import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type EvidenceObject = Tables<'evidence_objects'>;
export type EvidenceInsert = TablesInsert<'evidence_objects'>;

export function useEvidence() {
  return useQuery({
    queryKey: ['evidence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evidence_objects')
        .select('*')
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return data as EvidenceObject[];
    },
  });
}

export function useEvidenceByEntity(entityType: string | null, entityId: string | null) {
  return useQuery({
    queryKey: ['evidence', entityType, entityId],
    queryFn: async () => {
      if (!entityType || !entityId) return [];
      const { data, error } = await supabase
        .from('evidence_objects')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return data as EvidenceObject[];
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evidence: EvidenceInsert) => {
      const { data, error } = await supabase
        .from('evidence_objects')
        .insert(evidence)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      toast.success('Evidence captured successfully');
    },
    onError: (error) => {
      toast.error('Failed to capture evidence', { description: error.message });
    },
  });
}
