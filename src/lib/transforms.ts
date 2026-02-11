// ============================================
// DATA TRANSFORMATION UTILITIES
// Transform Supabase DB types to frontend types
// ============================================

import { Tables } from '@/integrations/supabase/types';
import { 
  Lead as FrontendLead, 
  Deal as FrontendDeal, 
  DealParty, 
  AssignedBroker,
  CommissionRecord as FrontendCommission,
  EventLogEntry as FrontendEventLog,
  DealState,
  DealType,
  DealSide,
  LeadState,
  LeadSource,
  CommissionStatus,
  UserRole,
  RegistryAction,
} from '@/types/bos';

// Database types
type DbLead = Tables<'leads'>;
type DbDeal = Tables<'deals'>;
type DbDealParty = Tables<'deal_parties'>;
type DbDealBroker = Tables<'deal_brokers'> & { broker_profiles?: Tables<'broker_profiles'> | null };
type DbCommission = Tables<'commission_records'> & { 
  broker_profiles?: Tables<'broker_profiles'> | null;
  deals?: Tables<'deals'> | null;
};
type DbEventLog = Tables<'event_log_entries'>;
type DbBrokerage = Tables<'brokerage_context'>;

// ============================================
// LEAD TRANSFORMATIONS
// ============================================
export function transformDbLeadToFrontend(dbLead: DbLead): FrontendLead {
  // Parse qualification_data if it exists
  const qualData = dbLead.qualification_data as Record<string, unknown> | null;
  
  // Parse consents safely
  let consents: FrontendLead['consents'] = [];
  if (Array.isArray(dbLead.consents)) {
    consents = dbLead.consents as unknown as FrontendLead['consents'];
  }
  
  return {
    lead_id: dbLead.lead_id,
    source: dbLead.source as LeadSource,
    contact_identity: {
      full_name: dbLead.contact_name,
      email: dbLead.contact_email || '',
      phone: dbLead.contact_phone || '',
      nationality: qualData?.nationality as string | undefined,
    },
    lead_state: dbLead.lead_state as LeadState,
    assigned_broker_id: dbLead.assigned_broker_id,
    consents,
    requirements: qualData?.requirements as FrontendLead['requirements'],
    notes: dbLead.notes || '',
    created_at: dbLead.created_at,
    updated_at: dbLead.updated_at,
  };
}

export function transformLeadsToFrontend(dbLeads: DbLead[]): FrontendLead[] {
  return dbLeads.map(transformDbLeadToFrontend);
}

// ============================================
// DEAL TRANSFORMATIONS
// ============================================
export function transformDbDealToFrontend(
  dbDeal: DbDeal,
  parties: DbDealParty[] = [],
  brokers: DbDealBroker[] = []
): FrontendDeal {
  const economics = dbDeal.deal_economics as Record<string, unknown> | null;
  
  // Parse registry actions safely
  let registryActions: RegistryAction[] = [];
  if (Array.isArray(dbDeal.registry_actions)) {
    registryActions = dbDeal.registry_actions as unknown as RegistryAction[];
  }

  // Map database deal_state to frontend DealState
  const mapDealState = (dbState: string): DealState => {
    const stateMap: Record<string, DealState> = {
      'ClosedWon': 'Closed_Won',
      'ClosedLost': 'Closed_Lost',
    };
    return (stateMap[dbState] || dbState) as DealState;
  };

  return {
    deal_id: dbDeal.deal_id,
    deal_type: dbDeal.deal_type as DealType,
    deal_state: mapDealState(dbDeal.deal_state),
    linked_lead_id: dbDeal.linked_lead_id || '',
    property_id: dbDeal.property_id || '',
    listing_id: dbDeal.listing_id || undefined,
    side: dbDeal.side as DealSide,
    parties: parties.map(transformDbDealPartyToFrontend),
    assigned_brokers: brokers.map(transformDbDealBrokerToFrontend),
    deal_economics_id: '',
    registry_actions: registryActions,
    agreed_price: economics?.agreed_price as number | undefined,
    currency: (economics?.currency as string) || 'AED',
    created_at: dbDeal.created_at,
    updated_at: dbDeal.updated_at,
  };
}

export function transformDbDealPartyToFrontend(dbParty: DbDealParty): DealParty {
  return {
    party_id: dbParty.id,
    role: dbParty.party_role as DealParty['role'],
    identity: {
      full_name: dbParty.party_name,
      email: dbParty.party_email || '',
      phone: dbParty.party_phone || '',
    },
    added_at: dbParty.created_at,
  };
}

