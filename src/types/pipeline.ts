// ============================================
// PIPELINE TYPES - OFF-PLAN vs SECONDARY MARKET
// ============================================

// Pipeline type
export type DealPipeline = 'OffPlan' | 'Secondary';

// Off-Plan Deal States
export type OffPlanDealState =
  | 'LeadQualified'
  | 'EOISubmitted'
  | 'EOIPaid'
  | 'SPASigned'
  | 'PaymentPlan'
  | 'Construction'
  | 'Handover'
  | 'ClosedWon'
  | 'ClosedLost';

// Secondary Market Deal States
export type SecondaryDealState =
  | 'RequirementsCaptured'
  | 'ViewingScheduled'
  | 'ViewingCompleted'
  | 'OfferSubmitted'
  | 'OfferAccepted'
  | 'MOUSigned'
  | 'NOCObtained'
  | 'TransferBooked'
  | 'TransferComplete'
  | 'ClosedWon'
  | 'ClosedLost';

// Off-Plan Dead Reasons
export type OffPlanDeadReason =
  | 'BudgetMismatch'
  | 'KYCFailed'
  | 'ClientWithdrew'
  | 'PaymentDefault'
  | 'ProjectCancelled'
  | 'Other';

// Secondary Dead Reasons
export type SecondaryDeadReason =
  | 'NoSuitableProperty'
  | 'BudgetMismatch'
  | 'MortgageRejected'
  | 'ClientWithdrew'
  | 'SellerWithdrew'
  | 'NOCRejected'
  | 'LegalIssue'
  | 'Other';

// Pipeline states configuration
export const OFFPLAN_PIPELINE_STATES: OffPlanDealState[] = [
  'LeadQualified',
  'EOISubmitted',
  'EOIPaid',
  'SPASigned',
  'PaymentPlan',
  'Construction',
  'Handover',
];

export const SECONDARY_PIPELINE_STATES: SecondaryDealState[] = [
  'RequirementsCaptured',
  'ViewingScheduled',
  'ViewingCompleted',
  'OfferSubmitted',
  'OfferAccepted',
  'MOUSigned',
  'NOCObtained',
  'TransferBooked',
  'TransferComplete',
];

// State configurations with labels and descriptions
export const OFFPLAN_STATE_CONFIG: Record<OffPlanDealState, { 
  label: string; 
  description: string;
  requiredDocs: string[];
  requiredEvidence: string[];
}> = {
  LeadQualified: {
    label: 'Lead Qualified',
    description: 'KYC validated, budget confirmed',
    requiredDocs: ['passport_copy', 'emirates_id'],
    requiredEvidence: ['kyc_verification'],
  },
  EOISubmitted: {
    label: 'EOI Submitted',
    description: 'Expression of Interest submitted to developer',
    requiredDocs: ['eoi_form'],
    requiredEvidence: ['eoi_submission_proof'],
  },
  EOIPaid: {
    label: 'EOI Paid',
    description: 'EOI payment received by developer',
    requiredDocs: ['payment_receipt'],
    requiredEvidence: ['payment_proof'],
  },
  SPASigned: {
    label: 'SPA Signed',
    description: 'Sales & Purchase Agreement executed',
    requiredDocs: ['spa_agreement'],
    requiredEvidence: ['spa_execution_proof'],
  },
  PaymentPlan: {
    label: 'Payment Plan',
    description: 'Ongoing payment milestones',
    requiredDocs: ['payment_schedule'],
    requiredEvidence: [],
  },
  Construction: {
    label: 'Construction',
    description: 'Property under construction',
    requiredDocs: [],
    requiredEvidence: ['construction_updates'],
  },
  Handover: {
    label: 'Handover',
    description: 'Property ready for handover',
    requiredDocs: ['handover_certificate', 'title_deed'],
    requiredEvidence: ['handover_proof'],
  },
  ClosedWon: {
    label: 'Closed Won',
    description: 'Deal successfully completed',
    requiredDocs: [],
    requiredEvidence: [],
  },
  ClosedLost: {
    label: 'Closed Lost',
    description: 'Deal lost or cancelled',
    requiredDocs: [],
    requiredEvidence: [],
  },
};

