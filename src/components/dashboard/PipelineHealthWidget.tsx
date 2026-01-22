import { useMemo } from 'react';
import { useProspects, useProspectStats } from '@/hooks/useProspects';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Users,
  UserCheck,
  Handshake,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

interface PipelineHealthWidgetProps {
  onNavigate?: (section: string) => void;
}

interface BottleneckAlert {
  id: string;
  type: 'aging' | 'stalled' | 'low_conversion';
  stage: string;
  section: string;
  count: number;
  message: string;
  severity: 'warning' | 'critical';
}

export function PipelineHealthWidget({ onNavigate }: PipelineHealthWidgetProps) {
  const { data: prospectStats, isLoading: isLoadingProspects } = useProspectStats();
  const { data: dbLeads, isLoading: isLoadingLeads } = useLeads();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();

  const isLoading = isLoadingProspects || isLoadingLeads || isLoadingDeals;

  // Calculate bottlenecks and alerts
  const alerts = useMemo<BottleneckAlert[]>(() => {
    const alertList: BottleneckAlert[] = [];
    const now = new Date();

    // Check for stale prospects (not contacted for 7+ days)
    const staleProspects = (prospectStats?.byStatus?.not_contacted || 0);
    if (staleProspects > 5) {
      alertList.push({
        id: 'stale-prospects',
        type: 'stalled',
        stage: 'Prospects',
        section: 'prospects',
        count: staleProspects,
        message: `${staleProspects} prospects never contacted`,
        severity: staleProspects > 10 ? 'critical' : 'warning',
      });
    }

    // Check for aging leads (in same state for 3+ days)
    const leads = dbLeads || [];
    const agingLeads = leads.filter(l => {
      if (['Converted', 'Disqualified'].includes(l.lead_state)) return false;
      const updatedAt = parseISO(l.updated_at);
      return differenceInDays(now, updatedAt) >= 3;
    });
    
    if (agingLeads.length > 0) {
      alertList.push({
        id: 'aging-leads',
        type: 'aging',
        stage: 'Leads',
        section: 'leads',
        count: agingLeads.length,
        message: `${agingLeads.length} leads stalled for 3+ days`,
        severity: agingLeads.length > 5 ? 'critical' : 'warning',
      });
    }

    // Check for deals needing action
    const deals = dbDeals || [];
    const dealsNeedingAction = deals.filter(d => {
      if (['ClosedWon', 'ClosedLost'].includes(d.deal_state)) return false;
      if (d.next_action_due) {
        const dueDate = parseISO(d.next_action_due);
        return dueDate <= now;
      }
      // No action scheduled for active deal
      return !d.next_action;
    });

    if (dealsNeedingAction.length > 0) {
      alertList.push({
        id: 'deals-action',
        type: 'aging',
        stage: 'Deals',
        section: 'deals',
        count: dealsNeedingAction.length,
        message: `${dealsNeedingAction.length} deals need attention`,
        severity: dealsNeedingAction.length > 3 ? 'critical' : 'warning',
      });
    }

    // Check conversion rate bottleneck
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.lead_state === 'Converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    
    if (totalLeads >= 10 && conversionRate < 10) {
      alertList.push({
        id: 'low-conversion',
        type: 'low_conversion',
        stage: 'Lead→Deal',
        section: 'leads',
        count: Math.round(conversionRate),
        message: `Only ${conversionRate.toFixed(0)}% lead conversion rate`,
        severity: 'critical',
      });
    }

    return alertList;
  }, [prospectStats, dbLeads, dbDeals]);

  // Quick stats
  const quickStats = useMemo(() => {
    const leads = dbLeads || [];
    const deals = dbDeals || [];
    
    return {
      prospectsToContact: prospectStats?.byStatus?.not_contacted || 0,
      leadsToQualify: leads.filter(l => l.lead_state === 'Contacted').length,
      dealsToProgress: deals.filter(d => 
        !['ClosedWon', 'ClosedLost'].includes(d.deal_state)
      ).length,
      readyToConvert: leads.filter(l => l.lead_state === 'Qualified').length,
    };
  }, [prospectStats, dbLeads, dbDeals]);

  if (isLoading) {
    return (
      <div className="card-surface p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Pipeline Health
        </h3>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {alerts.length} {alerts.length === 1 ? 'issue' : 'issues'}
          </Badge>
        )}
      </div>

      {/* Quick Action Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => onNavigate?.('prospects')}
          className="p-3 rounded-lg bg-chart-1/10 hover:bg-chart-1/20 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-chart-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">To Contact</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {quickStats.prospectsToContact}
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('leads')}
          className="p-3 rounded-lg bg-chart-2/10 hover:bg-chart-2/20 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-chart-2">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-medium">To Qualify</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {quickStats.leadsToQualify}
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('leads')}
          className="p-3 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-gold">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Ready to Convert</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {quickStats.readyToConvert}
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('deals')}
          className="p-3 rounded-lg bg-chart-3/10 hover:bg-chart-3/20 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-chart-3">
            <Handshake className="w-4 h-4" />
            <span className="text-xs font-medium">Active Deals</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {quickStats.dealsToProgress}
          </div>
        </button>
      </div>

      {/* Bottleneck Alerts */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Bottlenecks
          </h4>
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onNavigate?.(alert.section)}
              className={cn(
                "w-full p-3 rounded-lg flex items-center gap-3 text-left transition-colors",
                alert.severity === 'critical' 
                  ? "bg-destructive/10 hover:bg-destructive/20 border border-destructive/30" 
                  : "bg-gold/10 hover:bg-gold/20 border border-gold/30"
              )}
            >
              {alert.type === 'aging' && <Clock className={cn("w-4 h-4", alert.severity === 'critical' ? "text-destructive" : "text-gold")} />}
              {alert.type === 'stalled' && <AlertTriangle className={cn("w-4 h-4", alert.severity === 'critical' ? "text-destructive" : "text-gold")} />}
              {alert.type === 'low_conversion' && <TrendingUp className={cn("w-4 h-4", alert.severity === 'critical' ? "text-destructive" : "text-gold")} />}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {alert.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alert.stage}
                </p>
              </div>
              
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald" />
          Pipeline is healthy! No bottlenecks detected.
        </div>
      )}
    </div>
  );
}
