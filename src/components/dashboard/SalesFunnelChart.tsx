import { useMemo, useCallback } from 'react';
import { useProspects, useProspectStats } from '@/hooks/useProspects';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Users, UserCheck, Handshake, Trophy, ArrowRight, ChevronRight } from 'lucide-react';
import CountUp from 'react-countup';
import { cn } from '@/lib/utils';

interface FunnelStage {
  id: string;
  section: string; // Maps to app section for navigation
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface SalesFunnelChartProps {
  onNavigate?: (section: string) => void;
}

export function SalesFunnelChart({ onNavigate }: SalesFunnelChartProps) {
  const { data: prospectStats, isLoading: isLoadingProspects } = useProspectStats();
  const { data: dbLeads, isLoading: isLoadingLeads } = useLeads();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();

  const isLoading = isLoadingProspects || isLoadingLeads || isLoadingDeals;

  const handleStageClick = useCallback((section: string) => {
    onNavigate?.(section);
  }, [onNavigate]);

  const funnelData = useMemo<FunnelStage[]>(() => {
    const totalProspects = prospectStats?.total || 0;
    const convertedProspects = prospectStats?.byStatus?.converted || 0;
    
    // Count leads by state
    const leads = dbLeads || [];
    const activeLeads = leads.filter(l => !['Disqualified', 'Converted'].includes(l.lead_state)).length;
    const convertedLeads = leads.filter(l => l.lead_state === 'Converted').length;
    
    // Count deals by state
    const deals = dbDeals || [];
    const activeDeals = deals.filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state)).length;
    const closedWonDeals = deals.filter(d => d.deal_state === 'ClosedWon').length;

    return [
      {
        id: 'prospects',
        section: 'prospects',
        label: 'Prospects',
        count: totalProspects,
        icon: Users,
        color: 'text-chart-1',
        bgColor: 'bg-chart-1/20',
      },
      {
        id: 'leads',
        section: 'leads',
        label: 'Leads',
        count: activeLeads + convertedLeads,
        icon: UserCheck,
        color: 'text-chart-2',
        bgColor: 'bg-chart-2/20',
      },
      {
        id: 'deals',
        section: 'deals',
        label: 'Active Deals',
        count: activeDeals + closedWonDeals,
        icon: Handshake,
        color: 'text-chart-3',
        bgColor: 'bg-chart-3/20',
      },
      {
        id: 'closed',
        section: 'deals', // Closed won still navigates to deals section
        label: 'Closed Won',
        count: closedWonDeals,
        icon: Trophy,
        color: 'text-chart-4',
        bgColor: 'bg-chart-4/20',
      },
    ];
  }, [prospectStats, dbLeads, dbDeals]);

  // Calculate conversion rates between stages
  const conversionRates = useMemo(() => {
    const rates: { from: string; to: string; rate: number }[] = [];
    
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i];
      const next = funnelData[i + 1];
      const rate = current.count > 0 ? (next.count / current.count) * 100 : 0;
      rates.push({
        from: current.id,
        to: next.id,
        rate: Math.min(rate, 100), // Cap at 100%
      });
    }
    
    return rates;
  }, [funnelData]);

  // Overall conversion rate (Prospects to Closed)
  const overallConversion = useMemo(() => {
    const prospects = funnelData.find(s => s.id === 'prospects')?.count || 0;
    const closed = funnelData.find(s => s.id === 'closed')?.count || 0;
    return prospects > 0 ? (closed / prospects) * 100 : 0;
  }, [funnelData]);

  if (isLoading) {
    return (
      <div className="card-surface p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...funnelData.map(s => s.count), 1);

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          Sales Funnel
        </h3>
        <div className="text-xs text-muted-foreground">
          Overall: <span className="text-primary font-medium">{overallConversion.toFixed(1)}%</span>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-2">
        {funnelData.map((stage, index) => {
          const widthPercent = (stage.count / maxCount) * 100;
          const Icon = stage.icon;
          const conversionRate = conversionRates[index];
          
          return (
            <div key={stage.id}>
              {/* Stage Bar - Clickable */}
              <div className="relative">
                <button 
                  onClick={() => handleStageClick(stage.section)}
                  className={cn(
                    stage.bgColor,
                    "rounded-lg transition-all duration-300 ease-out w-full text-left",
                    "hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    onNavigate && "cursor-pointer"
                  )}
                  style={{ 
                    width: `${Math.max(widthPercent, 20)}%`,
                    marginLeft: `${(100 - Math.max(widthPercent, 20)) / 2}%`,
                  }}
                  aria-label={`View ${stage.label}`}
                >
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${stage.color}`} />
                      <span className="text-sm font-medium text-foreground">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${stage.color}`}>
                        <CountUp end={stage.count} duration={1} />
                      </span>
                      {onNavigate && <ChevronRight className={`w-4 h-4 ${stage.color} opacity-60`} />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Conversion Arrow */}
              {conversionRate && (
                <div className="flex items-center justify-center py-1 text-xs text-muted-foreground">
                  <ArrowRight className="w-3 h-3 mr-1" />
                  <span className={conversionRate.rate > 30 ? 'text-emerald' : conversionRate.rate > 10 ? 'text-gold' : 'text-coral'}>
                    {conversionRate.rate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
        {conversionRates.map((rate) => (
          <div key={`${rate.from}-${rate.to}`} className="text-xs">
            <div className="text-muted-foreground capitalize">
              {rate.from.slice(0, 4)} → {rate.to.slice(0, 4)}
            </div>
            <div className={`font-medium ${rate.rate > 30 ? 'text-emerald' : rate.rate > 10 ? 'text-gold' : 'text-coral'}`}>
              {rate.rate.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
