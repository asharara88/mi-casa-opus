import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      
      {/* Content overlay */}
      <foreignObject
        x={bottomLeft + 8}
        y={yOffset + 4}
        width={bottomRight - bottomLeft - 16}
        height={height - 8}
        style={{ pointerEvents: 'none' }}
      >
        <div className="h-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-foreground/80" />
            <span className="text-sm font-medium text-foreground truncate">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-foreground">
              <CountUp end={count} duration={1.5} delay={index * 0.1} />
            </span>
            {isClickable && (
              <ChevronRight className="w-4 h-4 text-foreground/60" />
            )}
          </div>
        </div>
      </foreignObject>
    </motion.g>
  );
}
