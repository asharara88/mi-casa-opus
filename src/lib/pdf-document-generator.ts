import { MICASA_LOGO_SVG, MICASA_COMPANY_INFO } from '@/components/branding/MiCasaLogo';

interface DocumentTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: string;
}

const DOC_REF_COUNTER_KEY = 'micasa_doc_ref_counter';
const DOC_REF_YEAR_KEY = 'micasa_doc_ref_year';

function getNextDocRefNumber(): number {
  const currentYear = new Date().getFullYear();
  const storedYear = parseInt(localStorage.getItem(DOC_REF_YEAR_KEY) || '0', 10);
  if (storedYear !== currentYear) {
    localStorage.setItem(DOC_REF_YEAR_KEY, currentYear.toString());
    localStorage.setItem(DOC_REF_COUNTER_KEY, '1');
    return 1;
  }
  const currentCounter = parseInt(localStorage.getItem(DOC_REF_COUNTER_KEY) || '0', 10);
  const nextCounter = currentCounter + 1;
  localStorage.setItem(DOC_REF_COUNTER_KEY, nextCounter.toString());
  return nextCounter;
}

function generateDocRef(templateId: string): string {
  const year = new Date().getFullYear();
  const seqNumber = getNextDocRefNumber();
  return `MC-${year}-${seqNumber.toString().padStart(6, '0')}`;
}

// Convert underscore patterns to styled form fields
function convertUnderscoresToFormFields(html: string): string {
  // Label: _____ patterns
  let result = html.replace(
    /([A-Za-z\s\/\(\)]+):\s*_{3,}/g,
    (match, label) => `<div class="form-field"><label class="field-label">${label.trim()}</label><div class="field-box"></div></div>`
  );
  // Date separators
  result = result.replace(
    /_{2,}\s*\/\s*_{2,}\s*\/\s*_{2,}/g,
    `<div class="form-field"><label class="field-label">Date</label><div class="date-boxes"><span class="date-box"></span><span class="date-sep">/</span><span class="date-box"></span><span class="date-sep">/</span><span class="date-box date-box-year"></span></div></div>`
  );
  // Standalone underscores
  result = result.replace(/(?<![\/\w])_{5,}(?![\/\w])/g, '<div class="field-box"></div>');
  return result;
}

function convertSignatureFields(html: string): string {
  return html.replace(/^_{10,}$/gm, '<div class="signature-line"></div>');
}

// Detect filled values (non-blank content after labels)
function convertFilledValues(html: string): string {
  // After form-field conversion, detect filled values in field-box
  // This catches cases where template was pre-filled
  return html;
}

function convertMarkdownContent(markdown: string): string {
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3 class="section-header h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="section-header h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="document-title">$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '');
      return `<pre class="code-block">${code}</pre>`;
    })
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/- \[ \] (.*$)/gim, '<div class="checkbox-item"><span class="checkbox unchecked"></span><span class="checkbox-label">$1</span></div>')
    .replace(/- \[x\] (.*$)/gim, '<div class="checkbox-item"><span class="checkbox checked">✓</span><span class="checkbox-label">$1</span></div>')
    .replace(/- \[X\] (.*$)/gim, '<div class="checkbox-item"><span class="checkbox checked">✓</span><span class="checkbox-label">$1</span></div>')
    .replace(/^\s*[-*] (.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\d+\. (.*$)/gim, '<li class="ordered">$1</li>')
    .replace(/^---$/gim, '<hr class="section-divider">')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c.trim()))) return '';
      const isHeader = cells.some(c => c.includes('**'));
      const tag = isHeader ? 'th' : 'td';
      const cellTags = cells.map(c => `<${tag}>${c.trim().replace(/\*\*/g, '')}</${tag}>`).join('');
      return `<tr>${cellTags}</tr>`;
    })
    .replace(/\n\n/g, '</p><p class="paragraph">')
    .replace(/\n/g, '<br>');

  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="styled-list">$&</ul>');
  html = html.replace(/(<tr>.*?<\/tr>\s*)+/g, '<table class="styled-table">$&</table>');
  html = convertUnderscoresToFormFields(html);
  html = convertSignatureFields(html);

  return html;
}

