import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { FileText, DollarSign, Home } from 'lucide-react';
import { PipelineStateBadge } from './PipelineStateBadge';
import { SecondaryDealCard } from './SecondaryDealCard';
import { PipelineDeal } from '@/hooks/usePipelineDeals';
import {
  SecondaryDealState,
  SECONDARY_PIPELINE_STATES,
  SECONDARY_STATE_CONFIG,
} from '@/types/pipeline';

interface SecondaryPipelineProps {
  deals: PipelineDeal[];
  onDealClick: (deal: PipelineDeal) => void;
  onDragTransition?: (dealId: string, targetState: SecondaryDealState) => void;
  onSetNextAction: (deal: PipelineDeal) => void;
}

export function SecondaryPipeline({
  deals,
  onDealClick,
  onDragTransition,
  onSetNextAction,
}: SecondaryPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getDealsByState = (state: SecondaryDealState) =>
    deals.filter((d) => d.secondary_state === state);

  const getDealCount = (state: SecondaryDealState) =>
    deals.filter((d) => d.secondary_state === state).length;

  const getTotalValue = (state: SecondaryDealState) => {
    const stateDeals = deals.filter((d) => d.secondary_state === state);
    return stateDeals.reduce((sum, d) => {
      const price = d.deal_economics?.agreed_price || d.deal_economics?.asking_price || 0;
      return sum + price;
    }, 0);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M AED`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K AED`;
    return `${value} AED`;
  };

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const targetState = over.id as SecondaryDealState;

    if (SECONDARY_PIPELINE_STATES.includes(targetState) && targetState !== deal.secondary_state) {
      onDragTransition?.(dealId, targetState);
    }
  };

  const closedWonDeals = deals.filter((d) => d.secondary_state === 'ClosedWon');
  const closedLostDeals = deals.filter((d) => d.secondary_state === 'ClosedLost');
  const closedWonValue = closedWonDeals.reduce((sum, d) => {
    const price = d.deal_economics?.agreed_price || d.deal_economics?.asking_price || 0;
    return sum + price;
  }, 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {SECONDARY_PIPELINE_STATES.map((state) => {
          const config = SECONDARY_STATE_CONFIG[state];
          const totalValue = getTotalValue(state);
          const stateDeals = getDealsByState(state);

          return (
            <div key={state} className="pipeline-column" data-state={state}>
              {/* Column Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <PipelineStateBadge pipeline="Secondary" state={state} />
                  <span className="text-sm text-muted-foreground">
                    ({getDealCount(state)})
                  </span>
                </div>
                {totalValue > 0 && (
                  <p className="text-xs text-primary font-medium">
                    {formatCurrency(totalValue)}
                  </p>
                )}
              </div>

              {/* Requirements Indicator */}
              <div className="flex gap-2 mb-3 text-xs text-muted-foreground">
                {config.requiredDocs.length > 0 && (
                  <div className="flex items-center gap-1" title="Documents required">
                    <FileText className="w-3 h-3" />
                    <span>{config.requiredDocs.length}</span>
                  </div>
                )}
              </div>

              {/* Sortable Cards */}
              <SortableContext
                items={stateDeals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
                id={state}
              >
                <div className="space-y-2 min-h-[100px]">
                  {stateDeals.map((deal) => (
                    <SecondaryDealCard
                      key={deal.id}
                      deal={deal}
                      onClick={() => onDealClick(deal)}
                      onSetNextAction={() => onSetNextAction(deal)}
                    />
                  ))}

                  {stateDeals.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                      Drop deals here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}

        {/* Closed Columns */}
        <div className="flex flex-col gap-4 min-w-[280px]">
          {/* Won */}
          <div className="pipeline-column bg-emerald-500/5 border border-emerald-500/20 flex-1">
            <div className="flex items-center justify-between mb-3">
              <PipelineStateBadge pipeline="Secondary" state="ClosedWon" />
              <span className="text-sm text-muted-foreground">
                ({closedWonDeals.length})
              </span>
            </div>
            <div className="text-center py-4">
              <DollarSign className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-500">
                {formatCurrency(closedWonValue)}
              </p>
            </div>
          </div>

          {/* Lost */}
          <div className="pipeline-column bg-destructive/5 border border-destructive/20 flex-1">
            <div className="flex items-center justify-between mb-3">
              <PipelineStateBadge pipeline="Secondary" state="ClosedLost" />
              <span className="text-sm text-muted-foreground">
                ({closedLostDeals.length})
              </span>
            </div>
            <div className="text-sm text-muted-foreground text-center py-4">
              {closedLostDeals.length} lost
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDeal && (
          <div className="pipeline-card opacity-90 shadow-xl ring-2 ring-primary rotate-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              <p className="font-medium text-foreground text-sm">
                {activeDeal.property_id || 'Secondary Deal'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeDeal.secondary_state}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
