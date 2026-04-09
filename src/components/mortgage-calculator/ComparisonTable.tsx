import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatAed } from '@/lib/money';
import { amortize, buildSingleRateSegments, buildHybridSegments } from '@/lib/mortgageEngine';
import type { RateOption } from '@/mortgage-data/types';
import { Check, X } from 'lucide-react';

type Props = {
  rateOptions: RateOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loanAmount?: number;
  totalMonths?: number;
  postFixedRatePct?: number;
};

type CompRow = { option: RateOption; monthly: number; totalInterest: number; totalCost: number };

export function ComparisonTable({ rateOptions, selectedIds, onToggle, loanAmount, totalMonths, postFixedRatePct }: Props) {
  const rows = useMemo<CompRow[]>(() => {
    if (!loanAmount || !totalMonths) return [];
    return selectedIds
      .map((id) => rateOptions.find((o) => o.id === id))
      .filter((o): o is RateOption => !!o && !!o.published_rate_pct)
      .map((option) => {
        const segments =
          option.rate_kind === 'FIXED_FULL_TERM'
            ? buildSingleRateSegments(totalMonths, option.published_rate_pct!.value)
            : option.fixed_period_months && postFixedRatePct != null
              ? buildHybridSegments({ totalMonths, fixedMonths: option.fixed_period_months.value, fixedRatePct: option.published_rate_pct!.value, postFixedRatePct })
              : null;
        if (!segments) return null;
        const result = amortize({ principal: loanAmount, totalMonths, segments });
        return {
          option,
          monthly: result.schedule[0]?.paymentTotal ?? 0,
          totalInterest: result.totalInterest,
          totalCost: loanAmount + result.totalInterest,
        };
      })
      .filter((r): r is CompRow => !!r);
  }, [selectedIds, rateOptions, loanAmount, totalMonths, postFixedRatePct]);

  const cheapest = rows.length > 0 ? rows.reduce((a, b) => (a.totalCost < b.totalCost ? a : b)) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rate Comparison</CardTitle>
        <p className="text-xs text-muted-foreground">Select up to 3 rate options to compare side-by-side.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Chip selectors */}
        <div className="flex flex-wrap gap-1.5">
          {rateOptions.filter(o => o.published_rate_pct).map((o) => {
            const selected = selectedIds.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => onToggle(o.id)}
                disabled={!selected && selectedIds.length >= 3}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:bg-muted disabled:opacity-40'
                }`}
              >
                {selected ? <Check className="w-3 h-3" /> : null}
                {o.bank_name.split('(')[0].trim()} — {o.published_rate_pct!.value}%
              </button>
            );
          })}
        </div>

        {/* Comparison table */}
        {rows.length >= 2 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank / Rate</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Total Interest</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.option.id}>
                    <TableCell className="font-medium">
                      {row.option.bank_name.split('(')[0].trim()} — {row.option.published_rate_pct!.value}%
                      {cheapest && row.option.id === cheapest.option.id && (
                        <Badge className="ml-2 bg-green-600 text-[10px]">Best</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatAed(row.monthly)}</TableCell>
                    <TableCell className="text-right">{formatAed(row.totalInterest)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatAed(row.totalCost)}
                      {cheapest && row.option.id !== cheapest.option.id && (
                        <span className="text-xs text-destructive ml-1">
                          +{formatAed(row.totalCost - cheapest.totalCost)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {rows.length < 2 && (
          <p className="text-xs text-muted-foreground">
            {selectedIds.length === 0
              ? 'Select rate options above to compare them side-by-side.'
              : 'Select at least 2 options to see a comparison.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
