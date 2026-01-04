import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResourceLevel, ResourceType } from '@/types/database';

export interface UpdateResourceData {
  id: string;
  title: string;
  description: string;
  resource_type: ResourceType;
  topics: string[];
  levels: ResourceLevel[];
  segments?: string[];
  curriculum_tags?: string[];
  external_url?: string;
  duration_minutes?: number;
  learning_outcomes?: string[];
  provider_id?: string | null;
  is_featured?: boolean;
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateResourceData) => {
      const { id, ...updateData } = data;
      
      const { data: result, error } = await supabase
        .from('resources')
        .update({
          title: updateData.title,
          description: updateData.description,
          resource_type: updateData.resource_type,
          topics: updateData.topics,
          levels: updateData.levels as any,
          segments: updateData.segments || null,
          curriculum_tags: updateData.curriculum_tags || null,
          external_url: updateData.external_url || null,
          duration_minutes: updateData.duration_minutes || null,
          learning_outcomes: updateData.learning_outcomes || null,
          provider_id: updateData.provider_id || null,
          is_featured: updateData.is_featured || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    },
  });
}
