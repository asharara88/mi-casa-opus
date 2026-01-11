import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
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
    <div className={cn('metric-card', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label">{label}</p>
          <p className={cn('metric-value mt-1', variant === 'gold' && 'text-gradient-gold')}>
            {value}
          </p>
          {change && (
            <p className={cn('text-xs mt-1', changeStyles[change.type])}>
              {change.type === 'increase' && '+'}
              {change.value}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
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