export const SECONDARY_STATE_CONFIG: Record<SecondaryDealState, {
  label: string;
  description: string;
  requiredDocs: string[];
  requiredEvidence: string[];
}> = {
  RequirementsCaptured: {
    label: 'Requirements Captured',
    description: 'Client requirements documented',
    requiredDocs: ['requirements_form'],
    requiredEvidence: ['kyc_verification'],
  },
  ViewingScheduled: {
    label: 'Viewing Scheduled',
    description: 'Property viewings arranged',
    requiredDocs: ['viewing_schedule'],
    requiredEvidence: [],
  },
  ViewingCompleted: {
    label: 'Viewing Completed',
    description: 'Viewings conducted, feedback collected',
    requiredDocs: [],
    requiredEvidence: ['viewing_log'],
  },
  OfferSubmitted: {
    label: 'Offer Submitted',
    description: 'Offer presented to seller',
    requiredDocs: ['offer_letter'],
    requiredEvidence: ['offer_submission_proof'],
  },
  OfferAccepted: {
    label: 'Offer Accepted',
    description: 'Seller accepted the offer',
    requiredDocs: ['offer_acceptance'],
    requiredEvidence: ['acceptance_proof'],
  },
  MOUSigned: {
    label: 'MOU Signed',
    description: 'Memorandum of Understanding executed',
    requiredDocs: ['mou_agreement', 'deposit_receipt'],
    requiredEvidence: ['mou_execution_proof', 'deposit_proof'],
  },
  NOCObtained: {
    label: 'NOC Obtained',
    description: 'No Objection Certificate from developer/management',
    requiredDocs: ['noc_certificate'],
    requiredEvidence: ['noc_receipt'],
  },
  TransferBooked: {
    label: 'Transfer Booked',
    description: 'DLD/Tawtheeq transfer appointment set',
    requiredDocs: ['transfer_booking'],
    requiredEvidence: ['booking_confirmation'],
  },
  TransferComplete: {
    label: 'Transfer Complete',
    description: 'Ownership transferred, title deed issued',
    requiredDocs: ['title_deed', 'handover_certificate'],
    requiredEvidence: ['transfer_proof'],
  },
  ClosedWon: {
    label: 'Closed Won',
    description: 'Deal successfully completed',
    requiredDocs: [],
    requiredEvidence: [],
  },
  ClosedLost: {
    label: 'Closed Lost',
    description: 'Deal lost or cancelled',
    requiredDocs: [],
    requiredEvidence: [],
  },
};

// State transition definitions
export const OFFPLAN_STATE_TRANSITIONS: Record<OffPlanDealState, OffPlanDealState[]> = {
  LeadQualified: ['EOISubmitted', 'ClosedLost'],
  EOISubmitted: ['EOIPaid', 'ClosedLost'],
  EOIPaid: ['SPASigned', 'ClosedLost'],
  SPASigned: ['PaymentPlan', 'ClosedLost'],
  PaymentPlan: ['Construction', 'ClosedLost'],
  Construction: ['Handover', 'ClosedLost'],
  Handover: ['ClosedWon', 'ClosedLost'],
  ClosedWon: [],
  ClosedLost: [],
};

export const SECONDARY_STATE_TRANSITIONS: Record<SecondaryDealState, SecondaryDealState[]> = {
  RequirementsCaptured: ['ViewingScheduled', 'ClosedLost'],
  ViewingScheduled: ['ViewingCompleted', 'ClosedLost'],
  ViewingCompleted: ['OfferSubmitted', 'ViewingScheduled', 'ClosedLost'],
  OfferSubmitted: ['OfferAccepted', 'ViewingCompleted', 'ClosedLost'],
  OfferAccepted: ['MOUSigned', 'ClosedLost'],
  MOUSigned: ['NOCObtained', 'ClosedLost'],
  NOCObtained: ['TransferBooked', 'ClosedLost'],
  TransferBooked: ['TransferComplete', 'ClosedLost'],
  TransferComplete: ['ClosedWon', 'ClosedLost'],
  ClosedWon: [],
  ClosedLost: [],
};

// Dead reason labels
export const OFFPLAN_DEAD_REASON_LABELS: Record<OffPlanDeadReason, string> = {
  BudgetMismatch: 'Budget Mismatch',
  KYCFailed: 'KYC Failed',
  ClientWithdrew: 'Client Withdrew',
  PaymentDefault: 'Payment Default',
  ProjectCancelled: 'Project Cancelled',
  Other: 'Other',
};

export const SECONDARY_DEAD_REASON_LABELS: Record<SecondaryDeadReason, string> = {
  NoSuitableProperty: 'No Suitable Property',
  BudgetMismatch: 'Budget Mismatch',
  MortgageRejected: 'Mortgage Rejected',
  ClientWithdrew: 'Client Withdrew',
  SellerWithdrew: 'Seller Withdrew',
  NOCRejected: 'NOC Rejected',
  LegalIssue: 'Legal Issue',
  Other: 'Other',
};

// Pipeline metadata
export const PIPELINE_CONFIG: Record<DealPipeline, {
  label: string;
  description: string;
  avgCycleDays: number;
  riskProfile: string;
}> = {
  OffPlan: {
    label: 'Off-Plan',
    description: 'New developments from developers',
    avgCycleDays: 180,
    riskProfile: 'Medium (Payment plan dependent)',
  },
  Secondary: {
    label: 'Secondary Market',
    description: 'Resale and leasing transactions',
    avgCycleDays: 45,
    riskProfile: 'Low-Medium (NOC/Mortgage dependent)',
  },
};

// Helper function to get state label
export function getPipelineStateLabel(
  pipeline: DealPipeline,
  state: OffPlanDealState | SecondaryDealState
): string {
  if (pipeline === 'OffPlan') {
    return OFFPLAN_STATE_CONFIG[state as OffPlanDealState]?.label || state;
  }
  return SECONDARY_STATE_CONFIG[state as SecondaryDealState]?.label || state;
}

// Helper function to get next valid states
export function getNextValidStates(
  pipeline: DealPipeline,
  currentState: OffPlanDealState | SecondaryDealState
): (OffPlanDealState | SecondaryDealState)[] {
  if (pipeline === 'OffPlan') {
    return OFFPLAN_STATE_TRANSITIONS[currentState as OffPlanDealState] || [];
  }
  return SECONDARY_STATE_TRANSITIONS[currentState as SecondaryDealState] || [];
}
