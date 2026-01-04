import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ResourceLevel, ResourceType } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

export interface CreateResourceData {
  title: string;
  description: string;
  external_url?: string;
  resource_type: ResourceType;
  topics: string[];
  levels: ResourceLevel[];
  segments?: string[];
  duration_minutes?: number;
  learning_outcomes?: string[];
  curriculum_tags?: string[];
  provider_id?: string;
  is_featured?: boolean;
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateResourceData) => {
      if (!user) throw new Error('Must be logged in to create resources');

      const { data: resource, error } = await supabase
        .from('resources')
        .insert({
          title: data.title,
          description: data.description,
          external_url: data.external_url || null,
          resource_type: data.resource_type,
          topics: data.topics,
          levels: data.levels,
          segments: data.segments || null,
          duration_minutes: data.duration_minutes || null,
          learning_outcomes: data.learning_outcomes || null,
          curriculum_tags: data.curriculum_tags || null,
          provider_id: data.provider_id || null,
          is_featured: data.is_featured || false,
          submitted_by: user.id,
          review_status: 'approved', // Admin-created resources are auto-approved
        })
        .select()
        .single();

      if (error) throw error;
      return resource;
    },
    onSuccess: () => {
      // Invalidate all resource-related queries
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['featured-resources'] });
    },
  });
}
