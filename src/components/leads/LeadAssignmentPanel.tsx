 import { useState } from 'react';
 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useBrokerList } from '@/hooks/useTeamMetrics';
 import { Button } from '@/components/ui/button';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { toast } from 'sonner';
 import { UserPlus } from 'lucide-react';
 
 interface Lead {
   id: string;
   lead_id: string;
   contact_name: string;
   source: string;
   created_at: string;
 }
 
 interface LeadAssignmentPanelProps {
   leads: Lead[];
 }
 
 export function LeadAssignmentPanel({ leads }: LeadAssignmentPanelProps) {
   const { data: brokers } = useBrokerList();
   const queryClient = useQueryClient();
   const [selectedBroker, setSelectedBroker] = useState<string>('');
   const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
 
   const assignMutation = useMutation({
     mutationFn: async ({ leadIds, brokerId }: { leadIds: string[]; brokerId: string }) => {
       const { error } = await supabase
         .from('leads')
         .update({ assigned_broker_id: brokerId })
         .in('id', leadIds);
 
       if (error) throw error;
     },
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ['leads'] });
       queryClient.invalidateQueries({ queryKey: ['unassigned-leads'] });
       queryClient.invalidateQueries({ queryKey: ['team-metrics'] });
       toast.success(`${variables.leadIds.length} lead(s) assigned successfully`);
       setSelectedLeads(new Set());
       setSelectedBroker('');
     },
     onError: (error) => {
       toast.error('Failed to assign leads', { description: error.message });
     },
   });
 
   const handleAssign = () => {
     if (!selectedBroker || selectedLeads.size === 0) return;
     assignMutation.mutate({
       leadIds: Array.from(selectedLeads),
       brokerId: selectedBroker,
     });
   };
 
   const toggleLead = (leadId: string) => {
     const newSelected = new Set(selectedLeads);
     if (newSelected.has(leadId)) {
       newSelected.delete(leadId);
     } else {
       newSelected.add(leadId);
     }
     setSelectedLeads(newSelected);
   };
 
   const selectAll = () => {
     if (selectedLeads.size === leads.length) {
       setSelectedLeads(new Set());
     } else {
       setSelectedLeads(new Set(leads.map((l) => l.id)));
     }
   };
 
   return (
     <div className="space-y-4">
       <div className="flex flex-wrap items-center gap-3">
         <Button
           variant="outline"
           size="sm"
           onClick={selectAll}
         >
           {selectedLeads.size === leads.length ? 'Deselect All' : 'Select All'}
         </Button>
         <Select value={selectedBroker} onValueChange={setSelectedBroker}>
           <SelectTrigger className="w-[200px]">
             <SelectValue placeholder="Select broker" />
           </SelectTrigger>
           <SelectContent>
             {brokers?.map((broker) => (
               <SelectItem key={broker.id} value={broker.id}>
                 {broker.broker_id}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
         <Button
           onClick={handleAssign}
           disabled={!selectedBroker || selectedLeads.size === 0 || assignMutation.isPending}
           size="sm"
         >
           <UserPlus className="w-4 h-4 mr-2" />
           Assign {selectedLeads.size > 0 ? `(${selectedLeads.size})` : ''}
         </Button>
       </div>
 
       <div className="space-y-2 max-h-[200px] overflow-y-auto">
         {leads.slice(0, 10).map((lead) => (
           <div
             key={lead.id}
             onClick={() => toggleLead(lead.id)}
             className={`p-3 rounded-lg border cursor-pointer transition-colors ${
               selectedLeads.has(lead.id)
                 ? 'bg-primary/10 border-primary'
                 : 'bg-card border-border hover:border-primary/50'
             }`}
           >
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium">{lead.contact_name}</p>
                 <p className="text-xs text-muted-foreground">
                   {lead.source} • {lead.lead_id}
                 </p>
               </div>
               <div className={`w-4 h-4 rounded border ${
                 selectedLeads.has(lead.id)
                   ? 'bg-primary border-primary'
                   : 'border-muted-foreground'
               }`}>
                 {selectedLeads.has(lead.id) && (
                   <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 16 16" fill="currentColor">
                     <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                   </svg>
                 )}
               </div>
             </div>
           </div>
         ))}
         {leads.length > 10 && (
           <p className="text-xs text-muted-foreground text-center py-2">
             And {leads.length - 10} more...
           </p>
         )}
       </div>
     </div>
   );
 }