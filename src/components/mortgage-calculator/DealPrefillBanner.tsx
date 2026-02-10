import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import { formatAed } from '@/lib/money';

export interface DealContext {
  dealId: string;
  dealDbId: string;
  purchasePrice?: number;
  propertyName?: string;
  clientIncome?: number;
}

interface Props {
  dealContext: DealContext;
  onApply: (ctx: DealContext) => void;
  applied: boolean;
}

export function DealPrefillBanner({ dealContext, onApply, applied }: Props) {
  return (
    <Card className={applied ? 'border-primary/30 bg-primary/5' : 'border-amber-500/40 bg-amber-500/5'}>
      <CardContent className="py-3 flex items-center gap-3">
        <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {applied ? 'Pre-filled from deal' : 'Deal context available'}
            {dealContext.propertyName && ` — ${dealContext.propertyName}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {dealContext.dealId}
            {dealContext.purchasePrice ? ` • ${formatAed(dealContext.purchasePrice)}` : ''}
          </p>
        </div>
        {!applied && (
          <Button size="sm" variant="outline" onClick={() => onApply(dealContext)}>
            Apply
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
