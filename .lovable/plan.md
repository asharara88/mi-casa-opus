

# Mortgage Calculator PDF Export

## Overview
Add an "Export PDF" button to the mortgage calculator that generates a branded, client-ready summary document. The document will include a prominent disclaimer that all figures are estimates subject to change, since bank rates and fees fluctuate.

## What the PDF Will Contain
1. **MI CASA branded letterhead and footer** (reusing existing `MICASA_LOGO_SVG` and `MICASA_COMPANY_INFO`)
2. **Calculation inputs** -- purchase price, loan amount, term, selected bank/rate
3. **Results summary** -- monthly payment, total interest, upfront cash
4. **Upfront cost breakdown** -- down payment, DARI fees, total
5. **Extra payment impact** (if configured) -- months saved, interest saved
6. **Yearly amortization schedule table** -- year, opening balance, paid, interest, principal, closing balance
7. **Disclaimer banner** -- clearly stating this is an estimate, rates change, and figures should be verified with the lending institution

## Technical Approach

### New File
- `src/lib/mortgage-pdf-export.ts` -- A standalone function that builds an HTML document string from the calculator's current state and opens `window.print()` (same pattern used by `generateFilledPDF` in `pdf-document-generator.ts`)

### Modified File
- `src/components/mortgage-calculator/MortgageCalculatorWidget.tsx` -- Add an "Export PDF" button (using the existing `Button` component with a `FileDown` icon from lucide-react) near the top of the results area. The button calls the export function, passing all current state values.

### Data Flow
The export function receives a single props object containing:
- `purchasePriceAed`, `loanAmountAed`, `termYears`
- Selected rate option label and rate percentage
- `amort.schedule` (monthly schedule array)
- `upfrontLines`, `downPayment`, `upfrontTotal`
- `extraPayment`, `amortWithExtra` (optional)
- Yearly aggregate rows (computed via the existing `yearlyAggregate` helper)

### Disclaimer Text
A highlighted amber box at the top and bottom of the document:
> "IMPORTANT DISCLAIMER: This document is a calculated estimate for advisory purposes only. Mortgage rates, fees, and lending criteria are subject to change without notice. All figures must be independently verified with the relevant bank or financial institution before making any financial commitments. MI CASA REALESTATE accepts no liability for decisions based on these projections."

### No New Dependencies
Uses the same `window.open` + `document.write` + `window.print()` pattern already established in the codebase. Recharts is not rendered in the PDF -- only the tabular data.

