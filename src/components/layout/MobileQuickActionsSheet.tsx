import { memo } from 'react';
import { UserPlus, Users, Phone, Calendar, Building2, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: 'add-lead', 
    label: 'New Lead', 
    description: 'Add a qualified lead',
    icon: UserPlus, 
    color: 'bg-emerald/10 text-emerald border-emerald/30' 
  },
  { 
    id: 'add-prospect', 
    label: 'New Prospect', 
    description: 'Add to marketing pool',
    icon: Users, 
    color: 'bg-cyan/10 text-cyan border-cyan/30' 
  },
  { 
    id: 'add-listing', 
    label: 'New Listing', 
    description: 'Add property listing',
    icon: Building2, 
    color: 'bg-purple/10 text-purple border-purple/30' 
  },
  { 
    id: 'log-call', 
    label: 'Log Call', 
    description: 'Record a call activity',
    icon: Phone, 
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
  },
  { 
    id: 'schedule', 
    label: 'Schedule Viewing', 
    description: 'Book a property viewing',
    icon: Calendar, 
    color: 'bg-primary/10 text-primary border-primary/30' 
  },
  { 
    id: 'new-document', 
    label: 'New Document', 
    description: 'Generate from template',
    icon: FileText, 
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
  },
];

interface MobileQuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
}

function MobileQuickActionsSheetComponent({ 
  isOpen, 
  onClose, 
  onAction 
}: MobileQuickActionsSheetProps) {
  const handleAction = (actionId: string) => {
    onAction(actionId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-card/95 backdrop-blur-xl",
              "border-t border-border/50",
              "rounded-t-3xl shadow-2xl"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <p className="text-xs text-muted-foreground">What would you like to do?</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="px-4 pb-6">
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleAction(action.id)}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-2xl",
                        "border transition-all duration-200",
                        "active:scale-[0.98] touch-manipulation",
                        action.color,
                        "hover:shadow-md"
                      )}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="font-medium text-sm">{action.label}</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{action.description}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const MobileQuickActionsSheet = memo(MobileQuickActionsSheetComponent);
