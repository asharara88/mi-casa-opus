import { useCallback } from 'react';
import { useUpdateProspect } from '@/hooks/useProspects';
import { useUpdateLead } from '@/hooks/useLeads';
import { useUpdatePipelineDeal } from '@/hooks/usePipelineDeals';
import { toast } from 'sonner';

/**
 * Hook for automating funnel stage transitions based on user actions
 */
export function useFunnelAutomation() {
  const updateProspect = useUpdateProspect();
  const updateLead = useUpdateLead();
  const updateDeal = useUpdatePipelineDeal();

  /**
   * Auto-advance prospect to 'contacted' when a call/message is logged
   */
  const onProspectContacted = useCallback(async (prospectId: string) => {
    try {
      await updateProspect.mutateAsync({
        id: prospectId,
        updates: {
          outreach_status: 'contacted',
          last_contacted_at: new Date().toISOString(),
          contact_attempts: 1, // Will be incremented properly by the component
        },
      });
      toast.success('Prospect marked as contacted');
    } catch (error) {
      console.error('Failed to update prospect:', error);
    }
  }, [updateProspect]);

  /**
   * Auto-advance lead to 'Contacted' when first outreach is logged
   */
  const onLeadContacted = useCallback(async (leadId: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        updates: {
          lead_state: 'Contacted',
        },
      });
      toast.success('Lead advanced to Contacted');
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  }, [updateLead]);

  /**
   * Auto-advance secondary deal when viewing is scheduled
   */
  const onViewingScheduled = useCallback(async (dealId: string) => {
    try {
      await updateDeal.mutateAsync({
        id: dealId,
        updates: {
          secondary_state: 'ViewingScheduled',
          next_action: 'Viewing',
        },
      });
      toast.success('Deal advanced to Viewing Scheduled');
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  }, [updateDeal]);

  /**
   * Auto-advance secondary deal when viewing is completed
   */
  const onViewingCompleted = useCallback(async (dealId: string) => {
    try {
      await updateDeal.mutateAsync({
        id: dealId,
        updates: {
          secondary_state: 'ViewingCompleted',
          next_action: 'FollowUp',
        },
      });
      toast.success('Deal advanced to Viewing Completed');
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  }, [updateDeal]);

  /**
   * Auto-advance offplan deal when EOI is submitted
   */
  const onEOISubmitted = useCallback(async (dealId: string, eoiAmount?: number) => {
    try {
      await updateDeal.mutateAsync({
        id: dealId,
        updates: {
          offplan_state: 'EOISubmitted',
          eoi_amount: eoiAmount || null,
        },
      });
      toast.success('Deal advanced to EOI Submitted');
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  }, [updateDeal]);

  /**
   * Auto-advance offplan deal when EOI payment is received
   */
  const onEOIPaid = useCallback(async (dealId: string) => {
    try {
      await updateDeal.mutateAsync({
        id: dealId,
        updates: {
          offplan_state: 'EOIPaid',
          eoi_paid_at: new Date().toISOString(),
        },
      });
      toast.success('Deal advanced to EOI Paid');
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  }, [updateDeal]);

  /**
   * Auto-advance secondary deal when MOU is signed
   */
  const onMOUSigned = useCallback(async (dealId: string) => {
    try {
      await updateDeal.mutateAsync({
        id: dealId,
        updates: {
          secondary_state: 'MOUSigned',
          next_action: 'CollectDocs',
        },
      });
      toast.success('Deal advanced to MOU Signed');
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  }, [updateDeal]);

  /**
   * Auto-advance when NOC is obtained
   */
  const onNOCObtained = useCallback(async (dealId: string, nocReference?: string) => {
    try {
      await updateDeal.mutateAsync({
        id: dealId,
        updates: {
          secondary_state: 'NOCObtained',
          noc_status: 'obtained',
          noc_obtained_at: new Date().toISOString(),
          noc_reference: nocReference || null,
        },
      });
      toast.success('Deal advanced to NOC Obtained');
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  }, [updateDeal]);

  return {
    onProspectContacted,
    onLeadContacted,
    onViewingScheduled,
    onViewingCompleted,
    onEOISubmitted,
    onEOIPaid,
    onMOUSigned,
    onNOCObtained,
  };
}
