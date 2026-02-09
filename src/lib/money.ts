export function formatAed(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
