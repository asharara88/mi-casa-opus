import { useCallback } from 'react';
import { useFunnelAutomation } from '@/hooks/useFunnelAutomation';

/**
 * Maps template IDs to deal stage advancement actions.
 * When certain documents are generated or signed, they should
 * automatically advance the deal to the appropriate stage.
 */
const DOCUMENT_STAGE_MAP: Record<string, {
  action: 'mou_signed' | 'offer_made' | 'reservation' | 'noc_request';
  description: string;
}> = {
  // MOU / Pre-SPA advances deal to MOUSigned
  '08_memorandum_of_understanding_pre_spa': {
    action: 'mou_signed',
    description: 'MOU signed - advancing to negotiation stage',
  },
  // Offer Letter advances deal to OfferMade
  '07_offer_letter_expression_of_interest': {
    action: 'offer_made',
    description: 'Offer letter generated - deal in active negotiation',
  },
  // Reservation Form advances deal to Reserved
  '09_reservation_booking_form': {
    action: 'reservation',
    description: 'Reservation form completed - deal reserved',
  },
  // NOC Request indicates NOC process started
  '11_noc_request_clearance_tracker': {
    action: 'noc_request',
    description: 'NOC request submitted',
  },
};

/**
 * Hook for triggering deal stage advancement when specific documents
 * are generated or executed.
 */
export function useDocumentStageAutomation() {
  const { onMOUSigned } = useFunnelAutomation();

  /**
   * Called when a document is generated. Checks if the template
   * should trigger a stage advancement.
   */
  const onDocumentGenerated = useCallback(async (
    templateId: string,
    dealId: string | null | undefined
  ) => {
    if (!dealId) return;

    const stageMapping = DOCUMENT_STAGE_MAP[templateId];
    if (!stageMapping) return;

    // For now, only MOU signing auto-advances the deal
    // Other documents create evidence but don't auto-advance
    // (they require explicit signature completion)
    if (stageMapping.action === 'mou_signed') {
      // Note: MOU typically requires signing, so we only advance
      // when the document is EXECUTED, not just generated.
      // This will be handled by the DocuSign webhook.
      console.log('MOU generated - will advance on signature completion');
    }
  }, []);

  /**
   * Called when a document signature is completed via DocuSign webhook.
   * This is when we actually advance the deal stage.
   */
  const onDocumentExecuted = useCallback(async (
    templateId: string,
    dealId: string
  ) => {
    const stageMapping = DOCUMENT_STAGE_MAP[templateId];
    if (!stageMapping) return;

    switch (stageMapping.action) {
      case 'mou_signed':
        await onMOUSigned(dealId);
        break;
      // Add other actions as needed
    }
  }, [onMOUSigned]);

  /**
   * Check if a template ID triggers stage automation
   */
  const hasStageAutomation = useCallback((templateId: string): boolean => {
    return templateId in DOCUMENT_STAGE_MAP;
  }, []);

  return {
    onDocumentGenerated,
    onDocumentExecuted,
    hasStageAutomation,
    DOCUMENT_STAGE_MAP,
  };
}
