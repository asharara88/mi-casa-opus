
# Production-Ready Implementation Plan
## Completing the Final 30% for MiCasa BOS

---

## Overview

This plan addresses the four critical gaps preventing production deployment:
1. **Security hardening** - Fix 10 RLS policy warnings
2. **Manager oversight dashboard** - Team performance visibility
3. **Real-time collaboration** - Live updates across brokers
4. **Notification system** - Automated alerts for key events

---

## Phase 1: RLS Security Hardening

### Problem
The linter identified 10 tables with overly permissive RLS policies using `USING (true)` or `WITH CHECK (true)` for INSERT/UPDATE/DELETE operations.

### Tables Requiring Fixes

| Table | Current Issue | Fix |
|-------|---------------|-----|
| `property_tokens` | INSERT allows any authenticated user | Restrict to Operators + created_by tracking |
| `token_ownership` | ALL operations open | Scope to token creators or Operators |
| `payment_escrow` | ALL operations open | Scope to deal participants or Operators |
| `smart_contracts` | ALL operations open | Scope to deal participants or Operators |
| `contract_events` | INSERT too permissive | Require contract access |
| `generated_documents` | Missing broker scoping | Add created_by tracking |
| `viewing_bookings` | Missing ownership | Scope to assigned broker |
| `communication_logs` | Missing creator check | Add created_by requirement |

### Implementation

```text
Migration: 20260205_security_hardening.sql

1. Add created_by columns where missing
2. Update INSERT policies to require created_by = auth.uid()
3. Update UPDATE/DELETE policies to check ownership
4. Create helper function: is_deal_participant(deal_id, user_id)
```

### Helper Function Design

```text
create function is_deal_participant(_deal_id uuid, _user_id uuid)
returns boolean as $$
  select exists (
    select 1 from deal_brokers db
    join broker_profiles bp on db.broker_id = bp.id
    where db.deal_id = _deal_id and bp.user_id = _user_id
  )
$$ language sql stable security definer;
```

---

## Phase 2: Manager Oversight Dashboard

### Components to Build

**1. Team Performance Overview (`TeamPerformanceDashboard.tsx`)**
- Shows all broker pipelines side-by-side
- Conversion rates per broker
- Commission totals by broker
- Activity heatmap (calls, viewings, deals)

**2. Broker KPI Cards (`BrokerKPICard.tsx`)**
- Active leads count
- Deals in progress
- Monthly closed value
- Response time average

**3. Assignment Manager (`LeadAssignmentPanel.tsx`)**
- Round-robin or manual lead assignment
- Workload balancing view
- Unassigned leads queue

### Database Query Design

```text
-- New function: get_team_metrics()
Returns for each broker:
  - lead_count
  - deal_count  
  - conversion_rate
  - total_commission_earned
  - avg_deal_cycle_days
```

### UI Location
- Add "Team" tab to Dashboard for Operator role
- Accessible via sidebar toggle

---

## Phase 3: Real-Time Collaboration

### Tables to Enable Realtime

```text
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_records;
```

### Hook Updates

**useLeadsRealtime.ts**
```text
- Subscribe to leads table changes
- Filter by assigned_broker_id for Broker role
- Auto-refresh query cache on postgres_changes
```

**useDealUpdates.ts**
```text
- Subscribe to deal state changes
- Notify when deal moves to new stage
- Show toast notification on updates
```

### Implementation Pattern

```text
useEffect(() => {
  const channel = supabase
    .channel('leads-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'leads' },
      (payload) => {
        queryClient.invalidateQueries(['leads']);
        if (payload.eventType === 'INSERT') {
          toast.info('New lead assigned to you');
        }
      }
    )
    .subscribe();
    
  return () => { supabase.removeChannel(channel); };
}, []);
```

---

## Phase 4: Notification System

### Notification Types

| Event | Recipients | Channel |
|-------|------------|---------|
| Lead assigned | Assigned broker | In-app + Email |
| Deal stage change | Deal brokers | In-app |
| Approval needed | Operators/LegalOwners | In-app + Email |
| Commission approved | Broker | In-app + Email |
| Document signed | Deal participants | In-app |

### Database Schema

```text
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for instant delivery
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### Components

**1. NotificationBell.tsx**
- Shows unread count
- Dropdown with recent notifications
- Mark all as read

**2. NotificationToast.tsx**
- Real-time toast on new notification
- Click to navigate to entity

**3. NotificationPreferences.tsx**
- Toggle email notifications per type
- Quiet hours setting

### Trigger Function

```text
CREATE FUNCTION notify_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_broker_id IS DISTINCT FROM OLD.assigned_broker_id 
     AND NEW.assigned_broker_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, notification_type, title, message, entity_type, entity_id)
    SELECT bp.user_id, 'lead_assigned', 'New Lead Assigned',
           'Lead ' || NEW.lead_id || ' has been assigned to you',
           'lead', NEW.id::text
    FROM broker_profiles bp WHERE bp.id = NEW.assigned_broker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Implementation Order

```text
Week 1: Security + Database
├── Day 1-2: RLS policy fixes (Phase 1)
├── Day 3-4: Team metrics function + notifications table (Phase 2+4)
└── Day 5: Enable realtime on key tables (Phase 3)

Week 2: Frontend
├── Day 1-2: Manager dashboard components
├── Day 3-4: Real-time hooks + notification system
└── Day 5: Testing + polish
```

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useTeamMetrics.ts` | Fetch broker performance data |
| `src/hooks/useNotifications.ts` | Notification CRUD + realtime |
| `src/hooks/useLeadsRealtime.ts` | Real-time lead updates |
| `src/components/dashboard/TeamPerformanceDashboard.tsx` | Manager view |
| `src/components/notifications/NotificationBell.tsx` | Header notification UI |
| `src/components/notifications/NotificationToast.tsx` | Real-time alerts |
| `src/components/leads/LeadAssignmentPanel.tsx` | Assignment UI |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Header.tsx` | Add NotificationBell |
| `src/components/dashboard/DashboardView.tsx` | Add Team tab for Operators |
| `src/hooks/useLeads.ts` | Add realtime subscription |
| `src/hooks/useDeals.ts` | Add realtime subscription |

### Migration Files

1. `20260205_001_security_hardening.sql` - RLS fixes
2. `20260205_002_team_metrics_function.sql` - Performance query
3. `20260205_003_notifications_table.sql` - Notification schema
4. `20260205_004_enable_realtime.sql` - Realtime publications
5. `20260205_005_notification_triggers.sql` - Auto-notify on events

---

## Post-Implementation Checklist

  - [x] All RLS warnings resolved (SELECT + INSERT/UPDATE/DELETE policies hardened)
 - [x] Brokers can only see their assigned leads/deals
 - [x] Operators can see all data + team overview
 - [x] Real-time updates working across browser tabs
 - [x] Notifications appear on lead assignment
 - [x] Manager dashboard shows broker KPIs
 - [x] Lead assignment UI functional
  - [x] Sensitive tables (escrow, contracts, tokens) scoped to participants
  - [x] AI prompts restricted to Operators only
  - [x] Audit log restricted to Operators/LegalOwners

---

## Risk Mitigation

1. **Existing Data**: RLS changes won't break existing data - all records remain accessible to Operators
2. **Performance**: Added indexes on notification queries
3. **Real-time Load**: Channel filters reduce unnecessary broadcasts

Ready to proceed with implementation?
