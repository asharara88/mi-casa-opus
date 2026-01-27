

# Navigation Restructure: Marketing vs Sales Separation

## Overview

Reorganize the app navigation to clearly separate **Marketing** (mass outreach, campaigns, prospects) from **Sales** (qualified leads, deals, conversions).

---

## Current Structure

```text
Dashboard
├── Control Room
├── AI Agent

Marketing
├── Marketing Hub

Customers          ← Currently mixed
├── Prospects      ← Should be under Marketing
├── Leads
├── Deals

Operations
├── Listings
├── Documents
├── Commissions
```

---

## New Structure

```text
Dashboard
├── Control Room
├── AI Agent

Marketing           ← Prospects moved here
├── Marketing Hub
├── Prospects       ← NEW: For mass emailers, campaigns

Sales              ← NEW group replacing "Customers"
├── Leads          ← Sales pipeline starts here
├── Deals

Operations
├── Listings
├── Documents
├── Commissions

Settings
├── Users
├── Rules & Templates
├── System Settings
```

---

## Changes Summary

| Change | Before | After |
|--------|--------|-------|
| `Prospects` group | `customers` | `marketing` |
| `Customers` group | Exists | Renamed to `Sales` |
| Marketing group | Only "Marketing Hub" | Includes Prospects |
| Sales group | N/A | New group with Leads & Deals |

---

## Files to Modify

### 1. `src/components/layout/Sidebar.tsx`

**Changes:**
- Move `Prospects` nav item from `group: 'customers'` to `group: 'marketing'`
- Rename `customers` group to `sales` in `NAV_ITEMS`
- Update `GROUP_CONFIG` to add `sales` label and change icon
- Update `groupOrder` array to reflect new order

**Before:**
```typescript
// Customers (unified funnel: Prospects → Leads → Deals)
{ id: 'prospects', label: 'Prospects', icon: Users, roles: ['Operator'], group: 'customers' },
{ id: 'leads', label: 'Leads', icon: Users, roles: ['Operator'], group: 'customers' },
{ id: 'deals', label: 'Deals', icon: Handshake, roles: ['Operator'], group: 'customers' },
```

**After:**
```typescript
// Marketing (Campaigns, Ads, Prospects)
{ id: 'marketing', label: 'Marketing Hub', icon: Megaphone, roles: ['Operator'], group: 'marketing' },
{ id: 'prospects', label: 'Prospects', icon: Users, roles: ['Operator'], group: 'marketing' },

// Sales (Leads → Deals pipeline)
{ id: 'leads', label: 'Leads', icon: Users, roles: ['Operator'], group: 'sales' },
{ id: 'deals', label: 'Deals', icon: Handshake, roles: ['Operator'], group: 'sales' },
```

**Group Config:**
```typescript
const GROUP_CONFIG = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  marketing: { label: 'Marketing', icon: Megaphone },
  sales: { label: 'Sales', icon: TrendingUp },      // NEW
  operations: { label: 'Operations', icon: Building2 },
  settings: { label: 'Settings', icon: Settings },
};
```

**Group Order:**
```typescript
const groupOrder = ['dashboard', 'marketing', 'sales', 'operations', 'settings'];
```

### 2. `src/components/layout/MobileBottomNav.tsx`

**Changes:**
- Update nav items to show Sales-focused navigation (Leads first)
- Keep Prospects accessible via full menu

**Before:**
```typescript
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'documents', label: 'Docs', icon: FileText },
];
```

**After (no change needed):**
Mobile nav already focuses on Leads and Deals, which aligns with the Sales focus. Prospects are accessible via the "More" menu.

### 3. `src/components/BOSApp.tsx`

**Changes:**
- Update `SECTION_TITLES` to reflect new grouping
- No changes needed to `renderSection()` logic

**Update section descriptions:**
```typescript
prospects: { 
  title: 'Prospects', 
  subtitle: 'Marketing pool for campaigns and mass outreach'  // Updated
},
leads: { 
  title: 'Lead Pipeline', 
  subtitle: 'Qualified leads for sales conversion'  // Updated
},
```

---

## Visual Representation

### New Sidebar Navigation

```text
┌─────────────────────────┐
│  Mi Casa Real Estate    │
├─────────────────────────┤
│  ▼ Dashboard            │
│    • Control Room       │
│    • AI Agent           │
├─────────────────────────┤
│  ▼ Marketing            │  ← Campaigns & Outreach
│    • Marketing Hub      │
│    • Prospects          │  ← Moved here
├─────────────────────────┤
│  ▼ Sales                │  ← Pipeline focus
│    • Leads              │  ← Sales starts here
│    • Deals              │
├─────────────────────────┤
│  ▼ Operations           │
│    • Listings           │
│    • Documents          │
│    • Commissions        │
├─────────────────────────┤
│  ▼ Settings             │
│    • Users              │
│    • Rules & Templates  │
│    • System Settings    │
└─────────────────────────┘
```

---

## User Flow Clarity

### Marketing Team Workflow
```text
Marketing Hub → Create campaigns → Target Prospects → Mass email/WhatsApp
                                                            ↓
                                              Interested → Convert to Lead
```

### Sales Team Workflow
```text
Leads (qualified) → Nurture → Qualify → HighIntent → Convert to Deal → Close
```

---

## Technical Details

### New Icons Import
Add to Sidebar.tsx:
```typescript
import { Megaphone, TrendingUp } from 'lucide-react';
```

- `Megaphone` - Marketing group icon
- `TrendingUp` - Sales group icon

### Role-Based Visibility
The changes maintain existing role restrictions:
- **Operator**: Sees all groups (Marketing, Sales, Operations)
- **Broker**: Sees "My Leads" and "My Deals" (Sales-focused)
- **LegalOwner**: Sees Oversight and Approvals
- **Investor**: Sees Deal Room and Documents

---

## Implementation Checklist

- [ ] Add `Megaphone` and `TrendingUp` icons to imports
- [ ] Move `prospects` from `customers` group to `marketing` group
- [ ] Rename `customers` group to `sales` in all nav items
- [ ] Update `GROUP_CONFIG` with new `sales` entry
- [ ] Update `groupOrder` array
- [ ] Update section subtitles in `BOSApp.tsx`
- [ ] Test navigation on desktop and mobile

