import { MICASA_LOGO_SVG, MICASA_COMPANY_INFO } from '@/components/branding/MiCasaLogo';

interface DocumentTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: string;
}

// Document reference counter storage key
const DOC_REF_COUNTER_KEY = 'micasa_doc_ref_counter';
const DOC_REF_YEAR_KEY = 'micasa_doc_ref_year';

// Get next sequential document reference number
function getNextDocRefNumber(): number {
  const currentYear = new Date().getFullYear();
  const storedYear = parseInt(localStorage.getItem(DOC_REF_YEAR_KEY) || '0', 10);
  
  // Reset counter if year changed
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

// Generate systematic document reference: MC-YYYY-NNNNNN
function generateDocRef(templateId: string): string {
  const year = new Date().getFullYear();
  const seqNumber = getNextDocRefNumber();
  const paddedSeq = seqNumber.toString().padStart(6, '0');
  return `MC-${year}-${paddedSeq}`;
}

// Convert underscore patterns to form fields
function convertUnderscoresToFormFields(html: string): string {
  // Pattern: Label: _____ or Label:_____ 
  // Match label followed by underscores
  return html.replace(
    /([A-Za-z\s\/\(\)]+):\s*_{3,}/g,
    (match, label) => {
      const trimmedLabel = label.trim();
      return `<div class="form-field">
        <label class="field-label">${trimmedLabel}</label>
        <div class="field-box"></div>
      </div>`;
    }
  );
}

// Convert standalone underscore lines to signature fields
function convertSignatureFields(html: string): string {
  // Pattern: Just underscores on their own (signature lines)
  return html.replace(
    /^_{10,}$/gm,
    '<div class="signature-line"></div>'
  );
}

// Improved markdown to HTML conversion
function convertMarkdownContent(markdown: string): string {
  let html = markdown
    // Headers with section styling
    .replace(/^### (.*$)/gim, '<h3 class="section-header h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="section-header h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="document-title">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '');
      return `<pre class="code-block">${code}</pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Checkboxes - styled
    .replace(/- \[ \] (.*$)/gim, '<div class="checkbox-item"><span class="checkbox unchecked"></span><span class="checkbox-label">$1</span></div>')
    .replace(/- \[x\] (.*$)/gim, '<div class="checkbox-item"><span class="checkbox checked">✓</span><span class="checkbox-label">$1</span></div>')
    // Unordered lists
    .replace(/^\s*[-*] (.*$)/gim, '<li>$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\. (.*$)/gim, '<li class="ordered">$1</li>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="section-divider">')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c.trim()))) return '';
      const isHeader = cells.some(c => c.includes('**'));
      const tag = isHeader ? 'th' : 'td';
      const cellTags = cells.map(c => `<${tag}>${c.trim().replace(/\*\*/g, '')}</${tag}>`).join('');
      return `<tr>${cellTags}</tr>`;
    })
    // Line breaks
    .replace(/\n\n/g, '</p><p class="paragraph">')
    .replace(/\n/g, '<br>');

  // Wrap lists
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="styled-list">$&</ul>');
  
  // Wrap tables
  html = html.replace(/(<tr>.*?<\/tr>\s*)+/g, '<table class="styled-table">$&</table>');

  // Convert underscores to form fields
  html = convertUnderscoresToFormFields(html);
  html = convertSignatureFields(html);

  return html;
}

// Generate professional PDF HTML
export function generateProfessionalPDFHTML(
  markdown: string,
  template: DocumentTemplate
): string {
  const docRef = generateDocRef(template.id);
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const contentHtml = convertMarkdownContent(markdown);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.title} - MI CASA REALESTATE</title>
  <style>
    /* Reset & Base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm 15mm 25mm 15mm;
    }
    
    @media print {
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
      }
      .page-break { page-break-before: always; }
      .no-print { display: none !important; }
    }
    
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
    }
    
    .document-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
    }
    
    /* Letterhead */
    .letterhead {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #0284C7;
      margin-bottom: 20px;
    }
    
    .logo-container {
      flex-shrink: 0;
    }
    
    .company-details {
      flex: 1;
      text-align: right;
    }
    
    .company-name {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    
    .company-name-arabic {
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .company-info-line {
      font-size: 9px;
      color: #444;
      margin-bottom: 2px;
    }
    
    .company-info-line strong {
      color: #0284C7;
    }
    
    /* Document Header */
    .document-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border: 1px solid #e2e8f0;
      border-left: 4px solid #CA8A04;
      padding: 15px 20px;
      margin-bottom: 20px;
      border-radius: 0 4px 4px 0;
    }
    
    .document-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    .document-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 10px;
    }
    
    .document-meta {
      display: flex;
      gap: 20px;
      font-size: 9px;
      color: #64748b;
    }
    
    .document-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .document-meta strong {
      color: #1a1a1a;
    }
    
    /* Content Styles */
    .content {
      padding: 0 5px;
    }
    
    .paragraph {
      margin: 10px 0;
      text-align: justify;
    }
    
    .section-header {
      margin: 20px 0 10px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .section-header.h2 {
      font-size: 14px;
      font-weight: 600;
      color: #0284C7;
    }
    
    .section-header.h3 {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    /* Form Fields */
    .form-field {
      margin: 12px 0;
    }
    
    .field-label {
      display: block;
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .field-box {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      min-height: 32px;
      background: #f8fafc;
      padding: 6px 10px;
    }
    
    .signature-line {
      border-bottom: 1px solid #1a1a1a;
      height: 40px;
      margin: 20px 0 5px 0;
    }
    
    /* Signature Block */
    .signature-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 30px 0;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .signature-area {
      text-align: center;
    }
    
    .signature-area .field-label {
      text-align: left;
    }
    
    /* Checkboxes */
    .checkbox-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: 8px 0;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 4px;
    }
    
    .checkbox {
      width: 16px;
      height: 16px;
      border: 2px solid #cbd5e1;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 10px;
      font-weight: bold;
    }
    
    .checkbox.checked {
      background: #0284C7;
      border-color: #0284C7;
      color: white;
    }
    
    .checkbox-label {
      flex: 1;
      font-size: 11px;
    }
    
    /* Tables */
    .styled-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10px;
    }
    
    .styled-table th,
    .styled-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    
    .styled-table th {
      background: #f1f5f9;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .styled-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    
    /* Lists */
    .styled-list {
      margin: 12px 0 12px 20px;
      padding-left: 0;
    }
    
    .styled-list li {
      margin: 6px 0;
      padding-left: 8px;
    }
    
    /* Code */
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 10px;
      overflow-x: auto;
      margin: 12px 0;
    }
    
    .inline-code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', monospace;
      font-size: 10px;
    }
    
    /* Dividers */
    .section-divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    
    /* Footer */
    .document-footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 2px solid #0284C7;
      font-size: 8px;
      color: #64748b;
    }
    
    .footer-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .footer-ref {
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .footer-company {
      text-align: center;
      margin-bottom: 8px;
    }
    
    .footer-company-name {
      font-weight: 600;
      color: #0284C7;
    }
    
    .footer-regulatory {
      text-align: center;
      font-size: 7px;
      color: #94a3b8;
    }
    
    .footer-confidential {
      text-align: center;
      margin-top: 8px;
      padding: 6px;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="document-container">
    <!-- Letterhead -->
    <div class="letterhead">
      <div class="logo-container">
        ${MICASA_LOGO_SVG}
      </div>
      <div class="company-details">
        <div class="company-name">${MICASA_COMPANY_INFO.tradeName || MICASA_COMPANY_INFO.legalName}</div>
        <div class="company-name-arabic">${MICASA_COMPANY_INFO.legalNameArabic}</div>
        <div class="company-info-line"><strong>License:</strong> ${MICASA_COMPANY_INFO.licenseNo} | <strong>TRN:</strong> ${MICASA_COMPANY_INFO.trn}</div>
        <div class="company-info-line">${MICASA_COMPANY_INFO.address}</div>
        <div class="company-info-line">Tel: ${MICASA_COMPANY_INFO.phone} | ${MICASA_COMPANY_INFO.email}</div>
      </div>
    </div>
    
    <!-- Document Header -->
    <div class="document-header">
      <div class="document-title">${template.title}</div>
      <div class="document-subtitle">${template.subtitle} • ${template.category}</div>
      <div class="document-meta">
        <span><strong>Reference:</strong> ${docRef}</span>
        <span><strong>Template:</strong> #${template.id}</span>
        <span><strong>Generated:</strong> ${generatedDate}</span>
      </div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="paragraph">${contentHtml}</p>
    </div>
    
    <!-- Footer -->
    <div class="document-footer">
      <div class="footer-main">
        <span class="footer-ref">${docRef}</span>
        <span>Generated: ${generatedDate}</span>
      </div>
      <div class="footer-company">
        <span class="footer-company-name">${MICASA_COMPANY_INFO.legalName}</span>
        <span> | Licensed by ${MICASA_COMPANY_INFO.regulator}</span>
        <span> | ${MICASA_COMPANY_INFO.licenseNo}</span>
      </div>
      <div class="footer-regulatory">
        Tax Registration Number: ${MICASA_COMPANY_INFO.trn} | ${MICASA_COMPANY_INFO.address}
      </div>
      <div class="footer-confidential">
        Confidential — For authorized use only
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
