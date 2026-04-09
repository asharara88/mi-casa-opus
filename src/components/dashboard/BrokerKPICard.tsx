 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Users, Handshake, TrendingUp, DollarSign, Clock } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface BrokerKPICardProps {
   brokerName: string;
   leadCount: number;
   dealCount: number;
   wonDeals: number;
   conversionRate: number;
   totalCommission: number;
   avgCycleDays: number;
   isTopPerformer?: boolean;
 }
 
 export function BrokerKPICard({
   brokerName,
   leadCount,
   dealCount,
   wonDeals,
   conversionRate,
   totalCommission,
   avgCycleDays,
   isTopPerformer,
 }: BrokerKPICardProps) {
   const formatCurrency = (value: number) => {
     if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
     if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
     return value.toFixed(0);
   };
 
   return (
     <Card className={cn(
       'relative overflow-hidden',
       isTopPerformer && 'ring-2 ring-primary/50'
     )}>
       {isTopPerformer && (
         <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-bl">
           Top Performer
         </div>
       )}
       <CardHeader className="pb-2">
         <CardTitle className="text-sm font-medium flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
             {brokerName.split('@')[0].slice(0, 2).toUpperCase()}
           </div>
           <span className="truncate">{brokerName.split('@')[0]}</span>
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-3">
         <div className="grid grid-cols-2 gap-3 text-sm">
           <div className="flex items-center gap-2">
             <Users className="w-4 h-4 text-muted-foreground" />
             <div>
               <p className="text-xs text-muted-foreground">Leads</p>
               <p className="font-semibold">{leadCount}</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <Handshake className="w-4 h-4 text-muted-foreground" />
             <div>
               <p className="text-xs text-muted-foreground">Deals</p>
               <p className="font-semibold">{dealCount}</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-muted-foreground" />
             <div>
               <p className="text-xs text-muted-foreground">Conversion</p>
               <p className={cn(
                 'font-semibold',
                 conversionRate >= 20 ? 'text-emerald-600' : conversionRate >= 10 ? 'text-amber-600' : 'text-muted-foreground'
               )}>
                 {conversionRate.toFixed(1)}%
               </p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-muted-foreground" />
             <div>
               <p className="text-xs text-muted-foreground">Avg Cycle</p>
               <p className="font-semibold">{avgCycleDays.toFixed(0)}d</p>
             </div>
           </div>
         </div>
         <div className="pt-2 border-t border-border">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <DollarSign className="w-4 h-4 text-primary" />
               <span className="text-xs text-muted-foreground">Commission</span>
             </div>
             <span className="font-semibold text-primary">
               {formatCurrency(totalCommission)} AED
             </span>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }