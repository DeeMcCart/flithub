
INSERT INTO public.provider_feeds (provider_id, feed_url, feed_type, resource_type, default_levels, default_topics)
SELECT '267f1ce1-5ec1-4f64-b693-35714bf73c40', 'https://www.mastermybalance.ie/podcast/', 'mastermybalance', 'podcast',
  ARRAY['adult_community']::resource_level[],
  ARRAY['financial_wellbeing','debt_credit','consumer_rights']::text[]
WHERE NOT EXISTS (
  SELECT 1 FROM public.provider_feeds WHERE feed_url = 'https://www.mastermybalance.ie/podcast/'
);
