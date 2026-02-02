
# MiCasa BOS: Complete Funnel Integration Implementation Plan

## ✅ IMPLEMENTATION COMPLETE

All 5 phases have been implemented, database schema updated, and remaining UI components built:

### Phase 1: Lead to Deal Conversion ✅
- Created `ConvertToDealModal.tsx` with pipeline selection (OffPlan/Secondary)
- Wired into `LeadsSection.tsx` with proper data mapping
- Lead requirements flow to deal economics

### Phase 2: Funnel Automation Triggers ✅
- `ViewingScheduler.tsx` now calls `onViewingScheduled()` automatically
- Created `ViewingCompletionDialog.tsx` for feedback capture
- `useFunnelAutomation.ts` hooks are now wired to UI actions

### Phase 3: Commission Auto-Generation ✅
- Created `useCommissionGeneration.ts` hook
- Auto-calculates splits based on `deal_brokers` table
- Creates evidence records for audit trail

### Phase 4: Document Linking to Evidence ✅
- Updated `useStaticFormFiller.ts` with dual-write logic
- Documents create `document_instances` + `evidence_objects`
- SHA-256 content hashes for integrity verification
- `EvidenceDrawer.tsx` now queries generated documents

### Phase 5: Automated Reminders ✅
- Created `viewing-reminder` edge function
- Added new templates to `twilio-messaging`
- Queries upcoming viewings and sends WhatsApp reminders

### Additional UI Components Built ✅
- `EOIPaymentModal.tsx` - Record EOI payments with amount, date, method
- `NOCTrackerPanel.tsx` - Track NOC status with timeline progress
- `DepositReceiptUploader.tsx` - Upload payment evidence with SHA-256 hashing
- All components integrated into `DealDetail.tsx` with new Payments tab

---

## Phase 1: Lead to Deal Conversion Flow

### Current State
- `LeadDetail.tsx` has a "Convert to Deal" button that appears for Qualified leads
- `QuickConvertButton.tsx` provides the UI component
- `useFunnelProcessor.ts` contains `createDealFromLead` logic but is not connected to the UI

### Implementation Steps

**1.1 Wire Conversion Logic in LeadsSection.tsx**
- Add `onConvertToDeal` handler to `LeadsSection` that:
  - Calls `useCreatePipelineDeal` hook to create the deal
  - Updates the lead state to "Converted"
  - Navigates to the new deal detail view
  - Logs the conversion event

**1.2 Pipeline Selection Dialog**
- Create `PipelineSelectionModal.tsx` allowing agent to choose:
  - OffPlan vs Secondary pipeline
  - Deal type (Sale/Rent)
  - Initial property/developer association

**1.3 Data Mapping**
- Map lead requirements (budget, bedrooms, locations) to deal economics
- Copy contact info from lead to deal parties table
- Preserve audit trail with linked_lead_id

```text
+----------------+     +------------------+     +----------------+
|     Lead       | --> | Pipeline Modal   | --> |     Deal       |
| (Qualified)    |     | - OffPlan/Sec    |     | (Created)      |
|                |     | - Sale/Rent      |     | linked_lead_id |
+----------------+     +------------------+     +----------------+
```

---

## Phase 2: Funnel Automation Triggers

### Current State
- `useFunnelAutomation.ts` defines automation hooks but they are not called
- `ViewingScheduler.tsx` creates bookings but does not advance deals
- `useStaticFormFiller.ts` generates documents but does not trigger stage changes

### Implementation Steps

**2.1 Viewing Automation**
- Modify `ViewingScheduler.tsx` to accept `onBookingCreated` callback
- After successful booking, call `useFunnelAutomation.onViewingScheduled(dealId)`
- Create `ViewingCompletionDialog.tsx` to mark viewings complete with feedback
- On completion, call `useFunnelAutomation.onViewingCompleted(dealId)`

**2.2 Document Automation**
- Modify `useStaticFormFiller.ts` to detect document type and trigger:
  - MOU signed: advance to `MOUSigned` state
  - Offer Letter: advance to `OfferMade` state
  - Reservation Form: advance to `Reserved` state

