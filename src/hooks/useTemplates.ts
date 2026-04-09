import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentTemplate {
  id: string;
  template_id: string;
  name: string;
  doc_type: string;
  template_version: string;
  status: 'Draft' | 'Published' | 'Deprecated';
  effective_from: string;
  published_at: string | null;
  created_at: string;
  template_content: string | null;
  required_signers_schema: unknown[] | null;
  data_binding_schema: Record<string, unknown> | null;
}

export interface ComplianceRule {
  id: string;
  rule_id: string;
  module_id: string;
  name: string;
  type: string;
  severity: 'BLOCK' | 'WARN' | 'INFO';
  requirements: unknown[];
  action_on_fail: {
    status: string;
    requiredAction: string;
  };
  applies_to: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceModule {
  id: string;
  module_id: string;
  name: string;
  jurisdiction: string;
  sort_order: number;
  is_active: boolean;
}

// Fetch all document templates
export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DocumentTemplate[];
    },
  });
}

// Fetch all compliance rules
export function useComplianceRules() {
  return useQuery({
    queryKey: ['compliance-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_rules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as ComplianceRule[];
    },
  });
}

// Fetch all compliance modules
export function useComplianceModules() {
  return useQuery({
    queryKey: ['compliance-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as ComplianceModule[];
    },
  });
}

// Publish a template (make immutable)
export function usePublishTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase
        .from('document_templates')
        .update({
          status: 'Published',
          published_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Template published', {
        description: 'Template is now immutable and ready for use',
      });
    },
    onError: (error) => {
      toast.error('Failed to publish template', {
        description: error.message,
      });
    },
  });
}

// Toggle rule active status
export function useToggleRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('compliance_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      toast.success(variables.isActive ? 'Rule enabled' : 'Rule disabled');
    },
    onError: (error) => {
      toast.error('Failed to update rule', {
        description: error.message,
      });
    },
  });
}

// Create a new version of a template
export function useCreateTemplateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // First fetch the existing template
      const { data: existing, error: fetchError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Parse current version and increment
      const currentVersion = existing.template_version || '1.0';
      const [major, minor] = currentVersion.split('.').map(Number);
      const newVersion = `${major}.${minor + 1}`;

      // Create new draft version
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          template_id: `${existing.template_id}-v${newVersion}`,
          name: existing.name,
          doc_type: existing.doc_type,
          template_version: newVersion,
          status: 'Draft',
          effective_from: new Date().toISOString().split('T')[0],
          template_content: existing.template_content,
          required_signers_schema: existing.required_signers_schema,
          data_binding_schema: existing.data_binding_schema,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('New version created', {
        description: 'Draft version ready for editing',
      });
    },
    onError: (error) => {
      toast.error('Failed to create version', {
        description: error.message,
      });
    },
  });
}
