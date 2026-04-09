import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CRMEnquiry {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  company: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  property_type: string | null;
  bedrooms_min: number | null;
  bedrooms_max: number | null;
  key_requirements: string | null;
  source: string;
  urgency: string;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMFollowUp {
  id: string;
  enquiry_id: string;
  follow_up_type: string;
  body: string;
  follow_up_date: string | null;
  completed: boolean;
  created_at: string;
}

export function useEnquiries() {
  return useQuery({
    queryKey: ['crm-enquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CRMEnquiry[];
    },
  });
}

export function useEnquiry(id: string | null) {
  return useQuery({
    queryKey: ['crm-enquiry', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_enquiries')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as CRMEnquiry;
    },
  });
}

export function useEnquiryFollowUps(enquiryId: string | null) {
  return useQuery({
    queryKey: ['crm-enquiry-followups', enquiryId],
    enabled: !!enquiryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_enquiry_followups')
        .select('*')
        .eq('enquiry_id', enquiryId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CRMFollowUp[];
    },
  });
}

export function useCreateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<CRMEnquiry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('crm_enquiries')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-enquiries'] });
      toast.success('Enquiry created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMEnquiry> & { id: string }) => {
      const { error } = await supabase
        .from('crm_enquiries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-enquiries'] });
      qc.invalidateQueries({ queryKey: ['crm-enquiry'] });
      toast.success('Enquiry updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<CRMFollowUp, 'id' | 'created_at'>) => {
      const { error } = await supabase
        .from('crm_enquiry_followups')
        .insert(entry);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['crm-enquiry-followups', vars.enquiry_id] });
      toast.success('Follow-up added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
