import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Loader2, 
  UserPlus, 
  Handshake,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickConvertButtonProps {
  type: 'prospect-to-lead' | 'lead-to-deal';
  onConvert: () => Promise<void>;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function QuickConvertButton({ 
  type, 
  onConvert, 
  disabled,
  className,
  'data-testid': testId
}: QuickConvertButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    if (isConverting || isSuccess || disabled) return;
    
    setIsConverting(true);
    try {
      await onConvert();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const config = type === 'prospect-to-lead' 
    ? {
        icon: UserPlus,
        label: 'Convert to Lead',
        successLabel: 'Converted!',
        bgColor: 'bg-chart-2 hover:bg-chart-2/90',
        successBg: 'bg-emerald',
      }
    : {
        icon: Handshake,
        label: 'Convert to Deal',
        successLabel: 'Deal Created!',
        bgColor: 'bg-gold hover:bg-gold/90',
        successBg: 'bg-emerald',
      };

  const Icon = config.icon;

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isConverting}
      data-testid={testId}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isSuccess ? config.successBg : config.bgColor,
        "text-primary-foreground font-medium",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isConverting ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Converting...</span>
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{config.successLabel}</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
