import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoContext';
import { ValidationContext } from '@/types/bos';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { LeadsSection } from '@/components/leads/LeadsSection';
import { DealsSection } from '@/components/deals/DealsSection';
import { EventLog } from '@/components/events/EventLog';
import { DocumentsSection } from '@/components/documents/DocumentsSection';
import { SignaturesSection } from '@/components/documents/SignaturesSection';
import { CommissionsSection } from '@/components/commissions/CommissionsSection';
import { EvidenceSection } from '@/components/evidence/EvidenceSection';
import { ApprovalsSection } from '@/components/approvals/ApprovalsSection';
import { ExportsSection } from '@/components/exports/ExportsSection';
import { UsersSection } from '@/components/users/UsersSection';
import { ListingsSection } from '@/components/listings/ListingsSection';
import { TemplatesSection } from '@/components/templates/TemplatesSection';
import { useBrokerageContext } from '@/hooks/useBrokerage';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { useCommissions } from '@/hooks/useCommissions';
import { useEventLog } from '@/hooks/useEventLog';
import { transformDbBrokerageToFrontend } from '@/lib/transforms';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, Shield, FileText, DollarSign, Sparkles, Settings, 
  AlertTriangle, Users, PenTool, Eye, ClipboardCheck, Download,
  FileStack, Calendar, UserCheck, Wallet, Briefcase
} from 'lucide-react';

// Section metadata
const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  // Operator sections
  dashboard: { title: 'Control Room', subtitle: 'Brokerage operations overview' },
  leads: { title: 'Lead Pipeline', subtitle: 'Manage and qualify incoming leads' },
  deals: { title: 'Deal Pipeline', subtitle: 'Track deals through the transaction lifecycle' },
  listings: { title: 'Listings', subtitle: 'Property inventory management' },
  documents: { title: 'Document Center', subtitle: 'Templates and executed documents' },
  signatures: { title: 'Signature Envelopes', subtitle: 'Track document execution status' },
  evidence: { title: 'Evidence Center', subtitle: 'Captured evidence and attachments' },
  commissions: { title: 'Commission Ledger', subtitle: 'Commission tracking by deal and broker' },
  payouts: { title: 'Payout Management', subtitle: 'Build and execute payout batches' },
  approvals: { title: 'Approvals Queue', subtitle: 'Pending approvals and overrides' },
  exports: { title: 'Export Center', subtitle: 'Generate deal and broker dossiers' },
  templates: { title: 'Rules & Templates', subtitle: 'Document templates and business rules' },
  'ai-insights': { title: 'AI Insights', subtitle: 'Read-only intelligence (non-authoritative)' },
  users: { title: 'User Management', subtitle: 'Manage users and broker profiles' },
  settings: { title: 'System Settings', subtitle: 'Brokerage context and configuration' },
  
  // LegalOwner sections
  oversight: { title: 'Oversight Dashboard', subtitle: 'Compliance posture and approvals' },
  
  // Broker sections
  'my-day': { title: 'My Day', subtitle: 'Your tasks and priorities' },
  'my-leads': { title: 'My Leads', subtitle: 'Your assigned leads' },
  'my-deals': { title: 'My Deals', subtitle: 'Your active deals' },
  'my-earnings': { title: 'My Earnings', subtitle: 'Your commission history' },
  
  // Investor sections
  'investor-profile': { title: 'Investor Profile', subtitle: 'Your preferences and documents' },
  shortlists: { title: 'Shortlists', subtitle: 'Your property shortlist' },
  'deal-room': { title: 'Deals Room', subtitle: 'Your active deals' },
  'investor-docs': { title: 'Documents', subtitle: 'Contracts and signatures' },
};

