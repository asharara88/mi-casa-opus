import { useCallback } from 'react';
import { useUpdateViewingBooking } from '@/hooks/useViewingBookings';
import { useFunnelAutomation } from '@/hooks/useFunnelAutomation';
import { toast } from 'sonner';

interface ViewingFeedback {
  feedbackScore: number;
  feedbackNotes: string;
  clientInterest: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Hook that combines viewing completion with automatic deal stage advancement.
 * When a viewing is marked complete, it updates the booking AND advances the deal
 * to ViewingCompleted state.
 */
export function useViewingCompletion() {
  const updateViewing = useUpdateViewingBooking();
  const { onViewingCompleted } = useFunnelAutomation();

  const completeViewing = useCallback(async (
    viewingId: string,
    dealId: string | null,
    feedback: ViewingFeedback
  ) => {
    try {
      // Update the viewing booking record
      await updateViewing.mutateAsync({
        id: viewingId,
        updates: {
          status: 'completed',
          notes: feedback.feedbackNotes 
            ? `Interest: ${feedback.clientInterest} (${feedback.feedbackScore}/5)\n${feedback.feedbackNotes}`
            : `Interest: ${feedback.clientInterest} (${feedback.feedbackScore}/5)`,
        },
      });

      // Auto-advance deal to ViewingCompleted if dealId exists
      if (dealId) {
        await onViewingCompleted(dealId);
      }

      toast.success('Viewing completed and deal advanced');
      return true;
    } catch (error) {
      console.error('Failed to complete viewing:', error);
      toast.error('Failed to complete viewing');
      return false;
    }
  }, [updateViewing, onViewingCompleted]);

  const markNoShow = useCallback(async (
    viewingId: string,
    dealId: string | null
  ) => {
    try {
      await updateViewing.mutateAsync({
        id: viewingId,
        updates: {
          status: 'no_show',
        },
      });

      toast.info('Viewing marked as no-show');
      return true;
    } catch (error) {
      console.error('Failed to mark no-show:', error);
      toast.error('Failed to update viewing');
      return false;
    }
  }, [updateViewing]);

  return {
    completeViewing,
    markNoShow,
    isLoading: updateViewing.isPending,
  };
}
