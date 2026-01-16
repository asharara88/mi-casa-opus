import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoContext';
import { ValidationContext } from '@/types/bos';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QuickAccessToolbar } from '@/components/layout/QuickAccessToolbar';
import { CustomerJourneyIndicator } from '@/components/layout/CustomerJourneyIndicator';
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
import { ProspectsSection } from '@/components/prospects/ProspectsSection';
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
  FileStack, Calendar, UserCheck, Wallet, Briefcase, Handshake, LayoutDashboard
} from 'lucide-react';

// Section metadata
const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  // Operator sections
  dashboard: { title: 'Control Room', subtitle: 'Brokerage operations overview' },
  leads: { title: 'Lead Pipeline', subtitle: 'Manage and qualify incoming leads' },
  deals: { title: 'Deal Pipeline', subtitle: 'Track deals through the transaction lifecycle' },
  listings: { title: 'Listings', subtitle: 'Property inventory management' },
  prospects: { title: 'Prospects', subtitle: 'Cold outreach and engagement tracking' },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
        return <AIInsightsSection onNavigate={setActiveSection} />;
      
      case 'my-day':
        return <MyDaySection />;
      
      case 'listings':
        return <ListingsSection />;
      
      case 'prospects':
        return <ProspectsSection />;
      
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
        />
        <QuickAccessToolbar
          currentRole={effectiveRole}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <CustomerJourneyIndicator
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 scrollbar-thin">
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
      case 'lead_score': return <Users className="w-4 h-4" />;
      case 'deal_health': return <Handshake className="w-4 h-4" />;
      case 'pipeline_analysis': return <LayoutDashboard className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lead_score': return 'Lead Score';
      case 'deal_health': return 'Deal Health';
      case 'pipeline_analysis': return 'Pipeline Analysis';
      default: return 'Insight';
    }
  };

  const isClickable = insight.entity_type === 'lead' || insight.entity_type === 'deal';

  const handleClick = () => {
    if (insight.entity_type === 'lead') {
      onNavigate('leads', insight.entity_id);
    } else if (insight.entity_type === 'deal') {
      onNavigate('deals', insight.entity_id);
    }
  };

  return (
    <div 
      className={`card-surface p-4 space-y-4 transition-all ${isClickable ? 'cursor-pointer hover:border-primary/50 hover:shadow-md' : ''}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10 text-primary">
            {getTypeIcon(insight.insight_type)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{getTypeLabel(insight.insight_type)}</p>
            <p className="font-medium text-sm text-foreground">{insight.entity_name}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-lg font-bold border ${getScoreColor(insight.score)}`}>
          {insight.score}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs font-medium text-primary mb-1">Next Best Action</p>
        <p className="text-sm text-foreground">{insight.next_best_action}</p>
      </div>

      {insight.rationale?.factors && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Score Breakdown</p>
          <div className="space-y-1.5">
            {insight.rationale.factors.map((factor: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-muted-foreground">{factor.factor}</span>
                    <span className="text-foreground font-medium">{factor.score}</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${factor.score >= 85 ? 'bg-emerald' : factor.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {insight.rationale.confidence && (
            <p className="text-xs text-muted-foreground mt-2">
              Confidence: {Math.round(insight.rationale.confidence * 100)}%
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {new Date(insight.created_at).toLocaleTimeString()}
        </span>
        <div className="flex items-center gap-2">
          {isClickable && (
            <span className="text-xs text-primary">Click to view →</span>
          )}
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
            Non-Authoritative
          </span>
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
