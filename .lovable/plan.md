# Plan: Provider Feed Sync Agent (with Master My Balance import)

Build a reusable framework that lets any approved provider have one or more "feed sources" (URLs to scrape). A scheduled edge function syncs them daily; admins can also trigger a sync on demand. Newly discovered resources are inserted as `pending` for human review. First feed wired up: Master My Balance podcast.

## 1. Database (migration)

New table `public.provider_feeds`:
- `provider_id` → providers (cascade)
- `feed_url` (text, the page/RSS to scrape)
- `feed_type` (text: `html_scrape` | `rss` — start with `html_scrape`)
- `resource_type` (text: defaults applied to discovered items, e.g. `podcast`)
- `default_levels` (text[]) and `default_topics` (text[]) — applied to new resources
- `default_segments` (text[], nullable)
- `is_active` (bool, default true)
- `last_synced_at`, `last_status` (`ok` | `error` | `running`), `last_error` (text), `last_items_found` (int), `last_items_added` (int)
- Standard `id`, `created_at`, `updated_at`

Plus a small `provider_feed_runs` log table (feed_id, started_at, finished_at, status, items_found, items_added, error) so the admin UI can show sync history.

GRANTs for `authenticated` + `service_role`; RLS so only admins can read/write (via `has_role(auth.uid(),'admin')`); `service_role` bypasses RLS for the edge function.

Resources table: add a nullable `source_url` (text) column with a unique index per provider so we can dedupe by episode URL on subsequent syncs (titles can change). If you'd rather keep dedupe on title only, say so and I'll skip this column.

## 2. Edge function: `sync-provider-feeds`

New Lovable Cloud function. Accepts:
- `POST { feed_id }` → sync a single feed (used by the "Sync now" button)
- `POST {}` (called by cron) → sync all `is_active` feeds

Logic per feed:
1. Mark feed `running`, insert a run row.
2. Fetch the page via **Firecrawl** (`scrape` with `formats: ['markdown','links']`) — Firecrawl connector is already linked.
3. For `html_scrape` on mastermybalance.ie/podcast: extract episode entries (title, episode URL, description snippet, optional duration) from the markdown/links. A small site-specific parser keyed off `feed_url` host handles this; the framework picks the parser by host so adding new sites later means adding a parser, not new infra.
4. For each item: skip if a resource with the same `source_url` (or title, if `source_url` not added) already exists for this provider; otherwise insert with `review_status='pending'`, `resource_type` + defaults from the feed config, `provider_id` set, `submitted_by` null.
5. Update `last_*` fields + close the run row.

Auth: admin-only for `{feed_id}` calls (verify JWT + `has_role` check, same pattern as `import-resources`). Cron calls authenticate via the service role key + a shared header check.

## 3. Scheduling

Enable `pg_cron` + `pg_net` and schedule a daily call to `sync-provider-feeds` (e.g. 06:00 Europe/Dublin). Created via `supabase--insert` (not migration) since it embeds the function URL + anon key.

## 4. Admin UI

New page **Admin → Provider Feeds** (`/admin/provider-feeds`):
- List feeds with provider name, URL, last sync, last status, items added.
- "Add feed" dialog: pick provider, paste URL, choose type/resource_type/default levels+topics.
- Per-row **Sync now** button → calls the edge function with `feed_id`, shows toast with results.
- Edit / deactivate / delete.
- Expandable run history per feed.

Sidebar link added under the existing admin nav.

## 5. Master My Balance setup (one-off, after the above ships)

- Confirm the existing Master My Balance provider record.
- Insert a `provider_feeds` row: `feed_url=https://www.mastermybalance.ie/podcast/`, `feed_type=html_scrape`, `resource_type=podcast`, `default_levels=['adult_community']`, `default_topics=['Money management','Wellbeing']` (adjust on the form).
- Trigger an initial **Sync now** — all discovered episodes land in your Pending Review queue for approval.

## Technical notes

- Firecrawl is already connected; reuse the existing server-side fetch pattern (`Authorization: Bearer ${FIRECRAWL_API_KEY}` against `https://api.firecrawl.dev/v2/scrape`).
- Site parsers live in `supabase/functions/sync-provider-feeds/parsers/<host>.ts`, each exporting `parse(markdown, links, baseUrl) → DiscoveredItem[]`. Registry maps hostname → parser; unknown hosts return an error so you know to add one.
- Dedupe key: `(provider_id, source_url)` if we add `source_url`; otherwise `(provider_id, lower(title))`.
- All new resources insert with `review_status='pending'` regardless of who triggers the sync.
- Cron schedule is editable later from the admin UI (future enhancement; not in this plan).

## Out of scope (ask if you want them in)

- RSS parser (Master My Balance page is HTML; can add later for podcast RSS feeds).
- Auto-fetching episode audio/transcripts.
- Per-feed custom schedules (single daily run for all feeds).
