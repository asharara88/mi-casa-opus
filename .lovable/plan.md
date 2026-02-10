

# Mortgage Calculator -- Refinement and Enhancement Plan

## Current State Summary
The calculator today handles basic mortgage math (amortization, upfront fees, DBR/LTV qualification) with a rate scraper integrated into the bank dropdown. It works, but is limited to a single static view with no visualizations, no comparison capability, and no persistence.

---

## Proposed Enhancements (Grouped by Priority)

### 1. Visual Amortization Chart
Add a Recharts area/line chart showing principal vs. interest breakdown over the loan term. This transforms a wall of numbers into an immediately useful visual for client presentations.
- Stacked area chart: interest (red) vs principal (green) vs balance (blue line)
- Highlight the fixed-to-variable rate transition point for hybrid loans
- Tooltip showing month-by-month breakdown on hover

### 2. Multi-Bank Side-by-Side Comparison
Allow the broker to select 2-3 rate options and see a comparison table:
- Monthly payment difference
- Total interest difference
- Total cost of borrowing
- A "savings" highlight showing the cheapest option
- This is the single most useful feature for client advisory

### 3. Interactive Sliders for Key Inputs
Replace plain text inputs with slider + input combos for:
- Purchase price (range: 500K - 50M AED with smart steps)
- Loan amount (capped at purchase price, auto-suggest LTV-compliant amounts)
- Term years (5-30 slider)
- This makes the tool feel dynamic and touchscreen-friendly

### 4. Upfront Cost Breakdown Card
Expand the single "upfront cash" line into a detailed breakdown card:
- Down payment amount and percentage
- DARI mortgage registration fee (% component)
- DARI e-services fee + VAT
- Total upfront cash required
- Each line linked to its regulatory source

### 5. Amortization Schedule Table (Expandable)
Add a collapsible yearly summary table beneath the chart:
- Year | Opening Balance | Total Paid | Interest | Principal | Closing Balance
- Aggregated by year (not 300 monthly rows)
- Export to CSV button for client handoff

### 6. Deal Integration -- Pre-fill from Active Deal
When the calculator is opened from a Deal context, auto-populate:
- Purchase price from the deal's property listing price
- Suggested loan amount based on LTV caps
- Client income from the lead/prospect record (if captured)
- This turns it from a standalone tool into a deal-closing assistant

### 7. Save and Share Scenarios
Allow brokers to:
- Save a calculation scenario with a name (persisted to database)
- Generate a shareable PDF or link for the client
- Track which scenario the client preferred

### 8. Extra Monthly Payment Simulator
The engine already supports `extraPaymentMonthly` but it is not exposed in the UI:
- Add an "Extra monthly payment" input
- Show the impact: months saved, interest saved, new payoff date
- Visual comparison on the amortization chart (with vs without extra payments)

---

## Technical Details

### New Components to Create
- `AmortizationChart.tsx` -- Recharts area chart using the existing `amort.schedule` data
- `ComparisonTable.tsx` -- Side-by-side table for 2-3 selected rate options
- `UpfrontBreakdownCard.tsx` -- Detailed fee breakdown replacing the single line
- `AmortizationScheduleTable.tsx` -- Yearly aggregated schedule with CSV export
- `InputSlider.tsx` -- Reusable slider+input combo component

### Components to Modify
- `MortgageCalculatorWidget.tsx` -- Main orchestrator; add state for comparison mode, extra payments, and render new sub-components
- `QualificationPanel.tsx` -- Auto-populate from deal context when available

### Engine Changes (mortgageEngine.ts)
- Add a `yearlyAggregate()` helper to roll up monthly schedule into yearly rows
- The `extraPaymentMonthly` parameter already exists; just needs UI wiring

### Database (optional, for Save/Share)
- New `mortgage_scenarios` table: id, user_id, deal_id (nullable), name, inputs (jsonb), results (jsonb), created_at
- RLS: users can only see their own scenarios

### No Breaking Changes
All enhancements are additive. Existing calculation logic, rate scraping, and qualification panels remain untouched.

---

## Recommended Implementation Order
1. Interactive sliders + upfront breakdown card (quick wins, immediate UX improvement)
2. Amortization chart + yearly schedule table (visual impact)
3. Extra payment simulator (already supported in engine, just UI)
4. Multi-bank comparison table (high value for brokers)
5. Deal integration pre-fill (contextual intelligence)
6. Save/share scenarios (requires database, do last)

