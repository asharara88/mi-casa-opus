import { Search, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import { useDemoMode } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications/NotificationBell';

 interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
   onSearchClick?: () => void;
   onNavigate?: (entityType: string, entityId: string) => void;
}

 export function Header({ title, subtitle, onMenuClick, onSearchClick, onNavigate }: HeaderProps) {
  const { isDemoMode } = useDemoMode();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 overflow-hidden">
      <div className="flex items-center gap-3 min-w-0 flex-shrink">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden min-h-[44px] min-w-[44px] flex-shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="min-w-0 flex-shrink">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-foreground/65 hidden sm:block truncate">{subtitle}</p>
          )}
        </div>
        {isDemoMode && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 hidden sm:inline-flex flex-shrink-0">
            Demo Data
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">

        {/* Mobile Search Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden min-h-[44px] min-w-[44px]"
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
            className="pl-9 bg-background border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <ThemeToggle />
          <NotificationBell onNavigate={onNavigate} />
          <Button variant="ghost" size="icon" className="hidden sm:flex min-h-[44px] min-w-[44px]">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}