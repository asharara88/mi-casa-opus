import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2, Home, LucideIcon } from 'lucide-react';
import { DealPipeline, PIPELINE_CONFIG } from '@/types/pipeline';

interface PipelineSelectorProps {
  selected: DealPipeline;
  onSelect: (pipeline: DealPipeline) => void;
  stats?: {
    offplan: { total: number; active: number; won: number; winRate: number };
    secondary: { total: number; active: number; won: number; winRate: number };
  };
}

const PIPELINE_ICONS: Record<DealPipeline, LucideIcon> = {
  OffPlan: Building2,
  Secondary: Home,
};

export function PipelineSelector({ selected, onSelect, stats }: PipelineSelectorProps) {
  return (
    <div className="flex gap-2">
      {(Object.keys(PIPELINE_CONFIG) as DealPipeline[]).map((pipeline) => {
        const Icon = PIPELINE_ICONS[pipeline];
        const config = PIPELINE_CONFIG[pipeline];
        const isSelected = selected === pipeline;
        const pipelineStats = stats?.[pipeline === 'OffPlan' ? 'offplan' : 'secondary'];

        return (
          <Button
            key={pipeline}
            variant={isSelected ? 'default' : 'outline'}
            size="lg"
            onClick={() => onSelect(pipeline)}
            className={cn(
              'flex-1 h-auto py-3 px-4 flex flex-col items-start gap-1',
              isSelected && 'ring-2 ring-primary/30'
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <Icon className="h-4 w-4" />
              <span className="font-semibold">{config.label}</span>
              {pipelineStats && (
                <span className="ml-auto text-xs opacity-80">
                  {pipelineStats.active} active
                </span>
              )}
            </div>
            <p className="text-xs opacity-70 text-left font-normal">
              {config.description}
            </p>
            {pipelineStats && pipelineStats.total > 0 && (
              <div className="flex items-center gap-2 text-xs opacity-80 mt-1">
                <span>{pipelineStats.won} won</span>
                <span>•</span>
                <span>{pipelineStats.winRate}% win rate</span>
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
}
