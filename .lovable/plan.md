

# Fix PDF Templates - Move to Public Folder

## Problem
The `PDFTemplatesSection.tsx` component tries to fetch templates from `/docs/templates/` but:
- Templates are at project root: `docs/templates/`
- Vite only serves static files from `public/`
- Result: 404 errors when trying to preview or download

## Solution
Move all 18 template files to `public/docs/templates/` so they become accessible as static assets.

## Implementation

### Task 1: Create Public Templates Directory
Move all markdown files from `docs/templates/` to `public/docs/templates/`:

| From | To |
|------|-----|
| `docs/templates/*.md` | `public/docs/templates/*.md` |

**Files to move (18 total):**
- `01_seller_landlord_authorization.md`
- `02_buyer_tenant_representation_agreement.md`
- `03_property_listing_authorization_marketing_consent.md`
- `04_agent_license_registration_record.md`
- `05_company_trade_license_regulatory_record.md`
- `06_agent_to_agent_agency_agreement.md`
- `07_offer_letter_expression_of_interest.md`
- `08_memorandum_of_understanding_pre_spa.md`
- `09_reservation_booking_form.md`
- `10_deal_completion_closing_checklist.md`
- `11_noc_request_clearance_tracker.md`
- `12_commission_vat_invoice.md`
- `13_commission_authorization_split_sheet.md`
- `14_refund_cancellation_approval_form.md`
- `15_financial_reconciliation_deal_ledger.md`
- `16_client_data_consent_privacy_acknowledgment.md`
- `17_complaint_dispute_incident_register.md`
- `18_internal_agent_governance_pack.md`

### Task 2: Keep Original Docs Reference (Optional)
Keep the original `docs/templates/` folder as documentation reference, or remove it to avoid confusion.

## Result
After this change:
- Preview will fetch from `/docs/templates/01_seller_landlord_authorization.md` successfully
- Download links will work correctly
- No code changes needed in `PDFTemplatesSection.tsx` - the paths are already correct

## Files Summary

| Action | Path |
|--------|------|
| Create | `public/docs/templates/` (directory) |
| Create | `public/docs/templates/*.md` (18 files) |
| Optional Delete | `docs/templates/` (original location) |

