/**
 * MiCasa BOS Manifest Types
 * TypeScript definitions for the manifest-driven document generation system
 */

// =====================================================
// MANIFEST PROMPT TYPES
// =====================================================

export interface ManifestPrompt {
  id: string;
  prompt_id: string;
  group_name: ManifestGroup;
  sort_order: number;
  title: string;
  purpose: string;
  prompt: string;
  input_schema: JSONSchema;
  output_schema: JSONSchema;
  refusal_policy: RefusalPolicy | null;
  depends_on: string[];
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ManifestGroup = 
  | 'SYSTEM' 
  | 'DOCUMENT_TEMPLATES' 
  | 'WORKFLOW_GATES' 
  | 'COMPLIANCE' 
  | 'ADMIN_OPS';

export interface JSONSchema {
  type: string;
  required?: string[];
  properties?: Record<string, JSONSchemaProperty>;
  additionalProperties?: boolean;
  items?: JSONSchemaProperty;
  enum?: string[];
}

export interface JSONSchemaProperty {
  type: string;
  enum?: string[];
  required?: string[];
  properties?: Record<string, JSONSchemaProperty>;
  items?: JSONSchemaProperty;
  additionalProperties?: boolean;
}

export interface RefusalPolicy {
  must_refuse_if: string[];
  refusal_style: string;
}

// =====================================================
// GENERATED DOCUMENT TYPES
// =====================================================

export type GeneratedDocumentStatus = 'Draft' | 'Finalized' | 'Voided';

export interface GeneratedDocument {
  id: string;
  document_id: string;
  prompt_id: string;
  entity_type: string;
  entity_id: string;
  input_payload: Record<string, unknown>;
  output: Record<string, unknown>;
  document_title: string;
  document_body: string;
  status: GeneratedDocumentStatus;
  generated_by: string | null;
  generated_at: string;
  finalized_at: string | null;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// WORKFLOW GATE TYPES
// =====================================================

export type WorkflowGateStatus = 'APPROVED' | 'BLOCKED';

export interface WorkflowGateResult {
  id: string;
  result_id: string;
  gate_id: string;
  deal_id: string;
  requested_action: string;
  documents_present: string[];
  status: WorkflowGateStatus;
  missing: string[];
  next_allowed_actions: string[];
  evaluation_notes: string | null;
  evaluated_at: string;
  evaluated_by: string | null;
  created_at: string;
}

// =====================================================
// EXECUTOR REQUEST/RESPONSE TYPES
// =====================================================

export interface ManifestExecutorRequest {
  promptId: string;
  inputPayload: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  dealId?: string; // For workflow gates
}

export interface ManifestExecutorResponse {
  success: boolean;
  promptId: string;
  // For document generation
  document_title?: string;
  document_body?: string;
  generatedDocumentId?: string;
  status?: GeneratedDocumentStatus;
  // For workflow gates
  gateStatus?: WorkflowGateStatus;
  missing?: string[];
  next_allowed_actions?: string[];
  gateResultId?: string;
  // For compliance checks
  risk_level?: 'Low' | 'Medium' | 'High';
  source_of_funds_required?: boolean;
  goaml_trigger_likely?: boolean;
  required_documents?: string[];
  notes?: string;
  // For KYC check
  kyc_status?: 'COMPLETE' | 'INCOMPLETE';
  // For admin ops
  index_title?: string;
  index_body?: string;
  audit_status?: 'AUDIT-READY' | 'INCOMPLETE';
  bundle_list?: string[];
  closeout_steps?: string[];
  // Error handling
  error?: string;
  refused?: boolean;
  refusal_reason?: string;
}

// =====================================================
// INPUT PAYLOAD TYPES (for specific prompts)
// =====================================================

export interface SalesBrokerageInput {
  client_role: 'seller' | 'buyer_rep';
  client_legal_name: string;
  property: {
    property_type: string;
    location: string;
    unit_or_plot: string;
    title_deed_no?: string;
    asking_price_aed?: number;
  };
  commission: {
    payor: 'seller' | 'buyer';
    structure: 'percent' | 'fixed';
    rate_percent?: number;
    fixed_aed?: number;
    due_event?: string;
  };
  contract_term: {
    start_date: string;
    end_date: string;
    non_exclusive: boolean;
  };
  assigned_agent: {
    full_name: string;
    agent_id_or_brn: string;
    email: string;
    mobile: string;
  };
  micasa: {
    legal_name: string;
    license_no: string;
    address: string;
    email: string;
    phone: string;
    bank_account?: Record<string, string>;
  };
}

export interface LeasingBrokerageInput {
  client_role: 'landlord' | 'tenant_rep';
  client_legal_name: string;
  property: {
    property_type: string;
    location: string;
    unit: string;
    title_deed_no?: string;
  };
  lease_terms: {
    annual_rent_aed: number;
    start_date: string;
    end_date: string;
    payment_terms?: string;
  };
  commission: {
    payor: 'landlord' | 'tenant';
    structure: 'percent' | 'fixed';
    rate_percent?: number;
    fixed_aed?: number;
    due_event?: string;
  };
  assigned_agent: {
    full_name: string;
    agent_id_or_brn: string;
    email: string;
    mobile: string;
  };
  micasa: {
    legal_name: string;
    license_no: string;
    address: string;
    email: string;
    phone: string;
  };
}

export interface WorkflowGateInput {
  requested_action: string;
  documents_present: string[];
}

export interface AMLCheckInput {
  deal_value_aed: number;
  payment_method: 'cash' | 'bank_transfer' | 'mortgage' | 'crypto' | 'mixed' | 'unknown';
  buyer_profile_flags: {
    pep_declared?: boolean;
    unusual_urgency?: boolean;
    complex_structure?: boolean;
    sanctions_concern?: boolean;
  };
}

export interface KYCCheckInput {
  landlord_id_present: boolean;
  tenant_id_present: boolean;
  ownership_proof_present: boolean;
}

export interface DocumentIndexInput {
  deal_type: 'sales' | 'leasing';
  property_ref: string;
  documents_present: string[];
}

// =====================================================
// TEMPLATE SELECTOR TYPES
// =====================================================

export interface TemplateOption {
  prompt_id: string;
  title: string;
  purpose: string;
  group: ManifestGroup;
  tags: string[];
}

export const DOCUMENT_TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    prompt_id: 'DOC_BROKERAGE_SALES',
    title: 'Sales Brokerage Agreement',
    purpose: 'ADM-approved sales brokerage addendum',
    group: 'DOCUMENT_TEMPLATES',
    tags: ['sales', 'brokerage']
  },
  {
    prompt_id: 'DOC_BROKERAGE_LEASING',
    title: 'Leasing Brokerage Agreement',
    purpose: 'One-party commission leasing addendum',
    group: 'DOCUMENT_TEMPLATES',
    tags: ['leasing', 'brokerage']
  },
  {
    prompt_id: 'DOC_BUYER_OFFER',
    title: 'Buyer Offer Letter',
    purpose: 'Non-binding buyer offer with validity',
    group: 'DOCUMENT_TEMPLATES',
    tags: ['sales', 'offer']
  },
  {
    prompt_id: 'DOC_TENANT_OFFER',
    title: 'Tenant Intent Letter',
    purpose: 'Non-binding tenant offer with rent terms',
    group: 'DOCUMENT_TEMPLATES',
    tags: ['leasing', 'offer']
  },
  {
    prompt_id: 'DOC_COMMISSION_INVOICE',
    title: 'Commission Invoice',
    purpose: 'VAT-aware commission invoice',
    group: 'DOCUMENT_TEMPLATES',
    tags: ['finance', 'invoice']
  }
];

export const WORKFLOW_GATE_OPTIONS: TemplateOption[] = [
  {
    prompt_id: 'FLOW_SALES_GATE',
    title: 'Sales Gatekeeper',
    purpose: 'Verify sales prerequisites',
    group: 'WORKFLOW_GATES',
    tags: ['sales', 'gate']
  },
  {
    prompt_id: 'FLOW_LEASING_GATE',
    title: 'Leasing Gatekeeper',
    purpose: 'Verify leasing prerequisites',
    group: 'WORKFLOW_GATES',
    tags: ['leasing', 'gate']
  }
];

export const COMPLIANCE_OPTIONS: TemplateOption[] = [
  {
    prompt_id: 'AML_SALES_CHECK',
    title: 'AML Risk Assessment',
    purpose: 'Determine AML requirements for sales',
    group: 'COMPLIANCE',
    tags: ['aml', 'sales']
  },
  {
    prompt_id: 'KYC_LEASING_CHECK',
    title: 'KYC Completeness',
    purpose: 'Verify leasing KYC documents',
    group: 'COMPLIANCE',
    tags: ['kyc', 'leasing']
  }
];
