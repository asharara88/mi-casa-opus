 import { useState } from 'react';
 import { UserRole } from '@/types/bos';
import { MetricCard } from './MetricCard';
import { StateBadge } from './StateBadge';
import { ForecastWidget } from './ForecastWidget';
import { SalesFunnelChart } from './SalesFunnelChart';
import { PipelineHealthWidget } from './PipelineHealthWidget';
import { EventLog } from '@/components/events/EventLog';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { useCommissions } from '@/hooks/useCommissions';
import { useEventLog } from '@/hooks/useEventLog';
import { DealState } from '@/types/bos';
import { transformDbLeadToFrontend, transformEventLogsToFrontend } from '@/lib/transforms';
import { Skeleton } from '@/components/ui/skeleton';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { TeamPerformanceDashboard } from './TeamPerformanceDashboard';
import CountUp from 'react-countup';
import {
  Users,
  Handshake,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface DashboardViewProps {
  role: UserRole;
  onNavigate?: (section: string) => void;
}

export function DashboardView({ role, onNavigate }: DashboardViewProps) {
  const { data: dbLeads, isLoading: isLoadingLeads } = useLeads();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();
  const { data: dbCommissions, isLoading: isLoadingCommissions } = useCommissions();
  const { data: dbEvents, isLoading: isLoadingEvents } = useEventLog();

  const isLoading = isLoadingLeads || isLoadingDeals || isLoadingCommissions;
   const [activeTab, setActiveTab] = useState('overview');

  // Transform leads to frontend format for display
  const leads = (dbLeads || []).map(transformDbLeadToFrontend);
  
  // Transform events for display
  const events = transformEventLogsToFrontend(dbEvents || []);

  // Calculate metrics
  const activeLeads = leads.filter(l => !['Disqualified', 'Converted'].includes(l.lead_state)).length;
  const activeDeals = (dbDeals || []).filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state)).length;
  const wonDeals = (dbDeals || []).filter(d => d.deal_state === 'ClosedWon').length;
  
  // Calculate pipeline value from deal economics
  const totalPipeline = (dbDeals || [])
    .filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state))
    .reduce((sum, d) => {
      const economics = d.deal_economics as Record<string, unknown> | null;
      return sum + ((economics?.agreed_price as number) || 0);
    }, 0);

  // Calculate expected commissions
  const expectedCommissions = (dbCommissions || [])
    .filter(c => c.status === 'Expected')
    .reduce((sum, c) => sum + (c.net_amount || 0), 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
     <div className="space-y-6 animate-fade-in">
       {/* Tabs for Manager role */}
       {role === 'Manager' ? (
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList>
             <TabsTrigger value="overview">Overview</TabsTrigger>
             <TabsTrigger value="team">Team Performance</TabsTrigger>
           </TabsList>
           
           <TabsContent value="team" className="mt-6">
             <TeamPerformanceDashboard />
           </TabsContent>
           
           <TabsContent value="overview" className="mt-6">
             <DashboardOverviewContent
               role={role}
               leads={leads}
               dbDeals={dbDeals || []}
               events={events}
               isLoadingEvents={isLoadingEvents}
               activeLeads={activeLeads}
               activeDeals={activeDeals}
               totalPipeline={totalPipeline}
               expectedCommissions={expectedCommissions}
               formatCurrency={formatCurrency}
               onNavigate={onNavigate}
             />
           </TabsContent>
         </Tabs>
       ) : (
         <DashboardOverviewContent
           role={role}
           leads={leads}
           dbDeals={dbDeals || []}
           events={events}
           isLoadingEvents={isLoadingEvents}
           activeLeads={activeLeads}
           activeDeals={activeDeals}
           totalPipeline={totalPipeline}
           expectedCommissions={expectedCommissions}
           formatCurrency={formatCurrency}
           onNavigate={onNavigate}
         />
       )}
     </div>
   );
 }
 
 // Extracted overview content component
 interface DashboardOverviewContentProps {
   role: UserRole;
   leads: ReturnType<typeof transformDbLeadToFrontend>[];
   dbDeals: Deal[];
   events: ReturnType<typeof transformEventLogsToFrontend>;
   isLoadingEvents: boolean;
   activeLeads: number;
   activeDeals: number;
   totalPipeline: number;
   expectedCommissions: number;
   formatCurrency: (value: number) => string;
   onNavigate?: (section: string) => void;
 }
 
 function DashboardOverviewContent({
   role,
   leads,
   dbDeals,
   events,
   isLoadingEvents,
   activeLeads,
   activeDeals,
   totalPipeline,
   expectedCommissions,
   formatCurrency,
   onNavigate,
 }: DashboardOverviewContentProps) {
   return (
     <>
       {/* Welcome Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
           {role === 'Manager' && 'Operations Dashboard'}
           {role === 'Owner' && 'Compliance Overview'}
          {role === 'Broker' && 'My Dashboard'}
        </h2>
        <p className="text-foreground/70 mt-1">
          {new Date().toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

       {/* Metrics Grid with Animated Counters */}
       <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Active Leads"
          value={activeLeads}
          icon={Users}
          change={activeLeads > 0 ? { value: 12, type: 'increase' } : undefined}
        />
        <MetricCard
          label="Active Deals"
          value={activeDeals}
          icon={Handshake}
          change={activeDeals > 0 ? { value: 8, type: 'increase' } : undefined}
        />
        <MetricCard
          label="Pipeline Value"
          value={totalPipeline > 0 ? `${formatCurrency(totalPipeline)} AED` : '0 AED'}
          icon={TrendingUp}
          variant="gold"
        />
        <MetricCard
          label="Expected Commission"
          value={expectedCommissions > 0 ? `${formatCurrency(expectedCommissions)} AED` : '0 AED'}
          icon={DollarSign}
          variant="success"
        />
      </div>

      {/* Sales Funnel & Pipeline Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesFunnelChart onNavigate={onNavigate} />
        </div>
        <PipelineHealthWidget onNavigate={onNavigate} />
      </div>

      {/* Forecast Widget */}
      <ForecastWidget 
        deals={(dbDeals || []).map(d => ({
          deal_id: d.deal_id,
          deal_state: d.deal_state,
          deal_economics: d.deal_economics as Record<string, unknown> | null,
        }))}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Leads */}
          <div className="card-surface p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Recent Leads
            </h3>
            <div className="space-y-3">
              {leads.length > 0 ? (
                leads.slice(0, 5).map(lead => (
                  <div key={lead.lead_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                        {(lead.contact_identity.full_name || 'Unknown').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {lead.contact_identity.full_name}
                        </p>
                        <p className="text-xs text-foreground/65">{lead.source}</p>
                      </div>
                    </div>
                    <StateBadge state={lead.lead_state} type="lead" size="sm" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-foreground/60 text-sm">
                  No leads yet. Start adding leads to see them here.
                </div>
              )}
            </div>
          </div>

          {/* Recent Deals */}
          <div className="card-surface p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-primary" />
              Active Deals
            </h3>
            <div className="space-y-3">
              {(dbDeals || []).filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state)).length > 0 ? (
                (dbDeals || [])
                  .filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state))
                  .slice(0, 5)
                  .map(deal => {
                    const economics = deal.deal_economics as Record<string, unknown> | null;
                    const agreedPrice = economics?.agreed_price as number | undefined;
                    return (
                      <div key={deal.deal_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground font-mono">
                            {deal.deal_id}
                          </p>
                          <p className="text-xs text-foreground/65">
                            {deal.deal_type} • {deal.side}
                          </p>
                        </div>
                        <div className="text-right">
                          <StateBadge state={deal.deal_state === 'ClosedWon' ? 'Closed_Won' : deal.deal_state === 'ClosedLost' ? 'Closed_Lost' : deal.deal_state as DealState} type="deal" size="sm" />
                          {agreedPrice && (
                            <p className="text-xs text-primary mt-1 font-medium">
                              {formatCurrency(agreedPrice)} AED
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-foreground/60 text-sm">
                  No active deals. Create a deal from a qualified lead.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Event Log */}
        <div className="space-y-6">
          <div className="card-surface p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Audit Trail
            </h3>
            {isLoadingEvents ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <EventLog events={events} maxItems={10} />
            )}
          </div>

          {/* Quick Stats */}
          {role === 'Manager' && (
            <div className="card-surface p-4">
              <h3 className="font-semibold text-foreground mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Event Chain</span>
                  <span className="flex items-center gap-1 text-sm text-emerald">
                    <CheckCircle className="w-4 h-4" />
                    Valid
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Total Events</span>
                  <span className="text-sm font-mono text-foreground">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Blocked Actions</span>
                  <span className="text-sm font-mono text-foreground">
                    {events.filter(e => e.decision === 'BLOCKED').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
     </>
   );
 }
 
 // Import type for Deal
 import type { Deal } from '@/hooks/useDeals';
