/**
 * MiCasa Deterministic Scoring Engine
 * 
 * Pure rules-based scoring - NO AI involvement.
 * AI fields are advisory only; this engine makes the decisions.
 */

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

// Configurable thresholds
const TARGET_BUDGET_MIN = 800_000;  // AED
const TARGET_BUDGET_MAX = 15_000_000; // AED

/**
 * Calculate FIT score (max 50 points)
 * Based on buyer profile and financial readiness
 */
export function calculateFitScore(prospect: ProspectScoringData): number {
  let score = 0;
  
  // +20: Budget within target range (AED 800K - 15M)
  if (prospect.budget_max && 
      prospect.budget_max >= TARGET_BUDGET_MIN && 
      prospect.budget_max <= TARGET_BUDGET_MAX) {
    score += 20;
  }
  
  // +10: Cash buyer
  if (prospect.is_cash_buyer) {
    score += 10;
  }
  
  // +10: Mortgage pre-approval
  if (prospect.mortgage_preapproval) {
    score += 10;
  }
  
  // +10: End-user (not investor)
  if (prospect.buyer_type === 'EndUser') {
    score += 10;
  }
  
  return Math.min(score, 50); // Cap at 50
}

/**
 * Calculate INTENT score (max 50 points)
 * Based on engagement signals
 */
export function calculateIntentScore(prospect: ProspectScoringData): number {
  let score = 0;
  
  // +15: Price list requested
  if (prospect.price_list_requested) {
    score += 15;
  }
  
  // +15: WhatsApp conversation started
  if (prospect.whatsapp_started) {
    score += 15;
  }
  
  // +10: Brochure/floor plan downloaded
  if (prospect.brochure_downloaded) {
    score += 10;
  }
  
  // +10: Repeat visit within 7 days
  if (prospect.repeat_visit_7d) {
    score += 10;
  }
  
  return Math.min(score, 50); // Cap at 50
}

/**
 * Calculate total score
 */
export function calculateTotalScore(prospect: ProspectScoringData): {
  fitScore: number;
  intentScore: number;
  totalScore: number;
} {
  const fitScore = calculateFitScore(prospect);
  const intentScore = calculateIntentScore(prospect);
  return {
    fitScore,
    intentScore,
    totalScore: fitScore + intentScore,
  };
}

/**
 * Determine lead stage based on score and timeframe
 * This is the SOLE authority for stage assignment - not AI
 */
export type LeadStage = 'Nurture' | 'Interested' | 'Qualified' | 'HighIntent' | 'Disqualified';

export function determineLeadStage(totalScore: number, timeframe: string | null | undefined): LeadStage {
  const urgentTimeframes = ['0-3', '3-6'];
  const mediumTimeframes = ['0-3', '3-6', '6-12'];
  
  // HIGH-INTENT: Score >= 75 AND timeframe <= 6 months
  if (totalScore >= 75 && timeframe && urgentTimeframes.includes(timeframe)) {
    return 'HighIntent';
  }
  
  // QUALIFIED: Score >= 60 AND timeframe <= 12 months
  if (totalScore >= 60 && timeframe && mediumTimeframes.includes(timeframe)) {
    return 'Qualified';
  }
  
  // INTERESTED: Score >= 40
  if (totalScore >= 40) {
    return 'Interested';
  }
  
  // NURTURE: Score < 40
  return 'Nurture';
}

/**
 * Check if lead qualifies for automatic deal creation
 */
export function shouldCreateDeal(leadStage: LeadStage): boolean {
  return leadStage === 'Qualified' || leadStage === 'HighIntent';
}

/**
 * Get score breakdown for UI display
 */
export function getScoreBreakdown(prospect: ProspectScoringData): {
  fit: { label: string; points: number; earned: boolean }[];
  intent: { label: string; points: number; earned: boolean }[];
} {
  return {
    fit: [
      { 
        label: 'Budget in target range', 
        points: 20, 
        earned: !!(prospect.budget_max && prospect.budget_max >= TARGET_BUDGET_MIN && prospect.budget_max <= TARGET_BUDGET_MAX)
      },
      { label: 'Cash buyer', points: 10, earned: !!prospect.is_cash_buyer },
      { label: 'Mortgage pre-approval', points: 10, earned: !!prospect.mortgage_preapproval },
      { label: 'End-user buyer', points: 10, earned: prospect.buyer_type === 'EndUser' },
    ],
    intent: [
      { label: 'Price list requested', points: 15, earned: !!prospect.price_list_requested },
      { label: 'WhatsApp started', points: 15, earned: !!prospect.whatsapp_started },
      { label: 'Brochure downloaded', points: 10, earned: !!prospect.brochure_downloaded },
      { label: 'Repeat visit (7 days)', points: 10, earned: !!prospect.repeat_visit_7d },
    ],
  };
}
