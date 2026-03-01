

## Plan: Add Fill-in-the-Blank Form to PDF Templates

### Problem
The PDF Templates tab only shows raw markdown with Preview/Download/Export. There is no way to fill in the blank fields (e.g., cooperating agency name in the Agent-to-Agent Agreement). The Official Forms tab already has this via `StaticFormFiller`, but the two tabs are disconnected.

### Approach
Add a "Fill & Generate" button to each PDF template card and preview dialog in `PDFTemplatesSection.tsx`. When clicked, it opens the existing `StaticFormFiller` component (which already has schemas for all 18 forms) in a dialog. On completion, the filled document is shown with Print on Letterhead and Share options.

### Files to Modify

**`src/components/documents/PDFTemplatesSection.tsx`**
- Import `StaticFormFiller` and `generateFilledPDF`
- Add state for `fillingTemplateId` and `filledContent`
- Map PDF template IDs (e.g., `'06'`) to `TEMPLATE_SCHEMAS` IDs (e.g., `'FORM_06_AGENT_AGREEMENT'`)
- Add a "Fill & Generate" button on each template card (next to Preview/Download/Export)
- Add a "Fill & Generate" button in the preview dialog
- When `StaticFormFiller` completes, show the filled document with Print on Letterhead + Share buttons
- Reuse the same letterhead/share pattern from `TemplatesSection.tsx`

### Implementation Steps
1. Add ID mapping from PDF template `id` to `FORM_*` schema IDs
2. Add fill/preview state management
3. Add fill dialog with `StaticFormFiller`
4. Add post-fill result dialog with letterhead print and share actions

