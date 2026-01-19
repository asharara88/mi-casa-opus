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
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  UserPlus,
  X,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SidebarProps {
  currentRole: AppRole | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName: string;
  onSignOut?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: AppRole[];
  group?: string;
}

// Full navigation structure - consolidated for clarity
const NAV_ITEMS: NavItem[] = [
  // Operator Navigation
  { id: 'dashboard', label: 'Control Room', icon: LayoutDashboard, roles: ['Operator'], group: 'main' },
  
  // Customers: Prospects → Leads → Deals (sales funnel order)
  { id: 'prospects', label: 'Prospects', icon: UserPlus, roles: ['Operator'], group: 'customers' },
  { id: 'leads', label: 'Leads', icon: Users, roles: ['Operator'], group: 'customers' },
  { id: 'deals', label: 'Deals', icon: Handshake, roles: ['Operator'], group: 'customers' },
  
  // Properties
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Operator'], group: 'properties' },
  
  // Documents & Evidence
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Operator'], group: 'documents' },
  { id: 'signatures', label: 'Signatures', icon: PenTool, roles: ['Operator'], group: 'documents' },
  { id: 'evidence', label: 'Evidence', icon: Eye, roles: ['Operator'], group: 'documents' },
  
  // Finance
  { id: 'commissions', label: 'Commissions', icon: DollarSign, roles: ['Operator'], group: 'finance' },
  { id: 'payouts', label: 'Payouts', icon: Wallet, roles: ['Operator'], group: 'finance' },
  
  // Compliance & Admin
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, roles: ['Operator'], group: 'admin' },
  { id: 'exports', label: 'Exports', icon: Download, roles: ['Operator'], group: 'admin' },
  { id: 'templates', label: 'Rules & Templates', icon: FileStack, roles: ['Operator'], group: 'admin' },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, roles: ['Operator'], group: 'admin' },
  { id: 'users', label: 'Users', icon: UserCheck, roles: ['Operator'], group: 'admin' },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Operator'], group: 'admin' },

  // LegalOwner Navigation
  { id: 'oversight', label: 'Oversight Dashboard', icon: LayoutDashboard, roles: ['LegalOwner'], group: 'main' },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, roles: ['LegalOwner'], group: 'main' },
  { id: 'deals', label: 'Deals', icon: Handshake, roles: ['LegalOwner'], group: 'readonly' },
  { id: 'exports', label: 'Exports', icon: Download, roles: ['LegalOwner'], group: 'readonly' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['LegalOwner'], group: 'readonly' },

  // Broker Navigation
  { id: 'my-day', label: 'My Day', icon: Calendar, roles: ['Broker'], group: 'main' },
  { id: 'my-leads', label: 'My Leads', icon: Users, roles: ['Broker'], group: 'customers' },
  { id: 'my-deals', label: 'My Deals', icon: Handshake, roles: ['Broker'], group: 'customers' },
  { id: 'my-earnings', label: 'My Earnings', icon: DollarSign, roles: ['Broker'], group: 'finance' },
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Broker'], group: 'properties' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Broker'], group: 'documents' },

  // Investor Navigation
  { id: 'investor-profile', label: 'Profile', icon: UserCheck, roles: ['Investor'], group: 'main' },
  { id: 'shortlists', label: 'Shortlists', icon: Building2, roles: ['Investor'], group: 'properties' },
  { id: 'deal-room', label: 'Deals Room', icon: Briefcase, roles: ['Investor'], group: 'main' },
  { id: 'investor-docs', label: 'Documents', icon: FileText, roles: ['Investor'], group: 'documents' },
];

const GROUP_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  main: { label: 'Dashboard', icon: LayoutDashboard },
  customers: { label: 'Customers', icon: Users },
  properties: { label: 'Properties', icon: Building2 },
  documents: { label: 'Documents', icon: FileText },
  finance: { label: 'Finance', icon: DollarSign },
  admin: { label: 'Admin & Settings', icon: Settings },
  readonly: { label: 'View Only', icon: Eye },
};

export function Sidebar({ 
  currentRole, 
  activeSection, 
  onSectionChange, 
  userName, 
  onSignOut,
  isOpen = true,
  onClose 
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Initialize with main group open
    return { main: true };
  });

  const filteredItems = NAV_ITEMS.filter(item => 
    currentRole && item.roles.includes(currentRole)
  );

  // Group items
  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = item.group || 'main';
    if (!acc[group]) acc[group] = [];
    if (!acc[group].find(i => i.id === item.id)) {
      acc[group].push(item);
    }
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Check if current section is in a group
  const getActiveGroup = () => {
    for (const [group, items] of Object.entries(groupedItems)) {
      if (items.find(i => i.id === activeSection)) {
        return group;
      }
    }
    return 'main';
  };

  // Auto-open the group containing active section
  const activeGroup = getActiveGroup();
  if (!openGroups[activeGroup]) {
    setOpenGroups(prev => ({ ...prev, [activeGroup]: true }));
  }

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
    // Close mobile sidebar when selecting
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50',
          // Desktop
          'lg:relative lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          // Mobile - fixed position
          'fixed top-0 left-0 w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col animate-fade-in">
                <span className="font-semibold text-foreground text-sm">Mi Casa</span>
                <span className="text-xs text-foreground/70">Real Estate</span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          {Object.entries(groupedItems).map(([group, items]) => {
            const groupInfo = GROUP_LABELS[group];
            const isGroupOpen = openGroups[group] || false;
            const hasActiveItem = items.some(i => i.id === activeSection);
            const GroupIcon = groupInfo?.icon || LayoutDashboard;

            // For "main" group, don't use collapsible
            if (group === 'main') {
              return (
                <div key={group} className="mb-2">
                  <div className="space-y-1">
                    {items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionChange(item.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && (
                            <span className="animate-fade-in truncate">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // For other groups, use collapsible
            return (
              <Collapsible
                key={group}
                open={isGroupOpen}
                onOpenChange={() => toggleGroup(group)}
                className="mb-2"
              >
                <CollapsibleTrigger
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    hasActiveItem 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className="w-4 h-4" />
                    {!collapsed && <span>{groupInfo?.label || group}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown 
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isGroupOpen && 'rotate-180'
                      )} 
                    />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="animate-fade-in truncate">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
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

        {/* Collapse Toggle - Desktop only */}
        <div className="hidden lg:block border-t border-sidebar-border p-2">
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
    </>
  );
}