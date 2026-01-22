/**
 * MiCasa Funnel Processor Hook
 * 
 * Orchestrates the deterministic prospect → lead → deal pipeline.
 * Enforces all invariant rules from the MiCasa algorithm.
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  runAllGates, 
  validateMinimumData,
  type DisqualificationReason,
  type ProspectData 
} from '@/lib/qualification-gates';
import { 
  calculateTotalScore, 
  determineLeadStage, 
  shouldCreateDeal,
  type LeadStage 
} from '@/lib/scoring-engine';

export interface ProcessResult {
  success: boolean;
  action: 'disqualified' | 'incomplete' | 'converted' | 'deal_created' | 'updated' | 'error';
  message: string;
  leadId?: string;
  dealId?: string;
  leadStage?: LeadStage;
}

export function useFunnelProcessor() {
  const queryClient = useQueryClient();

  /**
   * Update prospect status to DISQUALIFIED
   */
  const disqualifyProspect = useCallback(async (
    prospectId: string,
    reason: DisqualificationReason,
    message?: string
  ): Promise<ProcessResult> => {
    const { error } = await supabase
      .from('prospects')
      .update({
        prospect_status: 'DISQUALIFIED',
        disqualification_reason: reason,
        disqualified_at: new Date().toISOString(),
        outreach_status: 'not_interested',
      })
      .eq('id', prospectId);

    if (error) {
      return { success: false, action: 'error', message: error.message };
    }

    queryClient.invalidateQueries({ queryKey: ['prospects'] });
    queryClient.invalidateQueries({ queryKey: ['prospect-stats'] });
    
    return { 
      success: true, 
      action: 'disqualified', 
      message: message || `Prospect disqualified: ${reason}` 
    };
  }, [queryClient]);

  /**
   * Update prospect status to INCOMPLETE
   */
  const markIncomplete = useCallback(async (
    prospectId: string,
    missingFields: string
  ): Promise<ProcessResult> => {
    const { error } = await supabase
      .from('prospects')
      .update({
        prospect_status: 'INCOMPLETE',
      })
      .eq('id', prospectId);

    if (error) {
      return { success: false, action: 'error', message: error.message };
    }

    queryClient.invalidateQueries({ queryKey: ['prospects'] });
    
    return { 
      success: true, 
      action: 'incomplete', 
      message: `Missing: ${missingFields}` 
    };
  }, [queryClient]);

  /**
   * Generate unique Lead ID
   */
  const generateLeadId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LD-${timestamp}-${random}`;
  };

  /**
   * Generate unique Deal ID
   */
  const generateDealId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DL-${timestamp}-${random}`;
  };

  /**
   * Convert prospect to lead with calculated stage
   */
  const convertToLead = useCallback(async (
    prospect: ProspectData & { 
      full_name: string;
      phone?: string | null;
      email?: string | null;
      is_cash_buyer?: boolean;
      mortgage_preapproval?: boolean;
      price_list_requested?: boolean;
      whatsapp_started?: boolean;
      brochure_downloaded?: boolean;
      repeat_visit_7d?: boolean;
      source?: string | null;
    }
  ): Promise<ProcessResult> => {
    // Calculate scores
    const { fitScore, intentScore, totalScore } = calculateTotalScore(prospect);
    const leadStage = determineLeadStage(totalScore, prospect.timeframe);

    // Map LeadStage to database lead_state
    // Note: Database has New, Contacted, Qualified, Disqualified, Converted
    // We map our stages accordingly
    let dbLeadState: 'New' | 'Contacted' | 'Qualified' = 'New';
    if (leadStage === 'Interested' || leadStage === 'Nurture') {
      dbLeadState = 'Contacted'; // Nurture/Interested = needs follow-up
    } else if (leadStage === 'Qualified' || leadStage === 'HighIntent') {
      dbLeadState = 'Qualified';
    }

    const leadId = generateLeadId();

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        lead_id: leadId,
        contact_name: prospect.full_name,
        contact_phone: prospect.phone,
        contact_email: prospect.email,
        lead_state: dbLeadState,
        source: (prospect.source as any) || 'Other',
        qualification_data: {
          buyer_type: prospect.buyer_type,
          budget_min: prospect.budget_min,
          budget_max: prospect.budget_max,
          timeframe: prospect.timeframe,
          is_cash_buyer: prospect.is_cash_buyer,
          mortgage_preapproval: prospect.mortgage_preapproval,
          fit_score: fitScore,
          intent_score: intentScore,
          total_score: totalScore,
          calculated_stage: leadStage,
        },
        notes: `Converted from prospect. Fit Score: ${fitScore}, Intent Score: ${intentScore}, Total: ${totalScore}. Stage: ${leadStage}`,
      })
      .select()
      .single();

    if (leadError) {
      return { success: false, action: 'error', message: leadError.message };
    }

    // Update prospect with link to lead and scores
    const { error: prospectError } = await supabase
      .from('prospects')
      .update({
        prospect_status: 'VERIFIED',
        linked_lead_id: lead.id,
        outreach_status: 'converted',
        fit_score: fitScore,
        intent_score: intentScore,
        total_score: totalScore,
      })
      .eq('id', prospect.id);

    if (prospectError) {
      console.error('Failed to update prospect:', prospectError);
    }

    queryClient.invalidateQueries({ queryKey: ['prospects'] });
    queryClient.invalidateQueries({ queryKey: ['prospect-stats'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });

    // Check if we should auto-create a deal
    if (shouldCreateDeal(leadStage)) {
      const dealResult = await createDealFromLead(lead.id, leadId, prospect.full_name);
      if (dealResult.success) {
        return {
          success: true,
          action: 'deal_created',
          message: `Created ${leadStage} lead and deal`,
          leadId: lead.id,
          dealId: dealResult.dealId,
          leadStage,
        };
      }
    }

    return {
      success: true,
      action: 'converted',
      message: `Created ${leadStage} lead`,
      leadId: lead.id,
      leadStage,
    };
  }, [queryClient]);

  /**
   * Create deal from qualified lead
   */
  const createDealFromLead = useCallback(async (
    leadUuid: string,
    leadId: string,
    contactName: string
  ): Promise<{ success: boolean; dealId?: string; message: string }> => {
    // Check invariant: no active deal exists for this lead
    const { data: existingDeal } = await supabase
      .from('deals')
      .select('id, deal_id')
      .eq('linked_lead_id', leadUuid)
      .not('deal_state', 'in', '(ClosedWon,ClosedLost)')
      .limit(1)
      .single();

    if (existingDeal) {
      return { 
        success: false, 
        message: `Active deal already exists: ${existingDeal.deal_id}` 
      };
    }

    const dealId = generateDealId();

    const { data: deal, error } = await supabase
      .from('deals')
      .insert([{
        deal_id: dealId,
        linked_lead_id: leadUuid,
        deal_type: 'Sale' as const,
        deal_state: 'Created' as const,
        side: 'Buy' as const,
        pipeline: 'Secondary' as const,
        secondary_state: 'ViewingScheduled' as const,
        notes: `Auto-created from qualified lead ${leadId}`,
      }])
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    // Update lead to Converted
    await supabase
      .from('leads')
      .update({ lead_state: 'Converted' as const })
      .eq('id', leadUuid);

    queryClient.invalidateQueries({ queryKey: ['deals'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });

    return { success: true, dealId: deal.id, message: `Deal ${dealId} created` };
  }, [queryClient]);

  /**
   * Process prospect through complete funnel
   * This is the main entry point for funnel automation
   */
  const processProspect = useCallback(async (
    prospect: ProspectData & {
      full_name: string;
      is_cash_buyer?: boolean;
      mortgage_preapproval?: boolean;
      price_list_requested?: boolean;
      whatsapp_started?: boolean;
      brochure_downloaded?: boolean;
      repeat_visit_7d?: boolean;
      source?: string | null;
    },
    isNew: boolean = false
  ): Promise<ProcessResult> => {
    // Run all qualification gates
    const gateResult = await runAllGates(prospect, isNew);

    if (!gateResult.passed) {
      if (gateResult.reason === 'INELIGIBLE') {
        // Missing data - mark as incomplete
        return markIncomplete(prospect.id, gateResult.message || 'Missing fields');
      }
      
      // Hard disqualification
      return disqualifyProspect(prospect.id, gateResult.reason!, gateResult.message);
    }

    // All gates passed - convert to lead
    return convertToLead(prospect);
  }, [disqualifyProspect, markIncomplete, convertToLead]);

  /**
   * Update prospect scores without full conversion
   * Used when qualification data changes
   */
  const updateProspectScores = useCallback(async (
    prospect: ProspectData & {
      is_cash_buyer?: boolean;
      mortgage_preapproval?: boolean;
      price_list_requested?: boolean;
      whatsapp_started?: boolean;
      brochure_downloaded?: boolean;
      repeat_visit_7d?: boolean;
    }
  ): Promise<ProcessResult> => {
    const { fitScore, intentScore, totalScore } = calculateTotalScore(prospect);
    const leadStage = determineLeadStage(totalScore, prospect.timeframe);

    // Determine prospect status based on minimum data
    const minData = validateMinimumData(prospect);
    const prospectStatus = minData.passed ? 'VERIFIED' : 'INCOMPLETE';

    const { error } = await supabase
      .from('prospects')
      .update({
        fit_score: fitScore,
        intent_score: intentScore,
        total_score: totalScore,
        prospect_status: prospectStatus,
      })
      .eq('id', prospect.id);

    if (error) {
      return { success: false, action: 'error', message: error.message };
    }

    queryClient.invalidateQueries({ queryKey: ['prospects'] });

    return {
      success: true,
      action: 'updated',
      message: `Scores updated: ${totalScore}/100 (${leadStage})`,
      leadStage,
    };
  }, [queryClient]);

  return {
    processProspect,
    disqualifyProspect,
    markIncomplete,
    convertToLead,
    createDealFromLead,
    updateProspectScores,
  };
}
