import { useState, useEffect } from 'react';
import { UserRole, Lead, Deal, LeadState, DealState, ValidationContext } from '@/types/bos';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { LeadPipeline } from '@/components/leads/LeadPipeline';
import { DealPipeline } from '@/components/deals/DealPipeline';
import { EventLog } from '@/components/events/EventLog';
import { 
  DEMO_USERS, 
  DEMO_LEADS, 
  DEMO_DEALS, 
  DEMO_COMMISSIONS,
  DEMO_BROKERAGE,
} from '@/lib/demo-data';
import { 
  initializeDemoEventLog, 
  getEventLog, 
  createEventLogEntry 
} from '@/lib/event-log';
import { transitionLeadState, transitionDealState } from '@/lib/state-machine';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Building2, Shield, AlertTriangle, FileText, DollarSign, Sparkles, Settings } from 'lucide-react';

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your brokerage operations' },
  leads: { title: 'Lead Pipeline', subtitle: 'Manage and qualify incoming leads' },
  deals: { title: 'Deal Pipeline', subtitle: 'Track deals through the transaction lifecycle' },
  listings: { title: 'Listings', subtitle: 'Property inventory management' },
  documents: { title: 'Documents', subtitle: 'Templates and executed documents' },
  commissions: { title: 'Commissions', subtitle: 'Commission tracking and payouts' },
  compliance: { title: 'Compliance', subtitle: 'Audit trail and compliance posture' },
  'ai-insights': { title: 'AI Insights', subtitle: 'Read-only intelligence and analytics' },
  settings: { title: 'Settings', subtitle: 'System configuration' },
};

export function BOSApp() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Operator');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [deals, setDeals] = useState<Deal[]>(DEMO_DEALS);
  const [events, setEvents] = useState(getEventLog());

  // Empty validation context for demo (no documents/signatures yet)
  const validationContext: ValidationContext = {
    documents: [],
    signatures: [],
    evidence: [],
  };

  const currentUser = DEMO_USERS.find(u => u.role === currentRole) || DEMO_USERS[0];

  useEffect(() => {
    initializeDemoEventLog();
    setEvents(getEventLog());
  }, []);

  const refreshEvents = () => {
    setEvents(getEventLog());
  };

  const handleLeadTransition = (lead: Lead, targetState: LeadState) => {
    const result = transitionLeadState(lead, targetState, currentUser.user_id, currentRole);
    refreshEvents();

    if (result.success && result.lead) {
      setLeads(prev => prev.map(l => l.lead_id === lead.lead_id ? result.lead! : l));
      toast({
        title: 'Lead Updated',
        description: `Lead transitioned to ${targetState}`,
      });
    } else {
      toast({
        title: 'Transition Blocked',
        description: result.eventLog.block_reasons[0] || 'Requirements not met',
        variant: 'destructive',
      });
    }
  };

  const handleDealTransition = (deal: Deal, targetState: DealState) => {
    const result = transitionDealState(deal, targetState, validationContext, currentUser.user_id, currentRole);
    refreshEvents();

    if (result.success && result.deal) {
      setDeals(prev => prev.map(d => d.deal_id === deal.deal_id ? result.deal! : d));
      toast({
        title: 'Deal Updated',
        description: `Deal transitioned to ${targetState}`,
      });
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
        return (
          <DashboardView
            role={currentRole}
            leads={leads}
            deals={deals}
            commissions={DEMO_COMMISSIONS}
          />
        );
      
      case 'leads':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Lead Pipeline</h2>
                <p className="text-sm text-muted-foreground">
                  {leads.length} total leads • {leads.filter(l => l.lead_state === 'New').length} unassigned
                </p>
              </div>
              <Button className="btn-gold">
                + Add Lead
              </Button>
            </div>
            <LeadPipeline
              leads={leads}
              onLeadClick={(lead) => {
                toast({ title: 'Lead Selected', description: lead.contact_identity.full_name });
              }}
              onTransition={handleLeadTransition}
            />
          </div>
        );
      
      case 'deals':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Deal Pipeline</h2>
                <p className="text-sm text-muted-foreground">
                  {deals.length} total deals • {deals.filter(d => !['Closed_Won', 'Closed_Lost'].includes(d.deal_state)).length} active
                </p>
              </div>
            </div>
            <DealPipeline
              deals={deals}
              context={validationContext}
              onDealClick={(deal) => {
                toast({ title: 'Deal Selected', description: deal.deal_id });
              }}
              onTransition={handleDealTransition}
            />
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-foreground">Audit Trail</h2>
              <p className="text-sm text-muted-foreground">
                Complete event log with cryptographic chain verification
              </p>
            </div>
            <div className="card-surface p-4">
              <EventLog events={events} />
            </div>
          </div>
        );

      case 'commissions':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-foreground">Commission Records</h2>
              <p className="text-sm text-muted-foreground">
                View-only commission calculations and status
              </p>
            </div>
            <div className="card-surface overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Commission ID</th>
                    <th>Deal</th>
                    <th>Broker</th>
                    <th>Status</th>
                    <th>Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_COMMISSIONS.map(comm => (
                    <tr key={comm.commission_id}>
                      <td className="font-mono text-xs">{comm.commission_id}</td>
                      <td className="font-mono text-xs">{comm.deal_id}</td>
                      <td className="font-mono text-xs">{comm.broker_id}</td>
                      <td>
                        <span className={`state-badge ${
                          comm.status === 'Expected' ? 'state-pending' :
                          comm.status === 'Earned' ? 'state-active' :
                          comm.status === 'Paid' ? 'state-won' : 'state-new'
                        }`}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="font-bold text-primary">
                        {comm.calculation_trace.net_payable.toLocaleString()} AED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-foreground">Document Management</h2>
              <p className="text-sm text-muted-foreground">
                Templates and executed documents
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['OfferLetter', 'ReservationForm', 'SPA', 'ICA', 'MandateAgreement'].map(docType => (
                <div key={docType} className="card-surface p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{docType.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-xs text-muted-foreground">Template v1.0</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Read-only template. Documents are generated by workflow transitions.
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ai-insights':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
                <p className="text-sm text-muted-foreground">
                  Read-only analytics and predictions
                </p>
              </div>
            </div>
            <div className="card-gold p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">AI Features - Read Only</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI insights in BOS are strictly read-only and non-authoritative. 
                    AI cannot make decisions about compliance, calculate commissions, 
                    or modify deal states.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Deal risk scoring (informational only)</li>
                    <li>✓ Probability estimates (not binding)</li>
                    <li>✓ Aging alerts and reminders</li>
                    <li>✗ ROI/yield calculations (blocked)</li>
                    <li>✗ Legal advice (blocked)</li>
                    <li>✗ Property comparisons (blocked)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Section under development</p>
            </div>
          </div>
        );
    }
  };

  const sectionInfo = SECTION_TITLES[activeSection] || { title: 'BOS', subtitle: '' };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentRole={currentRole}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={currentUser.full_name}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={sectionInfo.title} subtitle={sectionInfo.subtitle} />
        
        {/* Role Switcher (Demo Only) */}
        <div className="px-6 py-3 border-b border-border bg-card/30">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Demo Role:</span>
            {(['Operator', 'LegalOwner', 'Broker'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentRole === role
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        
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
