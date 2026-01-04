import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://flithub.ie'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating dynamic sitemap...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Fetch all approved resources
    const { data: resources, error } = await supabase
      .from('resources')
      .select('id, updated_at')
      .eq('review_status', 'approved')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching resources:', error)
      throw error
    }

    console.log(`Found ${resources?.length || 0} approved resources`)

    // Static pages
    const staticPages = [
      { loc: '/', changefreq: 'weekly', priority: '1.0' },
      { loc: '/start-here', changefreq: 'monthly', priority: '0.9' },
      { loc: '/resources', changefreq: 'daily', priority: '0.9' },
      { loc: '/providers', changefreq: 'weekly', priority: '0.8' },
    ]

    // Generate XML
    const today = new Date().toISOString().split('T')[0]
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n'
      xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`
      xml += `    <priority>${page.priority}</priority>\n`
      xml += '  </url>\n'
    }

    // Add resource pages
    if (resources && resources.length > 0) {
      for (const resource of resources) {
        const lastmod = resource.updated_at 
          ? new Date(resource.updated_at).toISOString().split('T')[0]
          : today
        
        xml += '  <url>\n'
        xml += `    <loc>${SITE_URL}/resources/${resource.id}</loc>\n`
        xml += `    <lastmod>${lastmod}</lastmod>\n`
        xml += `    <changefreq>weekly</changefreq>\n`
        xml += `    <priority>0.7</priority>\n`
        xml += '  </url>\n'
      }
    }

    xml += '</urlset>'

    console.log('Sitemap generated successfully')

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
