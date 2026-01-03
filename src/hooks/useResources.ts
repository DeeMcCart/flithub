import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Resource, ResourceFilters } from '@/types/database';

export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          provider:providers(*)
        `)
        .eq('review_status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.levels && filters.levels.length > 0) {
        query = query.overlaps('levels', filters.levels);
      }
      
      if (filters?.topics && filters.topics.length > 0) {
        query = query.overlaps('topics', filters.topics);
      }
      
      if (filters?.segments && filters.segments.length > 0) {
        query = query.overlaps('segments', filters.segments);
      }
      
      if (filters?.types && filters.types.length > 0) {
        query = query.in('resource_type', filters.types);
      }
      
      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          provider:providers(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Resource | null;
    },
    enabled: !!id,
  });
}

export function useFeaturedResources() {
  return useQuery({
    queryKey: ['featured-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          provider:providers(*)
        `)
        .eq('review_status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Resource[];
    },
  });
}