export function transformDbDealBrokerToFrontend(dbBroker: DbDealBroker): AssignedBroker {
  return {
    broker_id: dbBroker.broker_id,
    assigned_at: dbBroker.assigned_at,
    role: (dbBroker.role as AssignedBroker['role']) || 'Primary',
    commission_split_pct: dbBroker.commission_split_percent || 100,
  };
}

export function transformDealsToFrontend(
  dbDeals: DbDeal[],
  allParties: DbDealParty[] = [],
  allBrokers: DbDealBroker[] = []
): FrontendDeal[] {
  return dbDeals.map(deal => {
    const dealParties = allParties.filter(p => p.deal_id === deal.id);
    const dealBrokers = allBrokers.filter(b => b.deal_id === deal.id);
    return transformDbDealToFrontend(deal, dealParties, dealBrokers);
  });
}

// ============================================
// COMMISSION TRANSFORMATIONS
// ============================================
export function transformDbCommissionToFrontend(dbCommission: DbCommission): FrontendCommission {
  const trace = dbCommission.calculation_trace as Record<string, unknown> | null;
  
  return {
    commission_id: dbCommission.commission_id,
    deal_id: dbCommission.deal_id,
    broker_id: dbCommission.broker_id,
    status: dbCommission.status as CommissionStatus,
    calculation_trace: {
      gross_commission: (trace?.gross_commission as number) || dbCommission.gross_amount || 0,
      brokerage_split_pct: (trace?.brokerage_split_pct as number) || 50,
      brokerage_amount: (trace?.brokerage_amount as number) || 0,
      broker_split_pct: dbCommission.split_percent || 100,
      broker_amount: dbCommission.net_amount || 0,
      deductions: (trace?.deductions as FrontendCommission['calculation_trace']['deductions']) || [],
      net_payable: dbCommission.net_amount || 0,
      calculated_at: (trace?.calculated_at as string) || dbCommission.created_at,
      rule_version: (trace?.rule_version as string) || '1.0.0',
    },
  };
}

export function transformCommissionsToFrontend(dbCommissions: DbCommission[]): FrontendCommission[] {
  return dbCommissions.map(transformDbCommissionToFrontend);
}

// ============================================
// EVENT LOG TRANSFORMATIONS
// ============================================
export function transformDbEventLogToFrontend(dbEvent: DbEventLog): FrontendEventLog {
  return {
    event_id: dbEvent.event_id,
    timestamp: dbEvent.timestamp,
    actor_user_id: dbEvent.actor_user_id || 'SYSTEM',
    actor_role: (dbEvent.actor_role as UserRole) || 'Manager',
    entity_ref: {
      entity_type: dbEvent.entity_type,
      entity_id: dbEvent.entity_id,
    },
    action: dbEvent.action,
    before: dbEvent.before_state as Record<string, unknown> | null,
    after: dbEvent.after_state as Record<string, unknown> | null,
    rule_set_version: dbEvent.rule_set_version || '1.0.0',
    decision: (dbEvent.decision as 'ALLOWED' | 'BLOCKED') || 'ALLOWED',
    block_reasons: Array.isArray(dbEvent.block_reasons) ? dbEvent.block_reasons as string[] : [],
    prev_event_hash: dbEvent.prev_event_hash,
    event_hash: dbEvent.event_hash || '',
  };
}

export function transformEventLogsToFrontend(dbEvents: DbEventLog[]): FrontendEventLog[] {
  return dbEvents.map(transformDbEventLogToFrontend);
}

// ============================================
// BROKERAGE CONTEXT TRANSFORMATIONS
// ============================================
export interface FrontendBrokerage {
  brokerage_id: string;
  legal_name: string;
  trade_name: string;
  license_context: {
    license_no: string;
    issuing_authority: string;
    issue_date: string;
    expiry_date: string;
    license_type: string;
    version: number;
    effective_from: string;
  }[];
}

export function transformDbBrokerageToFrontend(dbBrokerage: DbBrokerage): FrontendBrokerage {
  const licenseCtx = dbBrokerage.license_context as FrontendBrokerage['license_context'] | null;
  
  return {
    brokerage_id: dbBrokerage.brokerage_id,
    legal_name: dbBrokerage.legal_name,
    trade_name: dbBrokerage.trade_name,
    license_context: licenseCtx || [],
  };
}
