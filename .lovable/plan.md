

# Manifest v1.0.2 Database Synchronization Plan

## Objective
Align the `bos_manifest_prompts` table with the provided manifest v1.0.2 JSON, ensuring all 16 core prompts have the exact prompt text, input/output schemas, and refusal policies as defined.

## Current State Analysis

The database has **36 active prompts** while manifest v1.0.2 defines **16 core prompts**. The extended templates (CHECKLISTS, STATIC_TEMPLATES, extra DOCUMENT_TEMPLATES) will be preserved as they provide additional functionality.

### Prompts Requiring Updates

| Prompt ID | Field(s) to Update |
|-----------|-------------------|
| `MICASA_BOS_ROOT` | `prompt`, `output_schema` (add `acknowledgement`) |
| `DOC_BROKERAGE_SALES` | `prompt`, `input_schema`, `refusal_policy` |
| `DOC_BROKERAGE_LEASING` | `prompt`, `input_schema`, `refusal_policy` |
| `DOC_AGENT_TO_AGENT_MASTER` | `prompt`, `input_schema` |
| `DOC_AGENT_TO_AGENT_ANNEX` | `prompt`, `input_schema`, `refusal_policy` |
| `DOC_BUYER_OFFER` | `prompt`, `input_schema` |
| `DOC_TENANT_OFFER` | `prompt`, `input_schema` |
| `DOC_COMMISSION_INVOICE` | `prompt`, `input_schema`, `refusal_policy` |
| `DOC_COMMISSION_SPLIT` | `title`, `prompt`, `input_schema`, `refusal_policy` |
| `FLOW_SALES_GATE` | `prompt`, `input_schema`, `output_schema` |
| `FLOW_LEASING_GATE` | `prompt`, `input_schema`, `output_schema` |
| `AML_SALES_CHECK` | `prompt`, `input_schema`, `output_schema` |
| `KYC_LEASING_CHECK` | `prompt`, `input_schema`, `output_schema` |
| `COMPLIANCE_PORTALS_MAP` | `title`, `prompt`, `input_schema`, `output_schema` |
| `ADMIN_DOC_INDEX` | `prompt`, `input_schema`, `output_schema` |
| `ADMIN_AUDIT_EXPORT` | `prompt`, `input_schema`, `output_schema` |

---

## Implementation Tasks

### Task 1: Create Database Migration

Create a new migration file that uses `INSERT ... ON CONFLICT` (upsert) for each of the 16 manifest prompts.

**File:** `supabase/migrations/[timestamp]_sync_manifest_v102.sql`

**SQL Strategy:**
```text
INSERT INTO bos_manifest_prompts (prompt_id, group_name, sort_order, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags)
VALUES (...)
ON CONFLICT (prompt_id) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  sort_order = EXCLUDED.sort_order,
  title = EXCLUDED.title,
  purpose = EXCLUDED.purpose,
  prompt = EXCLUDED.prompt,
  input_schema = EXCLUDED.input_schema,
  output_schema = EXCLUDED.output_schema,
  refusal_policy = EXCLUDED.refusal_policy,
  depends_on = EXCLUDED.depends_on,
  tags = EXCLUDED.tags,
  updated_at = now();
```

This ensures:
- Existing prompts get updated to match manifest exactly
- No data loss for extended prompts (STATIC_TEMPLATES, CHECKLISTS, etc.)
- Clean audit trail via `updated_at`

---

### Task 2: Update Manifest Types (if needed)

Review `src/types/manifest.ts` to ensure `ManifestGroup` type includes all groups:

```typescript
export type ManifestGroup = 
  | 'SYSTEM' 
  | 'DOCUMENT_TEMPLATES' 
  | 'WORKFLOW_GATES' 
  | 'COMPLIANCE' 
  | 'ADMIN_OPS'
  | 'STATIC_TEMPLATES'  // Keep for locked forms
  | 'CHECKLISTS';       // Keep for operational checklists
```

---

### Task 3: Verify Edge Function Compatibility

Ensure `supabase/functions/bos-manifest-executor/index.ts` handles the updated output schema for:
- `AML_SALES_CHECK` now has `escalate_to_compliance` instead of `goaml_trigger_likely`
- Workflow gates return `status` ("APPROVED"/"BLOCKED") consistently

---

## Migration SQL Preview

The migration will contain 16 upsert statements. Example for `DOC_COMMISSION_SPLIT`:

```sql
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, sort_order, title, purpose, prompt,
  input_schema, output_schema, refusal_policy, depends_on, tags
) VALUES (
  'DOC_COMMISSION_SPLIT',
  'DOCUMENT_TEMPLATES',
  17,
  'Commission Split Confirmation',
  'Generate split confirmation with reconciliation using caller-provided totals (no arithmetic assumptions).',
  'Generate a Commission Split Confirmation.

Hard gate:
- Splits must reconcile using provided totals.
- Do not compute sums; compare provided splits_total_aed against the relevant commission total.
- If mismatch, refuse.

Include:
- deal details, commission amounts, split basis (gross/net), split lines, approvals.

Output:
- Return JSON only.
- document_body must be a single copy-paste-ready document.',
  '{"type":"object","required":["deal","commission","splits"],...}'::jsonb,
  '{"type":"object","properties":{"document_title":{"type":"string"},"document_body":{"type":"string"}},"required":["document_title","document_body"],"additionalProperties":false}'::jsonb,
  '{"must_refuse_if":["splits.basis is ''net'' and splits_total_aed does not equal commission.net_aed","splits.basis is ''gross'' and splits_total_aed does not equal commission.gross_aed"],"refusal_style":"State reconciliation failure and stop."}'::jsonb,
  ARRAY['MICASA_BOS_ROOT'],
  ARRAY['template','finance','splits']
)
ON CONFLICT (prompt_id) DO UPDATE SET
  title = EXCLUDED.title,
  purpose = EXCLUDED.purpose,
  prompt = EXCLUDED.prompt,
  input_schema = EXCLUDED.input_schema,
  output_schema = EXCLUDED.output_schema,
  refusal_policy = EXCLUDED.refusal_policy,
  depends_on = EXCLUDED.depends_on,
  tags = EXCLUDED.tags,
  updated_at = now();
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_sync_manifest_v102.sql` | Create | 16 upsert statements for manifest alignment |
| `src/types/manifest.ts` | Review | Ensure ManifestGroup type is complete |
| `supabase/functions/bos-manifest-executor/index.ts` | Review | Verify AML output field handling |

---

## Technical Notes

### Key Schema Changes from Manifest v1.0.2

1. **AML_SALES_CHECK Output**: Now includes `escalate_to_compliance` (boolean) instead of `goaml_trigger_likely`
2. **KYC_LEASING_CHECK Output**: Returns `status` ("COMPLETE"/"INCOMPLETE") consistently
3. **COMPLIANCE_PORTALS_MAP**: Input schema adds `portals_hint` array for caller-provided portal names
4. **All Document Templates**: Explicit `additionalProperties: false` on output schema for stricter validation

### Preserved Extended Templates

The following will remain untouched (not in manifest but useful):
- `STATIC_*` templates (7 locked forms)
- `CHECKLIST_*` templates (3 operational checklists)
- `DOC_SELLER_MANDATE`, `DOC_LANDLORD_MANDATE`
- `DOC_VIEWING_CONFIRMATION`, `DOC_NOC_REQUEST`, `DOC_PAYMENT_RECEIPT`, `DOC_HANDOVER_CHECKLIST`
- `CONTROL_*` compliance controls
- `REF_NON_NEGOTIABLE_RULES`

