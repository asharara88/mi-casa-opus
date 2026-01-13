import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AppRole } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  FileText,
  DollarSign,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  PenTool,
  Eye,
  ClipboardCheck,
  Download,
  FileStack,
  Briefcase,
  Calendar,
  UserCheck,
  Wallet,
} from 'lucide-react';

interface SidebarProps {
  currentRole: AppRole | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName: string;
  onSignOut?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: AppRole[];
  group?: string;
}

// Full navigation structure per BOS spec
const NAV_ITEMS: NavItem[] = [
  // Operator Navigation
  { id: 'dashboard', label: 'Control Room', icon: LayoutDashboard, roles: ['Operator'], group: 'main' },
  { id: 'leads', label: 'Leads', icon: Users, roles: ['Operator'], group: 'operations' },
  { id: 'deals', label: 'Deals', icon: Handshake, roles: ['Operator'], group: 'operations' },
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Operator'], group: 'operations' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Operator'], group: 'documents' },
  { id: 'signatures', label: 'Signatures', icon: PenTool, roles: ['Operator'], group: 'documents' },
  { id: 'evidence', label: 'Evidence', icon: Eye, roles: ['Operator'], group: 'documents' },
  { id: 'commissions', label: 'Commissions', icon: DollarSign, roles: ['Operator'], group: 'finance' },
  { id: 'payouts', label: 'Payouts', icon: Wallet, roles: ['Operator'], group: 'finance' },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, roles: ['Operator'], group: 'compliance' },
  { id: 'exports', label: 'Exports', icon: Download, roles: ['Operator'], group: 'compliance' },
  { id: 'templates', label: 'Rules & Templates', icon: FileStack, roles: ['Operator'], group: 'system' },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, roles: ['Operator'], group: 'system' },
  { id: 'users', label: 'Users', icon: UserCheck, roles: ['Operator'], group: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Operator'], group: 'system' },

  // LegalOwner Navigation
  { id: 'oversight', label: 'Oversight Dashboard', icon: LayoutDashboard, roles: ['LegalOwner'], group: 'main' },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, roles: ['LegalOwner'], group: 'main' },
  { id: 'deals', label: 'Deals', icon: Handshake, roles: ['LegalOwner'], group: 'readonly' },
  { id: 'exports', label: 'Exports', icon: Download, roles: ['LegalOwner'], group: 'readonly' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['LegalOwner'], group: 'readonly' },

  // Broker Navigation
  { id: 'my-day', label: 'My Day', icon: Calendar, roles: ['Broker'], group: 'main' },
  { id: 'my-leads', label: 'My Leads', icon: Users, roles: ['Broker'], group: 'main' },
  { id: 'my-deals', label: 'My Deals', icon: Handshake, roles: ['Broker'], group: 'main' },
  { id: 'my-earnings', label: 'My Earnings', icon: DollarSign, roles: ['Broker'], group: 'main' },
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Broker'], group: 'readonly' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Broker'], group: 'readonly' },

  // Investor Navigation
  { id: 'investor-profile', label: 'Profile', icon: UserCheck, roles: ['Investor'], group: 'main' },
  { id: 'shortlists', label: 'Shortlists', icon: Building2, roles: ['Investor'], group: 'main' },
  { id: 'deal-room', label: 'Deals Room', icon: Briefcase, roles: ['Investor'], group: 'main' },
  { id: 'investor-docs', label: 'Documents', icon: FileText, roles: ['Investor'], group: 'main' },
];

const GROUP_LABELS: Record<string, string> = {
  main: '',
  operations: 'Operations',
  documents: 'Documents & Evidence',
  finance: 'Finance',
  compliance: 'Compliance',
  system: 'System',
  readonly: 'Read Only',
};

export function Sidebar({ currentRole, activeSection, onSectionChange, userName, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false); // false = expanded by default

  const filteredItems = NAV_ITEMS.filter(item => 
    currentRole && item.roles.includes(currentRole)
  );

  // Group items
  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = item.group || 'main';
    if (!acc[group]) acc[group] = [];
    // Avoid duplicates (e.g., 'deals' appears for multiple roles)
    if (!acc[group].find(i => i.id === item.id)) {
      acc[group].push(item);
    }
    return acc;
  }, {} as Record<string, NavItem[]>);

  const getRoleBadge = (role: AppRole | null) => {
    switch (role) {
      case 'Operator':
        return { label: 'Operator', className: 'bg-purple/20 text-purple border-purple/50' };
      case 'LegalOwner':
        return { label: 'Legal Owner', className: 'bg-emerald/20 text-emerald border-emerald/50' };
      case 'Broker':
        return { label: 'Broker', className: 'bg-cyan/20 text-cyan border-cyan/50' };
      case 'Investor':
        return { label: 'Investor', className: 'bg-amber-500/20 text-amber-500 border-amber-500/50' };
      default:
        return { label: 'Guest', className: 'bg-muted text-muted-foreground' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="font-semibold text-foreground text-sm">Mi Casa</span>
            <span className="text-xs text-muted-foreground">Real Estate</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && GROUP_LABELS[group] && (
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {GROUP_LABELS[group]}
              </div>
            )}
            <div className="space-y-1">
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                    {!collapsed && (
                      <span className="animate-fade-in truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Role */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-3 animate-fade-in">
            <div className={cn('state-badge text-xs', roleBadge.className)}>
              {roleBadge.label}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-foreground">
              {userName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-foreground truncate">{userName || 'User'}</p>
              <button 
                onClick={onSignOut}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
