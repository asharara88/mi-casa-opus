export function FunnelGradients() {
  return (
    <defs>
      {/* Prospects - Teal gradient */}
      <linearGradient id="funnel-gradient-prospects" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.7" />
      </linearGradient>
      
      {/* Leads - Green gradient */}
      <linearGradient id="funnel-gradient-leads" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity="0.7" />
      </linearGradient>
      
      {/* Qualified - Cyan gradient */}
      <linearGradient id="funnel-gradient-qualified" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity="0.7" />
      </linearGradient>
      
      {/* Deals - Lime gradient */}
      <linearGradient id="funnel-gradient-deals" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity="0.7" />
      </linearGradient>
      
      {/* Won - Gold gradient */}
      <linearGradient id="funnel-gradient-won" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.7" />
      </linearGradient>

      {/* Glow filter */}
      <filter id="funnel-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}
