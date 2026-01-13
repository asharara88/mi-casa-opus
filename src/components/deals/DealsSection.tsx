import { useState } from 'react';
import { useDeals, useDealParties, useDealBrokers } from '@/hooks/useDeals';
import { useAuth } from '@/hooks/useAuth';
import { DealPipeline } from './DealPipeline';
import { DealDetail } from './DealDetail';
import { transformDbDealToFrontend } from '@/lib/transforms';
import { Deal, DealState, ValidationContext } from '@/types/bos';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useUpdateDeal } from '@/hooks/useDeals';
import { useCreateEventLog } from '@/hooks/useEventLog';
import { LostReasonModal, LostReason } from '@/components/modals/LostReasonModal';
import { NextActionModal } from '@/components/modals/NextActionModal';
import { Database } from '@/integrations/supabase/types';

type NextActionType = Database['public']['Enums']['next_action_type'];

export function DealsSection() {
  const { profile, role } = useAuth();
  const { data: dbDeals, isLoading: isLoadingDeals } = useDeals();
  const updateDeal = useUpdateDeal();
  const createEventLog = useCreateEventLog();
  
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  
  // Lost reason modal state
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLostDeal, setPendingLostDeal] = useState<{ deal: Deal; dbDealId: string } | null>(null);
  
  // Next action modal state
  const [nextActionModalOpen, setNextActionModalOpen] = useState(false);
  const [pendingNextActionDeal, setPendingNextActionDeal] = useState<{ deal: Deal; dbDealId: string } | null>(null);
  
  // Get parties and brokers for the selected deal
  const { data: selectedDealParties } = useDealParties(selectedDealId);
  const { data: selectedDealBrokers } = useDealBrokers(selectedDealId);

  // Transform deals to frontend format with extended properties
  const deals = (dbDeals || []).map(dbDeal => ({
    ...transformDbDealToFrontend(dbDeal, [], []),
    dbId: dbDeal.id,
    next_action: dbDeal.next_action,
    next_action_due: dbDeal.next_action_due,
    next_action_owner: dbDeal.next_action_owner,
  }));

  // Find the selected deal with full party/broker data
  const selectedDbDeal = dbDeals?.find(d => d.id === selectedDealId);
  const selectedDeal = selectedDbDeal 
    ? transformDbDealToFrontend(
        selectedDbDeal,
        selectedDealParties || [],
        selectedDealBrokers || []
      )
    : null;

  // Empty validation context (will be populated with real data)
  const validationContext: ValidationContext = {
    documents: [],
    signatures: [],
    evidence: [],
  };

  // Map frontend DealState to database deal_state
  const mapFrontendStateToDb = (state: DealState): string => {
    const stateMap: Record<string, string> = {
      'Closed_Won': 'ClosedWon',
      'Closed_Lost': 'ClosedLost',
    };
    return stateMap[state] || state;
  };

  const handleDealTransition = async (deal: Deal, targetState: DealState) => {
    const dbDeal = dbDeals?.find(d => d.deal_id === deal.deal_id);
    if (!dbDeal) return;

    // If transitioning to Closed_Lost, show the lost reason modal
    if (targetState === 'Closed_Lost') {
      setPendingLostDeal({ deal, dbDealId: dbDeal.id });
      setLostModalOpen(true);
      return;
    }

    const dbState = mapFrontendStateToDb(targetState);

    try {
      await updateDeal.mutateAsync({
        id: dbDeal.id,
        updates: { deal_state: dbState as any },
      });

      // Log the event
      await createEventLog.mutateAsync({
        event_id: `EVT-${Date.now()}`,
        entity_type: 'Deal',
        entity_id: dbDeal.id,
        action: 'STATE_TRANSITION',
        before_state: { deal_state: deal.deal_state },
        after_state: { deal_state: targetState },
        decision: 'ALLOWED',
        actor_user_id: profile?.user_id || null,
        actor_role: role || null,
      });

      toast.success(`Deal transitioned to ${targetState}`);
      
      if (selectedDealId) {
        setSelectedDealId(null);
      }
    } catch (error) {
      toast.error('Failed to transition deal');
    }
  };

  const handleDragTransition = async (dealDbId: string, targetState: DealState) => {
    const dbDeal = dbDeals?.find(d => d.id === dealDbId);
    if (!dbDeal) return;

    const dbState = mapFrontendStateToDb(targetState);

    try {
      await updateDeal.mutateAsync({
        id: dealDbId,
        updates: { deal_state: dbState as any },
      });

      // Log the event
      await createEventLog.mutateAsync({
        event_id: `EVT-${Date.now()}`,
        entity_type: 'Deal',
        entity_id: dealDbId,
        action: 'STATE_TRANSITION',
        before_state: { deal_state: dbDeal.deal_state },
        after_state: { deal_state: targetState },
        decision: 'ALLOWED',
        actor_user_id: profile?.user_id || null,
        actor_role: role || null,
      });

      toast.success(`Deal moved to ${targetState}`);
    } catch (error) {
      toast.error('Failed to move deal');
    }
  };

  const handleLostConfirm = async (reason: LostReason, notes: string) => {
    if (!pendingLostDeal) return;

    try {
      await updateDeal.mutateAsync({
        id: pendingLostDeal.dbDealId,
        updates: {
          deal_state: 'ClosedLost' as any,
          lost_reason: reason,
          lost_reason_notes: notes || null,
          lost_at: new Date().toISOString(),
        },
      });

      // Log the event
      await createEventLog.mutateAsync({
        event_id: `EVT-${Date.now()}`,
        entity_type: 'Deal',
        entity_id: pendingLostDeal.dbDealId,
        action: 'STATE_TRANSITION',
        before_state: { deal_state: pendingLostDeal.deal.deal_state },
        after_state: { deal_state: 'Closed_Lost', lost_reason: reason },
        decision: 'ALLOWED',
        actor_user_id: profile?.user_id || null,
        actor_role: role || null,
      });

      toast.success('Deal marked as lost');
      setPendingLostDeal(null);
      
      if (selectedDealId) {
        setSelectedDealId(null);
      }
    } catch (error) {
      toast.error('Failed to update deal');
    }
  };

  const handleSetNextAction = (deal: Deal & { dbId: string }) => {
    setPendingNextActionDeal({ deal, dbDealId: deal.dbId });
    setNextActionModalOpen(true);
  };

  const handleNextActionConfirm = async (action: NextActionType, dueDate: Date) => {
    if (!pendingNextActionDeal) return;

    try {
      await updateDeal.mutateAsync({
        id: pendingNextActionDeal.dbDealId,
        updates: {
          next_action: action,
          next_action_due: dueDate.toISOString(),
        },
      });
      toast.success('Next action set');
      setPendingNextActionDeal(null);
    } catch (error) {
      toast.error('Failed to set next action');
    }
  };

  const handleDealClick = (deal: Deal) => {
    const dbDeal = dbDeals?.find(d => d.deal_id === deal.deal_id);
    if (dbDeal) {
      setSelectedDealId(dbDeal.id);
    }
  };

  if (isLoadingDeals) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="min-w-[280px] h-[400px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (selectedDeal) {
    return (
      <DealDetail
        deal={selectedDeal}
        context={validationContext}
        onBack={() => setSelectedDealId(null)}
        onTransition={(deal, state) => {
          handleDealTransition(deal, state);
        }}
        dealDbId={selectedDealId || undefined}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {role === 'Broker' ? 'My Deals' : 'Deal Pipeline'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {deals.length} total • {deals.filter(d => !['ClosedWon', 'ClosedLost'].includes(d.deal_state)).length} active
          </p>
        </div>
      </div>
      <DealPipeline
        deals={deals}
        context={validationContext}
        onDealClick={handleDealClick}
        onTransition={handleDealTransition}
        onDragTransition={handleDragTransition}
        onSetNextAction={handleSetNextAction}
      />

      {/* Lost Reason Modal */}
      <LostReasonModal
        open={lostModalOpen}
        onOpenChange={setLostModalOpen}
        entityType="Deal"
        entityName={pendingLostDeal?.deal.deal_id || ''}
        onConfirm={handleLostConfirm}
      />

      {/* Next Action Modal */}
      <NextActionModal
        open={nextActionModalOpen}
        onOpenChange={setNextActionModalOpen}
        entityType="Deal"
        entityName={pendingNextActionDeal?.deal.deal_id || ''}
        currentAction={pendingNextActionDeal ? (dbDeals?.find(d => d.id === pendingNextActionDeal.dbDealId)?.next_action) : undefined}
        currentDueDate={pendingNextActionDeal ? (dbDeals?.find(d => d.id === pendingNextActionDeal.dbDealId)?.next_action_due) : undefined}
        onConfirm={handleNextActionConfirm}
      />
    </div>
  );
}
