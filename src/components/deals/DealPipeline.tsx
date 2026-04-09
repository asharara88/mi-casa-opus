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
import { Deal, DealState, DEAL_STATE_REQUIREMENTS, ValidationContext } from '@/types/bos';
import { StateBadge } from '@/components/dashboard/StateBadge';
import { cn } from '@/lib/utils';
import { FileText, PenTool, Camera, DollarSign } from 'lucide-react';
import { DraggableDealCard } from '@/components/pipeline/DraggableDealCard';
import { Database } from '@/integrations/supabase/types';

type NextActionType = Database['public']['Enums']['next_action_type'];

type ExtendedDeal = Deal & { 
  dbId: string;
  next_action?: NextActionType | null;
  next_action_due?: string | null;
};

interface DealPipelineProps {
  deals: ExtendedDeal[];
  context: ValidationContext;
  onDealClick: (deal: Deal) => void;
  onTransition: (deal: Deal, targetState: DealState) => void;
  onDragTransition?: (dealDbId: string, targetState: DealState) => void;
  onSetNextAction: (deal: ExtendedDeal) => void;
}

const PIPELINE_STATES: DealState[] = ['Created', 'Qualified', 'Viewing', 'Offer', 'Reservation', 'SPA'];

export function DealPipeline({ 
  deals, 
  context, 
  onDealClick, 
  onTransition,
  onDragTransition,
  onSetNextAction
}: DealPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getDealsByState = (state: DealState) => 
    deals.filter(d => d.deal_state === state);

  const getDealCount = (state: DealState) => 
    deals.filter(d => d.deal_state === state).length;

  const getTotalValue = (state: DealState) => {
    const stateDeals = deals.filter(d => d.deal_state === state);
    return stateDeals.reduce((sum, d) => sum + (d.agreed_price || 0), 0);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M AED`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K AED`;
    return `${value} AED`;
  };

  const activeDeal = activeId ? deals.find(d => d.dbId === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealDbId = active.id as string;
    const deal = deals.find(d => d.dbId === dealDbId);
    if (!deal) return;

    // Determine target state from the drop zone
    const targetState = over.id as DealState;
    
    // Only transition if dropping on a different state
    if (PIPELINE_STATES.includes(targetState) && targetState !== deal.deal_state) {
      if (onDragTransition) {
        onDragTransition(dealDbId, targetState);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {PIPELINE_STATES.map(state => {
          const requirements = DEAL_STATE_REQUIREMENTS[state];
          const totalValue = getTotalValue(state);
          const stateDeals = getDealsByState(state);

          return (
            <div key={state} className="pipeline-column" data-state={state}>
              {/* Column Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <StateBadge state={state} type="deal" />
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
                {requirements.required_documents.length > 0 && (
                  <div className="flex items-center gap-1" title="Documents required">
                    <FileText className="w-3 h-3" />
                    <span>{requirements.required_documents.length}</span>
                  </div>
                )}
                {requirements.required_signatures.length > 0 && (
                  <div className="flex items-center gap-1" title="Signatures required">
                    <PenTool className="w-3 h-3" />
                    <span>{requirements.required_signatures.length}</span>
                  </div>
                )}
                {requirements.required_evidence.length > 0 && (
                  <div className="flex items-center gap-1" title="Evidence required">
                    <Camera className="w-3 h-3" />
                    <span>{requirements.required_evidence.length}</span>
                  </div>
                )}
              </div>

              {/* Sortable Cards */}
              <SortableContext
                items={stateDeals.map(d => d.dbId)}
                strategy={verticalListSortingStrategy}
                id={state}
              >
                <div className="space-y-2 min-h-[100px]">
                  {stateDeals.map(deal => (
                    <DraggableDealCard
                      key={deal.dbId}
                      deal={deal}
                      context={context}
                      onClick={() => onDealClick(deal)}
                      onTransition={onTransition}
                      onSetNextAction={onSetNextAction}
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
          <div className="pipeline-column bg-emerald/5 border border-emerald/20 flex-1">
            <div className="flex items-center justify-between mb-3">
              <StateBadge state="Closed_Won" type="deal" />
              <span className="text-sm text-muted-foreground">
                ({getDealCount('Closed_Won')})
              </span>
            </div>
            <div className="text-center py-4">
              <DollarSign className="w-6 h-6 text-emerald mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald">
                {formatCurrency(getTotalValue('Closed_Won'))}
              </p>
            </div>
          </div>

          {/* Lost */}
          <div className="pipeline-column bg-destructive/5 border border-destructive/20 flex-1">
            <div className="flex items-center justify-between mb-3">
              <StateBadge state="Closed_Lost" type="deal" />
              <span className="text-sm text-muted-foreground">
                ({getDealCount('Closed_Lost')})
              </span>
            </div>
            <div className="text-sm text-muted-foreground text-center py-4">
              {getDealCount('Closed_Lost')} lost
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDeal && (
          <div className="pipeline-card opacity-90 shadow-xl ring-2 ring-primary rotate-2">
            <p className="font-medium text-foreground text-sm">
              {activeDeal.deal_type} • {activeDeal.side}
            </p>
            <p className="text-xs text-muted-foreground">{activeDeal.deal_state}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
