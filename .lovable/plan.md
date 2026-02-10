

# Mortgage Calculator -- Refinement and Enhancement Plan

## Status: ✅ ALL PHASES COMPLETE

---

## Completed Enhancements

### ✅ 1. Interactive Sliders for Key Inputs
`InputSlider.tsx` — Slider + input combos for Purchase Price, Loan Amount, and Term.

### ✅ 2. Upfront Cost Breakdown Card
`UpfrontBreakdownCard.tsx` — Detailed DARI fees, down payment, and registration costs.

### ✅ 3. Visual Amortization Chart
`AmortizationChart.tsx` — Recharts stacked area chart (Interest vs Principal) with rate transition markers.

### ✅ 4. Amortization Schedule Table
`AmortizationScheduleTable.tsx` — Yearly aggregated schedule with CSV export.

### ✅ 5. Extra Monthly Payment Simulator
`ExtraPaymentSimulator.tsx` — Shows months saved and interest saved with extra payments.

### ✅ 6. Multi-Bank Side-by-Side Comparison
`ComparisonTable.tsx` — Compare up to 3 rate options with "Best" value badges.

### ✅ 7. Deal Integration Pre-fill
`DealPrefillBanner.tsx` — Auto-populates calculator from active deal context (purchase price, 75% LTV suggestion). Mortgage tab added to DealDetail for Sale deals.

### ✅ 8. Save and Share Scenarios
`SavedScenariosPanel.tsx` + `useMortgageScenarios.ts` — Persist scenarios to database with RLS. Load saved scenarios to restore all inputs. `mortgage_scenarios` table with user-scoped RLS policies.

---

## Engine Changes
- `yearlyAggregate()` helper in `mortgageEngine.ts`
- `extraPaymentMonthly` parameter wired to UI

## Database
- `mortgage_scenarios` table with full RLS (user_id scoped)
- Optional `deal_id` FK for deal-linked scenarios
