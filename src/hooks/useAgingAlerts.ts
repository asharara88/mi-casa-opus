import { differenceInDays } from 'date-fns';

export type AgingLevel = 'fresh' | 'yellow' | 'red';

export interface AgingThresholds {
  yellow: number; // days until yellow alert
  red: number;    // days until red alert
}

// Lead aging thresholds by state (days)
export const LEAD_AGING_THRESHOLDS: Record<string, AgingThresholds> = {
  New: { yellow: 1, red: 2 },
  Contacted: { yellow: 3, red: 5 },
  Qualified: { yellow: 5, red: 7 },
  Converted: { yellow: 999, red: 999 },
  Disqualified: { yellow: 999, red: 999 },
};

// Deal aging thresholds by state (days)
export const DEAL_AGING_THRESHOLDS: Record<string, AgingThresholds> = {
  Created: { yellow: 2, red: 3 },
  Qualified: { yellow: 5, red: 7 },
  Viewing: { yellow: 7, red: 10 },
  Offer: { yellow: 5, red: 7 },
  Reservation: { yellow: 7, red: 14 },
  SPA: { yellow: 14, red: 21 },
  Closed_Won: { yellow: 999, red: 999 },
  Closed_Lost: { yellow: 999, red: 999 },
};

export function calculateAgingLevel(
  updatedAt: string | Date,
  thresholds: AgingThresholds
): AgingLevel {
  const lastUpdated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  const daysInStage = differenceInDays(new Date(), lastUpdated);

  if (daysInStage >= thresholds.red) return 'red';
  if (daysInStage >= thresholds.yellow) return 'yellow';
  return 'fresh';
}

export function getDaysInStage(updatedAt: string | Date): number {
  const lastUpdated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  return differenceInDays(new Date(), lastUpdated);
}

export function getAgingLabel(daysInStage: number): string {
  if (daysInStage === 0) return 'Today';
  if (daysInStage === 1) return '1 day';
  return `${daysInStage} days`;
}
