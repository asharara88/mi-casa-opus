import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Signer {
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'broker' | 'witness';
  order?: number;
}

export function useSendForSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      documentInstanceId: string;
      signers: Signer[];
      emailSubject?: string;
      emailMessage?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('docusign-envelope', {
        body: params,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.details || data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document_instances'] });
      queryClient.invalidateQueries({ queryKey: ['signature_envelopes'] });
      toast.success('Document sent for signature');
    },
    onError: (error) => {
      toast.error('Failed to send for signature', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}
