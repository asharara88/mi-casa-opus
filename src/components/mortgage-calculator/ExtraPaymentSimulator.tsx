import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { formatAed } from '@/lib/money';

type Props = {
  extraPayment: number;
  onExtraPaymentChange: (v: number) => void;
  baseMonths: number;
  baseTotalInterest: number;
  extraMonths?: number;
  extraTotalInterest?: number;
  maxPayment: number;
};

export function ExtraPaymentSimulator({
  extraPayment,
  onExtraPaymentChange,
  baseMonths,
  baseTotalInterest,
  extraMonths,
  extraTotalInterest,
  maxPayment,
}: Props) {
  const monthsSaved = extraMonths != null ? baseMonths - extraMonths : 0;
  const interestSaved = extraTotalInterest != null ? baseTotalInterest - extraTotalInterest : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Extra Monthly Payment Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Extra payment per month</span>
            <span className="font-semibold text-primary">{formatAed(extraPayment)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[extraPayment]}
              onValueChange={([v]) => onExtraPaymentChange(v)}
              min={0}
              max={maxPayment}
              step={100}
              className="flex-1"
            />
            <input
              className="w-24 border rounded-md px-2 py-1.5 text-sm bg-background text-foreground text-right"
              value={extraPayment || ''}
              placeholder="0"
              onChange={(e) => onExtraPaymentChange(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {extraPayment > 0 && extraMonths != null && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-2xl font-bold text-green-500">
                {monthsSaved > 0 ? `${monthsSaved}` : '0'}
              </p>
              <p className="text-xs text-muted-foreground">months saved</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-2xl font-bold text-green-500">
                {interestSaved > 0 ? formatAed(interestSaved) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">interest saved</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
