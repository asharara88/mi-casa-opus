
# Multi-Channel Communication & Productivity Integration

## Overview

This plan integrates five major productivity and communication tools into the real estate CRM to enable automated prospect engagement, viewing scheduling, document signing, and location intelligence.

---

## Integration Summary

| Tool | Purpose | API Keys Required |
|------|---------|-------------------|
| **Twilio** | WhatsApp Business + SMS messaging | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER |
| **SendGrid** | Email campaigns + transactional emails | SENDGRID_API_KEY |
| **Cal.com** | Embedded scheduling for viewings | CAL_API_KEY (optional for API integration) |
| **DocuSign** (or PandaDoc) | E-signatures for MOUs, SPAs, booking forms | DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_API_ACCOUNT_ID |
| **Mapbox** | Interactive property maps + neighborhood insights | MAPBOX_ACCESS_TOKEN |

---

## Feature 1: WhatsApp Business + SMS via Twilio

### What It Does

- Send WhatsApp messages directly from prospect/lead detail sheets
- Automated SMS notifications for follow-ups and reminders
- Message templates for common outreach scenarios
- Delivery status tracking and logging

### Architecture

```text
+-------------------+     +------------------------+     +----------+
| ProspectDetailSheet|---->| twilio-messaging       |---->| Twilio   |
| LeadDetail        |     | (Edge Function)        |     | API      |
+-------------------+     +------------------------+     +----------+
                                    |
                                    v
                          +-------------------+
                          | communication_logs|
                          | (Database Table)  |
                          +-------------------+
```

### New Components

| Component | Purpose |
|-----------|---------|
| `WhatsAppMessagePanel.tsx` | Send template-based WhatsApp messages with preview |
| `SMSNotificationButton.tsx` | Quick SMS send with predefined templates |
| `CommunicationHistory.tsx` | Display message history for prospect/lead |

### Edge Function: `twilio-messaging`

```typescript
// POST /twilio-messaging
{
  "channel": "whatsapp" | "sms",
  "to": "+971501234567",
  "template": "new_listing_alert",
  "variables": { "name": "Ahmed", "property": "3BR Marina View" },
  "prospectId": "uuid"
}
```

### Database Schema

New table `communication_logs`:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_type | text | 'prospect' or 'lead' |
| entity_id | uuid | FK to prospect/lead |
| channel | text | 'whatsapp', 'sms', 'email' |
| direction | text | 'outbound' or 'inbound' |
| template_used | text | Template name if applicable |
| content | text | Message content |
| status | text | 'sent', 'delivered', 'failed', 'read' |
| twilio_sid | text | Twilio message SID for tracking |
| sent_at | timestamp | When message was sent |
| delivered_at | timestamp | When delivered (webhook update) |

---

## Feature 2: Email Campaigns via SendGrid

### What It Does

- Send email campaigns for new listings
- Automated appointment reminders
- Transactional emails (viewing confirmations, document requests)
- Email templates with personalization

### New Components

| Component | Purpose |
|-----------|---------|
| `EmailCampaignBuilder.tsx` | Create/send email campaigns to prospect segments |
| `EmailTemplateSelector.tsx` | Choose from predefined templates |
| `AppointmentReminder.tsx` | Configure automated reminder emails |

### Edge Function: `sendgrid-email`

```typescript
// POST /sendgrid-email
{
  "type": "campaign" | "transactional",
  "to": ["email1@test.com", "email2@test.com"],
  "template": "new_listing",
  "variables": { ... },
  "scheduleAt": "2024-01-15T09:00:00Z" // Optional
}
```

### Predefined Templates

| Template | Use Case |
|----------|----------|
| `new_listing_alert` | Notify about matching properties |
| `viewing_confirmation` | Confirm scheduled viewing |
| `viewing_reminder` | 24-hour reminder before viewing |
| `document_request` | Request documents from client |
| `deal_milestone` | Update client on deal progress |

---

## Feature 3: Viewing Scheduling via Cal.com

### What It Does

- Embed Cal.com booking widget for property viewings
- Sync with agent calendars (Google/Outlook)
- Automated reminders and rescheduling
- Round-robin assignment for new leads

### Architecture

```text
+------------------+     +-------------------+     +----------+
| ViewingScheduler |---->| Cal.com Embed     |---->| Cal.com  |
| (React Component)|     | (iframe or SDK)   |     | API      |
+------------------+     +-------------------+     +----------+
          |                                               |
          |                +--------------------+         |
          +--------------->| viewing_bookings   |<--------+
                           | (Database Table)   |  (webhook)
                           +--------------------+
```

### New Components

| Component | Purpose |
|-----------|---------|
| `ViewingScheduler.tsx` | Embed Cal.com booking calendar |
| `AgentAvailability.tsx` | Display agent calendar slots |
| `ViewingConfirmation.tsx` | Confirmation screen after booking |
| `ViewingReminderConfig.tsx` | Configure reminder preferences |

### Edge Function: `cal-webhook`

