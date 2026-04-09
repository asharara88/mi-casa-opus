-- Add static document templates to bos_manifest_prompts
-- These templates return hard-coded content with NO AI modification

INSERT INTO public.bos_manifest_prompts (
  prompt_id, group_name, sort_order, title, purpose, prompt, 
  input_schema, output_schema, refusal_policy, depends_on, tags, is_active
) VALUES 
(
  'STATIC_ADM_FORM_A',
  'STATIC_TEMPLATES',
  100,
  'ADM Form A – Sales Brokerage Authority',
  'Official ADM-approved sales brokerage authority form (static, no AI modification)',
  'Static template - returns hard-coded ADM Form A document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'adm', 'form', 'sales', 'official'],
  true
),
(
  'STATIC_ADM_FORM_B',
  'STATIC_TEMPLATES',
  101,
  'ADM Form B – Leasing Brokerage Authority',
  'Official ADM-approved leasing brokerage authority form (static, no AI modification)',
  'Static template - returns hard-coded ADM Form B document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'adm', 'form', 'leasing', 'official'],
  true
),
(
  'STATIC_NDA',
  'STATIC_TEMPLATES',
  102,
  'Non-Disclosure Agreement (NDA)',
  'Standard NDA template for confidential information (static, no AI modification)',
  'Static template - returns hard-coded NDA document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'nda', 'legal', 'confidential'],
  true
),
(
  'STATIC_VIEWING_RECEIPT',
  'STATIC_TEMPLATES',
  103,
  'Property Viewing Confirmation Receipt',
  'Standard viewing confirmation receipt (static, no AI modification)',
  'Static template - returns hard-coded viewing receipt document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'viewing', 'receipt', 'confirmation'],
  true
),
(
  'STATIC_COMMISSION_RECEIPT',
  'STATIC_TEMPLATES',
  104,
  'Commission Payment Receipt',
  'Official commission payment receipt (static, no AI modification)',
  'Static template - returns hard-coded commission receipt document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'commission', 'receipt', 'finance'],
  true
),
(
  'STATIC_HANDOVER_CHECKLIST',
  'STATIC_TEMPLATES',
  105,
  'Property Handover Checklist',
  'Standard property handover checklist form (static, no AI modification)',
  'Static template - returns hard-coded handover checklist document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'handover', 'checklist', 'property'],
  true
),
(
  'STATIC_RESERVATION',
  'STATIC_TEMPLATES',
  106,
  'Property Reservation Agreement',
  'Standard reservation agreement form (static, no AI modification)',
  'Static template - returns hard-coded reservation agreement document',
  '{"type": "object", "properties": {}, "required": []}'::jsonb,
  '{"type": "object", "properties": {"document_title": {"type": "string"}, "document_body": {"type": "string"}}, "required": ["document_title", "document_body"]}'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['static', 'reservation', 'agreement', 'booking'],
  true
)
ON CONFLICT (prompt_id) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  title = EXCLUDED.title,
  purpose = EXCLUDED.purpose,
  tags = EXCLUDED.tags,
  is_active = EXCLUDED.is_active;