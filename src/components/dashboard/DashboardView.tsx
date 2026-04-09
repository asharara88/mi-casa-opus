import { useState } from 'react';
import { UserRole } from '@/types/bos';
import type { Deal } from '@/hooks/useDeals';
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
import {
  Users,
  Handshake,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
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

  const leads = (dbLeads || []).map(transformDbLeadToFrontend);
  const events = transformEventLogsToFrontend(dbEvents || []);

  const activeLeads = leads.filter(l => !['Disqualified', 'Converted'].includes(l.lead_state)).length;
  const activeDeals = (dbDeals || []).filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state)).length;

  const totalPipeline = (dbDeals || [])
    .filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state))
    .reduce((sum, d) => {
      const economics = d.deal_economics as Record<string, unknown> | null;
      return sum + ((economics?.agreed_price as number) || 0);
    }, 0);

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
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
              role={role} leads={leads} dbDeals={dbDeals || []} events={events}
              isLoadingEvents={isLoadingEvents} activeLeads={activeLeads} activeDeals={activeDeals}
              totalPipeline={totalPipeline} expectedCommissions={expectedCommissions}
              formatCurrency={formatCurrency} onNavigate={onNavigate}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DashboardOverviewContent
          role={role} leads={leads} dbDeals={dbDeals || []} events={events}
          isLoadingEvents={isLoadingEvents} activeLeads={activeLeads} activeDeals={activeDeals}
          totalPipeline={totalPipeline} expectedCommissions={expectedCommissions}
          formatCurrency={formatCurrency} onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

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
  role, leads, dbDeals, events, isLoadingEvents,
  activeLeads, activeDeals, totalPipeline, expectedCommissions,
  formatCurrency, onNavigate,
}: DashboardOverviewContentProps) {
  const [showDetails, setShowDetails] = useState(false);

  const activeFilteredDeals = (dbDeals || []).filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {role === 'Manager' && 'Operations Dashboard'}
          {role === 'Owner' && 'Compliance Overview'}
          {role === 'Broker' && 'My Dashboard'}
        </h2>
        <p className="text-sm text-foreground/60 mt-0.5">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Active Leads" value={activeLeads} icon={Users}
          change={activeLeads > 0 ? { value: 12, type: 'increase' } : undefined} />
        <MetricCard label="Active Deals" value={activeDeals} icon={Handshake}
          change={activeDeals > 0 ? { value: 8, type: 'increase' } : undefined} />
        <MetricCard label="Pipeline Value"
          value={totalPipeline > 0 ? `${formatCurrency(totalPipeline)} AED` : '0 AED'}
          icon={TrendingUp} variant="gold" />
        <MetricCard label="Expected Commission"
          value={expectedCommissions > 0 ? `${formatCurrency(expectedCommissions)} AED` : '0 AED'}
          icon={DollarSign} variant="success" />
      </div>

      {/* Funnel + Pipeline side by side — compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesFunnelChart onNavigate={onNavigate} />
        </div>
        <PipelineHealthWidget onNavigate={onNavigate} />
      </div>

      {/* Expandable details section */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/30"
      >
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showDetails ? 'Collapse details' : 'Forecast, leads, deals & audit trail'}
      </button>

      {showDetails && (
        <div className="space-y-5 animate-fade-in">
          {/* Forecast */}
          <ForecastWidget
            deals={(dbDeals || []).map(d => ({
              deal_id: d.deal_id,
              deal_state: d.deal_state,
              deal_economics: d.deal_economics as Record<string, unknown> | null,
            }))}
          />

          {/* Leads + Deals + Audit in a 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Leads */}
            <div className="card-surface p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Recent Leads
              </h3>
              <div className="space-y-2">
                {leads.length > 0 ? leads.slice(0, 4).map(lead => (
                  <div key={lead.lead_id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium shrink-0">
                        {(lead.contact_identity.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{lead.contact_identity.full_name}</p>
                        <p className="text-[10px] text-foreground/55">{lead.source}</p>
                      </div>
                    </div>
                    <StateBadge state={lead.lead_state} type="lead" size="sm" />
                  </div>
                )) : (
                  <p className="text-xs text-foreground/50 text-center py-6">No leads yet</p>
                )}
              </div>
            </div>

            {/* Active Deals */}
            <div className="card-surface p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Handshake className="w-4 h-4 text-primary" /> Active Deals
              </h3>
              <div className="space-y-2">
                {activeFilteredDeals.length > 0 ? activeFilteredDeals.slice(0, 4).map(deal => {
                  const economics = deal.deal_economics as Record<string, unknown> | null;
                  const agreedPrice = economics?.agreed_price as number | undefined;
                  return (
                    <div key={deal.deal_id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground font-mono truncate">{deal.deal_id}</p>
                        <p className="text-[10px] text-foreground/55">{deal.deal_type} · {deal.side}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <StateBadge state={deal.deal_state === 'ClosedWon' ? 'Closed_Won' : deal.deal_state === 'ClosedLost' ? 'Closed_Lost' : deal.deal_state as DealState} type="deal" size="sm" />
                        {agreedPrice && <p className="text-[10px] text-primary mt-0.5">{formatCurrency(agreedPrice)} AED</p>}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-foreground/50 text-center py-6">No active deals</p>
                )}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="card-surface p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Audit Trail
              </h3>
              {isLoadingEvents ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <EventLog events={events} maxItems={6} />
              )}
              {role === 'Manager' && (
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/60">Event Chain</span>
                    <span className="flex items-center gap-1 text-emerald"><CheckCircle className="w-3 h-3" /> Valid</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/60">Total Events</span>
                    <span className="font-mono text-foreground">{events.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
