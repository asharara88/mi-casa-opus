export function FunnelGradients() {
  return (
    <defs>
      {/* Prospects - Deep Teal gradient */}
      <linearGradient id="funnel-gradient-prospects" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(173 58% 35%)" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(173 58% 28%)" stopOpacity="1" />
      </linearGradient>
      
      {/* Leads - Deep Green gradient */}
      <linearGradient id="funnel-gradient-leads" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(160 60% 35%)" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(160 60% 28%)" stopOpacity="1" />
      </linearGradient>
      
      {/* Qualified - Deep Amber/Orange gradient for contrast */}
      <linearGradient id="funnel-gradient-qualified" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(35 80% 45%)" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(30 80% 38%)" stopOpacity="1" />
      </linearGradient>
      
      {/* Deals - Deep Coral/Rose gradient */}
      <linearGradient id="funnel-gradient-deals" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(350 65% 45%)" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(350 65% 38%)" stopOpacity="1" />
      </linearGradient>
      
      {/* Won - Deep Gold gradient */}
      <linearGradient id="funnel-gradient-won" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(43 80% 42%)" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(40 80% 35%)" stopOpacity="1" />
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
