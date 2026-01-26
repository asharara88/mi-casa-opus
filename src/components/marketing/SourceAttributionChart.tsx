import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SourceData {
  source: string;
  count: number;
}

interface SourceAttributionChartProps {
  data: SourceData[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
];

export function SourceAttributionChart({ data }: SourceAttributionChartProps) {
  const chartData = useMemo(() => {
    // Take top 8 sources and group the rest as "Other"
    const topSources = data.slice(0, 8);
    const otherCount = data.slice(8).reduce((sum, item) => sum + item.count, 0);
    
    const result = topSources.map(item => ({
      name: item.source,
      value: item.count,
    }));
    
    if (otherCount > 0) {
      result.push({ name: 'Other', value: otherCount });
    }
    
    return result;
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No prospect data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => 
              percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
            }
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              'Prospects'
            ]}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
