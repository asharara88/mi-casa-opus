import { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useProspectStats } from '@/hooks/useProspects';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Users, UserCheck, Handshake, Trophy } from 'lucide-react';
import { FunnelStage } from './funnel/FunnelStage';
import { ConversionBadge } from './funnel/ConversionBadge';
import { FunnelGradients } from './funnel/FunnelGradients';

interface SalesFunnelChartProps {
  onNavigate?: (section: string) => void;
}

interface FunnelStageData {
  id: string;
  section: string;
  label: string;
  count: number;
  icon: React.ElementType;
  gradientId: string;
}

export function SalesFunnelChart({ onNavigate }: SalesFunnelChartProps) {
  const { data: prospectStats, isLoading: isLoadingProspects } = useProspectStats();
  const { data: dbLeads, isLoading: isLoadingLeads } = useLeads();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();

  const isLoading = isLoadingProspects || isLoadingLeads || isLoadingDeals;

  const handleStageClick = useCallback((section: string) => {
    onNavigate?.(section);
  }, [onNavigate]);

  const funnelData = useMemo<FunnelStageData[]>(() => {
    const totalProspects = prospectStats?.total || 0;
    
    const leads = dbLeads || [];
    const qualifiedLeads = leads.filter(l => 
      ['Qualified', 'HighIntent'].includes(l.lead_state)
    ).length;
    const totalActiveLeads = leads.filter(l => 
      !['Disqualified', 'Converted'].includes(l.lead_state)
    ).length;
    
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
        gradientId: 'funnel-gradient-prospects',
      },
      {
        id: 'leads',
        section: 'leads',
        label: 'Active Leads',
        count: totalActiveLeads,
        icon: UserCheck,
        gradientId: 'funnel-gradient-leads',
      },
      {
        id: 'qualified',
        section: 'leads',
        label: 'Qualified',
        count: qualifiedLeads,
        icon: UserCheck,
        gradientId: 'funnel-gradient-qualified',
      },
      {
        id: 'deals',
        section: 'deals',
        label: 'Active Deals',
        count: activeDeals,
        icon: Handshake,
        gradientId: 'funnel-gradient-deals',
      },
      {
        id: 'closed',
        section: 'deals',
        label: 'Closed Won',
        count: closedWonDeals,
        icon: Trophy,
        gradientId: 'funnel-gradient-won',
      },
    ];
  }, [prospectStats, dbLeads, dbDeals]);

  const conversionRates = useMemo(() => {
    const rates: { from: string; to: string; rate: number }[] = [];
    
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i];
      const next = funnelData[i + 1];
      const rate = current.count > 0 ? (next.count / current.count) * 100 : 0;
      rates.push({
        from: current.id,
        to: next.id,
        rate: Math.min(rate, 100),
      });
    }
    
    return rates;
  }, [funnelData]);

  const overallConversion = useMemo(() => {
    const prospects = funnelData.find(s => s.id === 'prospects')?.count || 0;
    const closed = funnelData.find(s => s.id === 'closed')?.count || 0;
    return prospects > 0 ? (closed / prospects) * 100 : 0;
  }, [funnelData]);

  // Calculate trapezoid dimensions - responsive
  const stageHeight = 40;
  const stageGap = 24; // Gap for conversion badge
  const totalStages = funnelData.length;
  const maxWidth = 340;
  const minWidth = 100;
  const widthStep = (maxWidth - minWidth) / (totalStages - 1);

  if (isLoading) {
    return (
      <div className="card-surface p-4 rounded-xl">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  return (
    <motion.div 
      className="card-surface p-4 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </motion.div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Sales Funnel
          </span>
        </h3>
        <motion.div 
          className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/20 border border-primary/30 shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <span className="text-[10px] sm:text-xs text-muted-foreground">Overall: </span>
          <span className="text-xs sm:text-sm font-bold text-primary">
            {overallConversion.toFixed(1)}%
          </span>
        </motion.div>
      </div>

      {/* SVG Funnel */}
      <svg
        viewBox="0 0 400 310"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: '320px', minHeight: '200px' }}
      >
        <FunnelGradients />
        
        {funnelData.map((stage, index) => {
          const topWidth = maxWidth - (widthStep * index);
          const bottomWidth = maxWidth - (widthStep * (index + 1));
          const yOffset = index * (stageHeight + stageGap);
          
          return (
            <FunnelStage
              key={stage.id}
              label={stage.label}
              count={stage.count}
              icon={stage.icon}
              gradientId={stage.gradientId}
              topWidth={topWidth}
              bottomWidth={bottomWidth}
              height={stageHeight}
              yOffset={yOffset}
              index={index}
              isClickable={!!onNavigate}
              onClick={() => handleStageClick(stage.section)}
            />
          );
        })}

        {/* Conversion badges between stages */}
        {conversionRates.map((rate, index) => {
          const yPosition = (index + 1) * (stageHeight + stageGap) - stageGap / 2 - 12;
          
          return (
            <ConversionBadge
              key={`${rate.from}-${rate.to}`}
              rate={rate.rate}
              yPosition={yPosition}
              index={index}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}
