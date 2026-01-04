import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid enum values
const VALID_RESOURCE_TYPES = [
  "lesson_plan", "slides", "worksheet", "project_brief", 
  "video", "quiz", "guide", "interactive", "podcast"
];

const VALID_LEVELS = [
  "primary", "junior_cycle", "transition_year", 
  "senior_cycle", "lca", "adult_community"
];

const VALID_REVIEW_STATUSES = ["pending", "approved", "needs_changes", "rejected"];

interface ImportResource {
  title: string;
  description: string;
  external_url?: string;
  resource_type: string;
  topics: string | string[];
  levels: string | string[];
  segments?: string | string[];
  duration_minutes?: number;
  learning_outcomes?: string | string[];
  curriculum_tags?: string | string[];
  provider_name?: string;
  provider_id?: string;
  is_featured?: boolean | string;
  review_status?: string;
}

interface ImportResult {
  success: boolean;
  summary: {
    total: number;
    inserted: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  inserted: string[];
  updated: string[];
  skipped: Array<{ title: string; reason: string }>;
  errors: Array<{ title: string; row: number; errors: string[] }>;
}

// Parse comma-separated string to array
function parseArrayField(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => v.trim()).filter(Boolean);
  return value.split(",").map(v => v.trim()).filter(Boolean);
}

// Parse pipe-separated string to array (for learning outcomes)
function parsePipeArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => v.trim()).filter(Boolean);
  return value.split("|").map(v => v.trim()).filter(Boolean);
}

// Validate a single resource and return errors
function validateResource(resource: ImportResource, providers: Map<string, string>): string[] {
  const errors: string[] = [];
  
  // Required fields
  if (!resource.title?.trim()) {
    errors.push("Missing required field: title");
  }
  if (!resource.description?.trim()) {
    errors.push("Missing required field: description");
  }
  if (!resource.resource_type?.trim()) {
    errors.push("Missing required field: resource_type");
  }
  if (!resource.topics || (typeof resource.topics === 'string' && !resource.topics.trim()) || 
      (Array.isArray(resource.topics) && resource.topics.length === 0)) {
    errors.push("Missing required field: topics");
  }
  if (!resource.levels || (typeof resource.levels === 'string' && !resource.levels.trim()) || 
      (Array.isArray(resource.levels) && resource.levels.length === 0)) {
    errors.push("Missing required field: levels");
  }

  // Validate resource_type enum
  if (resource.resource_type) {
    const normalizedType = resource.resource_type.toLowerCase().trim().replace(/\s+/g, '_');
    if (!VALID_RESOURCE_TYPES.includes(normalizedType)) {
      errors.push(`Invalid resource_type: '${resource.resource_type}'. Valid values: ${VALID_RESOURCE_TYPES.join(", ")}`);
    }
  }

  // Validate levels enum
  const levels = parseArrayField(resource.levels);
  for (const level of levels) {
    const normalizedLevel = level.toLowerCase().trim().replace(/\s+/g, '_');
    if (!VALID_LEVELS.includes(normalizedLevel)) {
      errors.push(`Invalid level: '${level}'. Valid values: ${VALID_LEVELS.join(", ")}`);
    }
  }

  // Validate review_status if provided
  if (resource.review_status) {
    const normalizedStatus = resource.review_status.toLowerCase().trim();
    if (!VALID_REVIEW_STATUSES.includes(normalizedStatus)) {
      errors.push(`Invalid review_status: '${resource.review_status}'. Valid values: ${VALID_REVIEW_STATUSES.join(", ")}`);
    }
  }

  // Validate URL if provided
  if (resource.external_url) {
    try {
      new URL(resource.external_url);
    } catch {
      errors.push(`Invalid external_url: '${resource.external_url}'`);
    }
  }

  // Validate provider
  if (resource.provider_name && !resource.provider_id) {
    const normalizedName = resource.provider_name.toLowerCase().trim();
    if (!providers.has(normalizedName)) {
      errors.push(`Provider not found: '${resource.provider_name}'`);
    }
  }

  // Validate duration_minutes is a positive number if provided
  if (resource.duration_minutes !== undefined && resource.duration_minutes !== null) {
    const duration = Number(resource.duration_minutes);
    if (isNaN(duration) || duration < 0) {
      errors.push(`Invalid duration_minutes: '${resource.duration_minutes}'. Must be a positive number`);
    }
  }

  return errors;
}

