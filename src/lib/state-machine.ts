// ============================================
// STATE MACHINE - LEAD & DEAL WORKFLOWS
// ============================================

import {
  Lead,
  LeadState,
  LEAD_STATE_REQUIREMENTS,
  Deal,
  DealState,
  DEAL_STATE_REQUIREMENTS,
  StateTransitionResult,
  ValidationContext,
  UserRole,
  EventLogEntry,
} from '@/types/bos';

// Simple hash function for event logs
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

const RULE_SET_VERSION = '1.0.0';

// Create an event log entry (for local use, actual persistence happens via hooks)
function createLocalEventLogEntry(
  actorUserId: string,
  actorRole: UserRole,
  entityType: string,
  entityId: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  decision: 'ALLOWED' | 'BLOCKED',
  blockReasons: string[] = []
): EventLogEntry {
  const timestamp = new Date().toISOString();
  const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const eventData = {
    timestamp,
    actor_user_id: actorUserId,
    actor_role: actorRole,
    entity_ref: { entity_type: entityType, entity_id: entityId },
    action,
    before,
    after,
    rule_set_version: RULE_SET_VERSION,
    decision,
    block_reasons: blockReasons,
    prev_event_hash: null,
  };
  
  const eventHash = generateHash(JSON.stringify(eventData));
  
  return {
    event_id: eventId,
    ...eventData,
    event_hash: eventHash,
  };
}

// ============================================
// LEAD STATE MACHINE
// ============================================

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

export function validateLeadTransition(
  lead: Lead,
  targetState: LeadState
): StateTransitionResult {
  const currentRequirements = LEAD_STATE_REQUIREMENTS[lead.lead_state];
  const blockReasons: string[] = [];
  
  if (!currentRequirements.next_states.includes(targetState)) {
    blockReasons.push(
      `Transition from "${lead.lead_state}" to "${targetState}" is not allowed.`
    );
    return {
      allowed: false,
      block_reasons: blockReasons,
      missing_documents: [],
      missing_signatures: [],
      missing_evidence: [],
    };
  }
  
  const leadAsRecord = lead as unknown as Record<string, unknown>;
  for (const field of currentRequirements.required_fields) {
    const value = getNestedValue(leadAsRecord, field);
    if (value === undefined || value === null || value === '') {
      blockReasons.push(`Required field "${field}" is missing or empty`);
    }
  }
  
  if (targetState === 'Qualified') {
    if (!lead.consents || lead.consents.length === 0) {
      blockReasons.push('At least one consent record is required for qualification');
    }
    const hasDataConsent = lead.consents?.some(c => c.consent_type === 'DataProcessing' && c.granted);
    if (!hasDataConsent) {
      blockReasons.push('Data processing consent must be granted');
    }
  }
  
  if (targetState === 'Converted') {
    if (!lead.requirements) {
      blockReasons.push('Lead requirements must be captured before conversion');
    }
  }
  
  return {
    allowed: blockReasons.length === 0,
    block_reasons: blockReasons,
    missing_documents: [],
    missing_signatures: [],
    missing_evidence: [],
  };
}

export function transitionLeadState(
  lead: Lead,
  targetState: LeadState,
  actorUserId: string,
  actorRole: UserRole
): { success: boolean; lead?: Lead; eventLog: EventLogEntry } {
  const validation = validateLeadTransition(lead, targetState);
  
  const before = { lead_state: lead.lead_state };
  const after = validation.allowed ? { lead_state: targetState } : null;
  
  const eventLog = createLocalEventLogEntry(
    actorUserId,
    actorRole,
    'Lead',
    lead.lead_id,
    `LEAD_STATE_TRANSITION_${lead.lead_state}_TO_${targetState}`,
    before,
    after,
    validation.allowed ? 'ALLOWED' : 'BLOCKED',
    validation.block_reasons
  );
  
  if (!validation.allowed) {
    return { success: false, eventLog };
  }
  
  const updatedLead: Lead = {
    ...lead,
    lead_state: targetState,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, lead: updatedLead, eventLog };
}

// ============================================
// DEAL STATE MACHINE
// ============================================

