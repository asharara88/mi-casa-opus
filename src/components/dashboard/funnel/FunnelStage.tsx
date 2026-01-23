import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { ChevronRight } from 'lucide-react';

interface FunnelStageProps {
  label: string;
  count: number;
  icon: React.ElementType;
  gradientId: string;
  topWidth: number;
  bottomWidth: number;
  height: number;
  yOffset: number;
  index: number;
  isClickable: boolean;
  onClick: () => void;
}

export function FunnelStage({
  label,
  count,
  icon: Icon,
  gradientId,
  topWidth,
  bottomWidth,
  height,
  yOffset,
  index,
  isClickable,
  onClick,
}: FunnelStageProps) {
  const centerX = 200; // SVG viewBox center
  
  // Calculate trapezoid points
  const topLeft = centerX - topWidth / 2;
  const topRight = centerX + topWidth / 2;
  const bottomLeft = centerX - bottomWidth / 2;
  const bottomRight = centerX + bottomWidth / 2;
  
  const path = `
    M ${topLeft} ${yOffset}
    L ${topRight} ${yOffset}
    L ${bottomRight} ${yOffset + height}
    L ${bottomLeft} ${yOffset + height}
    Z
  `;

  // Calculate content area - use the narrower bottom width for safe text area
  const contentWidth = bottomRight - bottomLeft - 16;
  const contentX = bottomLeft + 8;

  return (
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      className="cursor-pointer"
      onClick={onClick}
      style={{ pointerEvents: isClickable ? 'auto' : 'none' }}
    >
      {/* Trapezoid shape */}
      <motion.path
        d={path}
        fill={`url(#${gradientId})`}
        stroke="hsl(var(--border))"
        strokeWidth="1"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ 
          scale: 1.02, 
          filter: 'brightness(1.15)',
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
        style={{ 
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          transformOrigin: 'center',
        }}
      />
      
      {/* Content overlay - centered in trapezoid */}
      <foreignObject
        x={contentX}
        y={yOffset + 2}
        width={contentWidth}
        height={height - 4}
        style={{ pointerEvents: 'none', overflow: 'visible' }}
      >
        <div className="h-full flex items-center justify-between px-1 sm:px-2 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-foreground/80 shrink-0" />
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground truncate">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <span className="text-sm sm:text-base md:text-lg font-bold text-foreground tabular-nums">
              <CountUp end={count} duration={1.5} delay={index * 0.1} />
            </span>
            {isClickable && (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-foreground/60" />
            )}
          </div>
        </div>
      </foreignObject>
    </motion.g>
  );
}
