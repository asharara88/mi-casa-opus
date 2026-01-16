import { Plus, UserPlus, Home, FileText, DollarSign, Search, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AppRole } from '@/hooks/useAuth';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  section: string;
  roles: AppRole[];
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Dashboard', section: 'dashboard', roles: ['Operator', 'LegalOwner'] },
  { id: 'new-lead', icon: <UserPlus className="w-4 h-4" />, label: 'New Lead', section: 'leads', roles: ['Operator', 'Broker'] },
  { id: 'deals', icon: <FileText className="w-4 h-4" />, label: 'Deals', section: 'deals', roles: ['Operator', 'Broker'] },
  { id: 'prospects', icon: <Phone className="w-4 h-4" />, label: 'Prospects', section: 'prospects', roles: ['Operator', 'Broker'] },
  { id: 'commissions', icon: <DollarSign className="w-4 h-4" />, label: 'Commissions', section: 'commissions', roles: ['Operator', 'LegalOwner', 'Broker'] },
  { id: 'approvals', icon: <Search className="w-4 h-4" />, label: 'Approvals', section: 'approvals', roles: ['Operator', 'LegalOwner'] },
];

interface QuickAccessToolbarProps {
  currentRole: AppRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function QuickAccessToolbar({ currentRole, activeSection, onSectionChange }: QuickAccessToolbarProps) {
  const availableActions = QUICK_ACTIONS.filter(action => action.roles.includes(currentRole));

  if (availableActions.length === 0) return null;

  return (
    <div className="border-b border-border bg-card/30 px-4 py-2">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        <span className="text-xs text-muted-foreground mr-2 shrink-0 hidden sm:inline">Quick Access:</span>
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            {availableActions.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === action.section ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 gap-2 shrink-0 ${
                      activeSection === action.section 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => onSectionChange(action.section)}
                  >
                    {action.icon}
                    <span className="hidden md:inline text-xs">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="md:hidden">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
