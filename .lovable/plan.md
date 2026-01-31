
# MiCasa BOS Manifest Alignment Plan

## Current State Analysis

### Database Prompts (29 total)
The system currently has **29 prompts** stored in `bos_manifest_prompts`:

| Group | Current Prompts |
|-------|-----------------|
| **SYSTEM** | MICASA_BOS_ROOT, REF_NON_NEGOTIABLE_RULES |
| **DOCUMENT_TEMPLATES** | DOC_BROKERAGE_SALES, DOC_BROKERAGE_LEASING, DOC_AGENT_MASTER, DOC_AGENT_ANNEX, DOC_BUYER_OFFER, DOC_TENANT_OFFER, DOC_COMMISSION_INVOICE, DOC_COMMISSION_SPLIT, DOC_SELLER_MANDATE, DOC_LANDLORD_MANDATE, DOC_VIEWING_CONFIRMATION, DOC_NOC_REQUEST, DOC_PAYMENT_RECEIPT, DOC_HANDOVER_CHECKLIST |
| **WORKFLOW_GATES** | FLOW_SALES_GATE, FLOW_LEASING_GATE |
| **COMPLIANCE** | AML_SALES_CHECK, KYC_LEASING_CHECK, COMPLIANCE_PORTALS_MAP, CONTROL_COMMISSION_DISPUTE, CONTROL_AUDIT_TRAIL, CONTROL_AUTHORITY_CHAIN |
| **ADMIN_OPS** | ADMIN_DOC_INDEX, ADMIN_AUDIT_EXPORT |
| **CHECKLISTS** | CHECKLIST_SALES_DEAL, CHECKLIST_LEASING_DEAL, CHECKLIST_AGENT_ONBOARDING |

### Manifest Requirements (16 prompts)
The provided manifest specifies **16 lean prompts**:
1. MICASA_BOS_ROOT
2. DOC_BROKERAGE_SALES
3. DOC_BROKERAGE_LEASING
4. DOC_AGENT_TO_AGENT_MASTER
5. DOC_AGENT_TO_AGENT_ANNEX
6. DOC_BUYER_OFFER
7. DOC_TENANT_OFFER
8. DOC_COMMISSION_INVOICE
9. DOC_COMMISSION_SPLIT
10. FLOW_SALES_GATE
11. FLOW_LEASING_GATE
12. AML_SALES_CHECK
13. KYC_LEASING_CHECK
14. COMPLIANCE_PORTALS_MAP
15. ADMIN_DOC_INDEX
16. ADMIN_AUDIT_EXPORT

---

## Gap Analysis

### Naming Mismatches
| Manifest ID | Current ID | Status |
|------------|-----------|--------|
| DOC_AGENT_TO_AGENT_MASTER | DOC_AGENT_MASTER | Needs rename |
| DOC_AGENT_TO_AGENT_ANNEX | DOC_AGENT_ANNEX | Needs rename |

### Schema Alignment Issues
The manifest provides detailed JSON schemas that need to be verified/updated:

1. **DOC_BROKERAGE_SALES** - Schema appears aligned but needs verification of all nested properties
2. **DOC_BROKERAGE_LEASING** - Schema appears aligned
3. **DOC_AGENT_TO_AGENT_MASTER** - Current DOC_AGENT_MASTER has different schema structure
4. **DOC_AGENT_TO_AGENT_ANNEX** - Current DOC_AGENT_ANNEX has different schema structure (missing split validation logic)
5. **COMPLIANCE_PORTALS_MAP** - Current schema differs (uses transaction_type vs deal_type)

### Additional Prompts (Not in Manifest)
The current system has **13 extra prompts** beyond the lean 16:
- DOC_SELLER_MANDATE, DOC_LANDLORD_MANDATE
- DOC_VIEWING_CONFIRMATION, DOC_NOC_REQUEST, DOC_PAYMENT_RECEIPT, DOC_HANDOVER_CHECKLIST
- CHECKLIST_SALES_DEAL, CHECKLIST_LEASING_DEAL, CHECKLIST_AGENT_ONBOARDING
- CONTROL_COMMISSION_DISPUTE, CONTROL_AUDIT_TRAIL, CONTROL_AUTHORITY_CHAIN
- REF_NON_NEGOTIABLE_RULES

**Recommendation**: Keep these as they extend the manifest without breaking it.

---

## Implementation Plan

### Phase 1: Database Schema Alignment