// CSS shared by both blank and filled PDFs
function getDocumentCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 18mm 18mm 28mm 18mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', -apple-system, sans-serif;
      font-size: 10.5px;
      line-height: 1.6;
      color: #1e293b;
      background: white;
    }
    .document-container { max-width: 210mm; margin: 0 auto; }
    
    /* ── Letterhead ── */
    .letterhead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 2.5px solid #1a365d;
      margin-bottom: 20px;
    }
    .letterhead::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 1px;
      background: #d4a574;
    }
    .logo-container { flex-shrink: 0; display: flex; align-items: center; }
    .logo-container svg { display: block; }
    .company-details { flex-shrink: 0; text-align: right; line-height: 1.5; }
    .company-name { font-size: 13px; font-weight: 700; color: #1a365d; letter-spacing: -0.2px; }
    .company-name-arabic { font-size: 10px; color: #94a3b8; margin-bottom: 4px; direction: rtl; }
    .company-info-line { font-size: 8.5px; color: #64748b; line-height: 1.6; }
    .company-info-line strong { color: #1a365d; font-weight: 600; }
    
    /* ── Document Header ── */
    .document-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-left: 4px solid #d4a574;
      padding: 14px 18px;
      margin-bottom: 22px;
      border-radius: 0 4px 4px 0;
    }
    .document-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a365d;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
    }
    .document-subtitle {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .document-meta {
      display: flex;
      gap: 20px;
      font-size: 8.5px;
      color: #64748b;
    }
    .document-meta span { display: inline-flex; align-items: center; gap: 3px; }
    .document-meta strong { color: #1a365d; font-weight: 600; }
    
    /* ── Content ── */
    .content { padding: 0; }
    .content > .document-title { display: none; }
    .paragraph { margin: 7px 0; text-align: justify; line-height: 1.65; }
    
    .section-header {
      margin: 22px 0 8px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-header.h2 {
      font-size: 12.5px;
      font-weight: 600;
      color: #1a365d;
      letter-spacing: 0.1px;
    }
    .section-header.h3 {
      font-size: 11.5px;
      font-weight: 600;
      color: #334155;
    }
    
    /* ── Form Fields ── */
    .form-field { margin: 12px 0; }
    .field-label {
      display: block;
      font-size: 7.5px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .field-box {
      border-bottom: 1.5px solid #1a365d;
      min-height: 28px;
      padding: 6px 2px 4px 2px;
      font-size: 11px;
      color: #1e293b;
    }
    .field-box-filled {
      border-bottom: 1.5px solid #1a365d;
      min-height: 28px;
      padding: 6px 2px 4px 2px;
      font-size: 11px;
      color: #1e293b;
      font-weight: 500;
    }
    
    /* Date boxes */
    .date-boxes {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .date-box {
      border-bottom: 1.5px solid #1a365d;
      min-width: 36px;
      height: 28px;
      display: inline-block;
    }
    .date-box-year {
      min-width: 56px;
    }
    .date-sep {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 300;
    }
    
    /* Signature */
    .signature-line {
      border-bottom: 1px solid #334155;
      height: 44px;
      margin: 24px 0 4px 0;
    }
    .signature-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin: 28px 0;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
    }
    
    /* ── Checkboxes ── */
    .checkbox-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 6px 0;
      padding: 6px 10px;
      border-radius: 3px;
    }
    .checkbox {
      width: 14px;
      height: 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 9px;
      font-weight: bold;
      margin-top: 1px;
    }
    .checkbox.checked {
      background: #1a365d;
      border-color: #1a365d;
      color: white;
    }
    .checkbox-label { flex: 1; font-size: 10.5px; }
    
    /* ── Tables ── */
    .styled-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9.5px;
    }
    .styled-table th, .styled-table td {
      border: 1px solid #e2e8f0;
      padding: 7px 10px;
      text-align: left;
    }
    .styled-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #1a365d;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .styled-table tr:nth-child(even) td { background: #fafbfc; }
    
    /* ── Lists ── */
    .styled-list { margin: 10px 0 10px 18px; }
    .styled-list li { margin: 5px 0; padding-left: 6px; }
    
    /* Code */
    .code-block {
      background: #f1f5f9;
      color: #334155;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 9.5px;
      border: 1px solid #e2e8f0;
      margin: 10px 0;
    }
    .inline-code {
      background: #f1f5f9;
      padding: 1px 5px;
      border-radius: 2px;
      font-family: 'Consolas', monospace;
      font-size: 10px;
    }
    
    .section-divider { border: none; border-top: 1px solid #e2e8f0; margin: 18px 0; }
    
    /* ── Footer ── */
    .document-footer {
      margin-top: 36px;
      padding-top: 12px;
      border-top: 2px solid #1a365d;
      font-size: 7.5px;
      color: #94a3b8;
    }
    .footer-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .footer-ref { font-weight: 600; color: #334155; font-size: 8px; }
    .footer-company { text-align: center; margin-bottom: 6px; }
    .footer-company-name { font-weight: 600; color: #1a365d; }
    .footer-regulatory { text-align: center; font-size: 7px; color: #cbd5e1; }
    .footer-confidential {
      text-align: center;
      margin-top: 6px;
      padding: 4px 8px;
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 2px;
      font-size: 7px;
      font-weight: 600;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    
    /* ── Watermark for unfilled ── */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 72px;
      font-weight: 800;
      color: rgba(226, 232, 240, 0.25);
      letter-spacing: 12px;
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
    }
  `;
}

function buildDocumentHTML(opts: {
  title: string;
  subtitle?: string;
  category?: string;
  docRef: string;
  date: string;
  contentHtml: string;
  isBlank?: boolean;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title} - MI CASA REALESTATE</title>
  <style>${getDocumentCSS()}</style>
</head>
<body>
  ${opts.isBlank ? '<div class="watermark">TEMPLATE</div>' : ''}
  <div class="document-container" style="position: relative; z-index: 1;">
    <div class="letterhead">
      <div class="logo-container">${MICASA_LOGO_SVG}</div>
      <div class="company-details">
        <div class="company-name">${MICASA_COMPANY_INFO.tradeName || MICASA_COMPANY_INFO.legalName}</div>
        <div class="company-name-arabic">${MICASA_COMPANY_INFO.legalNameArabic}</div>
        <div class="company-info-line"><strong>License:</strong> ${MICASA_COMPANY_INFO.licenseNo} &nbsp;|&nbsp; <strong>TRN:</strong> ${MICASA_COMPANY_INFO.trn}</div>
        <div class="company-info-line">${MICASA_COMPANY_INFO.address}</div>
        <div class="company-info-line">Tel: ${MICASA_COMPANY_INFO.phone} &nbsp;|&nbsp; ${MICASA_COMPANY_INFO.email}</div>
      </div>
    </div>
    <div class="document-header">
      <div class="document-title">${opts.title}</div>
      ${opts.subtitle ? `<div class="document-subtitle">${opts.subtitle}${opts.category ? ' · ' + opts.category : ''}</div>` : ''}
      <div class="document-meta">
        <span><strong>Reference:</strong> ${opts.docRef}</span>
        <span><strong>Generated:</strong> ${opts.date}</span>
      </div>
    </div>
    <div class="content"><p class="paragraph">${opts.contentHtml}</p></div>
    <div class="document-footer">
      <div class="footer-main">
        <span class="footer-ref">${opts.docRef}</span>
        <span>Generated: ${opts.date}</span>
      </div>
      <div class="footer-company">
        <span class="footer-company-name">${MICASA_COMPANY_INFO.legalName}</span>
        <span> &nbsp;|&nbsp; Licensed by ${MICASA_COMPANY_INFO.regulator}</span>
        <span> &nbsp;|&nbsp; ${MICASA_COMPANY_INFO.licenseNo}</span>
      </div>
      <div class="footer-regulatory">TRN: ${MICASA_COMPANY_INFO.trn} &nbsp;|&nbsp; ${MICASA_COMPANY_INFO.address}</div>
      <div class="footer-confidential">Confidential — For authorized use only</div>
    </div>
  </div>
</body>
</html>`;
}

export function generateProfessionalPDFHTML(markdown: string, template: DocumentTemplate): string {
  const docRef = generateDocRef(template.id);
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const contentHtml = convertMarkdownContent(markdown);
  return buildDocumentHTML({
    title: template.title,
    subtitle: template.subtitle,
    category: template.category,
    docRef,
    date,
    contentHtml,
    isBlank: true,
  });
}

export function generateFilledPDF(filledMarkdown: string, title: string, referenceNumber: string): void {
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const contentHtml = convertMarkdownContent(filledMarkdown);
  const html = buildDocumentHTML({ title, docRef: referenceNumber, date, contentHtml, isBlank: false });
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  }
}
