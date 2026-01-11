import { useState, useEffect } from 'react';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Lead, Deal, DealState, ValidationContext } from '@/types/bos';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { LeadsSection } from '@/components/leads/LeadsSection';
import { DealPipeline } from '@/components/deals/DealPipeline';
import { EventLog } from '@/components/events/EventLog';
import { DocumentsSection } from '@/components/documents/DocumentsSection';
import { SignaturesSection } from '@/components/documents/SignaturesSection';
import { CommissionsSection } from '@/components/commissions/CommissionsSection';
import { 
  DEMO_LEADS, 
  DEMO_DEALS, 
  DEMO_COMMISSIONS,
  DEMO_BROKERAGE,
} from '@/lib/demo-data';
import { 
  initializeDemoEventLog, 
  getEventLog, 
} from '@/lib/event-log';
import { transitionLeadState, transitionDealState } from '@/lib/state-machine';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [deals, setDeals] = useState<Deal[]>(DEMO_DEALS);
  const [events, setEvents] = useState(getEventLog());

  // Empty validation context for demo
  const validationContext: ValidationContext = {
    documents: [],
    signatures: [],
    evidence: [],
  };

  useEffect(() => {
    initializeDemoEventLog();
    setEvents(getEventLog());
    
    // Set default section based on role
    if (role === 'LegalOwner') setActiveSection('oversight');
    else if (role === 'Broker') setActiveSection('my-day');
    else if (role === 'Investor') setActiveSection('investor-profile');
    else setActiveSection('dashboard');
  }, [role]);

  const refreshEvents = () => setEvents(getEventLog());

  const handleLeadTransition = (lead: Lead, targetState: Lead['lead_state']) => {
    const result = transitionLeadState(lead, targetState, profile?.user_id || 'SYSTEM', role || 'Operator');
    refreshEvents();

    if (result.success && result.lead) {
      setLeads(prev => prev.map(l => l.lead_id === lead.lead_id ? result.lead! : l));
      toast({ title: 'Lead Updated', description: `Lead transitioned to ${targetState}` });
    } else {
      toast({
        title: 'Transition Blocked',
        description: result.eventLog.block_reasons[0] || 'Requirements not met',
        variant: 'destructive',
      });
    }
  };

  const handleDealTransition = (deal: Deal, targetState: DealState) => {
    const result = transitionDealState(deal, targetState, validationContext, profile?.user_id || 'SYSTEM', role || 'Operator');
    refreshEvents();

    if (result.success && result.deal) {
      setDeals(prev => prev.map(d => d.deal_id === deal.deal_id ? result.deal! : d));
      toast({ title: 'Deal Updated', description: `Deal transitioned to ${targetState}` });
    } else {
      toast({
        title: 'Transition Blocked',
        description: result.eventLog.block_reasons[0] || 'Requirements not met',
        variant: 'destructive',
      });
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
      case 'oversight':
        return (
          <DashboardView
            role={role || 'Operator'}
            leads={leads}
            deals={deals}
            commissions={DEMO_COMMISSIONS}
          />
        );

      case 'leads':
      case 'my-leads':
        return <LeadsSection />;

      case 'deals':
      case 'my-deals':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {role === 'Broker' ? 'My Deals' : 'Deal Pipeline'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {deals.length} total • {deals.filter(d => !['Closed_Won', 'Closed_Lost'].includes(d.deal_state)).length} active
                </p>
              </div>
            </div>
            <DealPipeline
              deals={deals}
              context={validationContext}
              onDealClick={(deal) => toast({ title: 'Deal Selected', description: deal.deal_id })}
              onTransition={handleDealTransition}
            />
          </div>
        );

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
      
      // payouts handled in commissions case above
      
      case 'ai-insights':
        return <AIInsightsSection />;
      
      case 'my-day':
        return <MyDaySection leads={leads} deals={deals} />;
      
      case 'listings':
        return <ListingsSection />;
      
      case 'settings':
        return <SettingsSection />;

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
        currentRole={role}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={profile?.full_name || 'User'}
        onSignOut={signOut}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={sectionInfo.title} subtitle={sectionInfo.subtitle} />
        
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {renderSection()}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border bg-card/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>{DEMO_BROKERAGE.trade_name}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>License: {DEMO_BROKERAGE.license_context[0].license_no}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald" />
            <span>Event Chain: Valid</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-mono">{events.length} events logged</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Section Components

function ApprovalsSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Approvals Queue</h2>
          <p className="text-sm text-muted-foreground">Pending approvals and override requests</p>
        </div>
      </div>
      <div className="card-surface p-8 text-center">
        <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No pending approvals</p>
        <p className="text-sm text-muted-foreground mt-1">Economics overrides and payout approvals appear here</p>
      </div>
    </div>
  );
}

