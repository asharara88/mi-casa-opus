import { Search, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import { useDemoMode } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNavigate?: (entityType: string, entityId: string) => void;
  onNewLead?: () => void;
}

export function Header({ title, subtitle, onMenuClick, onSearchClick, onNavigate, onNewLead }: HeaderProps) {
  const { isDemoMode } = useDemoMode();

  return (
    <header className={cn(
      "h-14 md:h-16 border-b border-border/50",
      "bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-xl",
      "flex items-center justify-between px-3 md:px-6 overflow-hidden"
    )}>
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-10 w-10 rounded-xl flex-shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Mobile: Show section title, Desktop: Show full title */}
        <div className="lg:hidden min-w-0 flex-shrink">
          <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        </div>
        
        <div className="hidden lg:block min-w-0 flex-shrink">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-foreground/60 truncate">{subtitle}</p>
          )}
        </div>
        
        {isDemoMode && (
          <Badge 
            variant="secondary" 
            className="bg-primary/10 text-primary border-primary/30 hidden sm:inline-flex flex-shrink-0 text-[10px] px-2 py-0.5"
          >
            Demo
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* New Lead shortcut */}
        {onNewLead && (
          <Button
            size="sm"
            onClick={onNewLead}
            className="rounded-full h-8 w-8 p-0 md:h-8 md:w-auto md:px-3 md:gap-1.5 shadow-sm"
            aria-label="New lead"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">New Lead</span>
          </Button>
        )}

        {/* Mobile Search Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-10 w-10 rounded-xl"
          onClick={onSearchClick}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Desktop Search */}
        <div className="relative w-48 md:w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-background/50 border-border/50 rounded-xl h-9"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 md:gap-1">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <NotificationBell onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  );
}