Receives booking events from Cal.com webhooks:
- `booking.created` - Creates viewing record, triggers confirmations
- `booking.rescheduled` - Updates viewing record
- `booking.cancelled` - Updates status, triggers notifications

### Database Schema

New table `viewing_bookings`:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| cal_booking_id | text | Cal.com booking reference |
| deal_id | uuid | FK to deals table |
| prospect_id | uuid | FK to prospects (if no deal yet) |
| listing_id | uuid | Property being viewed |
| agent_id | uuid | Assigned agent |
| scheduled_at | timestamp | Viewing date/time |
| duration_minutes | int | Typically 30-60 mins |
| status | text | 'scheduled', 'completed', 'cancelled', 'no_show' |
| location | text | Property address or meeting point |
| notes | text | Special instructions |
| reminder_sent | boolean | Whether reminder was sent |
| created_at | timestamp | Record creation |

---

## Feature 4: E-Signatures via DocuSign

### What It Does

- Send documents for electronic signature
- Track signature status
- Download executed documents
- Audit trails for compliance

### Architecture

```text
+------------------+     +----------------------+     +----------+
| DocumentInstance |---->| docusign-envelope    |---->| DocuSign |
| (Send for Sign)  |     | (Edge Function)      |     | API      |
+------------------+     +----------------------+     +----------+
                                    |
                                    v
                         +---------------------+
                         | signature_envelopes |
                         | (Existing Table)    |
                         +---------------------+
```

### New Components

| Component | Purpose |
|-----------|---------|
| `SendForSignatureButton.tsx` | Trigger DocuSign envelope creation |
| `SignatureStatusTracker.tsx` | Display real-time signature progress |
| `SignerManagement.tsx` | Add/remove signers before sending |
| `ExecutedDocumentViewer.tsx` | View completed documents |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `docusign-envelope` | Create and send envelope to signers |
| `docusign-webhook` | Receive status updates from DocuSign |
| `docusign-download` | Retrieve signed document PDF |

### Document Types Supported

- MOU (Memorandum of Understanding)
- SPA (Sales & Purchase Agreement)
- Reservation Form
- Booking Form
- Mandate Agreement
- NOC Application

---

## Feature 5: Location Intelligence via Mapbox

### What It Does

- Interactive property maps
- Neighborhood insights (schools, hospitals, metro)
- Commute time calculations
- Area comparison tools

### Architecture

```text
+------------------+     +-------------------+     +---------+
| ListingDetailMap |---->| Mapbox GL JS      |---->| Mapbox  |
| (React Component)|     | (Client-side SDK) |     | API     |
+------------------+     +-------------------+     +---------+
         |
         v
+-------------------------+
| NeighborhoodInsights    |
| (POI data from Mapbox)  |
+-------------------------+
```

### New Components

| Component | Purpose |
|-----------|---------|
| `PropertyMap.tsx` | Interactive Mapbox map with property marker |
| `NeighborhoodInsights.tsx` | Display nearby POIs (schools, metro, hospitals) |
| `CommuteCalculator.tsx` | Calculate driving/transit times to key locations |
| `AreaComparison.tsx` | Compare amenities between neighborhoods |
| `ListingsMapView.tsx` | Map view of all active listings |

### Implementation Notes

- Mapbox GL JS is client-side (no edge function needed)
- Access token stored as environment variable (public key is okay for client)
- Use Mapbox Geocoding API for address search
- Use Mapbox Directions API for commute times
- Use Mapbox POI data for nearby amenities

---

## Implementation Phases

### Phase 1: Infrastructure & Secrets (Day 1)
1. Add required secrets: TWILIO_*, SENDGRID_API_KEY, DOCUSIGN_*, MAPBOX_ACCESS_TOKEN
2. Create database tables: communication_logs, viewing_bookings
3. Create base edge functions with CORS setup

### Phase 2: Twilio WhatsApp + SMS (Days 2-3)
1. Create `twilio-messaging` edge function
2. Build `WhatsAppMessagePanel.tsx` component
3. Build `SMSNotificationButton.tsx` component
4. Integrate into ProspectDetailSheet and LeadDetail
5. Add `CommunicationHistory.tsx` to show message log

### Phase 3: SendGrid Email (Days 4-5)
1. Create `sendgrid-email` edge function
2. Build `EmailTemplateSelector.tsx`
3. Add email templates for common scenarios
4. Integrate with viewing reminders and deal milestones
5. Add to MarketingSection for campaign management

### Phase 4: Cal.com Scheduling (Days 6-7)
1. Create Cal.com webhook edge function
2. Build `ViewingScheduler.tsx` with Cal.com embed
3. Create viewing_bookings table
4. Connect to deal funnel automation (auto-advance on booking)
5. Configure reminder triggers

### Phase 5: DocuSign Integration (Days 8-10)
1. Create DocuSign edge functions (envelope, webhook, download)
2. Build signature request UI in DocumentsSection
3. Add signature status tracking
4. Connect to compliance workflow
5. Update signature_envelopes table with DocuSign data

