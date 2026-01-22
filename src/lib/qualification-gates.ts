/**
 * MiCasa Qualification Gates
 * 
 * Hard rules that determine prospect eligibility.
 * NO AI involvement - pure deterministic logic.
 */

import { supabase } from '@/integrations/supabase/client';

// Configurable minimum unit price
const MIN_UNIT_PRICE = 800_000; // AED

export type DisqualificationReason = 'SPAM' | 'DUPLICATE' | 'BROKER' | 'BELOW_BUDGET' | 'INELIGIBLE';

export interface GateResult {
  passed: boolean;
  reason?: DisqualificationReason;
  message?: string;
}

export interface ProspectInput {
  phone?: string | null;
  email?: string | null;
  full_name?: string;
  source?: string | null;
}

export interface ProspectData {
  id: string;
  buyer_type?: 'EndUser' | 'Investor' | 'Broker' | null;
  budget_min?: number | null;
  budget_max?: number | null;
  timeframe?: '0-3' | '3-6' | '6-12' | '12+' | null;
  phone?: string | null;
  email?: string | null;
}

// Spam detection patterns
const SPAM_PHONE_PATTERNS = [
  /^0{10,}$/,           // All zeros
  /^1234567890$/,       // Sequential
  /^(.)\1{9,}$/,        // Repeated digit
];

const SPAM_EMAIL_PATTERNS = [
  /test@/i,
  /fake@/i,
  /example\.com$/i,
  /mailinator\.com$/i,
  /tempmail/i,
];

const SPAM_NAME_PATTERNS = [
  /^test\s/i,
  /^fake\s/i,
  /^asdf/i,
  /^xxx/i,
];

/**
 * Gate 2: Eligibility & Spam Filter
 * Checks for duplicates and spam patterns
 */
export async function validateEligibility(
  prospect: ProspectInput,
  excludeId?: string
): Promise<GateResult> {
  // Check for spam patterns in phone
  if (prospect.phone) {
    const cleanPhone = prospect.phone.replace(/\D/g, '');
    if (SPAM_PHONE_PATTERNS.some(p => p.test(cleanPhone))) {
      return { passed: false, reason: 'SPAM', message: 'Invalid phone number detected' };
    }
  }
  
  // Check for spam patterns in email
  if (prospect.email) {
    if (SPAM_EMAIL_PATTERNS.some(p => p.test(prospect.email!))) {
      return { passed: false, reason: 'SPAM', message: 'Spam email detected' };
    }
  }
  
  // Check for spam patterns in name
  if (prospect.full_name) {
    if (SPAM_NAME_PATTERNS.some(p => p.test(prospect.full_name!))) {
      return { passed: false, reason: 'SPAM', message: 'Invalid name detected' };
    }
  }
  
  // Check for duplicates
  if (prospect.phone || prospect.email) {
    let query = supabase
      .from('prospects')
      .select('id, full_name');
    
    const conditions: string[] = [];
    if (prospect.phone) {
      conditions.push(`phone.eq.${prospect.phone}`);
    }
    if (prospect.email) {
      conditions.push(`email.eq.${prospect.email}`);
    }
    
    query = query.or(conditions.join(','));
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data: existing } = await query.limit(1);
    
    if (existing && existing.length > 0) {
      return { 
        passed: false, 
        reason: 'DUPLICATE', 
        message: `Contact already exists: ${existing[0].full_name}` 
      };
    }
  }
  
  return { passed: true };
}

/**
 * Gate 3: Minimum Data Capture
 * Prospect must have buyer_type, budget_range, and timeframe
 */
export function validateMinimumData(prospect: ProspectData): GateResult {
  const missing: string[] = [];
  
  if (!prospect.buyer_type) {
    missing.push('Buyer Type');
  }
  
  if (!prospect.budget_max) {
    missing.push('Budget Range');
  }
  
  if (!prospect.timeframe) {
    missing.push('Timeframe');
  }
  
  if (missing.length > 0) {
    return { 
      passed: false, 
      reason: 'INELIGIBLE', 
      message: `Missing required fields: ${missing.join(', ')}` 
    };
  }
  
  return { passed: true };
}

/**
 * Gate 4: Broker Disqualification
 * Brokers cannot become leads
 */
export function validateBuyerType(prospect: ProspectData): GateResult {
  if (prospect.buyer_type === 'Broker') {
    return { 
      passed: false, 
      reason: 'BROKER', 
      message: 'Brokers are automatically disqualified from the sales pipeline' 
    };
  }
  
  return { passed: true };
}

/**
 * Gate 5: Budget Qualification
 * Budget must meet minimum unit price
 */
export function validateBudget(prospect: ProspectData): GateResult {
  if (prospect.budget_max && prospect.budget_max < MIN_UNIT_PRICE) {
    return { 
      passed: false, 
      reason: 'BELOW_BUDGET', 
      message: `Budget (AED ${prospect.budget_max.toLocaleString()}) is below minimum unit price (AED ${MIN_UNIT_PRICE.toLocaleString()})` 
    };
  }
  
  return { passed: true };
}

/**
 * Run all gates in sequence
 * Returns first failure or success
 */
export async function runAllGates(
  prospect: ProspectData,
  isNewProspect: boolean = false
): Promise<GateResult & { gate?: string }> {
  // Gate 2: Eligibility (only for new prospects or when contact info changes)
  if (isNewProspect) {
    const eligibility = await validateEligibility(
      { phone: prospect.phone, email: prospect.email },
      prospect.id
    );
    if (!eligibility.passed) {
      return { ...eligibility, gate: 'eligibility' };
    }
  }
  
  // Gate 3: Minimum Data
  const minData = validateMinimumData(prospect);
  if (!minData.passed) {
    return { ...minData, gate: 'minimum_data' };
  }
  
  // Gate 4: Broker Check
  const buyerType = validateBuyerType(prospect);
  if (!buyerType.passed) {
    return { ...buyerType, gate: 'buyer_type' };
  }
  
  // Gate 5: Budget
  const budget = validateBudget(prospect);
  if (!budget.passed) {
    return { ...budget, gate: 'budget' };
  }
  
  return { passed: true };
}

/**
 * Get gate status for UI display
 */
export function getGateStatus(prospect: ProspectData): {
  gate: string;
  label: string;
  passed: boolean;
  message?: string;
}[] {
  const minData = validateMinimumData(prospect);
  const buyerType = validateBuyerType(prospect);
  const budget = validateBudget(prospect);
  
  return [
    {
      gate: 'minimum_data',
      label: 'Required Fields',
      passed: minData.passed,
      message: minData.message,
    },
    {
      gate: 'buyer_type',
      label: 'Buyer Type Check',
      passed: buyerType.passed,
      message: buyerType.message,
    },
    {
      gate: 'budget',
      label: 'Budget Qualification',
      passed: budget.passed,
      message: budget.message,
    },
  ];
}
