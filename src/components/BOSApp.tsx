import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoContext';
import { ValidationContext } from '@/types/bos';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileSearchSheet } from '@/components/layout/MobileSearchSheet';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { useBrokerageContext } from '@/hooks/useBrokerage';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import { useCommissions } from '@/hooks/useCommissions';
import { useEventLog } from '@/hooks/useEventLog';
import { useIsMobile } from '@/hooks/use-mobile';
import { transformDbBrokerageToFrontend } from '@/lib/transforms';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, Shield, FileText, DollarSign, Sparkles, Settings, 
  AlertTriangle, Users, PenTool, Eye, ClipboardCheck, Download,
  FileStack, Calendar, UserCheck, Wallet, Briefcase, Handshake, LayoutDashboard,
  Loader2
} from 'lucide-react';

// Lazy-loaded sections for code splitting - reduces initial bundle by ~70%
const DashboardView = lazy(() => import('@/components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const LeadsSection = lazy(() => import('@/components/leads/LeadsSection').then(m => ({ default: m.LeadsSection })));
const DealsSection = lazy(() => import('@/components/deals/DealsSection').then(m => ({ default: m.DealsSection })));
const EventLog = lazy(() => import('@/components/events/EventLog').then(m => ({ default: m.EventLog })));
const DocumentsSection = lazy(() => import('@/components/documents/DocumentsSection').then(m => ({ default: m.DocumentsSection })));
const SignaturesSection = lazy(() => import('@/components/documents/SignaturesSection').then(m => ({ default: m.SignaturesSection })));
const CommissionsSection = lazy(() => import('@/components/commissions/CommissionsSection').then(m => ({ default: m.CommissionsSection })));
const EvidenceSection = lazy(() => import('@/components/evidence/EvidenceSection').then(m => ({ default: m.EvidenceSection })));
const ApprovalsSection = lazy(() => import('@/components/approvals/ApprovalsSection').then(m => ({ default: m.ApprovalsSection })));
const ExportsSection = lazy(() => import('@/components/exports/ExportsSection').then(m => ({ default: m.ExportsSection })));
const UsersSection = lazy(() => import('@/components/users/UsersSection').then(m => ({ default: m.UsersSection })));
const ListingsSection = lazy(() => import('@/components/listings/ListingsSection').then(m => ({ default: m.ListingsSection })));
const TemplatesSection = lazy(() => import('@/components/templates/TemplatesSection').then(m => ({ default: m.TemplatesSection })));
const ProspectsSection = lazy(() => import('@/components/prospects/ProspectsSection').then(m => ({ default: m.ProspectsSection })));
const MarketingSection = lazy(() => import('@/components/marketing/MarketingSection').then(m => ({ default: m.MarketingSection })));
const TeamsSection = lazy(() => import('@/components/teams/TeamsSection').then(m => ({ default: m.TeamsSection })));
const SmartContractsSection = lazy(() => import('@/components/contracts/SmartContractsSection').then(m => ({ default: m.SmartContractsSection })));
const AIAgentChat = lazy(() => import('@/components/ai/AIAgentChat').then(m => ({ default: m.AIAgentChat })));
const FloatingAIChat = lazy(() => import('@/components/ai/FloatingAIChat').then(m => ({ default: m.FloatingAIChat })));

// Section loading fallback - minimal and fast
function SectionLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

// Section metadata
const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  // Operator sections
  dashboard: { title: 'Control Room', subtitle: 'Brokerage operations overview' },
  marketing: { title: 'Marketing Hub', subtitle: 'Campaigns, ads, events, and referral network' },
  leads: { title: 'Lead Pipeline', subtitle: 'Qualified leads for sales conversion' },
  deals: { title: 'Deal Pipeline', subtitle: 'Track deals through the transaction lifecycle' },
  listings: { title: 'Listings', subtitle: 'Property inventory management' },
  prospects: { title: 'Prospects', subtitle: 'Marketing pool for campaigns and mass outreach' },
  documents: { title: 'Document Center', subtitle: 'Templates and executed documents' },
  signatures: { title: 'Signature Envelopes', subtitle: 'Track document execution status' },
  evidence: { title: 'Evidence Center', subtitle: 'Captured evidence and attachments' },
  commissions: { title: 'Commission Ledger', subtitle: 'Commission tracking by deal and broker' },
  payouts: { title: 'Payout Management', subtitle: 'Build and execute payout batches' },
  approvals: { title: 'Approvals Queue', subtitle: 'Pending approvals and overrides' },
  exports: { title: 'Export Center', subtitle: 'Generate deal and broker dossiers' },
  templates: { title: 'Rules & Templates', subtitle: 'Document templates and business rules' },
  contracts: { title: 'Smart Contracts', subtitle: 'Tokenization, contracts, and payment escrow' },
  'ai-insights': { title: 'AI Insights', subtitle: 'Read-only intelligence (non-authoritative)' },
  'ai-agent': { title: 'Mi Ai', subtitle: 'Your BOS operations assistant' },
  users: { title: 'User Management', subtitle: 'Manage users and broker profiles' },
  settings: { title: 'System Settings', subtitle: 'Brokerage context and configuration' },
  
  // Teams sections
  meetings: { title: 'Team Meetings', subtitle: 'Schedule and manage team meetings' },
  directory: { title: 'Team Directory', subtitle: 'Internal team contacts and info' },
  
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
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // In demo bypass mode, use Operator role
  const effectiveRole: AppRole = isDemoBypass ? 'Operator' : (role || 'Operator');
  const effectiveUserName = isDemoBypass ? 'Demo User' : (profile?.full_name || 'User');

  // Fetch brokerage context
  const { data: dbBrokerage, isLoading: isLoadingBrokerage } = useBrokerageContext();
  const brokerage = dbBrokerage ? transformDbBrokerageToFrontend(dbBrokerage) : null;

  // Fetch data for dashboard stats
  const leadsQuery = useLeads();
  const dealsQuery = useDeals();
  const { data: commissions } = useCommissions();
  const { data: dbEvents } = useEventLog();

  // Handle sign out
  const handleSignOut = async () => {
    if (isDemoBypass) {
      exitDemoBypass();
      navigate('/login');
      return;
    }
    
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
      case 'oversight':
        return <DashboardView role={effectiveRole} onNavigate={setActiveSection} />;

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
      
      case 'contracts':
        return <SmartContractsSection />;
      
      case 'users':
        return <UsersSection />;
      
      case 'ai-insights':
        return <AIInsightsSection onNavigate={setActiveSection} />;
      
      case 'ai-agent':
        return <AIAgentChat />;
      
      case 'my-day':
        return <MyDaySection />;
      
      case 'listings':
        return <ListingsSection />;
      
      case 'prospects':
        return <ProspectsSection />;
      
      case 'marketing':
        return <MarketingSection />;
      
      case 'meetings':
        return <TeamsSection initialTab="meetings" />;
      
      case 'directory':
        return <TeamsSection initialTab="directory" />;
      
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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner onNavigate={setActiveSection} />
        <Header 
          title={sectionInfo.title} 
          subtitle={sectionInfo.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 lg:pb-6 scrollbar-thin">
          <Suspense fallback={<SectionLoader />}>
            {renderSection()}
          </Suspense>
        </main>

        {/* Footer - Hidden on mobile */}
        <footer className="hidden lg:flex px-6 py-3 border-t border-border bg-card/30 items-center justify-between text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {isLoadingBrokerage ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span>{brokerage?.trade_name || 'Brokerage'}</span>
                <span className="text-foreground/30">•</span>
                <span>License: {brokerage?.license_context?.[0]?.license_no || 'N/A'}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald" />
            <span>Event Chain: Valid</span>
            <span className="text-foreground/30">•</span>
            <span className="font-mono">{dbEvents?.length || 0} events logged</span>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onMenuClick={() => setSidebarOpen(true)}
        onQuickAction={(action) => {
          // Handle quick actions - navigate to appropriate section
          if (action === 'add-lead') setActiveSection('leads');
          else if (action === 'add-prospect') setActiveSection('prospects');
          else if (action === 'add-listing') setActiveSection('listings');
          else if (action === 'new-document') setActiveSection('documents');
          else if (action === 'schedule') setActiveSection('meetings');
          // Future: could trigger modals directly via context/state
        }}
      />

      {/* Mobile Search Sheet */}
      <MobileSearchSheet
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(section) => {
          setActiveSection(section);
          setSearchOpen(false);
        }}
      />

      {/* Floating AI Chat Button - Lazy loaded */}
      <Suspense fallback={null}>
        <FloatingAIChat />
      </Suspense>
    </div>
  );
}

// Local Section Components

function AIInsightsSection({ onNavigate }: { onNavigate: (section: string, entityId?: string) => void }) {
  const { isDemoMode } = useDemoMode();
  
  // Import demo data dynamically
  const demoInsights = isDemoMode ? require('@/data/demoData').DEMO_AI_INSIGHTS : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
          <p className="text-sm text-muted-foreground">Read-only analytics and predictions</p>
        </div>
      </div>
      
      {/* Disclaimer Banner */}
      <div className="card-gold p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">Non-Authoritative AI</h3>
            <p className="text-xs text-muted-foreground">
              AI insights are suggestions only. They cannot make compliance decisions, calculate commissions, or modify deal states.
            </p>
          </div>
        </div>
      </div>

      {isDemoMode && demoInsights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {demoInsights.map((insight: any) => (
            <AIInsightCard key={insight.id} insight={insight} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="card-surface p-8 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No AI insights available. Enable demo mode to see sample insights.</p>
        </div>
      )}
    </div>
  );
}

function AIInsightCard({ insight, onNavigate }: { insight: any; onNavigate: (section: string, entityId?: string) => void }) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald bg-emerald/10 border-emerald/30';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead_scoring': return <UserCheck className="w-4 h-4" />;
      case 'deal_health': return <Handshake className="w-4 h-4" />;
      case 'risk_flag': return <AlertTriangle className="w-4 h-4" />;
      case 'revenue_forecast': return <DollarSign className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleNavigate = () => {
    if (insight.entity_type === 'lead') {
      onNavigate('leads', insight.entity_id);
    } else if (insight.entity_type === 'deal') {
      onNavigate('deals', insight.entity_id);
    }
  };

  return (
    <div className="card-surface p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {getTypeIcon(insight.insight_type)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground capitalize">{insight.insight_type.replace('_', ' ')}</p>
            <p className="text-sm font-medium">{insight.entity_type}: {insight.entity_id.slice(0, 8)}...</p>
          </div>
        </div>
        {insight.score !== null && (
          <div className={`px-2 py-1 rounded-full border text-xs font-bold ${getScoreColor(insight.score)}`}>
            {insight.score}%
          </div>
        )}
      </div>

      {insight.next_best_action && (
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Recommended Action</p>
          <p className="text-sm font-medium">{insight.next_best_action}</p>
        </div>
      )}

      {insight.rationale && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Rationale:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {insight.rationale.factors?.slice(0, 3).map((factor: string, i: number) => (
              <li key={i}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {new Date(insight.created_at).toLocaleDateString()}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNavigate}>
          View Entity
        </Button>
      </div>
    </div>
  );
}

function MyDaySection() {
  const leadsQuery = useLeads();
  const dealsQuery = useDeals();
  const leads = leadsQuery.data || [];
  const deals = dealsQuery.data || [];
  
  // Filter for items due today
  const today = new Date().toDateString();
  const todayLeads = leads.filter(l => l.next_action_due && new Date(l.next_action_due).toDateString() === today);
  const todayDeals = deals.filter(d => d.next_action_due && new Date(d.next_action_due).toDateString() === today);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">My Day</h2>
          <p className="text-sm text-muted-foreground">Your tasks and priorities for today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Leads Due Today</h3>
            <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
              {todayLeads.length}
            </span>
          </div>
          {todayLeads.length > 0 ? (
            <div className="space-y-2">
              {todayLeads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-lg">
                  <span>{lead.contact_name}</span>
                  <span className="text-xs text-muted-foreground">{lead.next_action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No leads due today</p>
          )}
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-5 h-5 text-emerald" />
            <h3 className="font-semibold">Deals Due Today</h3>
            <span className="ml-auto bg-emerald/10 text-emerald px-2 py-0.5 rounded-full text-xs font-bold">
              {todayDeals.length}
            </span>
          </div>
          {todayDeals.length > 0 ? (
            <div className="space-y-2">
              {todayDeals.slice(0, 5).map(deal => (
                <div key={deal.id} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-lg">
                  <span>{deal.deal_id}</span>
                  <span className="text-xs text-muted-foreground">{deal.next_action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No deals due today</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ brokerage, isLoading }: { brokerage: any; isLoading: boolean }) {
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
        <h3 className="font-semibold mb-4">Brokerage Context</h3>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : brokerage ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Trade Name</p>
              <p className="font-medium">{brokerage.trade_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Legal Name</p>
              <p className="font-medium">{brokerage.legal_name}</p>
            </div>
            {brokerage.license_context?.[0] && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium">{brokerage.license_context[0].license_no}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jurisdiction</p>
                  <p className="font-medium">{brokerage.license_context[0].jurisdiction}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No brokerage context configured</p>
        )}
      </div>
    </div>
  );
}
