import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ThemeSelectProps {
  className?: string;
  collapsed?: boolean;
}

export function ThemeSelect({ className = '', collapsed = false }: ThemeSelectProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'Auto', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  if (collapsed) {
    return (
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger className={cn('w-8 h-8 p-0 border-0 bg-transparent', className)}>
          <CurrentIcon className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className={cn('w-24 h-8 text-xs bg-sidebar-accent border-sidebar-border', className)}>
        <SelectValue>
          <div className="flex items-center gap-1.5">
            <CurrentIcon className="h-3.5 w-3.5" />
            <span>{currentTheme.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border border-border z-50">
        {themes.map(({ value, label, icon: Icon }) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
