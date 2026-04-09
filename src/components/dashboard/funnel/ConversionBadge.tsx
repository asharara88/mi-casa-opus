import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionBadgeProps {
  rate: number;
  yPosition: number;
  index: number;
}

export function ConversionBadge({ rate, yPosition, index }: ConversionBadgeProps) {
  const getColorClass = (rate: number) => {
    if (rate > 30) return 'bg-emerald/20 text-emerald border-emerald/30';
    if (rate > 10) return 'bg-gold/20 text-gold border-gold/30';
    return 'bg-coral/20 text-coral border-coral/30';
  };

  const getGlowColor = (rate: number) => {
    if (rate > 30) return 'rgba(34, 197, 94, 0.3)';
    if (rate > 10) return 'rgba(234, 179, 8, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  };

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
    >
      <foreignObject
        x={160}
        y={yPosition}
        width={80}
        height={20}
        style={{ overflow: 'visible' }}
      >
        <motion.div 
          className={cn(
            "h-full flex items-center justify-center gap-0.5 rounded-full border text-[10px] sm:text-xs font-semibold px-1.5",
            getColorClass(rate)
          )}
          style={{
            boxShadow: `0 0 8px ${getGlowColor(rate)}`,
          }}
          whileHover={{ scale: 1.05 }}
          animate={rate < 10 ? {
            boxShadow: [
              `0 0 8px ${getGlowColor(rate)}`,
              `0 0 16px ${getGlowColor(rate)}`,
              `0 0 8px ${getGlowColor(rate)}`,
            ],
          } : {}}
          transition={rate < 10 ? {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          } : {}}
        >
          <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{rate.toFixed(0)}%</span>
        </motion.div>
      </foreignObject>
    </motion.g>
  );
}
