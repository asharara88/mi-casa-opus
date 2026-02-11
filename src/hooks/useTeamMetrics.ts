 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 
 interface TeamMetrics {
   broker_id: string;
   broker_name: string;
   user_id: string;
   lead_count: number;
   deal_count: number;
   won_deals: number;
   conversion_rate: number;
   total_commission: number;
   avg_deal_cycle_days: number;
 }
 
 export function useTeamMetrics() {
   const { role } = useAuth();
 
   return useQuery({
     queryKey: ['team-metrics'],
     queryFn: async () => {
       const { data, error } = await supabase.rpc('get_team_metrics');
 
       if (error) throw error;
       return data as TeamMetrics[];
     },
     enabled: role === 'Manager',
   });
 }
 
 export function useUnassignedLeads() {
   const { role } = useAuth();
 
   return useQuery({
     queryKey: ['unassigned-leads'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('leads')
         .select('*')
         .is('assigned_broker_id', null)
         .not('lead_state', 'in', '("Disqualified","Converted")')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data;
     },
     enabled: role === 'Manager',
   });
 }
 
 export function useBrokerList() {
   return useQuery({
     queryKey: ['broker-list'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('broker_profiles')
         .select('id, broker_id, broker_status, user_id')
         .eq('broker_status', 'Active');
 
       if (error) throw error;
       return data;
     },
   });
 }