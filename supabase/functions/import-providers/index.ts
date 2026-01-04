import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map JSON type strings to database provider_type enum values
const typeMapping: Record<string, string> = {
  'government body': 'government',
  'government service': 'government',
  'government/regulatory': 'government',
  'government department': 'government',
  'government/education': 'government',
  'education sector': 'community',
  'independent/ngo': 'independent',
  'independent/charity': 'independent',
  'charity': 'community',
  'commercial bank': 'independent',
  'industry body': 'independent',
  'credit union sector': 'community',
  'international': 'international',
  'european/regulatory': 'international',
  'international (uk)': 'international',
  'international (usa)': 'international',
};

interface ImportProvider {
  name: string;
  type?: string;
  website?: string;
  description?: string;
  targetAudience?: string[] | string;
}

interface ImportResult {
  imported: string[];
  skipped: { name: string; reason: string }[];
  errors: { name: string; error: string }[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { providers: importProviders } = await req.json() as { providers: ImportProvider[] };
    
    if (!Array.isArray(importProviders) || importProviders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or empty providers array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${importProviders.length} providers for import`);

    // Fetch existing providers for duplicate detection
    const { data: existingProviders, error: fetchError } = await supabase
      .from('providers')
      .select('name');

    if (fetchError) {
      console.error('Error fetching existing providers:', fetchError);
      throw fetchError;
    }

    // Normalize names for comparison
    const existingNames = new Set(
      (existingProviders || []).map(p => p.name.toLowerCase().trim())
    );

    const result: ImportResult = {
      imported: [],
      skipped: [],
      errors: [],
    };

    // Process each provider
    for (const provider of importProviders) {
      const normalizedName = provider.name?.toLowerCase().trim();
      
      if (!provider.name?.trim()) {
        result.errors.push({ name: 'Unknown', error: 'Missing name' });
        continue;
      }

      if (existingNames.has(normalizedName)) {
        result.skipped.push({ name: provider.name, reason: 'Already exists' });
        continue;
      }

      // Map provider type
      const providerType = typeMapping[provider.type?.toLowerCase() || ''] || 'independent';

      // Parse target audience
      let targetAudience: string[] = [];
      if (Array.isArray(provider.targetAudience)) {
        targetAudience = provider.targetAudience;
      } else if (typeof provider.targetAudience === 'string') {
        targetAudience = provider.targetAudience.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Insert new provider
      const { error: insertError } = await supabase
        .from('providers')
        .insert({
          name: provider.name.trim(),
          provider_type: providerType,
          website_url: provider.website || null,
          description: provider.description || null,
          target_audience: targetAudience.length > 0 ? targetAudience : null,
          is_verified: false,
          country: 'Ireland',
        });

      if (insertError) {
        console.error(`Error inserting provider ${provider.name}:`, insertError);
        result.errors.push({ name: provider.name, error: insertError.message });
      } else {
        result.imported.push(provider.name);
        // Add to existing names to prevent duplicates within same batch
        existingNames.add(normalizedName);
      }
    }

    console.log(`Import complete: ${result.imported.length} imported, ${result.skipped.length} skipped, ${result.errors.length} errors`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
