
# Professional Document Branding System

## Problem
Current PDF exports are unpresentable:
- Plain text "Mi Casa" instead of proper logo
- No letterhead with official company details
- Underscores (`____`) instead of proper form fields
- No professional styling reflecting brand identity
- Missing official registration/license information
- No footer with company details

## Solution
Create a professional document template system with:

### 1. Company Logo Asset
Create an inline SVG logo featuring:
- "MI CASA" wordmark with Arabic "مي كاسا" tagline
- Building/property icon element
- Gold/teal brand colors (#CA8A04 gold, #0284C7 teal)

### 2. Professional Letterhead
```text
+----------------------------------------------------------+
|  [LOGO]  MI CASA REALESTATE                              |
|          مؤسسة فردية                                      |
|----------------------------------------------------------+
|  License: CN-5220826 | TRN: 104329382600003              |
|  Office 1002, Addax Tower, Al Reem Island, Abu Dhabi     |
|  +971 2 447 0028 | info@micasarealestate.ae              |
+----------------------------------------------------------+
```

### 3. Document Body Improvements
| Current | Professional |
|---------|-------------|
| `Name: ____________` | Form field with bordered box |
| Plain checkboxes `[ ]` | Styled checkbox squares |
| Simple tables | Professional bordered tables |
| Plain section headers | Numbered sections with styling |

### 4. Professional Footer
- Document reference number
- Page numbering
- Generation timestamp
- Confidentiality notice
- Company registration details
- QR code placeholder (for future)

## Technical Implementation

### Task 1: Create Logo SVG Component
**File**: `src/components/branding/MiCasaLogo.tsx`

Export reusable SVG logo for:
- PDF documents (inline string)
- Web components (React component)

### Task 2: Refactor PDF HTML Generator
**File**: `src/components/documents/PDFTemplatesSection.tsx`

Update `convertMarkdownToHTML()` function:
- Replace text logo with SVG letterhead
- Add full company details in header
- Convert `_____` patterns to styled input boxes
- Improve table rendering with proper borders
- Add professional footer with license info
- Use brand fonts (Inter, Poppins)

**New styles to add:**
- `.letterhead` - Full header block with logo + details
- `.form-field` - Bordered input field boxes
- `.signature-block` - Professional signature area
- `.section-number` - Numbered section styling
- `.page-footer` - Running footer with page numbers

### Task 3: Improve Markdown Conversion
Replace underscore patterns with form fields:
```javascript
// Current: Name: ______________
// New: <div class="form-field"><label>Name</label><div class="field-box"></div></div>
```

### Task 4: Add Print Optimization
- `@page` rules for A4 paper
- Page break controls
- Print-specific color adjustments
- Running headers/footers

## Visual Preview

### Header Design:
```
┌────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                   │
│ │ LOGO │  MI CASA REALESTATE مؤسسة فردية                  │
│ └──────┘  ─────────────────────────────────────────────── │
│           License: CN-5220826 │ TRN: 104329382600003      │
│           Office 1002, Addax Tower, Al Reem Island, AD    │
│           Tel: +971 2 447 0028 │ info@micasarealestate.ae │
└────────────────────────────────────────────────────────────┘
```

### Form Field Style:
```
┌────────────────────────────────────────────────────────────┐
│ Full Name                                                  │
│ ┌────────────────────────────────────────────────────────┐│
│ │                                                        ││
│ └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Footer Design:
```
────────────────────────────────────────────────────────────
Document Ref: MC-2026-001234 │ Generated: 01 Feb 2026 │ Page 1/3
MI CASA REALESTATE │ Licensed by Abu Dhabi DED │ CN-5220826
CONFIDENTIAL - For authorized use only
────────────────────────────────────────────────────────────
```

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/branding/MiCasaLogo.tsx` | Reusable logo component |
| Modify | `src/components/documents/PDFTemplatesSection.tsx` | Professional PDF template |

## Result
- Client-ready documents with full branding
- Professional letterhead on every page
- Proper form fields instead of underscores
- Official company registration displayed
- Consistent brand identity across all templates
