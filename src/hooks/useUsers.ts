import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoContext';
import { toast } from 'sonner';

export interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
  role: 'Manager' | 'Agent' | 'Broker' | 'Owner' | null;
  broker_id?: string;
  license_no?: string;
}

// Demo fallback data
const DEMO_USERS: UserWithRole[] = [
  {
    id: '1',
    user_id: '893d2116-0918-4a34-b2b1-6d1ab65525e8',
    full_name: 'Ahmed Sharara',
    email: 'ahmed.m.sharara@gmail.com',
    phone: null,
    role: 'Manager',
    status: 'active',
    created_at: '2026-01-12T16:15:36.138964+00:00',
  },
];

export function useUsers() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // In demo mode, return demo data
      if (isDemoMode) {
        return DEMO_USERS;
      }

      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      // Fetch broker profiles for license info
      const { data: brokers, error: brokersError } = await supabase
        .from('broker_profiles')
        .select('*');

      if (brokersError) {
        console.error('Error fetching brokers:', brokersError);
      }

      // Combine the data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        const brokerProfile = brokers?.find((b) => b.user_id === profile.user_id);

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          status: profile.status,
          created_at: profile.created_at,
          role: userRole?.role || null,
          broker_id: brokerProfile?.broker_id,
          license_no: brokerProfile?.personal_license_no,
        };
      });

      return usersWithRoles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First, try to upsert the role
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: role as any },
          { onConflict: 'user_id,role' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    },
  });
}
