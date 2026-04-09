import { useState } from 'react';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { CRMListingsTab } from '@/components/crm/CRMListingsTab';
import { CRMListingDetail } from '@/components/crm/CRMListingDetail';
import { CRMClientView } from '@/components/crm/CRMClientView';
import { CRMActivityLog } from '@/components/crm/CRMActivityLog';
import { CRMEnquiryForm } from '@/components/crm/CRMEnquiryForm';
import { CRMEnquiriesList } from '@/components/crm/CRMEnquiriesList';
import { CRMEnquiryDetail } from '@/components/crm/CRMEnquiryDetail';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type View = 'dashboard' | 'portfolio' | 'enquiries' | 'activity' | 'new-enquiry' | 'enquiry-detail' | 'listing-detail';

export default function CRM() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const navigate = (v: View, id?: string) => {
    setView(v);
    setSelectedId(id || null);
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <CRMDashboard onNavigate={navigate} />;

      case 'portfolio':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('dashboard')}><ArrowLeft className="w-4 h-4" /></Button>
              <h2 className="text-xl font-bold text-foreground">Property Portfolio</h2>
            </div>
            <CRMListingsTab onSelect={(id) => navigate('listing-detail', id)} />
          </div>
        );

      case 'listing-detail':
        return selectedId ? (
          <CRMListingDetail listingId={selectedId} onBack={() => navigate('portfolio')} />
        ) : null;

      case 'enquiries':
        return (
          <CRMEnquiriesList
            onBack={() => navigate('dashboard')}
            onNew={() => navigate('new-enquiry')}
            onSelect={(id) => navigate('enquiry-detail', id)}
          />
        );

      case 'new-enquiry':
        return (
          <CRMEnquiryForm
            onBack={() => navigate('enquiries')}
            onCreated={() => navigate('enquiries')}
          />
        );

      case 'enquiry-detail':
        return selectedId ? (
          <CRMEnquiryDetail enquiryId={selectedId} onBack={() => navigate('enquiries')} />
        ) : null;

      case 'activity':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('dashboard')}><ArrowLeft className="w-4 h-4" /></Button>
              <h2 className="text-xl font-bold text-foreground">Activity Log</h2>
            </div>
            <CRMActivityLog />
          </div>
        );

      default:
        return <CRMDashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 sm:px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-3">
          <MiCasaLogo width={120} height="auto" useImage className="opacity-90" />
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">CRM</span>
        </button>
        <a href="/" className="text-xs text-primary hover:underline">← Back to BOS</a>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderView()}
      </main>
    </div>
  );
}
