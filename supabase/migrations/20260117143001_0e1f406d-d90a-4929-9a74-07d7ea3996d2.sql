-- Add category field for provider sub-areas (e.g., "Schools Education", "Consumer Complaints")
ALTER TABLE public.providers
ADD COLUMN category text;

-- Add provider_url for specific page URLs (distinct from main website_url)
ALTER TABLE public.providers
ADD COLUMN provider_url text;

-- Add comment for clarity
COMMENT ON COLUMN public.providers.category IS 'Sub-category or area of the provider (e.g., Schools Education, Consumer Complaints)';
COMMENT ON COLUMN public.providers.provider_url IS 'Specific page URL for this category (distinct from main website_url)';
COMMENT ON COLUMN public.providers.website_url IS 'Main organization website URL';