import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number | React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: LucideIcon;
  variant?: 'default' | 'gold' | 'success' | 'warning';
}

export function MetricCard({ label, value, change, icon: Icon, variant = 'default' }: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    gold: 'border-primary/30 shadow-gold',
    success: 'border-emerald/30',
    warning: 'border-amber-500/30',
  };

  const changeStyles = {
    increase: 'text-emerald',
    decrease: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('metric-card p-4 sm:p-5', variantStyles[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="metric-label">{label}</p>
          <p className={cn('metric-value mt-2', variant === 'gold' && 'text-gradient-gold')}>
            {value}
          </p>
          {change && (
            <p className={cn('text-xs mt-1.5', changeStyles[change.type])}>
              {change.type === 'increase' && '+'}
              {change.value}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            variant === 'gold' ? 'bg-primary/20' : 'bg-muted'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              variant === 'gold' ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
