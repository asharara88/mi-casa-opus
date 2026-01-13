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
            variant={isDemoMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleDemoMode}
            className={cn(
              'gap-2 transition-all duration-300',
              isDemoMode && 'bg-primary text-primary-foreground animate-pulse'
            )}
          >
            {isDemoMode ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Demo</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Demo Mode</span>
              </>
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
