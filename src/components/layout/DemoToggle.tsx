import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function DemoToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDemoMode}
            className={cn(
              'h-8 w-8 transition-all duration-300',
              isDemoMode && 'text-primary'
            )}
          >
            {isDemoMode ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isDemoMode
              ? 'Exit demo mode and return to live data'
              : 'Enable demo mode to showcase BOS capabilities with sample data'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
