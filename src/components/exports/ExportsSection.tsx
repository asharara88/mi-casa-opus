import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileArchive, 
  Briefcase, 
  User,
  FileText,
  PenTool,
  Camera,
  Clock,
  Building2,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ExportConfig {
  includeEventTimeline: boolean;
  includeDocuments: boolean;
  includeSignatures: boolean;
  includeEvidence: boolean;
  includeCommissions: boolean;
  format: 'pdf' | 'zip';
}

const DEMO_DEALS = [
  { id: 'DEAL-2024-001', type: 'Sale', state: 'SPA', price: 2500000 },
  { id: 'DEAL-2024-002', type: 'Sale', state: 'Reservation', price: 1800000 },
  { id: 'DEAL-2024-003', type: 'Lease', state: 'Closed_Won', price: 120000 },
];

const DEMO_BROKERS = [
  { id: 'BRK-001', name: 'Ahmed Hassan', deals: 12, commissions: 450000 },
  { id: 'BRK-002', name: 'Sara Ali', deals: 8, commissions: 320000 },
  { id: 'BRK-003', name: 'John Smith', deals: 15, commissions: 580000 },
];

export function ExportsSection() {
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [dealConfig, setDealConfig] = useState<ExportConfig>({
    includeEventTimeline: true,
    includeDocuments: true,
    includeSignatures: true,
    includeEvidence: true,
    includeCommissions: true,
    format: 'pdf',
  });
  const [brokerConfig, setBrokerConfig] = useState<ExportConfig>({
    includeEventTimeline: true,
    includeDocuments: true,
    includeSignatures: false,
    includeEvidence: false,
    includeCommissions: true,
    format: 'pdf',
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<'deal' | 'broker'>('deal');

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    setIsExporting(false);
    setShowExportDialog(false);
    toast({
      title: 'Export Complete',
      description: `${exportType === 'deal' ? 'Deal' : 'Broker'} dossier has been generated`,
    });
  };

  const openExportDialog = (type: 'deal' | 'broker') => {
    setExportType(type);
    setShowExportDialog(true);
  };

  const currentConfig = exportType === 'deal' ? dealConfig : brokerConfig;
  const setCurrentConfig = exportType === 'deal' ? setDealConfig : setBrokerConfig;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Export Center</h2>
          <p className="text-sm text-muted-foreground">
            Generate deal and broker dossiers for compliance and audit
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Dossier */}
        <Card className="card-gold">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Deal Dossier Export</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete audit package for a deal
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Event Timeline
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Executed Documents
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <PenTool className="h-4 w-4" />
                Signature Evidence
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Camera className="h-4 w-4" />
                Registry Evidence
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Commission Records
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileArchive className="h-4 w-4" />
                Governing Versions
              </div>
            </div>

            <Select value={selectedDeal} onValueChange={setSelectedDeal}>
              <SelectTrigger>
                <SelectValue placeholder="Select a deal to export" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_DEALS.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{deal.id}</span>
                      <Badge variant="outline" className="text-xs">
                        {deal.state}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="w-full btn-gold"
              disabled={!selectedDeal}
              onClick={() => openExportDialog('deal')}
            >
              <FileArchive className="h-4 w-4 mr-2" />
              Generate Deal Dossier
            </Button>
          </CardContent>
        </Card>

        {/* Broker Dossier */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Broker Dossier Export</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Broker compliance and earnings package
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                ICA Agreement
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                License References
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Deal History
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Download className="h-4 w-4" />
                Payout Evidence
              </div>
            </div>

            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
              <SelectTrigger>
                <SelectValue placeholder="Select a broker to export" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_BROKERS.map((broker) => (
                  <SelectItem key={broker.id} value={broker.id}>
                    <div className="flex items-center gap-2">
                      <span>{broker.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {broker.deals} deals
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="w-full"
              variant="secondary"
              disabled={!selectedBroker}
              onClick={() => openExportDialog('broker')}
            >
              <FileArchive className="h-4 w-4 mr-2" />
              Generate Broker Dossier
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'Deal', id: 'DEAL-2024-001', date: '2024-01-17', format: 'PDF', size: '2.4 MB' },
              { type: 'Broker', id: 'BRK-001', date: '2024-01-16', format: 'ZIP', size: '8.1 MB' },
              { type: 'Deal', id: 'DEAL-2024-003', date: '2024-01-15', format: 'PDF', size: '1.8 MB' },
            ].map((export_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    export_.type === 'Deal' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {export_.type === 'Deal' ? <Briefcase className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{export_.type} Dossier</span>
                      <code className="text-xs font-mono text-muted-foreground">{export_.id}</code>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {export_.date} • {export_.format} • {export_.size}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Configure {exportType === 'deal' ? 'Deal' : 'Broker'} Dossier Export
            </DialogTitle>
            <DialogDescription>
              Select what to include in the export package
            </DialogDescription>
          </DialogHeader>

          {isExporting ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating dossier...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Collecting documents, evidence, and generating report...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="timeline"
                      checked={currentConfig.includeEventTimeline}
                      onCheckedChange={(checked) =>
                        setCurrentConfig(prev => ({ ...prev, includeEventTimeline: !!checked }))
                      }
                    />
                    <label htmlFor="timeline" className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Event Timeline
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="documents"
                      checked={currentConfig.includeDocuments}
                      onCheckedChange={(checked) =>
                        setCurrentConfig(prev => ({ ...prev, includeDocuments: !!checked }))
                      }
                    />
                    <label htmlFor="documents" className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Executed Documents
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="signatures"
                      checked={currentConfig.includeSignatures}
                      onCheckedChange={(checked) =>
                        setCurrentConfig(prev => ({ ...prev, includeSignatures: !!checked }))
                      }
                    />
                    <label htmlFor="signatures" className="text-sm flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-muted-foreground" />
                      Signature Evidence
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="evidence"
                      checked={currentConfig.includeEvidence}
                      onCheckedChange={(checked) =>
                        setCurrentConfig(prev => ({ ...prev, includeEvidence: !!checked }))
                      }
                    />
                    <label htmlFor="evidence" className="text-sm flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      Registry & Photo Evidence
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="commissions"
                      checked={currentConfig.includeCommissions}
                      onCheckedChange={(checked) =>
                        setCurrentConfig(prev => ({ ...prev, includeCommissions: !!checked }))
                      }
                    />
                    <label htmlFor="commissions" className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Commission Records
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <Select
                    value={currentConfig.format}
                    onValueChange={(value: 'pdf' | 'zip') =>
                      setCurrentConfig(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="zip">ZIP Archive (with attachments)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button className="btn-gold" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Export
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
