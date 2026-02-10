import { MICASA_LOGO_SVG, MICASA_COMPANY_INFO } from '@/components/branding/MiCasaLogo';
import { yearlyAggregate } from './mortgageEngine';
import type { UpfrontLine } from './upfrontFees';

type ScheduleRow = { month: number; paymentTotal: number; interest: number; principal: number; balance: number };

export interface MortgagePdfData {
  purchasePriceAed?: number;
  loanAmountAed?: number;
  termYears?: number;
  rateLabel?: string;
  ratePct?: number;
  monthlyPayment?: number;
  totalInterest?: number;
  schedule?: ScheduleRow[];
  downPayment: number;
  upfrontLines: UpfrontLine[];
  upfrontTotal: number;
  extraPayment: number;
  baseMonths?: number;
  baseTotalInterest?: number;
  extraMonths?: number;
  extraTotalInterest?: number;
}

function fmtAed(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 2 }).format(n);
}

function fmtPct(n: number | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(2)}%`;
}

const DISCLAIMER = `IMPORTANT DISCLAIMER: This document is a calculated estimate for advisory purposes only. Mortgage rates, fees, and lending criteria are subject to change without notice. All figures must be independently verified with the relevant bank or financial institution before making any financial commitments. MI CASA REALESTATE accepts no liability for decisions based on these projections.`;

export function exportMortgagePdf(data: MortgagePdfData) {
  const yearly = data.schedule ? yearlyAggregate(data.schedule) : [];
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const refNo = `MC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

  const disclaimerBox = `
    <div style="background:#fffbeb;border:1.5px solid #f59e0b;border-radius:6px;padding:12px 16px;margin:16px 0;font-size:11px;color:#92400e;line-height:1.5;">
      <strong style="display:block;margin-bottom:4px;">⚠ DISCLAIMER</strong>
      ${DISCLAIMER}
    </div>`;

  const extraPaymentSection = data.extraPayment > 0 && data.extraMonths != null && data.extraTotalInterest != null && data.baseMonths != null && data.baseTotalInterest != null ? `
    <div style="margin-top:20px;">
      <h3 style="font-size:14px;color:#1a365d;margin-bottom:8px;">Extra Payment Impact</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <tr>
          <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Extra Monthly Payment</td>
          <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(data.extraPayment)}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Months Saved</td>
          <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${data.baseMonths - data.extraMonths} months</td>
        </tr>
        <tr>
          <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Interest Saved</td>
          <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;color:#16a34a;font-weight:600;">${fmtAed(data.baseTotalInterest - data.extraTotalInterest)}</td>
        </tr>
      </table>
    </div>` : '';

  const yearlyRows = yearly.map(r => `
    <tr>
      <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:center;">${r.year}</td>
      <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(r.openingBalance)}</td>
      <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(r.totalPaid)}</td>
      <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;color:#dc2626;">${fmtAed(r.totalInterest)}</td>
      <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;color:#16a34a;">${fmtAed(r.totalPrincipal)}</td>
      <td style="padding:5px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${fmtAed(r.closingBalance)}</td>
    </tr>`).join('');

  const upfrontRows = [
    { label: `Down Payment${data.purchasePriceAed ? ` (${((data.downPayment / data.purchasePriceAed) * 100).toFixed(0)}%)` : ''}`, amount: data.downPayment },
    ...data.upfrontLines.map(l => ({ label: l.label, amount: l.amountAed })),
  ].map(r => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;">${r.label}</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(r.amount)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mortgage Estimate — ${refNo}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 15mm 12mm; } }
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1a202c; font-size: 12px; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px; }
    h2 { font-size: 16px; color: #1a365d; border-bottom: 2px solid #d4a574; padding-bottom: 6px; margin: 24px 0 12px; }
    h3 { font-size: 14px; color: #1a365d; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a365d; padding-bottom: 12px; margin-bottom: 8px; }
    .ref { font-size: 11px; color: #718096; text-align: right; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
    .summary-card .label { font-size: 10px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-card .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .footer { margin-top: 30px; border-top: 1.5px solid #1a365d; padding-top: 10px; font-size: 9px; color: #718096; text-align: center; }
    table { font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>${MICASA_LOGO_SVG}</div>
    <div class="ref">
      <div><strong>Ref:</strong> ${refNo}</div>
      <div>${today}</div>
    </div>
  </div>

  ${disclaimerBox}

  <h2>Mortgage Estimate Summary</h2>

  <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;width:40%;">Purchase Price</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(data.purchasePriceAed)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Loan Amount</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(data.loanAmountAed)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Term</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${data.termYears ?? '—'} years</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Bank / Rate Product</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${data.rateLabel ?? '—'}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;">Interest Rate</td>
      <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtPct(data.ratePct)}</td>
    </tr>
  </table>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Monthly Payment</div>
      <div class="value" style="color:#1a365d;">${fmtAed(data.monthlyPayment)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Interest</div>
      <div class="value" style="color:#dc2626;">${fmtAed(data.totalInterest)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Upfront Cash Required</div>
      <div class="value">${fmtAed(data.upfrontTotal)}</div>
    </div>
  </div>

  <h2>Upfront Cost Breakdown</h2>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    ${upfrontRows}
    <tr style="background:#f1f5f9;font-weight:700;">
      <td style="padding:8px;border:1px solid #e2e8f0;">Total Upfront Cash Required</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${fmtAed(data.upfrontTotal)}</td>
    </tr>
  </table>

  ${extraPaymentSection}

  ${yearly.length > 0 ? `
  <h2>Yearly Amortization Schedule</h2>
  <table style="width:100%;border-collapse:collapse;font-size:11px;">
    <thead>
      <tr style="background:#1a365d;color:#fff;">
        <th style="padding:6px 8px;border:1px solid #1a365d;text-align:center;">Year</th>
        <th style="padding:6px 8px;border:1px solid #1a365d;text-align:right;">Opening</th>
        <th style="padding:6px 8px;border:1px solid #1a365d;text-align:right;">Paid</th>
        <th style="padding:6px 8px;border:1px solid #1a365d;text-align:right;">Interest</th>
        <th style="padding:6px 8px;border:1px solid #1a365d;text-align:right;">Principal</th>
        <th style="padding:6px 8px;border:1px solid #1a365d;text-align:right;">Closing</th>
      </tr>
    </thead>
    <tbody>${yearlyRows}</tbody>
  </table>` : ''}

  ${disclaimerBox}

  <div class="footer">
    <strong>${MICASA_COMPANY_INFO.legalName}</strong> — License ${MICASA_COMPANY_INFO.licenseNo} | TRN ${MICASA_COMPANY_INFO.trn}<br/>
    ${MICASA_COMPANY_INFO.address} | ${MICASA_COMPANY_INFO.phone} | ${MICASA_COMPANY_INFO.email}<br/>
    Regulated by ${MICASA_COMPANY_INFO.regulator}
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}
