export interface ProspectScoringData {
  buyer_type?: 'EndUser' | 'Investor' | 'Broker' | null;
  budget_min?: number | null;
  budget_max?: number | null;
  timeframe?: '0-3' | '3-6' | '6-12' | '12+' | null;
  is_cash_buyer?: boolean;
  mortgage_preapproval?: boolean;
  price_list_requested?: boolean;
  whatsapp_started?: boolean;
  brochure_downloaded?: boolean;
  repeat_visit_7d?: boolean;
}

export type LeadStatus = 'Nurture' | 'Interested' | 'Qualified' | 'HighIntent' | 'Disqualified';
export type LeadDisqualificationReason = 'BROKER' | 'BELOW_BUDGET';

export const MIN_UNIT_PRICE_AED = 800_000;
export const TARGET_BUDGET_MIN_AED = 800_000;
export const TARGET_BUDGET_MAX_AED = 15_000_000;

export interface LeadQualificationResult {
  fitScore: number;
  intentScore: number;
  totalScore: number;
  status: LeadStatus;
  disqualificationReason?: LeadDisqualificationReason;
}

export function calculateFitScore(prospect: ProspectScoringData): number {
  let score = 0;

  if (
    prospect.budget_max &&
    prospect.budget_max >= TARGET_BUDGET_MIN_AED &&
    prospect.budget_max <= TARGET_BUDGET_MAX_AED
  ) {
    score += 20;
  }

  if (prospect.is_cash_buyer) {
    score += 10;
  }

  if (prospect.mortgage_preapproval) {
    score += 10;
  }

  if (prospect.buyer_type === 'EndUser') {
    score += 10;
  }

  return Math.min(score, 50);
}

export function calculateIntentScore(prospect: ProspectScoringData): number {
  let score = 0;

  if (prospect.price_list_requested) {
    score += 15;
  }

  if (prospect.whatsapp_started) {
    score += 15;
  }

  if (prospect.brochure_downloaded) {
    score += 10;
  }

  if (prospect.repeat_visit_7d) {
    score += 10;
  }

  return Math.min(score, 50);
}

export function determineLeadStatus(totalScore: number, timeframe: string | null | undefined): LeadStatus {
  const urgentTimeframes = ['0-3', '3-6'];
  const mediumTimeframes = ['0-3', '3-6', '6-12'];

  if (totalScore >= 75 && timeframe && urgentTimeframes.includes(timeframe)) {
    return 'HighIntent';
  }

  if (totalScore >= 60 && timeframe && mediumTimeframes.includes(timeframe)) {
    return 'Qualified';
  }

  if (totalScore >= 40) {
    return 'Interested';
  }

  return 'Nurture';
}

export function qualifyLead(prospect: ProspectScoringData): LeadQualificationResult {
  const fitScore = calculateFitScore(prospect);
  const intentScore = calculateIntentScore(prospect);
  const totalScore = fitScore + intentScore;

  if (prospect.buyer_type === 'Broker') {
    return {
      fitScore,
      intentScore,
      totalScore,
      status: 'Disqualified',
      disqualificationReason: 'BROKER',
    };
  }

  if (typeof prospect.budget_max === 'number' && prospect.budget_max < MIN_UNIT_PRICE_AED) {
    return {
      fitScore,
      intentScore,
      totalScore,
      status: 'Disqualified',
      disqualificationReason: 'BELOW_BUDGET',
    };
  }

  return {
    fitScore,
    intentScore,
    totalScore,
    status: determineLeadStatus(totalScore, prospect.timeframe),
  };
}
