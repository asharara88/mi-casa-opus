
# Internal Teams Collaboration Hub

## Overview

Create a new **Teams** section for internal collaboration between admin, agents, operators, and management. This section will provide:
- Team meetings management
- Calendar sync with Google/Outlook
- Zoom call scheduling and quick join
- Team directory with availability status

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         TEAMS SECTION                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Team Meetings│  │Team Calendar │  │  Zoom Calls  │          │
│  │    List      │  │    View      │  │  Scheduler   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                    ┌──────────────┐                             │
│                    │team_meetings │                             │
│                    │  (Database)  │                             │
│                    └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Team Meetings Dashboard
- List of upcoming and past internal meetings
- Quick filters: Today, This Week, All
- Meeting status: Scheduled, In Progress, Completed, Cancelled
- Participant list with RSVP status
- Quick actions: Join, Reschedule, Cancel

### 2. Meeting Scheduler
- Create new team meetings with title, agenda, participants
- Select date/time with conflict detection
- Set meeting type: Zoom, In-Person, Phone
- Auto-generate Zoom meeting links
- Send calendar invites via email

### 3. Team Calendar
- Monthly/weekly calendar view of all team meetings
- Color-coded by meeting type
- Click to view meeting details
- Sync indicator for connected calendars

### 4. Zoom Integration
- Quick "Start Zoom Meeting" button
- Generate instant meeting links
- Schedule future Zoom meetings
- Meeting recordings access (future)

---

## Database Schema

### New Table: `team_meetings`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| meeting_id | text | Display ID (MTG-XXXXX) |
| title | text | Meeting title |
| description | text | Meeting agenda/notes |
| meeting_type | enum | 'zoom', 'in_person', 'phone', 'video_call' |
| scheduled_at | timestamp | Meeting start time |
| duration_minutes | int | Expected duration |
| location | text | Physical location or meeting link |
| zoom_meeting_id | text | Zoom meeting ID if applicable |
| zoom_join_url | text | Zoom join URL |
| zoom_host_url | text | Zoom host URL |
| organizer_id | uuid | User who created the meeting |
| status | enum | 'scheduled', 'in_progress', 'completed', 'cancelled' |
| recurrence | jsonb | Recurrence pattern if any |
| created_at | timestamp | Record creation |
| updated_at | timestamp | Last update |

### New Table: `team_meeting_participants`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| meeting_id | uuid | FK to team_meetings |
| user_id | uuid | FK to profiles |
| rsvp_status | enum | 'pending', 'accepted', 'declined', 'tentative' |
| is_required | boolean | Required or optional attendee |
| invited_at | timestamp | When invitation was sent |
| responded_at | timestamp | When user responded |

### New Enum Types
- `meeting_type`: 'zoom', 'in_person', 'phone', 'video_call'
- `meeting_status`: 'scheduled', 'in_progress', 'completed', 'cancelled'
- `rsvp_status`: 'pending', 'accepted', 'declined', 'tentative'

---

## Navigation Changes

### Updated Sidebar Structure

```text
Dashboard
├── Control Room
├── AI Agent

Marketing
├── Marketing Hub
├── Prospects

Sales
├── Leads
├── Deals

Operations
├── Listings
├── Documents
├── Commissions

Teams                  ← NEW GROUP
├── Meetings           ← Team meetings management
├── Team Directory     ← User directory with status

Settings
├── Users
├── Rules & Templates
├── System Settings
```

### Role Access
| Role | Access |
|------|--------|
| Operator | Full access (create, manage, delete) |
| LegalOwner | View meetings, RSVP |
| Broker | View and join meetings, RSVP |
| Investor | No access to internal meetings |

---

## Files to Create

### Components
| File | Purpose |
|------|---------|
| `src/components/teams/TeamsSection.tsx` | Main section with tabs |
| `src/components/teams/TeamMeetingsList.tsx` | List of all meetings |
| `src/components/teams/TeamMeetingCard.tsx` | Individual meeting card |
| `src/components/teams/AddMeetingModal.tsx` | Create new meeting form |
| `src/components/teams/MeetingDetailSheet.tsx` | Meeting details side panel |
| `src/components/teams/TeamCalendarView.tsx` | Calendar visualization |
| `src/components/teams/ZoomQuickStart.tsx` | Quick Zoom meeting button |
| `src/components/teams/TeamDirectoryList.tsx` | Team member directory |
| `src/components/teams/ParticipantSelector.tsx` | Multi-select participant picker |
| `src/components/teams/index.ts` | Barrel exports |

### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useTeamMeetings.ts` | CRUD for team meetings |
| `src/hooks/useMeetingParticipants.ts` | Participant management |

### Edge Functions (Future - Zoom API)
| File | Purpose |
|------|---------|
| `supabase/functions/zoom-create-meeting/index.ts` | Create Zoom meetings via API |
| `supabase/functions/zoom-webhook/index.ts` | Receive Zoom events |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Sidebar.tsx` | Add "teams" group with "meetings" and "directory" items |
| `src/components/BOSApp.tsx` | Add section titles and render cases for teams |
| `src/types/teams.ts` | New types file for team-related interfaces |

---

## Implementation Phases

### Phase 1: Database & Infrastructure
1. Create database migration for `team_meetings` and `team_meeting_participants` tables
2. Add new enum types
3. Set up RLS policies for role-based access
4. Create `useTeamMeetings` hook

### Phase 2: Core UI Components
1. Build `TeamsSection.tsx` with tab layout
2. Create `TeamMeetingsList.tsx` with filters
3. Build `AddMeetingModal.tsx` for creating meetings
4. Create `TeamMeetingCard.tsx` for display

### Phase 3: Calendar & Directory
1. Build `TeamCalendarView.tsx` using existing calendar patterns
2. Create `TeamDirectoryList.tsx` using existing user data

### Phase 4: Navigation Integration
1. Update Sidebar.tsx to add teams group
2. Update BOSApp.tsx to render TeamsSection
3. Test role-based visibility

### Phase 5: Zoom Integration (Future)
1. Add `ZOOM_API_KEY` and `ZOOM_API_SECRET` secrets
2. Create edge function for Zoom meeting creation
3. Auto-generate meeting links when type is "zoom"

---

## UI Design

### Meetings List View
```text
┌─────────────────────────────────────────────────────────────────┐
│  Team Meetings                                [+ New Meeting]   │
├─────────────────────────────────────────────────────────────────┤
│  [Today] [This Week] [All]                    🔍 Search...      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎥 Weekly Sales Standup                    [Join Zoom]   │   │
│  │    Today, 10:00 AM • 30 min • 5 participants            │   │
│  │    ○ Ahmed, ○ Sarah, ○ John...                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📍 Team Training Session                   [In Person]   │   │
│  │    Tomorrow, 2:00 PM • 2 hrs • Conference Room A        │   │
│  │    ○ All Agents Required                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Zoom Panel
```text
┌─────────────────────────────────┐
│  🎥 Quick Zoom Meeting          │
│                                 │
│  [Start Instant Meeting]        │
│                                 │
│  Or schedule for later...       │
│  [Schedule Meeting]             │
└─────────────────────────────────┘
```

---

## Technical Notes

### Calendar Sync Approach
For calendar sync (Google/Outlook), we have two options:
1. **Cal.com Integration** (already configured) - Use the existing Cal.com webhook for bi-directional sync
2. **Direct Google/Outlook OAuth** - More complex, requires additional secrets

Recommendation: Start with internal meetings stored in our database, with optional "Add to Calendar" button that generates .ics files users can import.

### Zoom Integration
- Requires `ZOOM_API_KEY`, `ZOOM_API_SECRET`, and OAuth setup
- For MVP: Use manual Zoom link entry
- Future: Full API integration with auto-generated meeting links

### Real-time Updates
- Enable realtime on `team_meetings` table for live status updates
- Show "Meeting in Progress" badge when meeting is happening

---

## Required Secrets (Future)

| Secret | Service | Required |
|--------|---------|----------|
| `ZOOM_API_KEY` | Zoom | Optional (for full integration) |
| `ZOOM_API_SECRET` | Zoom | Optional (for full integration) |
| `ZOOM_ACCOUNT_ID` | Zoom | Optional (for server-to-server) |

Note: MVP will work without Zoom API keys using manual link entry.

---

## Summary

This implementation creates a dedicated internal collaboration space for the brokerage team with:
- Meeting scheduling and management
- Team calendar view
- Directory of team members
- Placeholder for Zoom integration

The design follows existing patterns from ViewingScheduler and MarketingEvents, ensuring consistency across the application.
