// ============================================
// BROKERAGE OPERATING SYSTEM - CORE DATA MODELS
// Mi Casa Real Estate - Abu Dhabi Licensed
// ============================================

// Immutability class for evidence
export type ImmutabilityClass = 'HASH_LOCKED' | 'BLOCKCHAIN_ANCHORED' | 'NOTARIZED';

// Role definitions
export type UserRole = 'Operator' | 'LegalOwner' | 'Broker' | 'Investor';
export type BrokerStatus = 'Active' | 'Suspended' | 'Terminated';
export type UserStatus = 'Active' | 'Pending' | 'Suspended' | 'Deactivated';

// ============================================
// 1️⃣ BROKERAGE CONTEXT
// ============================================
export interface LicenseContext {
  license_no: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  license_type: string;
  version: number;
  effective_from: string;
}

export interface BrokerageContext {
  brokerage_id: string;
  legal_name: string;
  trade_name: string;
  license_context: LicenseContext[];
}

// ============================================
// 2️⃣ USER ACCOUNT
// ============================================
export interface UserAccount {
  user_id: string;
  auth_identity: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// ============================================
// 3️⃣ BROKER PROFILE
// ============================================
export interface BrokerProfile {
  broker_id: string;
  user_id: string;
  personal_license_no: string;
  license_validity: {
    issued: string;
    expires: string;
  };
  broker_status: BrokerStatus;
  independent_contractor_agreement_id: string | null;
  specializations: string[];
  created_at: string;
}

// ============================================
// 4️⃣ LISTING
// ============================================
export type ListingType = 'Sale' | 'Rent' | 'OffPlan';
export type ListingStatus = 'Draft' | 'Active' | 'Reserved' | 'Sold' | 'Rented' | 'Withdrawn';

export interface ListingAttributes {
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: string;
  furnishing: string;
  amenities: string[];
  location: {
    community: string;
    building?: string;
    unit_no?: string;
    city: string;
  };
  images: string[];
  description: string;
}

export interface Listing {
  listing_id: string;
  property_id: string;
  listing_type: ListingType;
  asking_terms: {
    price: number;
    currency: string;
    payment_plan?: string;
  };
  status: ListingStatus;
  owner_party_id: string;
  mandate_agreement_id: string | null;
  listing_attributes: ListingAttributes;
  created_at: string;
  updated_at: string;
}

// ============================================
// 5️⃣ LEAD
// ============================================
export type LeadState = 'New' | 'Contacted' | 'Qualified' | 'Disqualified' | 'Converted';
export type LeadSource = 'Website' | 'Referral' | 'Portal' | 'WalkIn' | 'SocialMedia' | 'Other';

export interface LeadConsent {
  consent_type: 'Marketing' | 'DataProcessing' | 'Communication';
  granted: boolean;
  granted_at: string;
  version: number;
}

export interface Lead {
  lead_id: string;
  source: LeadSource;
  contact_identity: {
    full_name: string;
    email: string;
    phone: string;
    nationality?: string;
  };
  lead_state: LeadState;
  assigned_broker_id: string | null;
  consents: LeadConsent[];
  requirements?: {
    budget_min?: number;
    budget_max?: number;
    property_types?: string[];
    locations?: string[];
    bedrooms_min?: number;
  };
  notes: string;
  created_at: string;
  updated_at: string;
}

// Lead State Transition Requirements
export const LEAD_STATE_REQUIREMENTS: Record<LeadState, { required_fields: string[]; next_states: LeadState[] }> = {
  New: {
    required_fields: ['contact_identity.full_name', 'contact_identity.phone'],
    next_states: ['Contacted', 'Disqualified'],
  },
  Contacted: {
    required_fields: ['assigned_broker_id', 'notes'],
    next_states: ['Qualified', 'Disqualified'],
  },
  Qualified: {
    required_fields: ['requirements', 'consents'],
    next_states: ['Converted', 'Disqualified'],
  },
  Disqualified: {
    required_fields: ['notes'],
    next_states: [],
  },
  Converted: {
    required_fields: [],
    next_states: [],
  },
};

// ============================================
// 6️⃣ DEAL
// ============================================
export type DealType = 'Sale' | 'Rent' | 'OffPlan';
export type DealState = 
  | 'Created' 
  | 'Qualified' 
  | 'Viewing' 
  | 'Offer' 
  | 'Reservation' 
  | 'SPA' 
  | 'Closed_Won' 
  | 'Closed_Lost';
export type DealSide = 'Buyer' | 'Seller' | 'Landlord' | 'Tenant' | 'Dual';

export interface DealParty {
  party_id: string;
  role: 'Buyer' | 'Seller' | 'Landlord' | 'Tenant' | 'Developer';
  identity: {
    full_name: string;
    email: string;
    phone: string;
    emirates_id?: string;
    passport_no?: string;
  };
  added_at: string;
}

export interface AssignedBroker {
  broker_id: string;
  assigned_at: string;
  role: 'Primary' | 'Secondary' | 'Referral';
  commission_split_pct: number;
}

export interface RegistryAction {
  action_id: string;
  action_type: 'NOC' | 'TitleDeed' | 'Ejari' | 'OQOOD';
  status: 'Pending' | 'Submitted' | 'Completed' | 'Failed';
  reference_no?: string;
  submitted_at?: string;
  completed_at?: string;
}

export interface Deal {
  deal_id: string;
  deal_type: DealType;
  deal_state: DealState;
  linked_lead_id: string;
  property_id: string;
  listing_id?: string;
  side: DealSide;
  parties: DealParty[];
  assigned_brokers: AssignedBroker[];
  deal_economics_id: string;
  registry_actions: RegistryAction[];
  agreed_price?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

// Deal State Transition Requirements
export interface DealStateRequirement {
  required_documents: string[];
  required_signatures: string[];
  required_evidence: string[];
  next_states: DealState[];
}

export const DEAL_STATE_REQUIREMENTS: Record<DealState, DealStateRequirement> = {
  Created: {
    required_documents: [],
    required_signatures: [],
    required_evidence: ['lead_consent_proof'],
    next_states: ['Qualified', 'Closed_Lost'],
  },
  Qualified: {
    required_documents: ['buyer_requirements_form'],
    required_signatures: [],
    required_evidence: ['kyc_verification'],
    next_states: ['Viewing', 'Closed_Lost'],
  },
  Viewing: {
    required_documents: ['viewing_confirmation'],
    required_signatures: [],
    required_evidence: ['viewing_log'],
    next_states: ['Offer', 'Closed_Lost'],
  },
  Offer: {
    required_documents: ['offer_letter'],
    required_signatures: ['buyer_signature', 'seller_acknowledgment'],
    required_evidence: ['offer_submission_proof'],
    next_states: ['Reservation', 'Viewing', 'Closed_Lost'],
  },
  Reservation: {
    required_documents: ['reservation_form', 'deposit_receipt'],
    required_signatures: ['buyer_signature', 'seller_signature'],
    required_evidence: ['deposit_proof'],
    next_states: ['SPA', 'Closed_Lost'],
  },
  SPA: {
    required_documents: ['sales_purchase_agreement', 'noc_application'],
    required_signatures: ['buyer_signature', 'seller_signature', 'witness_signature'],
    required_evidence: ['spa_execution_proof', 'noc_receipt'],
    next_states: ['Closed_Won', 'Closed_Lost'],
  },
  Closed_Won: {
    required_documents: ['title_deed', 'handover_certificate'],
    required_signatures: [],
    required_evidence: ['registration_proof', 'key_handover_proof'],
    next_states: [],
  },
  Closed_Lost: {
    required_documents: ['cancellation_note'],
    required_signatures: [],
    required_evidence: [],
    next_states: [],
  },
};

// ============================================
// 7️⃣ DOCUMENT TEMPLATE (Read-only after publish)
// ============================================
export type DocType = 
  | 'OfferLetter' 
  | 'ReservationForm' 
  | 'SPA' 
  | 'ICA' 
  | 'MandateAgreement' 
  | 'ViewingConfirmation'
  | 'NOCApplication'
  | 'HandoverCertificate';

export interface DocumentTemplate {
  template_id: string;
  doc_type: DocType;
  template_version: number;
  effective_from: string;
  required_signers_schema: {
    roles: string[];
    min_signers: number;
  };
  data_binding_schema: Record<string, string>;
  template_content: string;
  is_published: boolean;
  created_at: string;
}

// ============================================
// 8️⃣ DOCUMENT INSTANCE
// ============================================
export type DocumentStatus = 'Draft' | 'Generated' | 'PendingSignature' | 'Executed' | 'Voided';

export interface DocumentInstance {
  document_id: string;
  template_ref: string;
  entity_ref: {
    entity_type: 'Deal' | 'Broker' | 'Listing';
    entity_id: string;
  };
  data_snapshot_hash: string;
  rendered_artifact_hash: string;
  status: DocumentStatus;
  generated_at: string;
  executed_at?: string;
}

// ============================================
// 9️⃣ SIGNATURE ENVELOPE
// ============================================
export interface Signer {
  signer_id: string;
  role: string;
  identity: {
    full_name: string;
    email: string;
  };
  status: 'Pending' | 'Signed' | 'Declined';
  signed_at?: string;
  ip_address?: string;
  device_fingerprint?: string;
}

export interface AuthorityCheck {
  check_type: 'IdentityVerification' | 'RoleValidation' | 'AuthorizationLevel';
  passed: boolean;
  checked_at: string;
  details: string;
}

export interface SignatureEnvelope {
  envelope_id: string;
  document_id: string;
  signers: Signer[];
  authority_checks: AuthorityCheck[];
  execution_evidence: {
    certificate_hash?: string;
    audit_trail_hash?: string;
  };
  created_at: string;
  completed_at?: string;
}

// ============================================
// 🔟 EVIDENCE OBJECT
// ============================================
export type EvidenceType = 
  | 'Screenshot' 
  | 'EmailConfirmation' 
  | 'SMSConfirmation' 
  | 'SignedDocument' 
  | 'PaymentReceipt'
  | 'PhotoEvidence'
  | 'SystemLog';

export interface EvidenceObject {
  evidence_id: string;
  type: EvidenceType;
  source: string;
  captured_by: string;
  captured_at: string;
  hash: string;
  immutability_class: ImmutabilityClass;
  metadata?: Record<string, unknown>;
  storage_ref: string;
}

// ============================================
// 1️⃣1️⃣ COMMISSION RECORD
// ============================================
export type CommissionStatus = 'Expected' | 'Earned' | 'Received' | 'Paid';

export interface CalculationTrace {
  gross_commission: number;
  brokerage_split_pct: number;
  brokerage_amount: number;
  broker_split_pct: number;
  broker_amount: number;
  deductions: {
    type: string;
    amount: number;
    reason: string;
  }[];
  net_payable: number;
  calculated_at: string;
  rule_version: string;
}

export interface CommissionRecord {
  commission_id: string;
  deal_id: string;
  broker_id: string;
  status: CommissionStatus;
  calculation_trace: CalculationTrace;
  expected_at?: string;
  earned_at?: string;
  received_at?: string;
  paid_at?: string;
}

// ============================================
// 1️⃣2️⃣ EVENT LOG ENTRY (Append-only)
// ============================================
export interface EventLogEntry {
  event_id: string;
  timestamp: string;
  actor_user_id: string;
  actor_role: UserRole;
  entity_ref: {
    entity_type: string;
    entity_id: string;
  };
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  rule_set_version: string;
  decision: 'ALLOWED' | 'BLOCKED';
  block_reasons: string[];
  prev_event_hash: string | null;
  event_hash: string;
}

// ============================================
// STATE MACHINE VALIDATION HELPERS
// ============================================
export interface StateTransitionResult {
  allowed: boolean;
  block_reasons: string[];
  missing_documents: string[];
  missing_signatures: string[];
  missing_evidence: string[];
}

export interface ValidationContext {
  documents: DocumentInstance[];
  signatures: SignatureEnvelope[];
  evidence: EvidenceObject[];
}
