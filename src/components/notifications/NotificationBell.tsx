 import { Bell, Check, CheckCheck } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
 import { formatDistanceToNow } from 'date-fns';
 import { cn } from '@/lib/utils';
 
 interface NotificationBellProps {
   onNavigate?: (entityType: string, entityId: string) => void;
 }
 
 export function NotificationBell({ onNavigate }: NotificationBellProps) {
   const { data: notifications, isLoading } = useNotifications();
   const unreadCount = useUnreadCount();
   const markAsRead = useMarkAsRead();
   const markAllAsRead = useMarkAllAsRead();
 
   const handleNotificationClick = (notification: {
     id: string;
     entity_type: string | null;
     entity_id: string | null;
     read_at: string | null;
   }) => {
     if (!notification.read_at) {
       markAsRead.mutate(notification.id);
     }
     if (notification.entity_type && notification.entity_id && onNavigate) {
       onNavigate(notification.entity_type, notification.entity_id);
     }
   };
 
   const getNotificationIcon = (type: string) => {
     switch (type) {
       case 'lead_assigned':
         return '👤';
       case 'deal_stage_change':
         return '📊';
       case 'approval_needed':
         return '⚠️';
       case 'commission_approved':
         return '💰';
       default:
         return '📬';
     }
   };
 
   return (
     <Popover>
       <PopoverTrigger asChild>
         <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]">
           <Bell className="w-5 h-5" />
           {unreadCount > 0 && (
             <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium">
               {unreadCount > 9 ? '9+' : unreadCount}
             </span>
           )}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-80 p-0" align="end">
         <div className="flex items-center justify-between px-4 py-3 border-b border-border">
           <h4 className="font-semibold text-sm">Notifications</h4>
           {unreadCount > 0 && (
             <Button
               variant="ghost"
               size="sm"
               onClick={() => markAllAsRead.mutate()}
               className="text-xs h-7"
             >
               <CheckCheck className="w-3 h-3 mr-1" />
               Mark all read
             </Button>
           )}
         </div>
         <ScrollArea className="h-[300px]">
           {isLoading ? (
             <div className="p-4 text-center text-muted-foreground text-sm">
               Loading...
             </div>
           ) : !notifications?.length ? (
             <div className="p-8 text-center text-muted-foreground text-sm">
               <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
               No notifications yet
             </div>
           ) : (
             <div className="divide-y divide-border">
               {notifications.map((notification) => (
                 <button
                   key={notification.id}
                   onClick={() => handleNotificationClick(notification)}
                   className={cn(
                     'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                     !notification.read_at && 'bg-primary/5'
                   )}
                 >
                   <div className="flex gap-3">
                     <span className="text-lg">{getNotificationIcon(notification.notification_type)}</span>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between gap-2">
                         <p className={cn(
                           'text-sm truncate',
                           !notification.read_at && 'font-medium'
                         )}>
                           {notification.title}
                         </p>
                         {!notification.read_at && (
                           <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                         )}
                       </div>
                       {notification.message && (
                         <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                           {notification.message}
                         </p>
                       )}
                       <p className="text-xs text-muted-foreground mt-1">
                         {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                       </p>
                     </div>
                   </div>
                 </button>
               ))}
             </div>
           )}
         </ScrollArea>
       </PopoverContent>
     </Popover>
   );
 }