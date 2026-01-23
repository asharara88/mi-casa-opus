import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useProspectStats } from '@/hooks/useProspects';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Users, UserCheck, Handshake, Trophy, ChevronRight } from 'lucide-react';

interface RechartsSalesFunnelProps {
  onNavigate?: (section: string) => void;
}

interface FunnelStageData {
  id: string;
  section: string;
  label: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

export function RechartsSalesFunnel({ onNavigate }: RechartsSalesFunnelProps) {
  const { data: prospectStats, isLoading: isLoadingProspects } = useProspectStats();
  const { data: dbLeads, isLoading: isLoadingLeads } = useLeads();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();

  const isLoading = isLoadingProspects || isLoadingLeads || isLoadingDeals;

  const handleStageClick = useCallback(
    (section: string) => {
      onNavigate?.(section);
    },
    [onNavigate]
  );

  const funnelData = useMemo<FunnelStageData[]>(() => {
    const totalProspects = prospectStats?.total || 0;

    const leads = dbLeads || [];
    const qualifiedLeads = leads.filter((l) =>
      ['Qualified', 'HighIntent'].includes(l.lead_state)
    ).length;
    const totalActiveLeads = leads.filter(
      (l) => !['Disqualified', 'Converted'].includes(l.lead_state)
    ).length;

    const deals = dbDeals || [];
    const activeDeals = deals.filter(
      (d) => !['ClosedWon', 'ClosedLost'].includes(d.deal_state)
    ).length;
    const closedWonDeals = deals.filter((d) => d.deal_state === 'ClosedWon').length;

    return [
      {
        id: 'prospects',
        section: 'prospects',
        label: 'Prospects',
        count: totalProspects,
        icon: Users,
        colorClass: 'text-chart-1',
        bgClass: 'bg-chart-1/20 border-chart-1/40',
      },
      {
        id: 'leads',
        section: 'leads',
        label: 'Leads',
        count: totalActiveLeads,
        icon: UserCheck,
        colorClass: 'text-chart-2',
        bgClass: 'bg-chart-2/20 border-chart-2/40',
      },
      {
        id: 'qualified',
        section: 'leads',
        label: 'Qualified',
        count: qualifiedLeads,
        icon: UserCheck,
        colorClass: 'text-chart-3',
        bgClass: 'bg-chart-3/20 border-chart-3/40',
      },
      {
        id: 'deals',
        section: 'deals',
        label: 'Deals',
        count: activeDeals,
        icon: Handshake,
        colorClass: 'text-chart-4',
        bgClass: 'bg-chart-4/20 border-chart-4/40',
      },
      {
        id: 'closed',
        section: 'deals',
        label: 'Won',
        count: closedWonDeals,
        icon: Trophy,
        colorClass: 'text-gold',
        bgClass: 'bg-gold/20 border-gold/40',
      },
    ];
  }, [prospectStats, dbLeads, dbDeals]);

  const conversionRates = useMemo(() => {
    const rates: number[] = [];
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i].count;
      const next = funnelData[i + 1].count;
      rates.push(current > 0 ? Math.min((next / current) * 100, 100) : 0);
    }
    return rates;
  }, [funnelData]);

  const overallConversion = useMemo(() => {
    const prospects = funnelData.find((s) => s.id === 'prospects')?.count || 0;
    const closed = funnelData.find((s) => s.id === 'closed')?.count || 0;
    return prospects > 0 ? (closed / prospects) * 100 : 0;
  }, [funnelData]);

  const maxCount = Math.max(...funnelData.map((s) => s.count), 1);

  if (isLoading) {
    return (
      <div className="card-surface p-4 rounded-xl">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="card-surface p-4 rounded-xl border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          Sales Funnel
        </h3>
        <div className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/25">
          <span className="text-xs text-muted-foreground">Total: </span>
          <span className="text-xs font-semibold text-primary">
            {overallConversion.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Funnel Stages */}
      <div className="space-y-2">
        {funnelData.map((stage, index) => {
          const Icon = stage.icon;
          const widthPercent = Math.max((stage.count / maxCount) * 100, 15);
          const conversionRate = conversionRates[index];

          return (
            <div key={stage.id} className="space-y-1">
              {/* Stage Row */}
              <motion.button
                onClick={() => handleStageClick(stage.section)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${stage.bgClass} hover:opacity-80`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Icon */}
                <div className={`shrink-0 ${stage.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label & Progress Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {stage.label}
                    </span>
                    <span className={`text-sm font-bold ${stage.colorClass}`}>
                      {stage.count.toLocaleString()}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${stage.colorClass.replace('text-', 'bg-')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.button>

              {/* Conversion Arrow */}
              {index < funnelData.length - 1 && (
                <div className="flex items-center justify-center py-0.5">
                  <motion.div
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    <span
                      className={`font-medium ${
                        conversionRate < 20
                          ? 'text-destructive'
                          : conversionRate < 50
                          ? 'text-amber-400'
                          : 'text-emerald'
                      }`}
                    >
                      {conversionRate.toFixed(0)}%
                    </span>
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