### Phase 6: Mapbox Location Intelligence (Days 11-12)
1. Add Mapbox GL JS to dependencies
2. Build `PropertyMap.tsx` component
3. Add `NeighborhoodInsights.tsx` with POI display
4. Build `CommuteCalculator.tsx`
5. Integrate into ListingDetailModal

---

## Files to Create

### Edge Functions
| File | Purpose |
|------|---------|
| `supabase/functions/twilio-messaging/index.ts` | WhatsApp and SMS messaging |
| `supabase/functions/twilio-webhook/index.ts` | Receive delivery status updates |
| `supabase/functions/sendgrid-email/index.ts` | Send emails via SendGrid |
| `supabase/functions/cal-webhook/index.ts` | Receive Cal.com booking events |
| `supabase/functions/docusign-envelope/index.ts` | Create and send envelopes |
| `supabase/functions/docusign-webhook/index.ts` | Receive signature events |
| `supabase/functions/docusign-download/index.ts` | Download signed documents |

### React Components
| File | Purpose |
|------|---------|
| `src/components/communication/WhatsAppMessagePanel.tsx` | WhatsApp messaging UI |
| `src/components/communication/SMSNotificationButton.tsx` | Quick SMS button |
| `src/components/communication/EmailCampaignBuilder.tsx` | Email campaign creation |
| `src/components/communication/CommunicationHistory.tsx` | Message log display |
| `src/components/scheduling/ViewingScheduler.tsx` | Cal.com booking embed |
| `src/components/scheduling/ViewingConfirmation.tsx` | Booking confirmation |
| `src/components/documents/SendForSignatureButton.tsx` | DocuSign trigger |
| `src/components/documents/SignatureStatusTracker.tsx` | Signature progress |
| `src/components/maps/PropertyMap.tsx` | Mapbox property map |
| `src/components/maps/NeighborhoodInsights.tsx` | Nearby amenities |
| `src/components/maps/CommuteCalculator.tsx` | Travel time calculator |

### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useCommunications.ts` | Communication log queries |
| `src/hooks/useViewingBookings.ts` | Viewing bookings queries |
| `src/hooks/useDocuSign.ts` | DocuSign envelope management |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/prospects/ProspectDetailSheet.tsx` | Add WhatsApp panel, SMS button, communication history |
| `src/components/leads/LeadDetail.tsx` | Add messaging and scheduling components |
| `src/components/documents/DocumentsSection.tsx` | Add DocuSign integration |
| `src/components/listings/ListingDetailModal.tsx` | Add Mapbox map and neighborhood insights |
| `supabase/config.toml` | Add new edge function configurations |
| `package.json` | Add mapbox-gl dependency |

---

## Required Secrets

Before implementation, the following secrets must be configured:

| Secret | Service | Required |
|--------|---------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio (WhatsApp-enabled) | Yes |
| `SENDGRID_API_KEY` | SendGrid | Yes |
| `CAL_API_KEY` | Cal.com | Optional (for API calls) |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign | Yes |
| `DOCUSIGN_API_ACCOUNT_ID` | DocuSign | Yes |
| `DOCUSIGN_RSA_PRIVATE_KEY` | DocuSign (JWT auth) | Yes |
| `MAPBOX_ACCESS_TOKEN` | Mapbox | Yes (can be public) |

---

## User Experience Flow

### Prospect Outreach
```text
1. Agent opens ProspectDetailSheet
2. Sees "Communication" section with WhatsApp, SMS, Email options
3. Selects template (e.g., "New Listing Alert")
4. Previews message with personalization
5. Clicks "Send" → Message delivered via Twilio
6. Status updates in real-time (sent → delivered → read)
7. All communications logged in CommunicationHistory
```

### Property Viewing
```text
1. Agent clicks "Schedule Viewing" on deal
2. Cal.com widget opens with agent availability
3. Client selects preferred time slot
4. Booking confirmed → viewing_bookings created
5. Automated SMS/email confirmation sent
6. 24-hour reminder triggered automatically
7. Deal state advances to "ViewingScheduled"
```

### Document Signing
```text
1. Agent generates MOU from template
2. Clicks "Send for Signature"
3. Adds buyer + seller as signers
4. DocuSign envelope created and sent
5. Status tracked: Sent → Viewed → Signed by Buyer → Signed by Seller
6. Executed document auto-downloaded
7. Compliance status updated
```

### Property Location
```text
1. Agent/client opens ListingDetailModal
2. Map tab shows interactive Mapbox map
3. Property marker with popup details
4. Nearby amenities panel: schools, metro, hospitals
5. Commute calculator: "15 mins to Dubai Mall"
6. Area insights: "Walk Score: 85"
```

---

## Technical Notes

- **Twilio**: Use approved WhatsApp templates for business messaging
- **SendGrid**: Requires domain verification for sending
- **Cal.com**: Can use free tier with embed, API for advanced features
- **DocuSign**: Use JWT authentication for server-to-server calls
- **Mapbox**: Client-side token is safe to expose (restricted by domain)

All integrations include webhook handlers for real-time status updates and connect to the existing audit trail system.