export function validateDealTransition(
  deal: Deal,
  targetState: DealState,
  context: ValidationContext
): StateTransitionResult {
  const currentRequirements = DEAL_STATE_REQUIREMENTS[deal.deal_state];
  const blockReasons: string[] = [];
  const missingDocuments: string[] = [];
  const missingSignatures: string[] = [];
  const missingEvidence: string[] = [];
  
  if (!currentRequirements.next_states.includes(targetState)) {
    blockReasons.push(
      `Transition from "${deal.deal_state}" to "${targetState}" is not allowed.`
    );
    return {
      allowed: false,
      block_reasons: blockReasons,
      missing_documents: missingDocuments,
      missing_signatures: missingSignatures,
      missing_evidence: missingEvidence,
    };
  }
  
  for (const docType of currentRequirements.required_documents) {
    const hasDoc = context.documents.some(
      d => d.entity_ref.entity_id === deal.deal_id && 
           d.status === 'Executed' &&
           d.template_ref.includes(docType)
    );
    if (!hasDoc) {
      missingDocuments.push(docType);
      blockReasons.push(`Required document "${docType}" is not executed`);
    }
  }
  
  for (const sigType of currentRequirements.required_signatures) {
    const hasSig = context.signatures.some(
      s => s.signers.some(signer => 
        signer.role === sigType && signer.status === 'Signed'
      )
    );
    if (!hasSig) {
      missingSignatures.push(sigType);
      blockReasons.push(`Required signature "${sigType}" is missing`);
    }
  }
  
  for (const evidenceType of currentRequirements.required_evidence) {
    const hasEvidence = context.evidence.some(
      e => e.source === deal.deal_id && e.type.toLowerCase().includes(evidenceType.toLowerCase())
    );
    if (!hasEvidence) {
      missingEvidence.push(evidenceType);
      blockReasons.push(`Required evidence "${evidenceType}" is not captured`);
    }
  }
  
  if (targetState === 'Offer' && !deal.agreed_price) {
    blockReasons.push('Agreed price must be set before making an offer');
  }
  
  if (targetState === 'Closed_Won') {
    if (deal.registry_actions.length === 0) {
      blockReasons.push('At least one registry action must be completed');
    }
    const hasCompletedRegistry = deal.registry_actions.some(r => r.status === 'Completed');
    if (!hasCompletedRegistry) {
      blockReasons.push('Registry action must be completed for closing');
    }
  }
  
  return {
    allowed: blockReasons.length === 0,
    block_reasons: blockReasons,
    missing_documents: missingDocuments,
    missing_signatures: missingSignatures,
    missing_evidence: missingEvidence,
  };
}

export function transitionDealState(
  deal: Deal,
  targetState: DealState,
  context: ValidationContext,
  actorUserId: string,
  actorRole: UserRole
): { success: boolean; deal?: Deal; eventLog: EventLogEntry } {
  const validation = validateDealTransition(deal, targetState, context);
  
  const before = { deal_state: deal.deal_state };
  const after = validation.allowed ? { deal_state: targetState } : null;
  
  const eventLog = createLocalEventLogEntry(
    actorUserId,
    actorRole,
    'Deal',
    deal.deal_id,
    `DEAL_STATE_TRANSITION_${deal.deal_state}_TO_${targetState}`,
    before,
    after,
    validation.allowed ? 'ALLOWED' : 'BLOCKED',
    validation.block_reasons
  );
  
  if (!validation.allowed) {
    return { success: false, eventLog };
  }
  
  const updatedDeal: Deal = {
    ...deal,
    deal_state: targetState,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, deal: updatedDeal, eventLog };
}

// ============================================
// STATE DISPLAY HELPERS
// ============================================

// Lead State Colors - Supports both legacy and new MiCasa algorithm states
export const LEAD_STATE_COLORS: Record<LeadState, { bg: string; text: string; border: string }> = {
  // Legacy states
  New: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50' },
  Contacted: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  // New MiCasa algorithm states
  Nurture: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50' },
  Interested: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  Qualified: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  HighIntent: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  Disqualified: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/50' },
  Converted: { bg: 'bg-gold/20', text: 'text-gold', border: 'border-gold/50' },
};

export const DEAL_STATE_COLORS: Record<DealState, { bg: string; text: string; border: string }> = {
  Created: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  Qualified: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  Viewing: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  Offer: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  Reservation: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  SPA: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  Closed_Won: { bg: 'bg-gold/20', text: 'text-gold', border: 'border-gold/50' },
  Closed_Lost: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/50' },
};