// CommissionsSection is now imported from @/components/commissions/CommissionsSection

// DocumentsSection and SignaturesSection are now imported from @/components/documents/

function EvidenceSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Eye className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Evidence Center</h2>
          <p className="text-sm text-muted-foreground">Captured evidence and attachments</p>
        </div>
      </div>
      <div className="card-surface p-8 text-center">
        <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No evidence objects captured</p>
        <p className="text-sm text-muted-foreground mt-1">Evidence is attached during deal transitions</p>
      </div>
    </div>
  );
}

function ExportsSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Download className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Export Center</h2>
          <p className="text-sm text-muted-foreground">Generate deal and broker dossiers</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-gold p-6">
          <h3 className="font-semibold text-foreground mb-2">Deal Dossier Export</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete audit package including event timeline, executed documents, 
            signature evidence, registry evidence, commission records, and governing versions.
          </p>
          <Button className="btn-gold">Generate Deal Dossier</Button>
        </div>
        <div className="card-surface p-6">
          <h3 className="font-semibold text-foreground mb-2">Broker Dossier Export</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Broker ICA, license references, commission history, and payout evidence.
          </p>
          <Button variant="secondary">Generate Broker Dossier</Button>
        </div>
      </div>
    </div>
  );
}

function TemplatesSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <FileStack className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Rules & Templates</h2>
          <p className="text-sm text-muted-foreground">Document templates and business rules</p>
        </div>
      </div>
      <div className="card-surface p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Templates become immutable after publishing. Create new versions for changes.
        </p>
        <Button className="btn-gold">+ Create Template</Button>
      </div>
    </div>
  );
}

function UsersSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">User Management</h2>
            <p className="text-sm text-muted-foreground">Manage users and broker profiles</p>
          </div>
        </div>
        <Button className="btn-gold">+ Add User</Button>
      </div>
      <div className="card-surface p-8 text-center">
        <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">User management coming soon</p>
      </div>
    </div>
  );
}

// PayoutsSection is now integrated into CommissionsSection

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

function MyDaySection({ leads, deals }: { leads: Lead[]; deals: Deal[] }) {
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
          <div className="text-2xl font-bold text-primary">{leads.filter(l => l.lead_state === 'New').length}</div>
          <p className="text-sm text-muted-foreground">New Leads</p>
        </div>
        <div className="card-surface p-4">
          <div className="text-2xl font-bold text-amber-500">{deals.filter(d => d.deal_state === 'Viewing').length}</div>
          <p className="text-sm text-muted-foreground">Pending Viewings</p>
        </div>
        <div className="card-surface p-4">
          <div className="text-2xl font-bold text-emerald">{deals.filter(d => d.deal_state === 'Offer').length}</div>
          <p className="text-sm text-muted-foreground">Active Offers</p>
        </div>
      </div>
    </div>
  );
}

function ListingsSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Listings</h2>
            <p className="text-sm text-muted-foreground">Property inventory</p>
          </div>
        </div>
        <Button className="btn-gold">+ Add Listing</Button>
      </div>
      <div className="card-surface p-8 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Listings management coming soon</p>
      </div>
    </div>
  );
}

function SettingsSection() {
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
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Legal Name</span>
            <span className="text-foreground">{DEMO_BROKERAGE.legal_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trade Name</span>
            <span className="text-foreground">{DEMO_BROKERAGE.trade_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">License</span>
            <span className="text-foreground font-mono">{DEMO_BROKERAGE.license_context[0].license_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expiry</span>
            <span className="text-foreground">{DEMO_BROKERAGE.license_context[0].expiry_date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
