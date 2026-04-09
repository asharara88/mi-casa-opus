import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAed } from '@/lib/money';
import type { RateSegment } from '@/lib/mortgageEngine';

type ScheduleRow = { month: number; interest: number; principal: number; balance: number };

type Props = {
  schedule: ScheduleRow[];
  segments?: RateSegment[];
};

export function AmortizationChart({ schedule, segments }: Props) {
  const data = useMemo(() => {
    return schedule.map((row) => ({
      month: row.month,
      Interest: Math.round(row.interest),
      Principal: Math.round(row.principal),
      Balance: Math.round(row.balance),
    }));
  }, [schedule]);

  const transitionMonth = segments && segments.length > 1 ? segments[0].endMonth : undefined;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Amortization Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(m) => `${Math.ceil(m / 12)}y`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                color: 'hsl(var(--foreground))',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [formatAed(value), name]}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Area type="monotone" dataKey="Interest" stackId="1" stroke="hsl(0, 85%, 60%)" fill="hsl(0, 85%, 60%, 0.4)" />
            <Area type="monotone" dataKey="Principal" stackId="1" stroke="hsl(150, 70%, 45%)" fill="hsl(150, 70%, 45%, 0.4)" />
            {transitionMonth && (
              <ReferenceLine
                x={transitionMonth}
                stroke="hsl(var(--accent))"
                strokeDasharray="4 4"
                label={{ value: 'Rate change', fill: 'hsl(var(--accent))', fontSize: 11 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
