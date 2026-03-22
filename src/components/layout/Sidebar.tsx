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
  X,
  Bot,
  Megaphone,
  TrendingUp,
  FileSignature,
  Play,
  Calculator,
  ExternalLink,
  Home,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';
import { ThemeSelect } from './ThemeSelect';
import { DemoToggle } from './DemoToggle';

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
  group: string;
}

// Simplified navigation: 6 groups
// Dashboard | Marketing | Sales | Operations | Teams | Settings
const NAV_ITEMS: NavItem[] = [
  // === MANAGER ===
  // Dashboard
  { id: 'dashboard', label: 'Control Room', icon: LayoutDashboard, roles: ['Manager'], group: 'dashboard' },
  { id: 'ai-agent', label: 'Mi Ai', icon: Bot, roles: ['Manager'], group: 'dashboard' },
  
  // Marketing (Campaigns, Ads, Prospects)
  { id: 'marketing', label: 'Marketing Hub', icon: Megaphone, roles: ['Manager'], group: 'marketing' },
  { id: 'prospects', label: 'Prospects', icon: Users, roles: ['Manager'], group: 'marketing' },
  
  // Sales (Leads → Deals pipeline)
  { id: 'leads', label: 'Leads', icon: Users, roles: ['Manager'], group: 'sales' },
  { id: 'deals', label: 'Deals', icon: Handshake, roles: ['Manager'], group: 'sales' },
  
  // Operations (Listings, Documents, Commissions)
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Manager'], group: 'operations' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Manager'], group: 'operations' },
  
  { id: 'commissions', label: 'Commissions', icon: DollarSign, roles: ['Manager'], group: 'operations' },
  { id: 'mortgage-calc', label: 'Mortgage Calculator', icon: Calculator, roles: ['Manager', 'Broker'], group: 'operations' },
  
  // Teams (Internal collaboration)
  { id: 'meetings', label: 'Meetings', icon: Users, roles: ['Manager', 'Owner', 'Broker'], group: 'teams' },
  { id: 'directory', label: 'Team Directory', icon: Users, roles: ['Manager', 'Owner', 'Broker'], group: 'teams' },
  
  // Settings (Users, Templates, System)
  { id: 'users', label: 'Users', icon: Users, roles: ['Manager'], group: 'settings' },
  { id: 'templates', label: 'Rules & Templates', icon: FileText, roles: ['Manager'], group: 'settings' },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Manager'], group: 'settings' },

  // === OWNER (read-only access to everything) ===
  { id: 'oversight', label: 'Oversight', icon: LayoutDashboard, roles: ['Owner'], group: 'dashboard' },
  { id: 'approvals', label: 'Approvals', icon: FileText, roles: ['Owner'], group: 'operations' },
  { id: 'deals', label: 'Deals (View)', icon: Handshake, roles: ['Owner'], group: 'operations' },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Owner'], group: 'operations' },

  // === BROKER ===
  { id: 'my-day', label: 'My Day', icon: LayoutDashboard, roles: ['Broker'], group: 'dashboard' },
  { id: 'my-leads', label: 'My Leads', icon: Users, roles: ['Broker'], group: 'customers' },
  { id: 'my-deals', label: 'My Deals', icon: Handshake, roles: ['Broker'], group: 'customers' },
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Broker'], group: 'operations' },
  { id: 'my-earnings', label: 'My Earnings', icon: DollarSign, roles: ['Broker'], group: 'operations' },

  // === AGENT ===
  { id: 'investor-profile', label: 'Profile', icon: Users, roles: ['Agent'], group: 'dashboard' },
  { id: 'shortlists', label: 'Shortlists', icon: Building2, roles: ['Agent'], group: 'operations' },
  { id: 'deal-room', label: 'Deals Room', icon: Handshake, roles: ['Agent'], group: 'operations' },
  { id: 'investor-docs', label: 'Documents', icon: FileText, roles: ['Agent'], group: 'operations' },
];

