import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAed } from '@/lib/money';
import type { UpfrontLine } from '@/lib/upfrontFees';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  downPayment: number;
  purchasePrice?: number;
  upfrontLines: UpfrontLine[];
  upfrontTotal: number;
};

export function UpfrontBreakdownCard({ downPayment, purchasePrice, upfrontLines, upfrontTotal }: Props) {
  const dpPct = purchasePrice && purchasePrice > 0 ? ((downPayment / purchasePrice) * 100).toFixed(1) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upfront Cash Required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Down payment {dpPct && `(${dpPct}%)`}</span>
          <span className="font-medium">{formatAed(downPayment)}</span>
        </div>

        {upfrontLines.map((line, i) => (
          <div key={i} className="flex justify-between items-start">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground flex items-center gap-1 cursor-help">
                    {line.label} <Info className="w-3 h-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {line.sources.map((s) => (
                    <div key={s.id}>
                      <strong>{s.label}</strong>: {s.value} {s.unit}
                      <br />
                      <a href={s.source.source_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        {s.source.authority_name}
                      </a>
                    </div>
                  ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="font-medium shrink-0">{formatAed(line.amountAed)}</span>
          </div>
        ))}

        <div className="border-t pt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="text-primary">{formatAed(upfrontTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
