import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusData {
  not_contacted?: number;
  contacted?: number;
  follow_up?: number;
  interested?: number;
  qualified?: number;
  not_interested?: number;
  converted?: number;
}

interface ProspectStatusChartProps {
  byStatus: StatusData | Record<string, number>;
}

const STATUS_CONFIG = [
  { key: 'not_contacted', label: 'Not Contacted', color: 'hsl(var(--muted-foreground))' },
  { key: 'contacted', label: 'Contacted', color: 'hsl(280, 70%, 60%)' },
  { key: 'follow_up', label: 'Follow Up', color: 'hsl(45, 90%, 55%)' },
  { key: 'interested', label: 'Interested', color: 'hsl(200, 80%, 55%)' },
  { key: 'qualified', label: 'Qualified', color: 'hsl(160, 70%, 45%)' },
  { key: 'not_interested', label: 'Not Interested', color: 'hsl(0, 65%, 55%)' },
  { key: 'converted', label: 'Converted', color: 'hsl(142, 70%, 45%)' },
];

export function ProspectStatusChart({ byStatus }: ProspectStatusChartProps) {
  const chartData = useMemo(() => {
    return STATUS_CONFIG
      .map(({ key, label, color }) => ({
        name: label,
        value: (byStatus as Record<string, number>)[key] || 0,
        color,
      }))
      .filter(item => item.value > 0);
  }, [byStatus]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  name,
                ]}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => (
                  <span className="text-muted-foreground text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
