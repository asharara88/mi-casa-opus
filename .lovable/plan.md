

# MiCasa BOS Manifest Integration Plan

## Overview

This plan integrates the MiCasa BOS Manifest — a comprehensive governance system defining document templates, workflow gates, compliance checks, and admin operations for Abu Dhabi real estate transactions.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BOS MANIFEST EXECUTOR                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────────────┐  │
│  │   Frontend   │───▶│   Edge Function   │───▶│   Lovable AI Gateway     │  │
│  │  (Forms/UI)  │    │ bos-manifest-exec │    │   (google/gemini-3-flash)│  │
│  └──────────────┘    └───────────────────┘    └──────────────────────────┘  │
│         │                     │                          │                   │
│         │                     ▼                          │                   │
│         │           ┌─────────────────┐                  │                   │
│         │           │  Validation     │                  │                   │
│         │           │  • Input Schema │                  │                   │
│         │           │  • Refusal Rules│                  │                   │
│         │           │  • Hard Gates   │                  │                   │
│         │           └─────────────────┘                  │                   │
│         │                     │                          │                   │
│         ▼                     ▼                          ▼                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     Supabase Database                                 │   │
│  │  • bos_manifest_prompts (stored prompts)                             │   │
│  │  • generated_documents (output storage)                              │   │
│  │  • workflow_gate_results (gate evaluations)                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components to Build

### 1. Database Schema

**New Tables:**

- `bos_manifest_prompts` — Stores the manifest prompt definitions
  - `id`, `prompt_id` (e.g., "DOC_BROKERAGE_SALES"), `group`, `order`
  - `title`, `purpose`, `prompt` (the system instruction)
  - `input_schema` (JSONB), `output_schema` (JSONB)
  - `refusal_policy` (JSONB), `depends_on` (TEXT[])
  - `tags` (TEXT[]), `is_active` (BOOLEAN)

- `generated_documents` — Stores AI-generated document outputs
  - `id`, `prompt_id`, `entity_type`, `entity_id`
  - `input_payload` (JSONB), `output` (JSONB)
  - `document_title`, `document_body` (TEXT)
  - `status` ("Draft", "Finalized", "Voided")
  - `generated_by`, `generated_at`

- `workflow_gate_results` — Stores gate evaluation results
  - `id`, `gate_id` (e.g., "FLOW_SALES_GATE"), `deal_id`
  - `requested_action`, `documents_present` (TEXT[])
  - `status` ("APPROVED", "BLOCKED"), `missing` (TEXT[])
  - `next_allowed_actions` (TEXT[])
  - `evaluated_at`, `evaluated_by`

### 2. Edge Function: `bos-manifest-executor`

**Responsibilities:**
- Accept prompt execution requests with `promptId` and `inputPayload`
- Validate input against the prompt's `input_schema`
- Apply `refusal_policy` rules before AI invocation
- Construct the full prompt with manifest instructions
- Call Lovable AI Gateway with the prompt
- Extract and validate structured output
- Store results in appropriate tables
- Return the generated document or gate result

**Endpoint:** `POST /functions/v1/bos-manifest-executor`

**Request Body:**
```json
{
  "promptId": "DOC_BROKERAGE_SALES",
  "inputPayload": {
    "client_role": "seller",
    "client_legal_name": "Ahmed Al Mansouri",
    "property": { ... },
    "commission": { ... },
    "contract_term": { ... },
    "assigned_agent": { ... },
    "micasa": { ... }
  },
  "entityType": "deal",
  "entityId": "DL-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "promptId": "DOC_BROKERAGE_SALES",
  "document_title": "SALES BROKERAGE AGREEMENT ADDENDUM",
  "document_body": "...",
  "generatedDocumentId": "uuid",
  "status": "Draft"
}
```

### 3. Workflow Gate Evaluation Logic

For `FLOW_SALES_GATE` and `FLOW_LEASING_GATE`:

**Required Documents Matrix:**

| Deal Type | Gate | Required Documents |
|-----------|------|-------------------|
| Sales | FLOW_SALES_GATE | Signed brokerage contract, Ownership proof, KYC folder, AML assessment |
| Leasing | FLOW_LEASING_GATE | Signed brokerage contract, Ownership proof, Tenant ID (when identified) |

**Gate Evaluation Flow:**
1. Receive requested action and document list
2. Check against required documents for deal type
3. Return APPROVED with next actions or BLOCKED with missing items

### 4. Frontend Components

**A. Document Generation UI (`src/components/documents/DocumentGeneratorPanel.tsx`):**
- Template selector (Sales Brokerage, Leasing Brokerage, Offers, etc.)
- Dynamic form based on selected template's `input_schema`
- Live validation with required field highlighting
- Generate button that calls the edge function
- Preview and download capabilities

**B. Workflow Gate Panel (`src/components/compliance/WorkflowGatePanel.tsx`):**
- Shows current gate status (APPROVED/BLOCKED)
- Lists missing documents with upload prompts
- Displays next allowed actions
- Integration with existing `CompliancePanel`

**C. AML Check Component (`src/components/compliance/AMLCheckPanel.tsx`):**
- Risk level indicator (Low/Medium/High)
- Source of funds requirement status
- goAML trigger warning
- Required documents checklist

### 5. Document Template Groups

