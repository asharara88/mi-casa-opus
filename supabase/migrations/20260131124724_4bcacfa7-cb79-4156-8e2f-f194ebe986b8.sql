-- =====================================================
-- BOS MANIFEST INTEGRATION TABLES
-- =====================================================

-- 1. Enum for generated document status
CREATE TYPE generated_document_status AS ENUM ('Draft', 'Finalized', 'Voided');

-- 2. Enum for workflow gate status  
CREATE TYPE workflow_gate_status AS ENUM ('APPROVED', 'BLOCKED');

-- =====================================================
-- TABLE: bos_manifest_prompts
-- Stores the manifest prompt definitions for document generation and gates
-- =====================================================
CREATE TABLE public.bos_manifest_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id TEXT NOT NULL UNIQUE,
  group_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  purpose TEXT NOT NULL,
  prompt TEXT NOT NULL,
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  refusal_policy JSONB DEFAULT NULL,
  depends_on TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bos_manifest_prompts ENABLE ROW LEVEL SECURITY;

-- Policies: Operators can manage, authenticated can view
CREATE POLICY "Authenticated users can view manifest prompts"
  ON public.bos_manifest_prompts
  FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage manifest prompts"
  ON public.bos_manifest_prompts
  FOR ALL
  USING (has_role(auth.uid(), 'Operator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- Index for fast lookups
CREATE INDEX idx_bos_manifest_prompts_prompt_id ON public.bos_manifest_prompts(prompt_id);
CREATE INDEX idx_bos_manifest_prompts_group ON public.bos_manifest_prompts(group_name);

-- =====================================================
-- TABLE: generated_documents
-- Stores AI-generated document outputs
-- =====================================================
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  prompt_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,
  document_title TEXT NOT NULL,
  document_body TEXT NOT NULL,
  status generated_document_status NOT NULL DEFAULT 'Draft',
  generated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finalized_at TIMESTAMP WITH TIME ZONE,
  voided_at TIMESTAMP WITH TIME ZONE,
  void_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Operators can manage generated documents"
  ON public.generated_documents
  FOR ALL
  USING (has_role(auth.uid(), 'Operator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

CREATE POLICY "LegalOwners can view generated documents"
  ON public.generated_documents
  FOR SELECT
  USING (has_role(auth.uid(), 'LegalOwner'::app_role));

CREATE POLICY "Brokers can view their generated documents"
  ON public.generated_documents
  FOR SELECT
  USING (
    has_role(auth.uid(), 'Broker'::app_role) 
    AND generated_by = auth.uid()
  );

-- Indexes
CREATE INDEX idx_generated_documents_prompt_id ON public.generated_documents(prompt_id);
CREATE INDEX idx_generated_documents_entity ON public.generated_documents(entity_type, entity_id);
CREATE INDEX idx_generated_documents_status ON public.generated_documents(status);

-- =====================================================
-- TABLE: workflow_gate_results
-- Stores gate evaluation results (APPROVED/BLOCKED)
-- =====================================================
CREATE TABLE public.workflow_gate_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id TEXT NOT NULL UNIQUE,
  gate_id TEXT NOT NULL,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  requested_action TEXT NOT NULL,
  documents_present TEXT[] NOT NULL DEFAULT '{}',
  status workflow_gate_status NOT NULL DEFAULT 'BLOCKED',
  missing TEXT[] NOT NULL DEFAULT '{}',
  next_allowed_actions TEXT[] NOT NULL DEFAULT '{}',
  evaluation_notes TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  evaluated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_gate_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Operators can manage workflow gate results"
  ON public.workflow_gate_results
  FOR ALL
  USING (has_role(auth.uid(), 'Operator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

CREATE POLICY "LegalOwners can view workflow gate results"
  ON public.workflow_gate_results
  FOR SELECT
  USING (has_role(auth.uid(), 'LegalOwner'::app_role));

CREATE POLICY "Brokers can view gate results for their deals"
  ON public.workflow_gate_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_brokers db
      JOIN broker_profiles bp ON db.broker_id = bp.id
      WHERE db.deal_id = workflow_gate_results.deal_id
      AND bp.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_workflow_gate_results_gate_id ON public.workflow_gate_results(gate_id);
CREATE INDEX idx_workflow_gate_results_deal_id ON public.workflow_gate_results(deal_id);
CREATE INDEX idx_workflow_gate_results_status ON public.workflow_gate_results(status);

-- =====================================================
-- SEED: Insert manifest prompts from the BOS Manifest
-- =====================================================

-- SYSTEM prompts
INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'MICASA_BOS_ROOT',
  'SYSTEM',
  1,
  'MiCasa BOS Root Governance',
  'Define jurisdiction, regulator constraints, refusal logic, and non-negotiables for all downstream modules.',
  E'You are MiCasa BOS, the internal operating system for MiCasa Real Estate.\n\nJurisdiction: Abu Dhabi, UAE\nRegulator: DMT / ADM\nBusiness type: Licensed real estate brokerage (sales & leasing)\n\nHard rules (non-negotiable):\n- No brokerage activity may proceed without a signed ADM-approved brokerage contract.\n- Leasing commission may be charged to ONE party only.\n- Sales transactions require AML/KYC processing.\n- Online advertising requires a Madhmoun permit where applicable.\n- All actions must leave an audit trail.\n- If a required document is missing, refuse to proceed and clearly state what is missing.\n\nYou do not provide legal advice.\nYou do not invent regulations.\nIf a rule is uncertain, flag it as "VERIFY WITH ADM".\n\nYou only generate documents using approved MiCasa templates.',
  '{"type": "object", "properties": {}, "additionalProperties": true}'::jsonb,
  '{"type": "object", "properties": {"acknowledgement": {"type": "string"}}, "additionalProperties": true}'::jsonb,
  '{"must_refuse_if": ["User asks for legal advice rather than operational documentation.", "User requests fabrication or backdating of documents."], "refusal_style": "Refuse briefly and state safe alternative actions."}'::jsonb,
  '{}',
  ARRAY['root', 'governance', 'compliance']
);

-- DOCUMENT_TEMPLATES
INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'DOC_BROKERAGE_SALES',
  'DOCUMENT_TEMPLATES',
  10,
  'Sales Brokerage Agreement Addendum',
  'Generate MiCasa Sales Brokerage Agreement addendum aligned to ADM-approved brokerage contract forms.',
  E'Generate a MiCasa Sales Brokerage Agreement addendum aligned with ADM-approved brokerage contracts.\n\nRules:\n- Include: parties, property details, scope, term, commission mechanics, confidentiality, non-circumvention, dispute clause, signatures.\n- Keep language plain and minimal.\n- No legal advice.\n- If any point is uncertain, write: VERIFY WITH ADM.\n\nOutput:\n- Provide a single copy-paste-ready document in clean sections.',
  '{"type": "object", "required": ["client_role", "client_legal_name", "property", "commission", "contract_term", "assigned_agent", "micasa"], "properties": {"client_role": {"type": "string", "enum": ["seller", "buyer_rep"]}, "client_legal_name": {"type": "string"}, "property": {"type": "object", "required": ["location", "unit_or_plot", "property_type"]}, "commission": {"type": "object", "required": ["payor", "structure"]}, "contract_term": {"type": "object", "required": ["start_date", "end_date", "non_exclusive"]}, "assigned_agent": {"type": "object", "required": ["full_name", "agent_id_or_brn", "email", "mobile"]}, "micasa": {"type": "object", "required": ["legal_name", "license_no", "address", "email", "phone"]}}}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  '{"must_refuse_if": ["No client role provided", "Commission payor not specified", "Assigned agent identifier missing"], "refusal_style": "State missing inputs and stop."}'::jsonb,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['template', 'sales', 'brokerage', 'addendum']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'DOC_BROKERAGE_LEASING',
  'DOCUMENT_TEMPLATES',
  11,
  'Leasing Brokerage Agreement Addendum',
  'Generate MiCasa Leasing Brokerage Agreement addendum with one-party commission rule.',
  E'Generate a MiCasa Leasing Brokerage Agreement addendum.\n\nHard gates:\n- Commission payer must be exactly ONE party (landlord OR tenant). If not, refuse.\n\nInclude:\n- parties, property, rent, term, scope, commission, confidentiality, non-circumvention, dispute clause, signatures.\n\nOutput:\n- Provide a single copy-paste-ready document in clean sections.',
  '{"type": "object", "required": ["client_role", "client_legal_name", "property", "lease_terms", "commission", "assigned_agent", "micasa"], "properties": {"client_role": {"type": "string", "enum": ["landlord", "tenant_rep"]}, "client_legal_name": {"type": "string"}, "property": {"type": "object", "required": ["location", "unit", "property_type"]}, "lease_terms": {"type": "object", "required": ["annual_rent_aed", "start_date", "end_date"]}, "commission": {"type": "object", "required": ["payor", "structure"]}}}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  '{"must_refuse_if": ["Commission payor is missing", "Commission payor includes both parties", "Annual rent is missing"], "refusal_style": "State missing/invalid selection and stop."}'::jsonb,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['template', 'leasing', 'brokerage', 'addendum']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'DOC_BUYER_OFFER',
  'DOCUMENT_TEMPLATES',
  14,
  'Buyer Offer Letter (Non-Binding)',
  'Generate non-binding buyer offer letter with validity timer and key terms.',
  E'Generate a non-binding Buyer Offer Letter.\n\nRules:\n- Must clearly state it is non-binding.\n- Must include validity deadline.\n- Must include price and key terms.\n\nOutput:\n- Single copy-paste-ready letter.',
  '{"type": "object", "required": ["buyer", "property", "offer", "valid_until"], "properties": {"buyer": {"type": "object", "required": ["full_name", "id_ref", "mobile", "email"]}, "property": {"type": "object", "required": ["location", "unit"]}, "offer": {"type": "object", "required": ["price_aed"]}, "valid_until": {"type": "string"}}}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['template', 'offer', 'sales']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'DOC_TENANT_OFFER',
  'DOCUMENT_TEMPLATES',
  15,
  'Tenant Offer / Intent Letter (Non-Binding)',
  'Generate non-binding tenant intent letter including rent, cheques, validity.',
  E'Generate a non-binding Tenant Offer / Intent Letter.\n\nRules:\n- Must clearly state it is non-binding.\n- Must include validity deadline.\n- Must include proposed rent and payment terms.\n\nOutput:\n- Single copy-paste-ready letter.',
  '{"type": "object", "required": ["tenant", "property", "offer", "valid_until"], "properties": {"tenant": {"type": "object", "required": ["full_name", "id_ref", "mobile", "email"]}, "property": {"type": "object", "required": ["location", "unit"]}, "offer": {"type": "object", "required": ["annual_rent_aed", "lease_start_date", "lease_end_date"]}, "valid_until": {"type": "string"}}}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['template', 'offer', 'leasing']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'DOC_COMMISSION_INVOICE',
  'DOCUMENT_TEMPLATES',
  16,
  'Commission Invoice',
  'Generate invoice for commission with VAT toggle only if MiCasa is VAT-registered.',
  E'Generate a MiCasa Commission Invoice.\n\nHard gate:\n- VAT may only be applied if vat_registered = true.\n\nOutput:\n- Single copy-paste-ready invoice.',
  '{"type": "object", "required": ["deal", "invoice", "supplier", "customer", "commission", "payment_instructions"], "properties": {"deal": {"type": "object", "required": ["deal_type", "property_ref"]}, "invoice": {"type": "object", "required": ["invoice_no", "invoice_date", "due_date"]}, "supplier": {"type": "object", "required": ["legal_name", "license_no", "address", "email", "phone", "vat_registered"]}, "customer": {"type": "object", "required": ["name", "address"]}, "commission": {"type": "object", "required": ["basis", "base_amount_aed", "structure"]}}}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  '{"must_refuse_if": ["supplier.vat_registered is false but VAT requested in inputs"], "refusal_style": "State VAT rule and stop."}'::jsonb,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['template', 'finance', 'invoice']
);

-- WORKFLOW_GATES
INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'FLOW_SALES_GATE',
  'WORKFLOW_GATES',
  20,
  'Sales Gatekeeper',
  'Block sales workflow actions until required authority + KYC/AML prerequisites are met.',
  E'Before proceeding with a sales transaction action, verify the following are present:\n- Signed sales brokerage contract (approved form)\n- Ownership/authority proof\n- KYC folder created\n- AML risk assessment completed\n\nIf any are missing:\n- Refuse to proceed\n- List missing items explicitly\n\nIf present:\n- Output: APPROVED and list next allowed actions.',
  '{"type": "object", "required": ["requested_action", "documents_present"], "properties": {"requested_action": {"type": "string"}, "documents_present": {"type": "array", "items": {"type": "string"}}}}'::jsonb,
  '{"type": "object", "properties": {"status": {"type": "string", "enum": ["APPROVED", "BLOCKED"]}, "missing": {"type": "array", "items": {"type": "string"}}, "next_allowed_actions": {"type": "array", "items": {"type": "string"}}}, "required": ["status", "missing", "next_allowed_actions"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['gate', 'sales', 'workflow']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'FLOW_LEASING_GATE',
  'WORKFLOW_GATES',
  21,
  'Leasing Gatekeeper',
  'Block leasing workflow actions until required authority + basic KYC prerequisites are met.',
  E'Before proceeding with a leasing transaction action, verify the following are present:\n- Signed leasing brokerage contract (approved form)\n- Ownership/authority proof\n- Tenant ID collected (when tenant identified)\n\nIf any are missing:\n- Refuse to proceed\n- List missing items explicitly\n\nIf present:\n- Output: APPROVED and list next allowed actions.',
  '{"type": "object", "required": ["requested_action", "documents_present"], "properties": {"requested_action": {"type": "string"}, "documents_present": {"type": "array", "items": {"type": "string"}}}}'::jsonb,
  '{"type": "object", "properties": {"status": {"type": "string", "enum": ["APPROVED", "BLOCKED"]}, "missing": {"type": "array", "items": {"type": "string"}}, "next_allowed_actions": {"type": "array", "items": {"type": "string"}}}, "required": ["status", "missing", "next_allowed_actions"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['gate', 'leasing', 'workflow']
);

-- COMPLIANCE
INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'AML_SALES_CHECK',
  'COMPLIANCE',
  30,
  'AML Sales Requirements Check',
  'Determine AML obligations per sales deal (risk level, source of funds need, goAML trigger).',
  E'Determine AML requirements for a sales transaction.\n\nOutput must include:\n- Risk level: Low / Medium / High\n- Whether source of funds is required\n- Whether goAML reporting appears triggered\n- A concise list of required documents\n\nRules:\n- Do not auto-file reports.\n- If unclear, output: VERIFY WITH ADM.\n- Keep it operational (not legal advice).',
  '{"type": "object", "required": ["deal_value_aed", "payment_method", "buyer_profile_flags"], "properties": {"deal_value_aed": {"type": "number"}, "payment_method": {"type": "string", "enum": ["cash", "bank_transfer", "mortgage", "crypto", "mixed", "unknown"]}, "buyer_profile_flags": {"type": "object", "properties": {"pep_declared": {"type": "boolean"}, "unusual_urgency": {"type": "boolean"}, "complex_structure": {"type": "boolean"}, "sanctions_concern": {"type": "boolean"}}}}}'::jsonb,
  '{"type": "object", "properties": {"risk_level": {"type": "string", "enum": ["Low", "Medium", "High"]}, "source_of_funds_required": {"type": "boolean"}, "goaml_trigger_likely": {"type": "boolean"}, "required_documents": {"type": "array", "items": {"type": "string"}}, "notes": {"type": "string"}}, "required": ["risk_level", "source_of_funds_required", "goaml_trigger_likely", "required_documents", "notes"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['compliance', 'aml', 'sales']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'KYC_LEASING_CHECK',
  'COMPLIANCE',
  31,
  'Leasing KYC Completeness Check',
  'Confirm basic ID/authority completeness for leasing (no AML scoring).',
  E'Confirm leasing KYC completeness.\n\nInputs:\n- Landlord ID present?\n- Tenant ID present?\n- Ownership/authority proof present?\n\nOutput:\n- COMPLETE or INCOMPLETE, and missing items list.',
  '{"type": "object", "required": ["landlord_id_present", "tenant_id_present", "ownership_proof_present"], "properties": {"landlord_id_present": {"type": "boolean"}, "tenant_id_present": {"type": "boolean"}, "ownership_proof_present": {"type": "boolean"}}}'::jsonb,
  '{"type": "object", "properties": {"status": {"type": "string", "enum": ["COMPLETE", "INCOMPLETE"]}, "missing": {"type": "array", "items": {"type": "string"}}}, "required": ["status", "missing"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['compliance', 'kyc', 'leasing']
);

-- ADMIN_OPS
INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'ADMIN_DOC_INDEX',
  'ADMIN_OPS',
  40,
  'Deal Document Index Generator',
  'Generate one-page document index with Present/Missing status for the deal folder.',
  E'Generate a one-page Deal Document Index.\n\nInputs:\n- Deal type\n- Property reference\n- List of uploaded / present documents\n\nOutput:\n- Ordered checklist with status (PRESENT / MISSING) and next action.',
  '{"type": "object", "required": ["deal_type", "property_ref", "documents_present"], "properties": {"deal_type": {"type": "string", "enum": ["sales", "leasing"]}, "property_ref": {"type": "string"}, "documents_present": {"type": "array", "items": {"type": "string"}}}}'::jsonb,
  '{"type": "object", "properties": {"index_title": {"type": "string"}, "index_body": {"type": "string"}}, "required": ["index_title", "index_body"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['admin', 'ops', 'index']
);

INSERT INTO public.bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (
  'ADMIN_AUDIT_EXPORT',
  'ADMIN_OPS',
  41,
  'Audit-Ready Export Checklist',
  'Prepare final audit-ready bundle list and flag missing mandatory items before closeout.',
  E'Prepare a final audit-ready PDF bundle checklist.\n\nRules:\n- Flag missing mandatory documents.\n- Output status: AUDIT-READY or INCOMPLETE.\n- Provide exact missing items and where they should be filed.\n\nOutput must be short and operational.',
  '{"type": "object", "required": ["deal_type", "property_ref", "documents_present"], "properties": {"deal_type": {"type": "string", "enum": ["sales", "leasing"]}, "property_ref": {"type": "string"}, "documents_present": {"type": "array", "items": {"type": "string"}}}}'::jsonb,
  '{"type": "object", "properties": {"status": {"type": "string", "enum": ["AUDIT-READY", "INCOMPLETE"]}, "bundle_list": {"type": "array", "items": {"type": "string"}}, "missing": {"type": "array", "items": {"type": "string"}}, "closeout_steps": {"type": "array", "items": {"type": "string"}}}, "required": ["status", "bundle_list", "missing", "closeout_steps"]}'::jsonb,
  NULL,
  ARRAY['MICASA_BOS_ROOT', 'ADMIN_DOC_INDEX'],
  ARRAY['admin', 'audit', 'export']
);