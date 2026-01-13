import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoContext';
import { DEMO_BROKERAGE, DEMO_BROKER_PROFILES, DEMO_PROFILES, DEMO_USER_ROLES } from '@/data/demoData';

export type BrokerageContext = Tables<'brokerage_context'>;
export type BrokerProfile = Tables<'broker_profiles'>;
export type UserRole = Tables<'user_roles'>;
export type Profile = Tables<'profiles'>;

export function useBrokerageContext() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['brokerage_context', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_BROKERAGE as unknown as BrokerageContext;
      }

      const { data, error } = await supabase
        .from('brokerage_context')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as BrokerageContext | null;
    },
  });
}

export function useBrokerProfiles() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['broker_profiles', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_BROKER_PROFILES as unknown as BrokerProfile[];
      }

      const { data, error } = await supabase
        .from('broker_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BrokerProfile[];
    },
  });
}

export function useProfiles() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['profiles', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_PROFILES as unknown as Profile[];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUserRoles() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['user_roles', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_USER_ROLES as unknown as UserRole[];
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
  });
}

export function useUpdateBrokerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'broker_profiles'> }) => {
      const { data, error } = await supabase
        .from('broker_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker_profiles'] });
      toast.success('Broker profile updated');
    },
    onError: (error) => {
      toast.error('Failed to update broker profile', { description: error.message });
    },
  });
}
