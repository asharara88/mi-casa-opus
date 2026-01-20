import { Home, Users, Handshake, FileText, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileBottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onMenuClick: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'menu', label: 'More', icon: Menu },
];

export function MobileBottomNav({ 
  activeSection, 
  onSectionChange, 
  onMenuClick 
}: MobileBottomNavProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleNavClick = (id: string) => {
    if (id === 'menu') {
      onMenuClick();
    } else {
      onSectionChange(id);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id !== 'menu' && activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1.5 rounded-lg transition-colors touch-manipulation",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