const GROUP_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  marketing: { label: 'Marketing', icon: Megaphone },
  sales: { label: 'Sales', icon: TrendingUp },
  operations: { label: 'Operations', icon: Building2 },
  teams: { label: 'Teams', icon: Users },
  customers: { label: 'Customers', icon: Users },
  settings: { label: 'Settings', icon: Settings },
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ dashboard: true });

  const filteredItems = NAV_ITEMS.filter(item => 
    currentRole && item.roles.includes(currentRole)
  );

  // Group items - dedupe by id
  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = item.group;
    if (!acc[group]) acc[group] = [];
    if (!acc[group].find(i => i.id === item.id)) {
      acc[group].push(item);
    }
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Get active group
  const getActiveGroup = () => {
    for (const [group, items] of Object.entries(groupedItems)) {
      if (items.find(i => i.id === activeSection)) return group;
    }
    return 'dashboard';
  };

  const activeGroup = getActiveGroup();
  if (!openGroups[activeGroup]) {
    setOpenGroups(prev => ({ ...prev, [activeGroup]: true }));
  }

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const getRoleBadge = (role: AppRole | null) => {
    switch (role) {
      case 'Manager':
        return { label: 'Manager', className: 'bg-purple/20 text-purple border-purple/50' };
      case 'Owner':
        return { label: 'Owner', className: 'bg-emerald/20 text-emerald border-emerald/50' };
      case 'Broker':
        return { label: 'Broker', className: 'bg-cyan/20 text-cyan border-cyan/50' };
      case 'Agent':
        return { label: 'Agent', className: 'bg-amber-500/20 text-amber-500 border-amber-500/50' };
      default:
        return { label: 'Guest', className: 'bg-muted text-muted-foreground' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  // Order groups consistently
  const groupOrder = ['dashboard', 'marketing', 'sales', 'operations', 'teams', 'customers', 'settings'];
  const orderedGroups = groupOrder.filter(g => groupedItems[g]?.length > 0);

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
          'lg:relative lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]',
          'fixed top-0 left-0 w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            {collapsed ? (
              <MiCasaLogo 
                width={36} 
                height={36}
                useImage={false}
              />
            ) : (
              <MiCasaLogo 
                width={140} 
                height="auto"
                useImage={true}
                className="transition-all duration-300"
              />
            )}
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          {orderedGroups.map((group) => {
            const items = groupedItems[group];
            const groupInfo = GROUP_CONFIG[group];
            const isGroupOpen = openGroups[group] || false;
            const hasActiveItem = items.some(i => i.id === activeSection);
            const GroupIcon = groupInfo?.icon || LayoutDashboard;

            // Dashboard group - no collapsible wrapper
            if (group === 'dashboard') {
              return (
                <div key={group} className="mb-3">
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
                              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Other groups - collapsible
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
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className="w-4 h-4" />
                    {!collapsed && <span>{groupInfo?.label || group}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isGroupOpen && 'rotate-180')} />
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
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
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
            <div className="mb-3">
              <div className={cn('state-badge text-xs', roleBadge.className)}>
                {roleBadge.label}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-sidebar-foreground">
                {userName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userName || 'User'}</p>
                <button 
                  onClick={onSignOut}
                  className="text-xs text-sidebar-foreground/70 hover:text-destructive flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theme Select, Demo Toggle & Collapse - Desktop only */}
        <div className="hidden lg:block border-t border-sidebar-border p-2 space-y-1">
          {!collapsed && (
            <>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sidebar-foreground/70">
                <span className="text-sm">Theme</span>
                <ThemeSelect />
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sidebar-foreground/70">
                <span className="text-sm">Demo</span>
                <DemoToggle />
              </div>
            </>
          )}
          {collapsed && (
            <div className="flex flex-col items-center gap-2 py-2">
              <ThemeSelect collapsed />
              <DemoToggle />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
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