**2.3 Payment Automation**
- Create `EOIPaymentModal.tsx` for recording EOI payments
- On payment confirmation, call `useFunnelAutomation.onEOIPaid(dealId)`
- Create `DepositReceiptUploader.tsx` for payment evidence

**2.4 NOC Automation**
- Create `NOCTrackerPanel.tsx` to monitor NOC status
- When NOC reference is entered, call `useFunnelAutomation.onNOCObtained(dealId, reference)`

### Automation Flow Diagram
```text
Viewing Scheduled --> Deal: ViewingScheduled
Viewing Completed --> Deal: ViewingCompleted
MOU Signed        --> Deal: MOUSigned
NOC Obtained      --> Deal: NOCObtained
Transfer Done     --> Deal: ClosedWon + Commission Created
```

---

## Phase 3: Commission Auto-Generation

### Current State
- `commission_records` table exists with proper schema
- `useCommissions.ts` has CRUD operations but no auto-creation
- `deal_brokers` table stores broker assignments and split percentages

### Implementation Steps

**3.1 Create Commission Generation Hook**
Create `useCommissionGeneration.ts` with:
```text
generateCommissions(dealId):
  1. Fetch deal economics (transaction_value_aed)
  2. Fetch deal_brokers for this deal
  3. Calculate gross = transaction_value * commission_percent
  4. For each broker:
     - net = gross * split_percent
     - Create commission_record with status: 'pending'
  5. Return commission IDs for audit
```

**3.2 Trigger on Deal Close**
- Modify `useTransitionSecondaryDeal` and `useTransitionOffPlanDeal`
- When `targetState === 'ClosedWon'`:
  - Call `generateCommissions(dealId)` after state update
  - Create evidence record for commission calculation

**3.3 Commission Validation Rules**
- Total split percentages must equal 100%
- Commission cannot exceed regulatory caps (Dubai: typically 2% sale, 5% rent)
- VAT calculation (5% in UAE) must be applied

**3.4 UI Enhancements**
- Add commission preview panel in deal detail before closing
- Show breakdown by broker with calculated amounts
- Require manager approval for commissions over threshold

---

## Phase 4: Document Linking to Evidence

### Current State
- `generated_documents` table stores filled forms
- `document_instances` table exists for entity-linked documents
- `EvidenceDrawer.tsx` shows evidence but does not query generated documents

### Implementation Steps

**4.1 Dual-Write on Document Generation**
Modify `useStaticFormFiller.ts` to:
```text
onSave():
  1. Insert into generated_documents (existing)
  2. If entityType && entityId:
     - Insert into document_instances linking to deal/lead
     - Create evidence record with document hash
  3. Create follow-up task if template requires
```

**4.2 Evidence Query Enhancement**
Modify `EvidenceDrawer.tsx` to:
- Query `document_instances` where `entity_id = dealId`
- Query `generated_documents` where `deal_id = dealId`
- Merge results into unified evidence timeline

**4.3 Document Type Mapping**
Create mapping from template to evidence type:
```text
01_seller_authorization     --> SignedDocument
07_offer_letter             --> SignedDocument
09_reservation_form         --> SignedDocument
12_commission_invoice       --> PaymentReceipt
```

**4.4 Evidence Integrity**
- Generate SHA-256 hash of document content
- Store hash in `data_snapshot_hash` column
- Display verification status in Evidence drawer

---

## Phase 5: Automated Communication Reminders

### Current State
- `viewing_bookings` table has `reminder_sent`, `confirmation_sent` flags
- `useCommunications.ts` has sendWhatsApp, sendSMS methods
- Twilio edge function is ready for outbound messages

### Implementation Steps

