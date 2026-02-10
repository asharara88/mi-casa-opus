import { clamp } from './money';

export type RateSegment = { startMonth: number; endMonth: number; annualRatePct: number; label: string };

export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  if (Math.abs(r) < 1e-12) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function buildSingleRateSegments(totalMonths: number, annualRatePct: number): RateSegment[] {
  return [{ startMonth: 1, endMonth: totalMonths, annualRatePct, label: 'Single rate' }];
}

export function buildHybridSegments(params: {
  totalMonths: number;
  fixedMonths: number;
  fixedRatePct: number;
  postFixedRatePct: number;
}): RateSegment[] {
  const fixedMonths = clamp(Math.floor(params.fixedMonths), 0, params.totalMonths);
  if (fixedMonths <= 0) return buildSingleRateSegments(params.totalMonths, params.postFixedRatePct);
  if (fixedMonths >= params.totalMonths) return buildSingleRateSegments(params.totalMonths, params.fixedRatePct);
  return [
    { startMonth: 1, endMonth: fixedMonths, annualRatePct: params.fixedRatePct, label: 'Fixed' },
    {
      startMonth: fixedMonths + 1,
      endMonth: params.totalMonths,
      annualRatePct: params.postFixedRatePct,
      label: 'Post-fixed (user-entered)',
    },
  ];
}

export function amortize(params: {
  principal: number;
  totalMonths: number;
  segments: RateSegment[];
  extraPaymentMonthly?: number;
}) {
  const { principal, totalMonths, segments } = params;
  const extra = params.extraPaymentMonthly ?? 0;
  let balance = principal;
  let totalInterest = 0;
  const schedule: Array<{ month: number; paymentTotal: number; interest: number; principal: number; balance: number }> = [];

  let segment = segments[0];
  let segmentIndex = 0;
  let payment = 0;

  for (let month = 1; month <= totalMonths && balance > 1e-8; month++) {
    while (month > segment.endMonth) {
      segmentIndex += 1;
      segment = segments[segmentIndex];
    }

    if (month === segment.startMonth) {
      payment = monthlyPayment(balance, segment.annualRatePct, totalMonths - month + 1);
    }

    const r = segment.annualRatePct / 100 / 12;
    const interest = balance * r;
    let principalPaid = payment - interest + extra;
    if (principalPaid > balance) principalPaid = balance;

    balance -= principalPaid;
    totalInterest += interest;

    schedule.push({
      month,
      paymentTotal: interest + principalPaid,
      interest,
      principal: principalPaid,
      balance: Math.max(0, balance),
    });
  }

  return { schedule, totalInterest };
}

export type YearlyRow = {
  year: number;
  openingBalance: number;
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
  closingBalance: number;
};

export function yearlyAggregate(
  schedule: Array<{ month: number; paymentTotal: number; interest: number; principal: number; balance: number }>
): YearlyRow[] {
  const years: YearlyRow[] = [];
  let currentYear = 1;
  let row: YearlyRow = { year: 1, openingBalance: 0, totalPaid: 0, totalInterest: 0, totalPrincipal: 0, closingBalance: 0 };

  for (const m of schedule) {
    const y = Math.ceil(m.month / 12);
    if (y !== currentYear) {
      years.push(row);
      currentYear = y;
      row = { year: y, openingBalance: years[years.length - 1].closingBalance, totalPaid: 0, totalInterest: 0, totalPrincipal: 0, closingBalance: 0 };
    }
    if (m.month === 1 || (m.month - 1) % 12 === 0) {
      row.openingBalance = m.balance + m.principal;
    }
    row.totalPaid += m.paymentTotal;
    row.totalInterest += m.interest;
    row.totalPrincipal += m.principal;
    row.closingBalance = m.balance;
  }
  if (row.totalPaid > 0) years.push(row);
  return years;
}
