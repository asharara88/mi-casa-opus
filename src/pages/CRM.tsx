import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CRMListingsTab } from '@/components/crm/CRMListingsTab';
import { CRMListingDetail } from '@/components/crm/CRMListingDetail';
import { CRMClientView } from '@/components/crm/CRMClientView';
import { CRMActivityLog } from '@/components/crm/CRMActivityLog';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';

export default function CRM() {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('listings');

  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
  };

  const handleBack = () => {
    setSelectedListingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MiCasaLogo width={120} height="auto" useImage className="opacity-90" />
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">CRM</span>
        </div>
        <a href="/" className="text-xs text-primary hover:underline">← Back to BOS</a>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {selectedListingId ? (
          <CRMListingDetail listingId={selectedListingId} onBack={handleBack} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            <TabsContent value="listings">
              <CRMListingsTab onSelect={handleSelectListing} />
            </TabsContent>
            <TabsContent value="client">
              <CRMClientView />
            </TabsContent>
            <TabsContent value="activity">
              <CRMActivityLog />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
