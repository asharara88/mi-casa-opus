import { Bell, Search, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DemoToggle } from './DemoToggle';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { role } = useAuth();
  const { isDemoMode } = useDemoMode();
  const canAccessDemo = role === 'Operator' || role === 'LegalOwner';

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
          )}
        </div>
        {isDemoMode && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 hidden sm:inline-flex">
            Demo Data
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Demo Toggle - Only for Operator/Admin */}
        {canAccessDemo && <DemoToggle />}

        {/* Search - Hidden on mobile */}
        <div className="relative w-48 md:w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-background border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}