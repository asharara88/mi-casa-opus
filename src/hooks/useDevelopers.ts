import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Developer {
  id: string;
  developer_id: string;
  name: string;
  legal_name: string | null;
  rera_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeveloperProject {
  id: string;
  project_id: string;
  developer_id: string;
  name: string;
  location: string | null;
  community: string | null;
  project_type: string | null;
  status: string | null;
  launch_date: string | null;
  expected_handover: string | null;
  total_units: number | null;
  available_units: number | null;
  price_from: number | null;
  price_to: number | null;
  commission_percent: number | null;
  payment_plan_details: any;
  amenities: any;
  brochure_url: string | null;
  floor_plans_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useDevelopers() {
  return useQuery({
    queryKey: ['developers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Developer[];
    },
  });
}

export function useDeveloperProjects(developerId?: string) {
  return useQuery({
    queryKey: ['developer_projects', developerId],
    queryFn: async () => {
      let query = supabase
        .from('developer_projects')
        .select('*')
        .order('name');

      if (developerId) {
        query = query.eq('developer_id', developerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DeveloperProject[];
    },
  });
}

export function useCreateDeveloper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (developer: Omit<Developer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('developers')
        .insert(developer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      toast.success('Developer created');
    },
    onError: (error) => {
      toast.error('Failed to create developer', { description: error.message });
    },
  });
}

export function useCreateDeveloperProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Omit<DeveloperProject, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('developer_projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer_projects'] });
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error('Failed to create project', { description: error.message });
    },
  });
}
