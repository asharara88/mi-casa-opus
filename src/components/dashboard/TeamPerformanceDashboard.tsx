 import { useTeamMetrics, useUnassignedLeads } from '@/hooks/useTeamMetrics';
 import { BrokerKPICard } from './BrokerKPICard';
 import { LeadAssignmentPanel } from '@/components/leads/LeadAssignmentPanel';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 export function TeamPerformanceDashboard() {
   const { data: metrics, isLoading: isLoadingMetrics } = useTeamMetrics();
   const { data: unassignedLeads, isLoading: isLoadingUnassigned } = useUnassignedLeads();
 
   const isLoading = isLoadingMetrics || isLoadingUnassigned;
 
   // Calculate team totals
   const teamTotals = metrics?.reduce(
     (acc, broker) => ({
       totalLeads: acc.totalLeads + (broker.lead_count || 0),
       totalDeals: acc.totalDeals + (broker.deal_count || 0),
       totalWon: acc.totalWon + (broker.won_deals || 0),
       totalCommission: acc.totalCommission + (broker.total_commission || 0),
     }),
     { totalLeads: 0, totalDeals: 0, totalWon: 0, totalCommission: 0 }
   ) || { totalLeads: 0, totalDeals: 0, totalWon: 0, totalCommission: 0 };
 
   const teamConversionRate = teamTotals.totalLeads > 0
     ? (teamTotals.totalWon / teamTotals.totalLeads) * 100
     : 0;
 
   const formatCurrency = (value: number) => {
     if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
     if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
     return value.toFixed(0);
   };
 
   if (isLoading) {
     return (
       <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="h-24 rounded-lg" />
           ))}
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[...Array(3)].map((_, i) => (
             <Skeleton key={i} className="h-48 rounded-lg" />
           ))}
         </div>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Team Summary */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg">
                 <Users className="w-5 h-5 text-primary" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Brokers</p>
                 <p className="text-2xl font-bold">{metrics?.length || 0}</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-500/10 rounded-lg">
                 <Users className="w-5 h-5 text-blue-500" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Leads</p>
                 <p className="text-2xl font-bold">{teamTotals.totalLeads}</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Team Conversion</p>
                 <p className="text-2xl font-bold">{teamConversionRate.toFixed(1)}%</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-500/10 rounded-lg">
                 <DollarSign className="w-5 h-5 text-amber-500" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Commission</p>
                 <p className="text-2xl font-bold">{formatCurrency(teamTotals.totalCommission)} AED</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Unassigned Leads Alert */}
       {(unassignedLeads?.length || 0) > 0 && (
         <Card className="border-amber-500/50 bg-amber-500/5">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
               <AlertCircle className="w-4 h-4" />
               {unassignedLeads?.length} Unassigned Leads
             </CardTitle>
           </CardHeader>
           <CardContent>
             <LeadAssignmentPanel leads={unassignedLeads || []} />
           </CardContent>
         </Card>
       )}
 
       {/* Broker Performance Cards */}
       <div>
         <h3 className="text-lg font-semibold mb-4">Broker Performance</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {metrics?.map((broker, index) => (
             <BrokerKPICard
               key={broker.broker_id}
               brokerName={broker.broker_name}
               leadCount={broker.lead_count || 0}
               dealCount={broker.deal_count || 0}
               wonDeals={broker.won_deals || 0}
               conversionRate={broker.conversion_rate || 0}
               totalCommission={broker.total_commission || 0}
               avgCycleDays={broker.avg_deal_cycle_days || 0}
               isTopPerformer={index === 0 && (broker.total_commission || 0) > 0}
             />
           ))}
           {metrics?.length === 0 && (
             <div className="col-span-full text-center py-8 text-muted-foreground">
               No brokers found. Add broker profiles to see team metrics.
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }