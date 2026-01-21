import { useState, memo, useCallback } from 'react';
import { Home, Users, Handshake, FileText, Menu, Plus, UserPlus, Phone, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileBottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onMenuClick: () => void;
  onQuickAction?: (action: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'documents', label: 'Docs', icon: FileText },
] as const;

const QUICK_ACTIONS = [
  { id: 'add-lead', label: 'Add Lead', icon: UserPlus },
  { id: 'add-prospect', label: 'Add Prospect', icon: Users },
  { id: 'log-call', label: 'Log Call', icon: Phone },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
] as const;

function MobileBottomNavComponent({ 
  activeSection, 
  onSectionChange, 
  onMenuClick,
  onQuickAction
}: MobileBottomNavProps) {
  const isMobile = useIsMobile();
  const [fabOpen, setFabOpen] = useState(false);

  const handleNavClick = useCallback((id: string) => {
    onSectionChange(id);
  }, [onSectionChange]);

  const handleQuickAction = useCallback((actionId: string) => {
    setFabOpen(false);
    onQuickAction?.(actionId);
  }, [onQuickAction]);

  if (!isMobile) return null;

  return (
    <>
      {/* FAB Overlay */}
      {fabOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Quick Actions Menu */}
      {fabOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3 items-end animate-fade-in">
          {QUICK_ACTIONS.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full",
                  "bg-primary text-primary-foreground shadow-lg",
                  "transition-all duration-200 hover:scale-105 active:scale-95"
                )}
                style={{ 
                  animationDelay: `${idx * 50}ms`,
                  animation: 'slideUp 0.2s ease-out forwards'
                }}
              >
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Navigation Bar */}
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
        <div className="flex items-center justify-around h-16 px-2 relative">
          {/* Left Nav Items */}
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "min-w-[56px] min-h-[48px] px-2 py-2",
                  "rounded-xl transition-all duration-150 ease-out",
                  "touch-manipulation select-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive && [
                    "text-[hsl(var(--mobile-nav-foreground-active))]",
                    "bg-primary/10",
                    "scale-105"
                  ],
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
                <Icon className={cn("w-6 h-6 transition-transform duration-150", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("text-[11px] mt-1 font-medium leading-none", isActive && "font-semibold")}>{item.label}</span>
              </button>
            );
          })}

          {/* Center FAB Button */}
          <div className="relative -mt-6">
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className={cn(
                "w-14 h-14 rounded-full shadow-lg",
                "flex items-center justify-center",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                fabOpen 
                  ? "bg-destructive text-destructive-foreground rotate-45" 
                  : "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
              )}
              aria-label={fabOpen ? "Close quick actions" : "Open quick actions"}
            >
              {fabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>

          {/* Right Nav Items */}
          {NAV_ITEMS.slice(2, 4).map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "min-w-[56px] min-h-[48px] px-2 py-2",
                  "rounded-xl transition-all duration-150 ease-out",
                  "touch-manipulation select-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive && [
                    "text-[hsl(var(--mobile-nav-foreground-active))]",
                    "bg-primary/10",
                    "scale-105"
                  ],
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
                <Icon className={cn("w-6 h-6 transition-transform duration-150", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("text-[11px] mt-1 font-medium leading-none", isActive && "font-semibold")}>{item.label}</span>
              </button>
            );
          })}

          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[56px] min-h-[48px] px-2 py-2",
              "rounded-xl transition-all duration-150 ease-out",
              "touch-manipulation select-none",
              "text-[hsl(var(--mobile-nav-foreground))]",
              "hover:text-[hsl(var(--mobile-nav-foreground-active))]",
              "hover:bg-muted/50",
              "active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            aria-label="More options"
          >
            <Menu className="w-6 h-6" strokeWidth={2} />
            <span className="text-[11px] mt-1 font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* CSS for animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export const MobileBottomNav = memo(MobileBottomNavComponent);