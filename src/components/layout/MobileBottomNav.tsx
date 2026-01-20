import { Home, Users, Handshake, FileText, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { memo, useCallback } from 'react';

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
] as const;

export const MobileBottomNav = memo(function MobileBottomNav({ 
  activeSection, 
  onSectionChange, 
  onMenuClick 
}: MobileBottomNavProps) {
  const isMobile = useIsMobile();

  const handleNavClick = useCallback((id: string) => {
    if (id === 'menu') {
      onMenuClick();
    } else {
      onSectionChange(id);
    }
  }, [onMenuClick, onSectionChange]);

  if (!isMobile) return null;

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-[hsl(var(--mobile-nav-background))]",
        "border-t border-[hsl(var(--mobile-nav-border))]",
        "backdrop-blur-lg bg-opacity-95",
        "will-change-transform"
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id !== 'menu' && activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                // Base styles - larger touch target
                "flex flex-col items-center justify-center",
                "min-w-[56px] min-h-[48px] px-2 py-2",
                "rounded-xl transition-all duration-150 ease-out",
                "touch-manipulation select-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                // Active state - prominent with background
                isActive && [
                  "text-[hsl(var(--mobile-nav-foreground-active))]",
                  "bg-primary/10",
                  "scale-105"
                ],
                // Inactive state - clear but subdued
                !isActive && [
                  "text-[hsl(var(--mobile-nav-foreground))]",
                  "hover:text-[hsl(var(--mobile-nav-foreground-active))]",
                  "hover:bg-muted/50",
                  "active:scale-95"
                ]
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-transform duration-150",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={cn(
                  "text-[11px] mt-1 font-medium leading-none",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