// Transform input resource to database format
function transformResource(
  resource: ImportResource, 
  providers: Map<string, string>
): Record<string, unknown> {
  // Get provider_id from name lookup or direct ID
  let providerId: string | null = resource.provider_id || null;
  if (resource.provider_name && !providerId) {
    const normalizedName = resource.provider_name.toLowerCase().trim();
    providerId = providers.get(normalizedName) || null;
  }

  // Normalize levels
  const levels = parseArrayField(resource.levels).map(l => 
    l.toLowerCase().trim().replace(/\s+/g, '_')
  );

  return {
    title: resource.title.trim(),
    description: resource.description.trim(),
    external_url: resource.external_url?.trim() || null,
    resource_type: resource.resource_type.toLowerCase().trim().replace(/\s+/g, '_'),
    topics: parseArrayField(resource.topics),
    levels: levels,
    segments: parseArrayField(resource.segments),
    duration_minutes: resource.duration_minutes ? Number(resource.duration_minutes) : null,
    learning_outcomes: parsePipeArray(resource.learning_outcomes),
    curriculum_tags: parseArrayField(resource.curriculum_tags),
    provider_id: providerId,
    is_featured: resource.is_featured === true || resource.is_featured === 'true' || resource.is_featured === 'Yes',
    review_status: resource.review_status?.toLowerCase().trim() || 'approved',
    updated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = userRoles?.some(r => r.role === "admin");
    if (!isAdmin) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const mode: "insert" | "upsert" = body.mode || "insert";
    const resources: ImportResource[] = body.resources || [];

    console.log(`Processing ${resources.length} resources in ${mode} mode`);

    if (!Array.isArray(resources) || resources.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No resources provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all providers for lookup
    const { data: providersData, error: providersError } = await supabase
      .from("providers")
      .select("id, name");

    if (providersError) {
      console.error("Error fetching providers:", providersError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch providers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create provider name -> id lookup map (case-insensitive)
    const providerMap = new Map<string, string>();
    for (const p of providersData || []) {
      providerMap.set(p.name.toLowerCase().trim(), p.id);
    }
    console.log(`Loaded ${providerMap.size} providers for lookup`);

    // Fetch existing resources for duplicate detection
    const { data: existingResources, error: existingError } = await supabase
      .from("resources")
      .select("id, title, provider_id");

    if (existingError) {
      console.error("Error fetching existing resources:", existingError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to check existing resources" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create existing resources lookup map (title lowercase -> resource)
    const existingMap = new Map<string, { id: string; title: string; provider_id: string | null }>();
    for (const r of existingResources || []) {
      existingMap.set(r.title.toLowerCase().trim(), r);
    }
    console.log(`Found ${existingMap.size} existing resources`);

    // Process results
    const result: ImportResult = {
      success: true,
      summary: { total: resources.length, inserted: 0, updated: 0, skipped: 0, errors: 0 },
      inserted: [],
      updated: [],
      skipped: [],
      errors: [],
    };

    // Process each resource
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      const rowNumber = i + 1; // 1-indexed for user-friendly reporting
      const titleForLog = resource.title?.trim() || `Row ${rowNumber}`;

      // Validate resource
      const validationErrors = validateResource(resource, providerMap);
      if (validationErrors.length > 0) {
        result.errors.push({ title: titleForLog, row: rowNumber, errors: validationErrors });
        result.summary.errors++;
        console.error(`Validation failed for row ${rowNumber}: ${validationErrors.join(", ")}`);
        continue;
      }

      // Check for duplicates
      const normalizedTitle = resource.title.toLowerCase().trim();
      const existingResource = existingMap.get(normalizedTitle);

      if (existingResource) {
        if (mode === "insert") {
          result.skipped.push({ title: resource.title, reason: "Already exists (insert mode)" });
          result.summary.skipped++;
          console.log(`Skipped duplicate: ${resource.title}`);
          continue;
        }

        // Upsert mode - update existing
        try {
          const transformed = transformResource(resource, providerMap);
          const { error: updateError } = await supabase
            .from("resources")
            .update(transformed)
            .eq("id", existingResource.id);

          if (updateError) {
            result.errors.push({ title: resource.title, row: rowNumber, errors: [updateError.message] });
            result.summary.errors++;
            console.error(`Update failed for ${resource.title}: ${updateError.message}`);
          } else {
            result.updated.push(resource.title);
            result.summary.updated++;
            console.log(`Updated: ${resource.title}`);
          }
        } catch (err) {
          result.errors.push({ title: resource.title, row: rowNumber, errors: [(err as Error).message] });
          result.summary.errors++;
          console.error(`Update error for ${resource.title}: ${(err as Error).message}`);
        }
      } else {
        // Insert new resource
        try {
          const transformed = transformResource(resource, providerMap);
          const { error: insertError } = await supabase
            .from("resources")
            .insert(transformed);

          if (insertError) {
            result.errors.push({ title: resource.title, row: rowNumber, errors: [insertError.message] });
            result.summary.errors++;
            console.error(`Insert failed for ${resource.title}: ${insertError.message}`);
          } else {
            result.inserted.push(resource.title);
            result.summary.inserted++;
            // Add to existing map to prevent duplicates in same batch
            existingMap.set(normalizedTitle, { id: 'new', title: resource.title, provider_id: null });
            console.log(`Inserted: ${resource.title}`);
          }
        } catch (err) {
          result.errors.push({ title: resource.title, row: rowNumber, errors: [(err as Error).message] });
          result.summary.errors++;
          console.error(`Insert error for ${resource.title}: ${(err as Error).message}`);
        }
      }
    }

    console.log(`Import complete: ${result.summary.inserted} inserted, ${result.summary.updated} updated, ${result.summary.skipped} skipped, ${result.summary.errors} errors`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
