
-- Add source_url to resources for dedupe
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS source_url text;
CREATE UNIQUE INDEX IF NOT EXISTS resources_provider_source_url_uidx
  ON public.resources (provider_id, source_url)
  WHERE source_url IS NOT NULL;

-- Provider feeds configuration table
CREATE TABLE public.provider_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  feed_url text NOT NULL,
  feed_type text NOT NULL DEFAULT 'html_scrape',
  resource_type resource_type NOT NULL DEFAULT 'podcast',
  default_levels resource_level[] NOT NULL DEFAULT ARRAY['adult_community']::resource_level[],
  default_topics text[] NOT NULL DEFAULT ARRAY[]::text[],
  default_segments text[],
  is_active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_status text,
  last_error text,
  last_items_found integer DEFAULT 0,
  last_items_added integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_feeds TO authenticated;
GRANT ALL ON public.provider_feeds TO service_role;

ALTER TABLE public.provider_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage provider_feeds"
  ON public.provider_feeds FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER provider_feeds_updated_at
  BEFORE UPDATE ON public.provider_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Sync run history
CREATE TABLE public.provider_feed_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES public.provider_feeds(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  items_found integer DEFAULT 0,
  items_added integer DEFAULT 0,
  error text,
  triggered_by text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_feed_runs TO authenticated;
GRANT ALL ON public.provider_feed_runs TO service_role;

ALTER TABLE public.provider_feed_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read feed runs"
  ON public.provider_feed_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX provider_feed_runs_feed_id_started_idx
  ON public.provider_feed_runs (feed_id, started_at DESC);
