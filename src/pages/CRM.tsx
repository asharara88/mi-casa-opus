import { useState } from 'react';
import { ContactsHub } from '@/components/crm/unified/ContactsHub';
import { ContactDetail } from '@/components/crm/unified/ContactDetail';
import { PipelineKanban } from '@/components/crm/unified/PipelineKanban';
import { TasksInbox } from '@/components/crm/unified/TasksInbox';
import { CRMAnalytics } from '@/components/crm/unified/CRMAnalytics';
import { NewOpportunityDialog } from '@/components/crm/unified/NewOpportunityDialog';
import { CRMListingsTab } from '@/components/crm/CRMListingsTab';
import { CRMListingDetail } from '@/components/crm/CRMListingDetail';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Users, KanbanSquare, ListChecks, BarChart3, Building2 } from 'lucide-react';
import type { Contact } from '@/hooks/useUnifiedCRM';

type Tab = 'pipeline' | 'contacts' | 'tasks' | 'analytics' | 'listings';

export default function CRM() {
  const [tab, setTab] = useState<Tab>('pipeline');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [newOppOpen, setNewOppOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: ListChecks },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'listings', label: 'Listings', icon: Building2 },
  ];

  const renderContent = () => {
    if (selectedContact) {
      return (
        <ContactDetail
          contactId={selectedContact.id}
          onBack={() => setSelectedContact(null)}
        />
      );
    }
    if (selectedListing) {
      return <CRMListingDetail listingId={selectedListing} onBack={() => setSelectedListing(null)} />;
    }
    switch (tab) {
      case 'pipeline':
        return <PipelineKanban />;
      case 'contacts':
        return <ContactsHub onSelect={setSelectedContact} />;
      case 'tasks':
        return <TasksInbox />;
      case 'analytics':
        return <CRMAnalytics />;
      case 'listings':
        return <CRMListingsTab onSelect={setSelectedListing} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setTab('pipeline');
              setSelectedContact(null);
              setSelectedListing(null);
            }}
            className="flex items-center gap-3"
          >
            <MiCasaLogo width={120} height="auto" useImage className="opacity-90" />
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">CRM</span>
          </button>
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewOppOpen(true)} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> New Lead
            </Button>
            <a href="/" className="text-xs text-primary hover:underline ml-2 hidden sm:inline">← BOS</a>
          </div>
        </div>

        {!selectedContact && !selectedListing && (
          <nav className="px-4 sm:px-6 flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        {renderContent()}
      </main>

      <NewOpportunityDialog open={newOppOpen} onOpenChange={setNewOppOpen} />

      {/* Floating action button (mobile) */}
      <button
        onClick={() => setNewOppOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
        aria-label="New lead"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
