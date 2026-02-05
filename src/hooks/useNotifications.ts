 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 interface Notification {
   id: string;
   user_id: string;
   notification_type: string;
   title: string;
   message: string | null;
   entity_type: string | null;
   entity_id: string | null;
   read_at: string | null;
   created_at: string;
 }
 
 export function useNotifications() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const query = useQuery({
     queryKey: ['notifications', user?.id],
     queryFn: async () => {
       if (!user?.id) return [];
       const { data, error } = await supabase
         .from('notifications')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false })
         .limit(50);
 
       if (error) throw error;
       return data as Notification[];
     },
     enabled: !!user?.id,
   });
 
   // Real-time subscription for new notifications
   useEffect(() => {
     if (!user?.id) return;
 
     const channel = supabase
       .channel('notifications-changes')
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'notifications',
           filter: `user_id=eq.${user.id}`,
         },
         (payload) => {
           const newNotification = payload.new as Notification;
           queryClient.invalidateQueries({ queryKey: ['notifications'] });
           toast.info(newNotification.title, {
             description: newNotification.message || undefined,
           });
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [user?.id, queryClient]);
 
   return query;
 }
 
 export function useUnreadCount() {
   const { data: notifications } = useNotifications();
   return notifications?.filter((n) => !n.read_at).length || 0;
 }
 
 export function useMarkAsRead() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (notificationId: string) => {
       const { error } = await supabase
         .from('notifications')
         .update({ read_at: new Date().toISOString() })
         .eq('id', notificationId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['notifications'] });
     },
   });
 }
 
 export function useMarkAllAsRead() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async () => {
       if (!user?.id) return;
       const { error } = await supabase
         .from('notifications')
         .update({ read_at: new Date().toISOString() })
         .eq('user_id', user.id)
         .is('read_at', null);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['notifications'] });
       toast.success('All notifications marked as read');
     },
   });
 }