| Group | Templates |
|-------|-----------|
| DOCUMENT_TEMPLATES | Sales Brokerage Addendum, Leasing Brokerage Addendum, Agent-to-Agent Master, Agent-to-Agent Annex, Buyer Offer, Tenant Offer, Commission Invoice, Commission Split |
| WORKFLOW_GATES | Sales Gatekeeper, Leasing Gatekeeper |
| COMPLIANCE | AML Sales Check, KYC Leasing Check, Portals Map |
| ADMIN_OPS | Document Index Generator, Audit Export Checklist |

---

## Implementation Sequence

### Phase 1: Database & Backend ✅ COMPLETE
1. ✅ Created `bos_manifest_prompts` table and seeded with manifest data
2. ✅ Created `generated_documents` table
3. ✅ Created `workflow_gate_results` table
4. ✅ Implemented `bos-manifest-executor` edge function
5. ✅ Added RLS policies (Operator role only)

### Phase 2: UI Components ✅ COMPLETE
1. ✅ Created `DocumentGeneratorPanel` with template selection
2. ✅ Created `WorkflowGatePanel` for gate status display
3. ✅ Created `AMLCheckPanel` for risk assessment
4. ✅ Integrated into Deal Details view

### Phase 3: Compliance Integration ✅ COMPLETE
1. ✅ Added AML check panel to deal details
2. ✅ Added KYC completeness indicator for leasing
3. ✅ Added portal steps map to transaction view
4. ✅ Created audit export functionality

### Phase 4: Additional Components ✅ COMPLETE
1. ✅ Created `KYCCheckPanel` for leasing deals
2. ✅ Created `PortalStepsPanel` for portal touchpoints
3. ✅ Created `AuditExportPanel` for audit bundles
4. ✅ Integrated all panels into DealDetail tabs

---

## Technical Details

### Input Schema Validation

The edge function will use JSON Schema validation:

```typescript
// Validate required fields from manifest
function validateInput(schema: JSONSchema, payload: unknown): ValidationResult {
  const required = schema.required || [];
  const missing = required.filter(field => !getNestedValue(payload, field));
  
  if (missing.length > 0) {
    return { valid: false, errors: missing.map(f => `Missing required: ${f}`) };
  }
  
  // Validate nested objects recursively
  // Check enum values
  // Verify data types
  
  return { valid: true, errors: [] };
}
```

### Refusal Policy Enforcement

```typescript
function checkRefusalPolicy(policy: RefusalPolicy, input: unknown): RefusalResult {
  for (const condition of policy.must_refuse_if) {
    if (evaluateRefusalCondition(condition, input)) {
      return { refused: true, reason: condition };
    }
  }
  return { refused: false };
}
```

### AI Prompt Construction

```typescript
function buildPrompt(manifest: ManifestPrompt, input: unknown): string {
  return `${manifest.prompt}

INPUT DATA:
${JSON.stringify(input, null, 2)}

OUTPUT REQUIREMENTS:
- Follow the output schema exactly
- Document must be copy-paste ready
- No filler text or unnecessary legal language
- If uncertain about any ADM requirement, output: VERIFY WITH ADM`;
}
```

---

## Security Considerations

1. **Authentication**: All endpoints require Bearer token auth
2. **Authorization**: RLS policies restrict to Operator role
3. **Input Validation**: Strict schema validation before AI invocation
4. **Audit Trail**: All generations logged with user ID and timestamp
5. **Refusal Logging**: Track refused requests for compliance review
6. **No Legal Advice**: AI constrained to operational documentation only

---

## Hard Rules (Non-Negotiable)

These rules from the manifest are enforced at the code level:

- No brokerage activity without signed ADM-approved contract
- Leasing commission charged to ONE party only
- Sales transactions require AML/KYC processing
- Online advertising requires Madhmoun permit
- All actions leave audit trail
- Missing documents block progression
- VAT only if `vat_registered = true`
- Commission splits must reconcile to 100%

---

## Files Created/Modified

### New Files (Created):
- ✅ `supabase/functions/bos-manifest-executor/index.ts` — Main edge function
- ✅ `src/components/documents/DocumentGeneratorPanel.tsx` — Document generation UI
- ✅ `src/components/compliance/WorkflowGatePanel.tsx` — Gate status display
- ✅ `src/components/compliance/AMLCheckPanel.tsx` — AML risk display
- ✅ `src/components/compliance/KYCCheckPanel.tsx` — KYC completeness check
- ✅ `src/components/compliance/PortalStepsPanel.tsx` — Portal touchpoints
- ✅ `src/components/compliance/AuditExportPanel.tsx` — Audit export
- ✅ `src/hooks/useManifestExecutor.ts` — React hook for edge function
- ✅ `src/types/manifest.ts` — TypeScript types for manifest schemas

### Modified Files:
- ✅ `src/components/deals/DealDetail.tsx` — Add document generator and gate panel
- ✅ `src/components/compliance/index.ts` — Export new components
- ✅ `src/components/documents/DocumentsSection.tsx` — Add generator tab
- ✅ `supabase/config.toml` — Register new edge function

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Database & Backend | 3-4 hours |
| Phase 2: Workflow Gates | 2-3 hours |
| Phase 3: Document Generation UI | 3-4 hours |
| Phase 4: Compliance Integration | 2-3 hours |
| **Total** | **10-14 hours** |

