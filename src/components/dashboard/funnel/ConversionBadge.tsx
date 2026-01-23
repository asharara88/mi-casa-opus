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
        x={155}
        y={yPosition}
        width={90}
        height={24}
      >
        <motion.div 
          className={cn(
            "h-full flex items-center justify-center gap-1 rounded-full border text-xs font-semibold",
            getColorClass(rate)
          )}
          style={{
            boxShadow: `0 0 12px ${getGlowColor(rate)}`,
          }}
          whileHover={{ scale: 1.05 }}
          animate={rate < 10 ? {
            boxShadow: [
              `0 0 12px ${getGlowColor(rate)}`,
              `0 0 20px ${getGlowColor(rate)}`,
              `0 0 12px ${getGlowColor(rate)}`,
            ],
          } : {}}
          transition={rate < 10 ? {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          } : {}}
        >
          <ArrowDown className="w-3 h-3" />
          <span>{rate.toFixed(1)}%</span>
        </motion.div>
      </foreignObject>
    </motion.g>
  );
}
