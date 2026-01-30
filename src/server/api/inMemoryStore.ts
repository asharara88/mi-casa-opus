import {
  OFFPLAN_STATE_TRANSITIONS,
  SECONDARY_STATE_TRANSITIONS,
  type DealPipeline,
  type OffPlanDealState,
  type OffPlanDeadReason,
  type SecondaryDealState,
  type SecondaryDeadReason,
} from '@/types/pipeline';
import { LEAD_STATE_REQUIREMENTS, type LeadState } from '@/types/bos';

// Temporary in-memory storage. Replace with Supabase client calls using
// SUPABASE_URL/SUPABASE_ANON_KEY when wiring up the real persistence layer.
const createId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export interface ProspectRecord {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  outreach_status: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface LeadRecord {
  id: string;
  lead_state: LeadState;
  qualification_data: Record<string, unknown> | null;
  disqualification_reason: string | null;
  disqualified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface DealRecord {
  id: string;
  deal_id: string;
  pipeline: DealPipeline;
  deal_state: string;
  offplan_state?: OffPlanDealState | null;
  secondary_state?: SecondaryDealState | null;
  offplan_dead_reason?: OffPlanDeadReason | null;
  secondary_dead_reason?: SecondaryDeadReason | null;
  lost_reason_notes?: string | null;
  lost_at?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface MemoryStore {
  prospects: ProspectRecord[];
  leads: LeadRecord[];
  deals: DealRecord[];
}

const memoryStore: MemoryStore = (globalThis as { __micasaMemoryStore?: MemoryStore }).__micasaMemoryStore ?? {
  prospects: [],
  leads: [],
  deals: [],
};

if (!(globalThis as { __micasaMemoryStore?: MemoryStore }).__micasaMemoryStore) {
  (globalThis as { __micasaMemoryStore?: MemoryStore }).__micasaMemoryStore = memoryStore;
}

export function createProspect(payload: Partial<ProspectRecord> & {
  full_name: string;
}): ProspectRecord {
  const now = new Date().toISOString();
  
  const prospect: ProspectRecord = {
    ...payload,
    id: createId('PROSPECT'),
    full_name: payload.full_name,
    email: (payload.email as string | null) ?? null,
    phone: (payload.phone as string | null) ?? null,
    source: (payload.source as string | null) ?? null,
    outreach_status: (payload.outreach_status as string) ?? 'not_contacted',
    created_at: now,
    updated_at: now,
  };

  memoryStore.prospects.unshift(prospect);
  return prospect;
}

export function qualifyLead(payload: {
  leadId: string;
  targetState?: LeadState;
  qualificationData?: Record<string, unknown> | null;
  disqualificationReason?: string | null;
  notes?: string | null;
}): LeadRecord {
  const lead = memoryStore.leads.find((item) => item.id === payload.leadId);
  if (!lead) {
    throw new Error('Lead not found');
  }

  const currentState = lead.lead_state;
  const targetState = payload.targetState ?? 'Qualified';
  const allowedStates = LEAD_STATE_REQUIREMENTS[currentState]?.next_states ?? [];

  if (!allowedStates.includes(targetState)) {
    throw new Error(`Invalid lead transition from ${currentState} to ${targetState}`);
  }

  if (targetState === 'Disqualified' && !payload.disqualificationReason) {
    throw new Error('Disqualification reason is required when disqualifying a lead');
  }

  const now = new Date().toISOString();
  lead.lead_state = targetState;
  lead.qualification_data = payload.qualificationData ?? lead.qualification_data ?? null;
  lead.disqualification_reason = payload.disqualificationReason ?? null;
  lead.disqualified_at = targetState === 'Disqualified' ? now : null;
  lead.notes = payload.notes ?? lead.notes ?? null;
  lead.updated_at = now;

  return lead;
}

export function createDeal(payload: {
  pipeline: DealPipeline;
  deal_type: string;
  side: string;
  linked_lead_id?: string | null;
  developer_id?: string | null;
  developer_project_id?: string | null;
  developer_project_name?: string | null;
  listing_id?: string | null;
  deal_economics?: unknown;
  notes?: string | null;
}): DealRecord {
  const now = new Date().toISOString();
  const dealId = createId('DEAL');

  const baseDeal: DealRecord = {
    id: dealId,
    deal_id: dealId,
    pipeline: payload.pipeline,
    deal_state: 'Created',
    offplan_state: null,
    secondary_state: null,
    offplan_dead_reason: null,
    secondary_dead_reason: null,
    lost_reason_notes: null,
    lost_at: null,
    created_at: now,
    updated_at: now,
    deal_type: payload.deal_type,
    side: payload.side,
    linked_lead_id: payload.linked_lead_id ?? null,
    developer_id: payload.developer_id ?? null,
    developer_project_id: payload.developer_project_id ?? null,
    developer_project_name: payload.developer_project_name ?? null,
    listing_id: payload.listing_id ?? null,
    deal_economics: payload.deal_economics ?? null,
    notes: payload.notes ?? null,
  };

  if (payload.pipeline === 'OffPlan') {
    baseDeal.offplan_state = 'LeadQualified';
  } else {
    baseDeal.secondary_state = 'RequirementsCaptured';
  }

  memoryStore.deals.unshift(baseDeal);
  return baseDeal;
}

export function updateDealStage(payload: {
  dealId: string;
  targetState: OffPlanDealState | SecondaryDealState;
  deadReason?: OffPlanDeadReason | SecondaryDeadReason | null;
  notes?: string | null;
}): DealRecord {
  const deal = memoryStore.deals.find((item) => item.id === payload.dealId || item.deal_id === payload.dealId);
  if (!deal) {
    throw new Error('Deal not found');
  }

  const now = new Date().toISOString();

  if (deal.pipeline === 'OffPlan') {
    const currentState = deal.offplan_state ?? 'LeadQualified';
    const allowed = OFFPLAN_STATE_TRANSITIONS[currentState] ?? [];
    if (!allowed.includes(payload.targetState as OffPlanDealState)) {
      throw new Error(`Invalid off-plan transition from ${currentState} to ${payload.targetState}`);
    }

    deal.offplan_state = payload.targetState as OffPlanDealState;

    if (payload.targetState === 'ClosedLost') {
      if (!payload.deadReason) {
        throw new Error('Off-plan dead reason is required when closing lost');
      }
      deal.offplan_dead_reason = payload.deadReason as OffPlanDeadReason;
      deal.lost_reason_notes = payload.notes ?? null;
      deal.lost_at = now;
      deal.deal_state = 'ClosedLost';
    } else if (payload.targetState === 'ClosedWon') {
      deal.deal_state = 'ClosedWon';
    }
  } else {
    const currentState = deal.secondary_state ?? 'RequirementsCaptured';
    const allowed = SECONDARY_STATE_TRANSITIONS[currentState] ?? [];
    if (!allowed.includes(payload.targetState as SecondaryDealState)) {
      throw new Error(`Invalid secondary transition from ${currentState} to ${payload.targetState}`);
    }

    deal.secondary_state = payload.targetState as SecondaryDealState;

    if (payload.targetState === 'ClosedLost') {
      if (!payload.deadReason) {
        throw new Error('Secondary dead reason is required when closing lost');
      }
      deal.secondary_dead_reason = payload.deadReason as SecondaryDeadReason;
      deal.lost_reason_notes = payload.notes ?? null;
      deal.lost_at = now;
      deal.deal_state = 'ClosedLost';
    } else if (payload.targetState === 'ClosedWon') {
      deal.deal_state = 'ClosedWon';
    }
  }

  deal.updated_at = now;
  return deal;
}

export function seedLead(payload: Omit<LeadRecord, 'id' | 'created_at' | 'updated_at' | 'lead_state'> & {
  lead_state?: LeadState;
}): LeadRecord {
  const now = new Date().toISOString();
  const { 
    qualification_data, 
    disqualification_reason, 
    disqualified_at, 
    notes, 
    lead_state, 
    ...rest 
  } = payload;

  const lead: LeadRecord = {
    ...rest,
    id: createId('LEAD'),
    lead_state: lead_state ?? 'New',
    qualification_data: (qualification_data as Record<string, unknown>) ?? null,
    disqualification_reason: (disqualification_reason as string) ?? null,
    disqualified_at: (disqualified_at as string) ?? null,
    notes: (notes as string) ?? null,
    created_at: now,
    updated_at: now,
  };

  memoryStore.leads.unshift(lead);
  return lead;
}

export function getMemorySnapshot() {
  return memoryStore;
}
