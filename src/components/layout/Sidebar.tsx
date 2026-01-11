import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/bos';
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
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Operator', 'LegalOwner', 'Broker'] },
  { id: 'leads', label: 'Leads', icon: Users, roles: ['Operator', 'Broker'] },
  { id: 'deals', label: 'Deals', icon: Handshake, roles: ['Operator', 'LegalOwner', 'Broker'] },
  { id: 'listings', label: 'Listings', icon: Building2, roles: ['Operator', 'Broker'] },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['Operator', 'LegalOwner'] },
  { id: 'commissions', label: 'Commissions', icon: DollarSign, roles: ['Operator', 'Broker'] },
  { id: 'compliance', label: 'Compliance', icon: Shield, roles: ['Operator', 'LegalOwner'] },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, roles: ['Operator'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Operator'] },
];

export function Sidebar({ currentRole, activeSection, onSectionChange, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(currentRole));

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Operator':
        return { label: 'Operator', className: 'bg-purple/20 text-purple border-purple/50' };
      case 'LegalOwner':
        return { label: 'Legal Owner', className: 'bg-emerald/20 text-emerald border-emerald/50' };
      case 'Broker':
        return { label: 'Broker', className: 'bg-cyan/20 text-cyan border-cyan/50' };
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
        <div className="space-y-1">
          {filteredItems.map(item => {
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
                  <span className="animate-fade-in">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
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
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">View Profile</p>
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