**Task 1.1**: Rename prompt IDs for consistency
```text
Update prompts:
- DOC_AGENT_MASTER → DOC_AGENT_TO_AGENT_MASTER
- DOC_AGENT_ANNEX → DOC_AGENT_TO_AGENT_ANNEX
```

**Task 1.2**: Update input/output schemas to match manifest exactly
- Update all 16 core prompts with the exact JSON schemas from the manifest
- Ensure refusal_policy is set correctly on each prompt
- Update depends_on arrays to match manifest

**Task 1.3**: Set proper sort_order values
```text
SYSTEM: 1
DOCUMENT_TEMPLATES: 10-17
WORKFLOW_GATES: 20-21
COMPLIANCE: 30-32
ADMIN_OPS: 40-41
```

### Phase 2: Edge Function Updates

**Task 2.1**: Update prompt ID references in `bos-manifest-executor`
- Update gate handling for renamed prompts
- Add split validation for DOC_AGENT_TO_AGENT_ANNEX (must equal 100%)

**Task 2.2**: Add COMPLIANCE_PORTALS_MAP handler
- Currently not specifically handled - needs dedicated response formatting

**Task 2.3**: Ensure refusal policy enforcement
- Verify all refusal conditions from manifest are checked
- Add specific checks for:
  - Legal advice requests
  - Backdating requests
  - Missing commission payor
  - Split != 100%

### Phase 3: Frontend Alignment

**Task 3.1**: Update DocumentGeneratorPanel references
- Update TEMPLATE_SUBCATEGORIES mapping for renamed prompts
- Update SALES_ONLY and LEASING_ONLY arrays

**Task 3.2**: Update type definitions
- Align `src/types/manifest.ts` with manifest schema definitions

### Phase 4: Validation & Testing

**Task 4.1**: Test each of the 16 core prompts
- Verify input validation works correctly
- Verify refusal policies trigger appropriately
- Verify output matches expected schema

**Task 4.2**: Test workflow gates end-to-end
- FLOW_SALES_GATE with various document combinations
- FLOW_LEASING_GATE with various document combinations

---

## Technical Details

### SQL Migration for Prompt Alignment
```sql
-- Rename prompts
UPDATE bos_manifest_prompts 
SET prompt_id = 'DOC_AGENT_TO_AGENT_MASTER' 
WHERE prompt_id = 'DOC_AGENT_MASTER';

UPDATE bos_manifest_prompts 
SET prompt_id = 'DOC_AGENT_TO_AGENT_ANNEX' 
WHERE prompt_id = 'DOC_AGENT_ANNEX';

-- Update schemas to match manifest (full schema updates for each prompt)
```

### Files to Modify
1. **Database**: SQL migration to update prompt_ids and schemas
2. **Edge Function**: `supabase/functions/bos-manifest-executor/index.ts`
3. **UI Component**: `src/components/documents/DocumentGeneratorPanel.tsx`
4. **Types**: `src/types/manifest.ts`
5. **Hooks**: `src/hooks/useManifestExecutor.ts` (if any hardcoded prompt IDs)

### Manifest Routing Logic
The manifest defines recommended call sequences:
```text
sales_deal_start:
  ROOT → PORTALS_MAP → SALES_GATE → AML_CHECK → DOC_BROKERAGE_SALES → DOC_BUYER_OFFER → INVOICE → SPLIT → INDEX → AUDIT

leasing_deal_start:
  ROOT → PORTALS_MAP → LEASING_GATE → KYC_CHECK → DOC_BROKERAGE_LEASING → DOC_TENANT_OFFER → INVOICE → SPLIT → INDEX → AUDIT

co_broker_setup:
  ROOT → DOC_AGENT_TO_AGENT_MASTER → DOC_AGENT_TO_AGENT_ANNEX
```

---

## Summary

| Aspect | Current | Target | Action |
|--------|---------|--------|--------|
| Core Prompts | 16 (with naming differences) | 16 | Rename 2 prompts |
| Extended Prompts | +13 | Keep | No action |
| Schemas | Partial alignment | Full alignment | Update via migration |
| Edge Function | Working | Enhanced | Add split validation, portal handler |
| UI | Working | Enhanced | Update references |

**Estimated Changes**:
- 1 SQL migration (schema + rename updates)
- 1 edge function update
- 2 frontend file updates
- Total prompts after alignment: **29** (16 core + 13 extended)
