import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Rating } from '@/types/database';
import { useAuth } from './useAuth';

export function useResourceRatings(resourceId: string) {
  return useQuery({
    queryKey: ['ratings', resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Rating[];
    },
    enabled: !!resourceId,
  });
}

export function useAverageRating(resourceId: string) {
  const { data: ratings } = useResourceRatings(resourceId);
  
  if (!ratings || ratings.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
  return {
    average: sum / ratings.length,
    count: ratings.length,
  };
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      resourceId, 
      stars, 
      comment 
    }: { 
      resourceId: string; 
      stars: number; 
      comment?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to rate');

      const { data, error } = await supabase
        .from('ratings')
        .upsert({
          resource_id: resourceId,
          user_id: user.id,
          stars,
          comment,
          is_approved: false, // Requires moderation
        }, {
          onConflict: 'resource_id,user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.resourceId] });
    },
  });
}
