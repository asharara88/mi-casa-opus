import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================
export type LifecycleStage = 'Lead' | 'Prospect' | 'Customer' | 'Past_Customer' | 'Disqualified';
export type ContactType = 'Person' | 'Company';
export type Financing = 'cash' | 'mortgage' | 'mixed' | 'unknown';
export type ActivityKind = 'call' | 'email' | 'whatsapp' | 'sms' | 'meeting' | 'note' | 'viewing' | 'system';
export type ActivityDirection = 'inbound' | 'outbound' | 'internal';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type StageType = 'active' | 'won' | 'lost';

export interface Contact {
  id: string;
  contact_type: ContactType;
  full_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  alt_phone: string | null;
  whatsapp: string | null;
  lifecycle_stage: LifecycleStage;
  source: string | null;
  owner_user_id: string | null;
  tags: string[];
  nationality: string | null;
  preferred_language: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  sort_order: number;
  probability: number;
  stage_type: StageType;
  color: string;
  is_active: boolean;
}

export interface Opportunity {
  id: string;
  reference: string;
  title: string;
  contact_id: string;
  stage_id: string;
  source: string | null;
  owner_user_id: string | null;
  value: number | null;
  currency: string;
  probability: number | null;
  expected_close_date: string | null;
  property_type: string | null;
  listing_type: string | null;
  bedrooms_min: number | null;
  bedrooms_max: number | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_locations: string[];
  unit_count: number | null;
  financing: Financing;
  mortgage_pre_approved: boolean | null;
  timeframe: string | null;
  key_requirements: string | null;
  urgency: string | null;
  listing_id: string | null;
  deal_id: string | null;
  stage_changed_at: string | null;
  closed_at: string | null;
  lost_reason: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  contact_id: string | null;
  opportunity_id: string | null;
  activity_type: ActivityKind;
  direction: ActivityDirection;
  subject: string | null;
  body: string | null;
  channel: string | null;
  status: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  contact_id: string | null;
  opportunity_id: string | null;
  assigned_to: string | null;
  due_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONTACTS
// ============================================
export function useContacts(search?: string) {
  return useQuery({
    queryKey: ['contacts', search],
    queryFn: async () => {
      let q = supabase.from('contacts').select('*').order('updated_at', { ascending: false });
      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`full_name.ilike.${s},email.ilike.${s},phone.ilike.${s},company.ilike.${s}`);
      }
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return data as Contact[];
    },
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Contact;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Contact>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...input,
          full_name: input.full_name!,
          created_by: user.id,
          owner_user_id: input.owner_user_id ?? user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['contact', data.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============================================
// PIPELINE STAGES
// ============================================
export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as PipelineStage[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// OPPORTUNITIES
// ============================================
export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Opportunity[];
    },
  });
}

export function useOpportunity(id: string | null) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Opportunity;
    },
    enabled: !!id,
  });
}

export function useContactOpportunities(contactId: string | null) {
  return useQuery({
    queryKey: ['opportunities-by-contact', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('contact_id', contactId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Opportunity[];
    },
    enabled: !!contactId,
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Opportunity>) => {
      if (!user) throw new Error('Not authenticated');
      const reference = input.reference ?? `OPP-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...input,
          reference,
          title: input.title!,
          contact_id: input.contact_id!,
          stage_id: input.stage_id!,
          created_by: user.id,
          owner_user_id: input.owner_user_id ?? user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Opportunity;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['opportunities-by-contact'] });
      toast.success('Opportunity created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opportunity> & { id: string }) => {
      const { data, error } = await supabase.from('opportunities').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Opportunity;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['opportunity', data.id] });
      qc.invalidateQueries({ queryKey: ['opportunities-by-contact'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============================================
// ACTIVITIES
// ============================================
export function useActivities(opts: { contactId?: string | null; opportunityId?: string | null }) {
  const { contactId, opportunityId } = opts;
  return useQuery({
    queryKey: ['activities', contactId ?? null, opportunityId ?? null],
    queryFn: async () => {
      let q = supabase.from('activities').select('*').order('occurred_at', { ascending: false }).limit(200);
      if (contactId) q = q.eq('contact_id', contactId);
      if (opportunityId) q = q.eq('opportunity_id', opportunityId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!(contactId || opportunityId),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Activity>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('activities')
        .insert({
          ...input,
          activity_type: input.activity_type!,
          direction: input.direction ?? 'outbound',
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      // Update contact last_contacted_at
      if (input.contact_id) {
        await supabase.from('contacts').update({ last_contacted_at: new Date().toISOString() }).eq('id', input.contact_id);
      }
      return data as Activity;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Logged');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ============================================
// TASKS
// ============================================
export function useTasks(opts?: { mine?: boolean; contactId?: string | null; opportunityId?: string | null }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', opts?.mine, opts?.contactId, opts?.opportunityId, user?.id],
    queryFn: async () => {
      let q = supabase.from('tasks').select('*').order('due_at', { ascending: true, nullsFirst: false }).limit(300);
      if (opts?.mine && user) q = q.eq('assigned_to', user.id);
      if (opts?.contactId) q = q.eq('contact_id', opts.contactId);
      if (opts?.opportunityId) q = q.eq('opportunity_id', opts.opportunityId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Task>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...input,
          title: input.title!,
          created_by: user.id,
          assigned_to: input.assigned_to ?? user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const payload: Partial<Task> = { ...updates };
      if (updates.status === 'completed' && !updates.completed_at) {
        payload.completed_at = new Date().toISOString();
      }
      const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}
