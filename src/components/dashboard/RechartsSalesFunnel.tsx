import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FunnelChart,
  Funnel,
  Cell,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useProspectStats } from '@/hooks/useProspects';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown } from 'lucide-react';

interface RechartsSalesFunnelProps {
  onNavigate?: (section: string) => void;
}

// Extract CSS variable colors at runtime
const getCssColor = (varName: string): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value ? `hsl(${value})` : 'hsl(var(--primary))';
};

// Stage colors mapped to theme tokens
const STAGE_COLORS = [
  'hsl(var(--chart-1))',  // Prospects - Teal
  'hsl(var(--chart-2))',  // Verified Leads - Green
  'hsl(var(--chart-3))',  // Qualified - Cyan
  'hsl(var(--chart-4))',  // Active Deals - Lime
  'hsl(var(--gold))',     // Closed Won - Gold
];

interface FunnelDataItem {
  id: string;
  name: string;
  value: number;
  section: string;
  fill: string;
}

// Custom label component for funnel stages
const CustomFunnelLabel = (props: any) => {
  const { x, y, width, height, name, value } = props;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <g>
      <text
        x={centerX}
        y={centerY - 6}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize={12}
        fontWeight={500}
      >
        {name}
      </text>
      <text
        x={centerX}
        y={centerY + 12}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize={16}
        fontWeight={700}
      >
        {value.toLocaleString()}
      </text>
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {data.value.toLocaleString()} records
      </p>
    </div>
  );
};

export function RechartsSalesFunnel({ onNavigate }: RechartsSalesFunnelProps) {
  const { data: prospectStats, isLoading: isLoadingProspects } = useProspectStats();
  const { data: dbLeads, isLoading: isLoadingLeads } = useLeads();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();

  const isLoading = isLoadingProspects || isLoadingLeads || isLoadingDeals;

  const handleCellClick = useCallback(
    (section: string) => {
      onNavigate?.(section);
    },
    [onNavigate]
  );

  const funnelData = useMemo<FunnelDataItem[]>(() => {
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
        name: 'Prospects',
        value: totalProspects,
        section: 'prospects',
        fill: STAGE_COLORS[0],
      },
      {
        id: 'leads',
        name: 'Verified Leads',
        value: totalActiveLeads,
        section: 'leads',
        fill: STAGE_COLORS[1],
      },
      {
        id: 'qualified',
        name: 'Qualified',
        value: qualifiedLeads,
        section: 'leads',
        fill: STAGE_COLORS[2],
      },
      {
        id: 'deals',
        name: 'Active Deals',
        value: activeDeals,
        section: 'deals',
        fill: STAGE_COLORS[3],
      },
      {
        id: 'closed',
        name: 'Closed Won',
        value: closedWonDeals,
        section: 'deals',
        fill: STAGE_COLORS[4],
      },
    ];
  }, [prospectStats, dbLeads, dbDeals]);

  // Calculate conversion rates between stages
  const conversionRates = useMemo(() => {
    const rates: number[] = [];
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i].value;
      const next = funnelData[i + 1].value;
      rates.push(current > 0 ? Math.min((next / current) * 100, 100) : 0);
    }
    return rates;
  }, [funnelData]);

  const overallConversion = useMemo(() => {
    const prospects = funnelData.find((s) => s.id === 'prospects')?.value || 0;
    const closed = funnelData.find((s) => s.id === 'closed')?.value || 0;
    return prospects > 0 ? (closed / prospects) * 100 : 0;
  }, [funnelData]);

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
        boxShadow:
          '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TrendingDown className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Sales Funnel
          </span>
          <span className="text-xs font-normal text-muted-foreground ml-2">
            (Recharts)
          </span>
        </h3>
        <motion.div
          className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <span className="text-xs text-muted-foreground">Overall: </span>
          <span className="text-sm font-bold text-primary">
            {overallConversion.toFixed(1)}%
          </span>
        </motion.div>
      </div>

      {/* Funnel Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {funnelData.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={entry.fill}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  onClick={() => handleCellClick(entry.section)}
                  style={{ cursor: onNavigate ? 'pointer' : 'default' }}
                />
              ))}
              <LabelList
                position="center"
                content={<CustomFunnelLabel />}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>

        {/* Conversion Rate Badges - Positioned between stages */}
        <div className="absolute right-4 top-0 h-full flex flex-col justify-around py-8 pointer-events-none">
          {conversionRates.map((rate, index) => (
            <motion.div
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                rate < 20
                  ? 'bg-destructive/20 text-destructive border border-destructive/30'
                  : rate < 50
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald/20 text-emerald border border-emerald/30'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {rate.toFixed(1)}%
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
