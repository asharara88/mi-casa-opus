import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type DocumentTemplate = Tables<'document_templates'>;
export type DocumentTemplateInsert = TablesInsert<'document_templates'>;
export type DocumentTemplateUpdate = TablesUpdate<'document_templates'>;

export type DocumentInstance = Tables<'document_instances'>;
export type DocumentInstanceInsert = TablesInsert<'document_instances'>;

export type SignatureEnvelope = Tables<'signature_envelopes'>;

export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['document_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });
}

export function useDocumentInstances() {
  return useQuery({
    queryKey: ['document_instances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_instances')
        .select('*, document_templates(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useSignatureEnvelopes() {
  return useQuery({
    queryKey: ['signature_envelopes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signature_envelopes')
        .select('*, document_instances(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocumentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: DocumentTemplateInsert) => {
      const { data, error } = await supabase
        .from('document_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document_templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create template', { description: error.message });
    },
  });
}

export function useCreateDocumentInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instance: DocumentInstanceInsert) => {
      const { data, error } = await supabase
        .from('document_instances')
        .insert(instance)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document_instances'] });
      toast.success('Document created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create document', { description: error.message });
    },
  });
}
