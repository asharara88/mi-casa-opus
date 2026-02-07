import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={showLabel ? 'sm' : 'icon'}
          onClick={toggleTheme}
          className={`transition-all duration-200 ${className}`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4" />
              {showLabel && <span className="ml-2">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              {showLabel && <span className="ml-2">Dark Mode</span>}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</p>
      </TooltipContent>
    </Tooltip>
  );
}
