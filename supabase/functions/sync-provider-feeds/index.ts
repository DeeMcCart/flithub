import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedItem {
  title: string;
  description?: string;
  source_url: string;
  external_url: string;
}

// HTML entity decode
function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim();
}

// Master My Balance parser: extracts "Ep N: Title" headings and nearest Spotify link
function parseMasterMyBalance(html: string): ParsedItem[] {
  const titleRe = />(\s*Ep\s?\d+\s*[:\-][^<]{3,300})</gi;
  const linkRe = /href="(https?:\/\/[^"]*spotify[^"]+)"/gi;

  const titles: { pos: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = titleRe.exec(html)) !== null) {
    titles.push({ pos: m.index, text: decode(m[1]) });
  }

  const links: { pos: number; url: string }[] = [];
  while ((m = linkRe.exec(html)) !== null) {
    links.push({ pos: m.index, url: m[1] });
  }

  const seen = new Set<string>();
  const items: ParsedItem[] = [];
  for (const t of titles) {
    if (seen.has(t.text)) continue;
    // Find nearest Spotify link AFTER title, skipping show URL
    const link = links.find(l => l.pos >= t.pos && l.pos - t.pos < 6000 && !/spotify\.com\/show\//i.test(l.url));
    if (!link) continue;
    seen.add(t.text);
    items.push({
      title: t.text,
      description: `Master My Balance podcast episode. Listen on Spotify: ${t.text}`,
      source_url: link.url,
      external_url: link.url,
    });
  }
  return items;
}

const parsers: Record<string, (html: string) => ParsedItem[]> = {
  mastermybalance: parseMasterMyBalance,
};

async function fetchHtml(url: string, firecrawlKey?: string): Promise<string> {
  // Try direct fetch first (cheaper); fall back to Firecrawl on failure
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 FlitHubBot' } });
    if (r.ok) {
      const text = await r.text();
      if (text.length > 1000) return text;
    }
  } catch (_) { /* fall through */ }

  if (!firecrawlKey) throw new Error('Direct fetch failed and FIRECRAWL_API_KEY not set');
  const fc = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['html'] }),
  });
  if (!fc.ok) throw new Error(`Firecrawl error ${fc.status}`);
  const j = await fc.json();
  return j?.data?.html ?? '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY') ?? undefined;

  try {
    const body = await req.json().catch(() => ({}));
    const feedId: string | undefined = body.feedId;
    const triggeredBy: string = body.triggeredBy ?? 'manual';

    let query = supabase.from('provider_feeds').select('*').eq('is_active', true);
    if (feedId) query = supabase.from('provider_feeds').select('*').eq('id', feedId);
    const { data: feeds, error: feedsErr } = await query;
    if (feedsErr) throw feedsErr;

    const results: any[] = [];

    for (const feed of feeds ?? []) {
      const { data: run } = await supabase
        .from('provider_feed_runs')
        .insert({ feed_id: feed.id, triggered_by: triggeredBy, status: 'running' })
        .select()
        .single();

      try {
        const parser = parsers[feed.feed_type];
        if (!parser) throw new Error(`No parser registered for type "${feed.feed_type}"`);

        const html = await fetchHtml(feed.feed_url, firecrawlKey);
        const items = parser(html);

        let added = 0;
        for (const item of items) {
          // Check existence by (provider_id, source_url)
          const { data: existing } = await supabase
            .from('resources')
            .select('id')
            .eq('provider_id', feed.provider_id)
            .eq('source_url', item.source_url)
            .maybeSingle();

          if (existing) continue;

          const { error: insErr } = await supabase.from('resources').insert({
            title: item.title.slice(0, 250),
            description: item.description ?? item.title,
            resource_type: feed.resource_type,
            levels: feed.default_levels,
            topics: feed.default_topics,
            segments: feed.default_segments,
            external_url: item.external_url,
            source_url: item.source_url,
            provider_id: feed.provider_id,
            review_status: 'approved',
          } as any);
          if (!insErr) added++;
          else console.error('Insert error:', insErr);
        }

        await supabase
          .from('provider_feeds')
          .update({
            last_synced_at: new Date().toISOString(),
            last_status: 'success',
            last_error: null,
            last_items_found: items.length,
            last_items_added: added,
          })
          .eq('id', feed.id);

        if (run) {
          await supabase
            .from('provider_feed_runs')
            .update({
              finished_at: new Date().toISOString(),
              status: 'success',
              items_found: items.length,
              items_added: added,
            })
            .eq('id', run.id);
        }

        results.push({ feedId: feed.id, status: 'success', itemsFound: items.length, itemsAdded: added });
      } catch (e) {
        const err = String((e as Error)?.message ?? e);
        await supabase
          .from('provider_feeds')
          .update({ last_synced_at: new Date().toISOString(), last_status: 'error', last_error: err })
          .eq('id', feed.id);
        if (run) {
          await supabase
            .from('provider_feed_runs')
            .update({ finished_at: new Date().toISOString(), status: 'error', error: err })
            .eq('id', run.id);
        }
        results.push({ feedId: feed.id, status: 'error', error: err });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String((e as Error)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
