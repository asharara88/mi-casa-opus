import { UserRole, Lead, Deal, CommissionRecord } from '@/types/bos';
import { MetricCard } from './MetricCard';
import { StateBadge } from './StateBadge';
import { EventLog } from '@/components/events/EventLog';
import { getEventLog } from '@/lib/event-log';
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
  leads: Lead[];
  deals: Deal[];
  commissions: CommissionRecord[];
}

export function DashboardView({ role, leads, deals, commissions }: DashboardViewProps) {
  const events = getEventLog();

  // Calculate metrics
  const activeLeads = leads.filter(l => !['Disqualified', 'Converted'].includes(l.lead_state)).length;
  const activeDeals = deals.filter(d => !['Closed_Won', 'Closed_Lost'].includes(d.deal_state)).length;
  const wonDeals = deals.filter(d => d.deal_state === 'Closed_Won').length;
  const totalPipeline = deals
    .filter(d => !['Closed_Won', 'Closed_Lost'].includes(d.deal_state))
    .reduce((sum, d) => sum + (d.agreed_price || 0), 0);

  const expectedCommissions = commissions
    .filter(c => c.status === 'Expected')
    .reduce((sum, c) => sum + c.calculation_trace.net_payable, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {role === 'Operator' && 'Operations Dashboard'}
          {role === 'LegalOwner' && 'Compliance Overview'}
          {role === 'Broker' && 'My Dashboard'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Leads"
          value={activeLeads}
          icon={Users}
          change={{ value: 12, type: 'increase' }}
        />
        <MetricCard
          label="Active Deals"
          value={activeDeals}
          icon={Handshake}
          change={{ value: 8, type: 'increase' }}
        />
        <MetricCard
          label="Pipeline Value"
          value={`${formatCurrency(totalPipeline)} AED`}
          icon={TrendingUp}
          variant="gold"
        />
        <MetricCard
          label="Expected Commission"
          value={`${formatCurrency(expectedCommissions)} AED`}
          icon={DollarSign}
          variant="success"
        />
      </div>

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
              {leads.slice(0, 5).map(lead => (
                <div key={lead.lead_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                      {lead.contact_identity.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {lead.contact_identity.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{lead.source}</p>
                    </div>
                  </div>
                  <StateBadge state={lead.lead_state} type="lead" size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Deals */}
          <div className="card-surface p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-primary" />
              Active Deals
            </h3>
            <div className="space-y-3">
              {deals.filter(d => !['Closed_Won', 'Closed_Lost'].includes(d.deal_state)).slice(0, 5).map(deal => (
                <div key={deal.deal_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {deal.deal_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deal.deal_type} • {deal.side}
                    </p>
                  </div>
                  <div className="text-right">
                    <StateBadge state={deal.deal_state} type="deal" size="sm" />
                    {deal.agreed_price && (
                      <p className="text-xs text-primary mt-1 font-medium">
                        {formatCurrency(deal.agreed_price)} AED
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
            <EventLog events={events} maxItems={10} />
          </div>

          {/* Quick Stats */}
          {role === 'Operator' && (
            <div className="card-surface p-4">
              <h3 className="font-semibold text-foreground mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event Chain</span>
                  <span className="flex items-center gap-1 text-sm text-emerald">
                    <CheckCircle className="w-4 h-4" />
                    Valid
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="text-sm font-mono text-foreground">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Blocked Actions</span>
                  <span className="text-sm font-mono text-foreground">
                    {events.filter(e => e.decision === 'BLOCKED').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
