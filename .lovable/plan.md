
# Document Generator UX Enhancement Plan

## Problem Summary
The current document system has:
- Separate tabs that can confuse users (Official Forms vs AI Generator)
- No guided workflow for deal sequences
- No smart prefilling of common data (MiCasa company details)
- Users must know which template they need upfront
- No preview before committing to a form

## Solution Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT CENTER                               │
├─────────────────────────────────────────────────────────────────┤
│  [Documents] [Templates] [Generate Documents]                    │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🚀 Start a Workflow                                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │  │
│  │  │ 🏠 Sales    │ │ 🔑 Leasing  │ │ 🤝 Co-Broker│         │  │
│  │  │   Deal      │ │   Deal      │ │   Setup     │         │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📋 Quick Access                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔒 Official Forms    │ ✨ Smart Templates   │ 📁 Recent  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Phase 1: Unified Generator Tab (Rename & Consolidate)

**Task 1.1: Rename "AI Generator" tab to "Generate Documents"**
- Remove the separate "Official Forms" tab
- Consolidate both into a single "Generate Documents" tab
- Clearer label that doesn't confuse non-technical users

**Files Modified:**
- `src/components/documents/DocumentsSection.tsx`

---

### Phase 2: Workflow Wizard Component

**Task 2.1: Create `WorkflowWizard.tsx`**
A guided experience that walks users through recommended template sequences based on deal type.

**Features:**
- Three workflow buttons: **Sales Deal**, **Leasing Deal**, **Co-Broker Setup**
- Shows step progress (e.g., "Step 2 of 7: AML Check")
- Auto-proceeds to next template after each generation
- Skip button for optional steps
- Visual checklist of completed documents

**Workflow Sequences (from manifest):**
```text
Sales Deal:
1. DOC_BROKERAGE_SALES (Brokerage Agreement)
2. AML_SALES_CHECK (AML Assessment)
3. DOC_BUYER_OFFER (Offer Letter)
4. DOC_COMMISSION_INVOICE (Invoice)
5. DOC_COMMISSION_SPLIT (Split Confirmation)
6. ADMIN_DOC_INDEX (Document Index)

Leasing Deal:
1. DOC_BROKERAGE_LEASING (Brokerage Agreement)
2. KYC_LEASING_CHECK (KYC Check)
3. DOC_TENANT_OFFER (Tenant Intent)
4. DOC_COMMISSION_INVOICE (Invoice)
5. DOC_COMMISSION_SPLIT (Split Confirmation)
6. ADMIN_DOC_INDEX (Document Index)

Co-Broker Setup:
1. DOC_AGENT_TO_AGENT_MASTER (Master Agreement)
2. DOC_AGENT_TO_AGENT_ANNEX (Property Annex)
```

**Files Created:**
- `src/components/documents/WorkflowWizard.tsx`

---

### Phase 3: Improved Template Browser

**Task 3.1: Create `QuickAccessGrid.tsx`**
Replace the current "Quick Start" with a cleaner three-section layout:

| Section | Content |
|---------|---------|
| 🔒 Official Forms | Static ADM forms (Form A, Form B, NDA, etc.) - instant download |
| ✨ Smart Templates | AI-generated documents (Brokerage, Offers, Invoices) |
| 📁 Recently Used | Last 5 templates user generated (stored in localStorage) |

**Task 3.2: Add Template Preview Modal**
Before starting a form, show:
- Template purpose (what it's for)
- Required fields summary
- Sample output preview (first 10 lines)
- "Start Form" / "Cancel" buttons

**Files Created:**
- `src/components/documents/QuickAccessGrid.tsx`
- `src/components/documents/TemplatePreviewModal.tsx`

---

### Phase 4: Smart Form Prefilling

**Task 4.1: Create `useMiCasaDefaults.ts` hook**
Auto-populate common MiCasa company fields:

```text
Prefilled Values:
- micasa.legal_name: "MiCasa Real Estate LLC"
- micasa.license_no: "[From environment/config]"
- micasa.address: "Abu Dhabi, UAE"
- micasa.email: "info@micasa.ae"
- micasa.phone: "+971 XX XXX XXXX"
- micasa.vat_registered: false
```

**Task 4.2: Enhance `FormWizard.tsx`**
- Add field descriptions/help text from schema
- Better date picker with calendar
- Auto-format currency fields (AED)
- Required field validation before next step
- "Save Draft" button for long forms

**Files Created:**
- `src/hooks/useMiCasaDefaults.ts`

**Files Modified:**
- `src/components/documents/FormWizard.tsx`

---

### Phase 5: Enhanced Official Forms Panel

**Task 5.1: Improve `OfficialFormsPanel.tsx`**
- Add instant preview (expand/collapse document content)
- One-click copy to clipboard
- Download as PDF-ready text file
- Clear visual grouping (Sales Forms / Leasing Forms / General)

---

## Updated Document Generator Flow

```text
User opens "Generate Documents" tab
           │
           ▼
┌─────────────────────────────────────┐
│  How would you like to proceed?     │
│                                     │
│  [🚀 Start Workflow]                │  ← Guided step-by-step
│  [📋 Browse Templates]              │  ← Manual selection
│  [🔒 Official Forms]                │  ← Static documents
└─────────────────────────────────────┘
           │
     (User choice)
           │
           ▼
    ┌──────┴──────┐
    │             │
Workflow      Browse/Forms
    │             │
    ▼             ▼
Step-by-step  Template cards
wizard        with preview
    │             │
    └──────┬──────┘
           │
           ▼
      Form Wizard
   (with prefilled data)
           │
           ▼
    Generated Document
    (Copy / Download)
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `DocumentsSection.tsx` | Modify | Consolidate tabs, rename to "Generate Documents" |
| `DocumentGeneratorPanel.tsx` | Modify | Add mode selector (Workflow/Browse/Forms) |
| `WorkflowWizard.tsx` | Create | Guided deal workflow component |
| `QuickAccessGrid.tsx` | Create | Three-section template layout |
| `TemplatePreviewModal.tsx` | Create | Preview before form entry |
| `useMiCasaDefaults.ts` | Create | Company data prefill hook |
| `OfficialFormsPanel.tsx` | Modify | Add preview expand, better grouping |
| `FormWizard.tsx` | Modify | Add help text, better validation, save draft |
| `TemplateBrowser.tsx` | Modify | Add "Recently Used" tracking |

---

## Technical Details

### localStorage Schema for Recent Templates
```typescript
interface RecentTemplate {
  prompt_id: string;
  title: string;
  usedAt: string; // ISO date
}
// Key: "micasa_recent_templates"
// Max items: 5
```

### Workflow State Machine
```typescript
interface WorkflowState {
  type: "sales" | "leasing" | "co_broker";
  currentStep: number;
  completedSteps: string[]; // prompt_ids
  skippedSteps: string[];
  generatedDocs: Array<{ id: string; title: string }>;
}
```

---

## UX Improvements Summary

| Before | After |
|--------|-------|
| Two confusing tabs (Official Forms + AI Generator) | Single "Generate Documents" tab with clear modes |
| No guidance on which template to use | Workflow wizard for Sales/Leasing/Co-Broker deals |
| Must fill MiCasa details every time | Smart prefilling of company data |
| No preview before starting form | Preview modal with sample output |
| No memory of past usage | "Recently Used" section |
| Basic form with no help | Enhanced form with descriptions and validation |
