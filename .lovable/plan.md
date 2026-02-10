

## Add Mortgage Calculator to Operations Navigation

### What will change

The existing Mortgage Calculator (currently only accessible via a standalone `/mortgage-calculator` route) will be integrated into the main app as a section under the **Operations** navigation group, alongside Listings, Documents, Smart Contracts, and Commissions.

### Steps

1. **Sidebar Navigation** (`src/components/layout/Sidebar.tsx`)
   - Add a new nav item `{ id: 'mortgage-calc', label: 'Mortgage Calculator', icon: Calculator, roles: ['Operator', 'Broker'], group: 'operations' }`
   - Import `Calculator` icon from `lucide-react`

2. **Section Metadata** (`src/components/BOSApp.tsx`)
   - Add entry to `SECTION_TITLES`: `'mortgage-calc': { title: 'Mortgage Calculator', subtitle: 'Abu Dhabi mortgage guidance and qualification' }`

3. **Lazy Import** (`src/components/BOSApp.tsx`)
   - Add lazy import for `MortgageCalculatorWidget`

4. **Render Section** (`src/components/BOSApp.tsx`)
   - Add `case 'mortgage-calc'` to the `renderSection` switch returning `<MortgageCalculatorWidget />`

### Technical Details

- The `MortgageCalculatorWidget` component already exists at `src/components/mortgage-calculator/MortgageCalculatorWidget.tsx` and is fully self-contained
- No new dependencies or database changes required
- The standalone `/mortgage-calculator` route will remain functional as an alternative entry point

