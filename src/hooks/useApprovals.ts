import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Approval = Tables<'approvals'>;
export type ApprovalInsert = TablesInsert<'approvals'>;
export type ApprovalUpdate = TablesUpdate<'approvals'>;

export function useApprovals() {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as Approval[];
    },
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('status', 'Pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as Approval[];
    },
  });
}

export function useCreateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (approval: ApprovalInsert) => {
      const { data, error } = await supabase
        .from('approvals')
        .insert(approval)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Approval request submitted');
    },
    onError: (error) => {
      toast.error('Failed to submit approval', { description: error.message });
    },
  });
}

export function useUpdateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ApprovalUpdate }) => {
      const { data, error } = await supabase
        .from('approvals')
        .update({
          ...updates,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success(`Approval ${data.status.toLowerCase()}`);
    },
    onError: (error) => {
      toast.error('Failed to update approval', { description: error.message });
    },
  });
}