**5.1 Create Reminder Edge Function**
Create `supabase/functions/viewing-reminder/index.ts`:
```text
1. Query upcoming viewings where:
   - scheduled_at BETWEEN now() AND now() + 24 hours
   - reminder_sent = false
   - status IN ('scheduled', 'confirmed')

2. For each viewing:
   - Fetch prospect/deal contact details
   - Send WhatsApp message with template
   - Update viewing: reminder_sent = true
   - Log to communication_logs

3. Return summary of sent reminders
```

**5.2 Create Scheduled Job**
- Use Supabase pg_cron extension to run hourly
- Or create a daily batch trigger at 9 AM UAE time

**5.3 Message Templates**
Create templates in `twilio-messaging` edge function:
```text
viewing_reminder_24h:
  "Hi {{client_name}}, reminder: Your property viewing at 
   {{property}} is tomorrow at {{time}}. 
   Location: {{address}}. Reply YES to confirm."

viewing_confirmation:
  "Your viewing is confirmed for {{date}} at {{time}}.
   Your agent {{agent_name}} will meet you at {{location}}."

viewing_feedback:
  "Thank you for viewing {{property}}! 
   How would you rate your experience? Reply 1-5."
```

**5.4 Response Handling**
Enhance `twilio-webhook` edge function to:
- Parse incoming confirmations (YES/NO)
- Update viewing status based on response
- Trigger next action if confirmed

---

## Database Schema Changes Required

### New Columns
```sql
-- Add to viewing_bookings
ALTER TABLE viewing_bookings ADD COLUMN feedback_score INTEGER;
ALTER TABLE viewing_bookings ADD COLUMN feedback_notes TEXT;

-- Add to generated_documents
ALTER TABLE generated_documents ADD COLUMN deal_id UUID REFERENCES deals(id);
ALTER TABLE generated_documents ADD COLUMN lead_id UUID REFERENCES leads(id);
ALTER TABLE generated_documents ADD COLUMN evidence_type TEXT;
ALTER TABLE generated_documents ADD COLUMN content_hash TEXT;
```

### New Scheduled Job
```sql
-- Create cron job for viewing reminders
SELECT cron.schedule(
  'viewing-reminders',
  '0 * * * *',  -- Every hour
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/viewing-reminder',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  )$$
);
```

---

## Implementation Priority & Timeline

| Phase | Area | Priority | Complexity | Estimate |
|-------|------|----------|------------|----------|
| 1 | Lead to Deal Conversion | High | Medium | 2-3 hours |
| 2 | Funnel Automation Triggers | High | Medium | 3-4 hours |
| 3 | Commission Auto-Generation | High | Medium | 2-3 hours |
| 4 | Document Linking to Evidence | Medium | Low | 1-2 hours |
| 5 | Automated Reminders | Medium | High | 3-4 hours |

**Recommended Order**: 1 → 2 → 3 → 4 → 5

---

## Files to Create/Modify

### New Files
- `src/components/leads/ConvertToDealModal.tsx`
- `src/components/deals/EOIPaymentModal.tsx`
- `src/components/deals/ViewingCompletionDialog.tsx`
- `src/components/deals/NOCTrackerPanel.tsx`
- `src/hooks/useCommissionGeneration.ts`
- `supabase/functions/viewing-reminder/index.ts`

### Modified Files
- `src/components/leads/LeadsSection.tsx` (add conversion handler)
- `src/components/scheduling/ViewingScheduler.tsx` (add automation callback)
- `src/hooks/useStaticFormFiller.ts` (add document linking)
- `src/hooks/usePipelineDeals.ts` (add commission generation on close)
- `src/components/deals/EvidenceDrawer.tsx` (query generated documents)
- `supabase/functions/twilio-messaging/index.ts` (add reminder templates)

---

## Success Criteria

1. **Lead Conversion**: Clicking "Convert to Deal" creates a properly linked deal with all data transferred
2. **Automation**: Scheduling a viewing automatically advances deal state without manual intervention
3. **Commissions**: Closing a deal auto-generates commission records for all assigned brokers
4. **Evidence**: Generated documents appear in the deal's Evidence drawer with verification hashes
5. **Reminders**: Clients receive WhatsApp reminders 24 hours before viewings with no manual action
