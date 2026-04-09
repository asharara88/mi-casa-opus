import { useMemo } from 'react';
import { TrendingUp, Target, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CountUp from 'react-countup';

// Stage weight configuration
const STAGE_WEIGHTS: Record<string, { weight: number; label: string; color: string }> = {
  Offer: { weight: 0.4, label: '40%', color: 'bg-warning' },
  Reservation: { weight: 0.7, label: '70%', color: 'bg-primary' },
  SPA: { weight: 0.9, label: '90%', color: 'bg-emerald' },
};

// Stages to include in forecast (active deal stages with pipeline value)
const FORECAST_STAGES = ['Offer', 'Reservation', 'SPA'];

interface Deal {
  deal_id: string;
  deal_state: string;
  deal_economics: Record<string, unknown> | null;
}

interface ForecastWidgetProps {
  deals: Deal[];
}

interface StageData {
  stage: string;
  count: number;
  totalValue: number;
  weightedValue: number;
  weight: number;
  color: string;
}

export function ForecastWidget({ deals }: ForecastWidgetProps) {
  const forecastData = useMemo(() => {
    const stageData: StageData[] = FORECAST_STAGES.map(stage => {
      const stageDeals = deals.filter(d => d.deal_state === stage);
      const totalValue = stageDeals.reduce((sum, d) => {
        const economics = d.deal_economics as Record<string, unknown> | null;
        return sum + ((economics?.agreed_price as number) || 0);
      }, 0);
      
      const config = STAGE_WEIGHTS[stage];
      return {
        stage,
        count: stageDeals.length,
        totalValue,
        weightedValue: totalValue * config.weight,
        weight: config.weight,
        color: config.color,
      };
    });

    const totalWeightedRevenue = stageData.reduce((sum, s) => sum + s.weightedValue, 0);
    const totalPipelineValue = stageData.reduce((sum, s) => sum + s.totalValue, 0);
    const totalDeals = stageData.reduce((sum, s) => sum + s.count, 0);

    return {
      stages: stageData,
      totalWeightedRevenue,
      totalPipelineValue,
      totalDeals,
    };
  }, [deals]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toLocaleString();
  };

  const maxValue = Math.max(...forecastData.stages.map(s => s.totalValue), 1);

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Revenue Forecast
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-muted-foreground cursor-help">
                Weighted by stage
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Offer: 40% • Reservation: 70% • SPA: 90%
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Total Projected Revenue */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Projected Revenue
            </p>
            <p className="text-2xl font-bold text-primary">
              <CountUp
                end={forecastData.totalWeightedRevenue}
                duration={1.5}
                separator=","
                formattingFn={(value) => `${formatCurrency(value)} AED`}
              />
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {forecastData.totalDeals} deal{forecastData.totalDeals !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              of {formatCurrency(forecastData.totalPipelineValue)} AED
            </p>
          </div>
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="space-y-4">
        {forecastData.stages.map((stage) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{stage.stage}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${stage.color} text-white`}>
                  {STAGE_WEIGHTS[stage.stage].label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">
                  {stage.count > 0 ? (
                    <>
                      <span className="text-foreground font-medium">
                        {formatCurrency(stage.weightedValue)}
                      </span>
                      <span className="text-xs ml-1">
                        ({formatCurrency(stage.totalValue)})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={(stage.totalValue / maxValue) * 100} 
                className="h-2"
              />
              {stage.count > 0 && (
                <div 
                  className="absolute top-0 h-2 bg-foreground/20 rounded-full"
                  style={{ 
                    width: `${(stage.weightedValue / maxValue) * 100}%`,
                    left: 0,
                  }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stage.count} deal{stage.count !== 1 ? 's' : ''} in stage
            </p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {forecastData.totalDeals === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No deals in forecast stages yet.
          <br />
          <span className="text-xs">
            Move deals to Offer, Reservation, or SPA to see projections.
          </span>
        </div>
      )}
    </div>
  );
}
