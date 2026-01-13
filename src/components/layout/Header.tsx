import { Bell, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DemoToggle } from './DemoToggle';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { role } = useAuth();
  const { isDemoMode } = useDemoMode();
  const canAccessDemo = role === 'Operator' || role === 'LegalOwner';

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {isDemoMode && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            Demo Data
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Demo Toggle - Only for Operator/Admin */}
        {canAccessDemo && <DemoToggle />}

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-background border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
