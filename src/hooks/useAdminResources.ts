import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Resource, ReviewStatus } from '@/types/database';

export function usePendingResources() {
  return useQuery({
    queryKey: ['admin-pending-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          provider:providers(*)
        `)
        .in('review_status', ['pending', 'needs_changes'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useAllResources(status?: ReviewStatus) {
  return useQuery({
    queryKey: ['admin-all-resources', status],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          provider:providers(*)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('review_status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useUpdateResourceReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      resourceId, 
      status, 
      reviewNotes,
      isFeatured
    }: { 
      resourceId: string; 
      status: ReviewStatus; 
      reviewNotes?: string;
      isFeatured?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = {
        review_status: status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      };

      if (reviewNotes !== undefined) {
        updateData.review_notes = reviewNotes;
      }

      if (isFeatured !== undefined) {
        updateData.is_featured = isFeatured;
      }

      const { data, error } = await supabase
        .from('resources')
        .update(updateData)
        .eq('id', resourceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-resources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
