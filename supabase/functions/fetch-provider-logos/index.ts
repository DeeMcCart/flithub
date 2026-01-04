import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Provider {
  id: string;
  name: string;
  website_url: string | null;
  logo_url: string | null;
}

interface FetchResult {
  providerId: string;
  providerName: string;
  status: 'success' | 'failed' | 'skipped';
  logoUrl?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { providerId } = await req.json().catch(() => ({}));

    // Fetch providers that need logos
    let query = supabase
      .from('providers')
      .select('id, name, website_url, logo_url')
      .not('website_url', 'is', null);

    if (providerId) {
      query = query.eq('id', providerId);
    } else {
      query = query.is('logo_url', null);
    }

    const { data: providers, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching providers:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, results: [], message: 'No providers need logo updates' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${providers.length} providers`);

    const results: FetchResult[] = [];

    for (const provider of providers as Provider[]) {
      console.log(`Processing: ${provider.name} (${provider.website_url})`);

      // Skip if already has logo and not a specific request
      if (provider.logo_url && !providerId) {
        results.push({
          providerId: provider.id,
          providerName: provider.name,
          status: 'skipped',
          error: 'Already has logo'
        });
        continue;
      }

      if (!provider.website_url) {
        results.push({
          providerId: provider.id,
          providerName: provider.name,
          status: 'skipped',
          error: 'No website URL'
        });
        continue;
      }

      try {
        // Format URL
        let formattedUrl = provider.website_url.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
          formattedUrl = `https://${formattedUrl}`;
        }

        // Call Firecrawl branding API
        console.log(`Calling Firecrawl for: ${formattedUrl}`);
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: formattedUrl,
            formats: ['branding'],
          }),
        });

        const firecrawlData = await firecrawlResponse.json();

        if (!firecrawlResponse.ok) {
          console.error(`Firecrawl error for ${provider.name}:`, firecrawlData);
          results.push({
            providerId: provider.id,
            providerName: provider.name,
            status: 'failed',
            error: firecrawlData.error || `Firecrawl request failed: ${firecrawlResponse.status}`
          });
          continue;
        }

        // Extract logo URL from branding data
        const branding = firecrawlData.data?.branding || firecrawlData.branding;
        let logoUrl = branding?.logo || branding?.images?.logo || branding?.images?.favicon;

        if (!logoUrl) {
          console.log(`No logo found for ${provider.name}`);
          results.push({
            providerId: provider.id,
            providerName: provider.name,
            status: 'failed',
            error: 'No logo found in branding data'
          });
          continue;
        }

        console.log(`Found logo for ${provider.name}: ${logoUrl}`);

        // Download the logo
        const logoResponse = await fetch(logoUrl);
        if (!logoResponse.ok) {
          console.error(`Failed to download logo for ${provider.name}: ${logoResponse.status}`);
          results.push({
            providerId: provider.id,
            providerName: provider.name,
            status: 'failed',
            error: `Failed to download logo: ${logoResponse.status}`
          });
          continue;
        }

        const contentType = logoResponse.headers.get('content-type') || 'image/png';
        const logoBlob = await logoResponse.arrayBuffer();

        // Determine file extension
        let ext = 'png';
        if (contentType.includes('svg')) ext = 'svg';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('gif')) ext = 'gif';

        const fileName = `${provider.id}.${ext}`;

        // Upload to storage
        console.log(`Uploading logo for ${provider.name} as ${fileName}`);
        const { error: uploadError } = await supabase.storage
          .from('provider-logos')
          .upload(fileName, logoBlob, {
            contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${provider.name}:`, uploadError);
          results.push({
            providerId: provider.id,
            providerName: provider.name,
            status: 'failed',
            error: `Upload failed: ${uploadError.message}`
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('provider-logos')
          .getPublicUrl(fileName);

        // Update provider record
        const { error: updateError } = await supabase
          .from('providers')
          .update({ logo_url: publicUrl })
          .eq('id', provider.id);

        if (updateError) {
          console.error(`Update error for ${provider.name}:`, updateError);
          results.push({
            providerId: provider.id,
            providerName: provider.name,
            status: 'failed',
            error: `Database update failed: ${updateError.message}`
          });
          continue;
        }

        console.log(`Successfully updated logo for ${provider.name}`);
        results.push({
          providerId: provider.id,
          providerName: provider.name,
          status: 'success',
          logoUrl: publicUrl
        });

        // Rate limiting: wait 1 second between requests
        if (providers.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error processing ${provider.name}:`, error);
        results.push({
          providerId: provider.id,
          providerName: provider.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    };

    console.log('Fetch complete:', summary);

    return new Response(
      JSON.stringify({ success: true, results, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-provider-logos:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
