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
import { Lead, LeadState, LEAD_STATE_REQUIREMENTS } from '@/types/bos';
import { StateBadge } from '@/components/dashboard/StateBadge';
import { DraggableLeadCard } from '@/components/pipeline/DraggableLeadCard';
import { Database } from '@/integrations/supabase/types';

type NextActionType = Database['public']['Enums']['next_action_type'];

type ExtendedLead = Lead & { 
  id: string; 
  next_action?: NextActionType | null;
  next_action_due?: string | null;
};

interface LeadPipelineProps {
  leads: ExtendedLead[];
  onLeadClick: (lead: Lead) => void;
  onTransition: (lead: Lead, targetState: LeadState) => void;
  onDragTransition?: (leadId: string, targetState: LeadState) => void;
  onSetNextAction: (lead: ExtendedLead) => void;
}

const PIPELINE_STATES: LeadState[] = ['New', 'Contacted', 'Qualified', 'Converted'];

export function LeadPipeline({ 
  leads, 
  onLeadClick, 
  onTransition, 
  onDragTransition,
  onSetNextAction 
}: LeadPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getLeadsByState = (state: LeadState) => 
    leads.filter(l => l.lead_state === state);

  const getLeadCount = (state: LeadState) => 
    leads.filter(l => l.lead_state === state).length;

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Determine target state from the drop zone
    const targetState = over.id as LeadState;
    
    // Only transition if dropping on a different state
    if (PIPELINE_STATES.includes(targetState) && targetState !== lead.lead_state) {
      if (onDragTransition) {
        onDragTransition(leadId, targetState);
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
          const stateLeads = getLeadsByState(state);
          
          return (
            <div key={state} className="pipeline-column" data-state={state}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StateBadge state={state} type="lead" />
                  <span className="text-sm text-muted-foreground">
                    ({getLeadCount(state)})
                  </span>
                </div>
              </div>

              {/* Sortable Cards */}
              <SortableContext
                items={stateLeads.map(l => l.id)}
                strategy={verticalListSortingStrategy}
                id={state}
              >
                <div className="space-y-2 min-h-[100px]">
                  {stateLeads.map(lead => (
                    <DraggableLeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => onLeadClick(lead)}
                      onTransition={onTransition}
                      onSetNextAction={onSetNextAction}
                    />
                  ))}

                  {stateLeads.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                      Drop leads here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}

        {/* Disqualified Column (collapsed view) */}
        <div className="pipeline-column bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <StateBadge state="Disqualified" type="lead" />
            <span className="text-sm text-muted-foreground">
              ({getLeadCount('Disqualified')})
            </span>
          </div>
          <div className="text-sm text-muted-foreground text-center py-4">
            {getLeadCount('Disqualified')} archived
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeLead && (
          <div className="pipeline-card opacity-90 shadow-xl ring-2 ring-primary rotate-2">
            <p className="font-medium text-foreground text-sm">
              {activeLead.contact_identity.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{activeLead.lead_state}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
