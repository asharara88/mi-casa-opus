

# Marketing Hub Implementation Plan

## Overview

Create a comprehensive **Marketing Section** that serves as the command center for all marketing activities that feed into the sales funnel. This section will track advertisements, events, roadshows, networking activities, and integrate with the existing 13K prospect CRM database.

The Marketing Hub connects to the sales funnel by tracking how marketing efforts (ads, events, campaigns) generate prospects, which then convert to leads and deals.

---

## Marketing Hub Structure

```text
Marketing Hub
├── Dashboard (Campaign Overview + ROI Metrics)
├── Advertisements (DARI Permits, Online Ads, Print)
├── Campaigns (Email, SMS, WhatsApp sequences)
├── Events (Roadshows, Property Launches, Exhibitions)
├── Network (Partner Brokers, Referral Sources)
└── CRM Summary (13K Prospects Source Analysis)
```

---

## Feature Details

### 1. Marketing Dashboard
- **Campaign Performance Cards**: Active campaigns, total spend, leads generated
- **Source Attribution Chart**: Visualize which marketing channels generate the most prospects
- **ROI Calculator**: Cost per lead by channel
- **Upcoming Events Timeline**: Next 30 days of marketing activities

### 2. Advertisements Tab
- **DARI Permit Tracking**: Based on the Abu Dhabi compliance requirements you shared
  - Permit request status (Pending, Approved, Expired)
  - Validity periods (30-90 days)
  - Linked properties
- **Online Ads Management**:
  - Portal ads (Bayut, Property Finder, Dubizzle)
  - Social media campaigns (Instagram, Facebook, LinkedIn)
  - Google Ads tracking
- **Print/Outdoor**: Billboards, brochures, magazine placements

### 3. Campaigns Tab
- **Campaign Types**: Email drip, SMS blast, WhatsApp broadcast
- **Campaign Status**: Draft, Active, Paused, Completed
- **Metrics**: Opens, clicks, responses, conversions
- **Integration**: Link to prospect database for targeting

### 4. Events Tab
- **Event Types**:
  - Roadshows (multi-city property tours)
  - Property Launch Events
  - Exhibitions (Cityscape, MIPIM)
  - Networking Events
- **Event Details**: Date, venue, budget, attendee count
- **Lead Capture**: Track prospects registered vs attended
- **Follow-up Status**: Post-event outreach tracking

### 5. Network Tab
- **Partner Sources**: Referral partners, co-brokers, developers
- **Source Performance**: Leads generated per source
- **Commission Sharing**: Track referral fees

### 6. CRM Integration (Prospect Source Analysis)
- **Source Breakdown**: CustomerList (9,407), McLaren (4,129), etc.
- **Conversion Funnel by Source**: Which sources produce qualified leads?
- **Campaign Attribution**: Link prospects to specific campaigns

---

## Database Schema Changes

### New Tables

**marketing_campaigns**
```
id, campaign_id, name, type, channel, status, budget, spend,
start_date, end_date, target_audience, metrics (JSONB),
created_by, created_at, updated_at
```

**marketing_events**
```
id, event_id, name, type, venue, date, end_date, budget, spend,
expected_attendees, actual_attendees, leads_captured,
status, notes, created_at, updated_at
```

**marketing_ads**
```
id, ad_id, name, platform, type, status, listing_id,
dari_permit_no, permit_status, permit_valid_until,
budget, spend, impressions, clicks, leads_generated,
start_date, end_date, created_at, updated_at
```

**referral_sources**
```
id, source_id, name, type, contact_name, contact_phone,
contact_email, commission_percent, leads_generated,
deals_closed, total_commission_paid, status,
created_at, updated_at
```

### Prospect Table Enhancement
Add column: `campaign_id` (nullable UUID) to track which campaign generated each prospect

---

## UI Components

### Navigation Update
Add "Marketing" group to sidebar between "Dashboard" and "Customers":
```
Dashboard
Marketing       <-- NEW
  ├── Campaigns
  ├── Ads
  ├── Events
  └── Network
Customers
  ├── Prospects
  ├── Leads
  └── Deals
```

### New Components
1. **MarketingSection.tsx** - Main container with tabs
2. **MarketingDashboard.tsx** - Overview with KPIs and charts
3. **CampaignsList.tsx** - Campaign management table
4. **AdsManager.tsx** - Advertisement tracking with DARI permits
5. **EventsCalendar.tsx** - Events list with calendar view
6. **NetworkDirectory.tsx** - Referral partner management
7. **SourceAttributionChart.tsx** - Prospects by source visualization

### Hooks
1. **useMarketingCampaigns.ts** - CRUD for campaigns
2. **useMarketingEvents.ts** - CRUD for events
3. **useMarketingAds.ts** - CRUD for ads
4. **useReferralSources.ts** - CRUD for network partners
5. **useMarketingStats.ts** - Aggregated metrics

---

## Implementation Phases

### Phase 1: Core Structure
- Create database tables with RLS policies
- Add Marketing group to sidebar navigation
- Create MarketingSection with tab structure
- Implement Marketing Dashboard with prospect source analytics

### Phase 2: Campaigns & Ads
- Campaign management interface
- Advertisement tracking with DARI permit integration
- Source attribution linking

### Phase 3: Events & Network
- Events calendar and management
- Roadshow planning interface
- Referral network directory

### Phase 4: Analytics & Reporting
- ROI calculations
- Conversion attribution
- Export capabilities

---

## Key Integration Points

1. **Prospects**: Link prospects to campaigns/events via `campaign_id` or `source` field
2. **Leads**: Track which marketing source generated each lead
3. **Sales Funnel**: Show marketing-attributed conversion rates
4. **DARI Compliance**: Track advertisement permits per Abu Dhabi regulations

---

## Technical Notes

- All new tables will have RLS policies requiring Operator role
- JSONB columns for flexible metrics storage
- Realtime updates for campaign metrics
- Mobile-responsive design matching existing UI patterns

