import { useState, memo, useCallback } from 'react';
import { Home, Users, Handshake, FileText, Menu, Plus, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileQuickActionsSheet } from './MobileQuickActionsSheet';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'ai-agent', label: 'Mi AI', icon: Bot },
] as const;

function MobileBottomNavComponent({ 
  activeSection, 
  onSectionChange, 
  onMenuClick,
  onQuickAction
}: MobileBottomNavProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleNavClick = useCallback((id: string) => {
    onSectionChange(id);
  }, [onSectionChange]);

  const handleQuickAction = useCallback((actionId: string) => {
    onQuickAction?.(actionId);
  }, [onQuickAction]);

  if (!isMobile) return null;

  return (
    <>
      {/* Quick Actions Sheet */}
      <MobileQuickActionsSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={handleQuickAction}
      />

      {/* Main Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
          "bg-gradient-to-t from-[hsl(var(--mobile-nav-background))] to-[hsl(var(--mobile-nav-background)/0.95)]",
          "border-t border-[hsl(var(--mobile-nav-border)/0.5)]",
          "backdrop-blur-2xl",
          "will-change-transform"
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Glow effect for active section */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="flex items-center h-[68px] px-1 relative">
          {/* Left Nav Items */}
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            
            return (
              <NavButton
                key={item.id}
                isActive={isActive}
                onClick={() => handleNavClick(item.id)}
                label={item.label}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              </NavButton>
            );
          })}

          {/* Center FAB Button */}
          <div className="flex-1 flex justify-center -mt-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSheetOpen(true)}
              className={cn(
                "w-14 h-14 rounded-2xl",
                "bg-gradient-to-br from-primary to-primary/80",
                "flex items-center justify-center",
                "shadow-lg shadow-primary/30",
                "border border-primary/50",
                "transition-all duration-200"
              )}
              aria-label="Open quick actions"
            >
              <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Right Nav Items */}
          {NAV_ITEMS.slice(2, 4).map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            
            return (
              <NavButton
                key={item.id}
                isActive={isActive}
                onClick={() => handleNavClick(item.id)}
                label={item.label}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              </NavButton>
            );
          })}

          {/* Menu Button */}
          <NavButton
            isActive={false}
            onClick={onMenuClick}
            label="More"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </NavButton>
        </div>
      </nav>
    </>
  );
}

interface NavButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function NavButton({ isActive, onClick, label, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1",
        "min-h-[56px] py-2 mx-0.5",
        "rounded-xl transition-all duration-200 ease-out",
        "touch-manipulation select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      )}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <motion.div
        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          "p-1.5 rounded-xl transition-colors duration-200",
          isActive 
            ? "bg-primary/15 text-primary" 
            : "text-[hsl(var(--mobile-nav-foreground))]"
        )}
      >
        {children}
      </motion.div>
      <span 
        className={cn(
          "text-[10px] font-medium transition-colors duration-200",
          isActive 
            ? "text-primary" 
            : "text-[hsl(var(--mobile-nav-foreground))]"
        )}
      >
        {label}
      </span>
      
      {/* Active indicator dot */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary"
          />
        )}
      </AnimatePresence>
    </button>
  );
}

export const MobileBottomNav = memo(MobileBottomNavComponent);