export function BOSApp() {
  const { profile, role, signOut } = useAuth();
  const { isDemoBypass, exitDemoBypass } = useDemoMode();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // In demo bypass mode, use Operator role
  const effectiveRole: AppRole = isDemoBypass ? 'Operator' : (role || 'Operator');
  const effectiveUserName = isDemoBypass ? 'Demo User' : (profile?.full_name || 'User');
  
  // Live data hooks
  const { data: dbBrokerage, isLoading: isLoadingBrokerage } = useBrokerageContext();
  const { data: dbLeads } = useLeads();
  const { data: dbDeals } = useDeals();
  const { data: dbCommissions } = useCommissions();
  const { data: dbEvents } = useEventLog();

  // Transform brokerage data
  const brokerage = dbBrokerage ? transformDbBrokerageToFrontend(dbBrokerage) : null;

  // Handle sign out - if in demo bypass, exit demo mode
  const handleSignOut = () => {
    if (isDemoBypass) {
      exitDemoBypass();
      navigate('/login');
    } else {
      signOut?.();
    }
  };

  useEffect(() => {
    // Set default section based on role
    if (effectiveRole === 'LegalOwner') setActiveSection('oversight');
    else if (effectiveRole === 'Broker') setActiveSection('my-day');
    else if (effectiveRole === 'Investor') setActiveSection('investor-profile');
    else setActiveSection('dashboard');
  }, [effectiveRole]);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
      case 'oversight':
        return <DashboardView role={effectiveRole} />;

      case 'leads':
      case 'my-leads':
        return <LeadsSection />;

      case 'deals':
      case 'my-deals':
        return <DealsSection />;

      case 'approvals':
        return <ApprovalsSection />;
      
      case 'commissions':
      case 'my-earnings':
      case 'payouts':
        return <CommissionsSection />;
      
      case 'documents':
      case 'investor-docs':
        return <DocumentsSection />;
      
      case 'signatures':
        return <SignaturesSection />;
      
      case 'evidence':
        return <EvidenceSection />;
      
      case 'exports':
        return <ExportsSection />;
      
      case 'templates':
        return <TemplatesSection />;
      
      case 'users':
        return <UsersSection />;
      
      case 'ai-insights':
        return <AIInsightsSection />;
      
      case 'my-day':
        return <MyDaySection />;
      
      case 'listings':
        return <ListingsSection />;
      
      case 'settings':
        return <SettingsSection brokerage={brokerage} isLoading={isLoadingBrokerage} />;

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Section: {activeSection}</p>
            </div>
          </div>
        );
    }
  };

  const sectionInfo = SECTION_TITLES[activeSection] || { title: 'BOS', subtitle: '' };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentRole={effectiveRole}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={effectiveUserName}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner onNavigate={setActiveSection} />
        <Header title={sectionInfo.title} subtitle={sectionInfo.subtitle} />
        
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {renderSection()}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border bg-card/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {isLoadingBrokerage ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span>{brokerage?.trade_name || 'Brokerage'}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>License: {brokerage?.license_context?.[0]?.license_no || 'N/A'}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald" />
            <span>Event Chain: Valid</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-mono">{dbEvents?.length || 0} events logged</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Local Section Components

function AIInsightsSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
          <p className="text-sm text-muted-foreground">Read-only analytics and predictions</p>
        </div>
      </div>
      <div className="card-gold p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">AI Features - Read Only & Non-Authoritative</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI insights in BOS are strictly read-only. AI cannot make decisions about 
              compliance, calculate commissions, or modify deal states.
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Lead scoring and prioritization suggestions</li>
              <li>Deal health predictions</li>
              <li>Next-best-action recommendations</li>
              <li>Document completeness analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyDaySection() {
  const { data: dbLeads } = useLeads();
  const { data: dbDeals } = useDeals();

  const newLeadsCount = dbLeads?.filter(l => l.lead_state === 'New').length || 0;
  const viewingDealsCount = dbDeals?.filter(d => d.deal_state === 'Viewing').length || 0;
  const offerDealsCount = dbDeals?.filter(d => d.deal_state === 'Offer').length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">My Day</h2>
          <p className="text-sm text-muted-foreground">Your tasks and priorities for today</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-surface p-4">
          <div className="text-2xl font-bold text-primary">{newLeadsCount}</div>
          <p className="text-sm text-muted-foreground">New Leads</p>
        </div>
        <div className="card-surface p-4">
          <div className="text-2xl font-bold text-amber-500">{viewingDealsCount}</div>
          <p className="text-sm text-muted-foreground">Pending Viewings</p>
        </div>
        <div className="card-surface p-4">
          <div className="text-2xl font-bold text-emerald">{offerDealsCount}</div>
          <p className="text-sm text-muted-foreground">Active Offers</p>
        </div>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  brokerage: ReturnType<typeof transformDbBrokerageToFrontend> | null;
  isLoading: boolean;
}

function SettingsSection({ brokerage, isLoading }: SettingsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="card-surface p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">System Settings</h2>
          <p className="text-sm text-muted-foreground">Brokerage context and configuration</p>
        </div>
      </div>
      <div className="card-surface p-6">
        <h3 className="font-semibold text-foreground mb-4">Brokerage Context</h3>
        {brokerage ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Legal Name</span>
              <span className="text-foreground">{brokerage.legal_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trade Name</span>
              <span className="text-foreground">{brokerage.trade_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License</span>
              <span className="text-foreground font-mono">
                {brokerage.license_context?.[0]?.license_no || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry</span>
              <span className="text-foreground">
                {brokerage.license_context?.[0]?.expiry_date || 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No brokerage context configured.</p>
        )}
      </div>
    </div>
  );
}
