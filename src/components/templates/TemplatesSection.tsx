import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileStack, 
  Plus, 
  FileText,
  Lock,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface DocumentTemplate {
  id: string;
  template_id: string;
  name: string;
  doc_type: string;
  version: string;
  status: 'Draft' | 'Published' | 'Deprecated';
  effective_from: string;
  required_signers: string[];
  created_at: string;
  published_at?: string;
}

const DEMO_TEMPLATES: DocumentTemplate[] = [
  {
    id: '1',
    template_id: 'TPL-SPA-001',
    name: 'Sale and Purchase Agreement',
    doc_type: 'SPA',
    version: '2.1',
    status: 'Published',
    effective_from: '2024-01-01',
    required_signers: ['Buyer', 'Seller', 'Witness'],
    created_at: '2023-12-15',
    published_at: '2024-01-01',
  },
  {
    id: '2',
    template_id: 'TPL-RES-001',
    name: 'Reservation Form',
    doc_type: 'ReservationForm',
    version: '1.3',
    status: 'Published',
    effective_from: '2024-01-01',
    required_signers: ['Buyer', 'Agent'],
    created_at: '2023-11-20',
    published_at: '2024-01-01',
  },
  {
    id: '3',
    template_id: 'TPL-ICA-001',
    name: 'Independent Contractor Agreement',
    doc_type: 'ICA',
    version: '1.0',
    status: 'Published',
    effective_from: '2023-06-01',
    required_signers: ['Broker', 'Brokerage'],
    created_at: '2023-05-15',
    published_at: '2023-06-01',
  },
  {
    id: '4',
    template_id: 'TPL-MAN-001',
    name: 'Exclusive Mandate Agreement',
    doc_type: 'MandateAgreement',
    version: '1.2',
    status: 'Published',
    effective_from: '2024-01-01',
    required_signers: ['Owner', 'Brokerage'],
    created_at: '2023-12-01',
    published_at: '2024-01-01',
  },
  {
    id: '5',
    template_id: 'TPL-SPA-002',
    name: 'Sale and Purchase Agreement (Off-Plan)',
    doc_type: 'SPA',
    version: '1.0',
    status: 'Draft',
    effective_from: '2024-02-01',
    required_signers: ['Buyer', 'Developer', 'Agent'],
    created_at: '2024-01-10',
  },
];

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Draft: { 
    color: 'bg-muted text-muted-foreground', 
    icon: <Edit className="h-3 w-3" /> 
  },
  Published: { 
    color: 'bg-emerald/20 text-emerald', 
    icon: <Lock className="h-3 w-3" /> 
  },
  Deprecated: { 
    color: 'bg-amber-500/20 text-amber-600', 
    icon: <AlertTriangle className="h-3 w-3" /> 
  },
};

export function TemplatesSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const draftCount = DEMO_TEMPLATES.filter(t => t.status === 'Draft').length;
  const publishedCount = DEMO_TEMPLATES.filter(t => t.status === 'Published').length;

  const handlePublish = () => {
    toast({ title: 'Template Published', description: 'Template is now immutable and ready for use' });
    setShowPublishDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileStack className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Rules & Templates</h2>
            <p className="text-sm text-muted-foreground">
              Document templates and business rules
            </p>
          </div>
        </div>
        <Button className="btn-gold">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Template Immutability
              </h3>
              <p className="text-sm text-muted-foreground">
                Templates become immutable after publishing. Create new versions for changes. 
                All documents reference the specific template version used at creation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileStack className="h-6 w-6 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">{DEMO_TEMPLATES.length}</div>
                <div className="text-xs text-muted-foreground">Total Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-emerald" />
              <div>
                <div className="text-xl font-bold text-foreground">{publishedCount}</div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-amber-500" />
              <div>
                <div className="text-xl font-bold text-foreground">{draftCount}</div>
                <div className="text-xs text-muted-foreground">Drafts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <div>
                <div className="text-xl font-bold text-foreground">5</div>
                <div className="text-xs text-muted-foreground">Document Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onView={() => setSelectedTemplate(template)}
                onPublish={() => {
                  setSelectedTemplate(template);
                  setShowPublishDialog(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_TEMPLATES.filter(t => t.status === 'Published').map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onView={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_TEMPLATES.filter(t => t.status === 'Draft').map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onView={() => setSelectedTemplate(template)}
                onPublish={() => {
                  setSelectedTemplate(template);
                  setShowPublishDialog(true);
                }}
              />
            ))}
            {draftCount === 0 && (
              <Card className="col-span-2">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald opacity-50" />
                  <p className="text-muted-foreground">All templates are published</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Template</DialogTitle>
            <DialogDescription>
              Publishing makes this template immutable and available for document generation.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-medium">{selectedTemplate.name}</div>
                <div className="text-sm text-muted-foreground">
                  Version {selectedTemplate.version} • {selectedTemplate.doc_type}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">This action cannot be undone</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Once published, this template version becomes immutable. 
                  To make changes, you must create a new version.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button className="btn-gold" onClick={handlePublish}>
              <Lock className="h-4 w-4 mr-2" />
              Publish Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateCardProps {
  template: DocumentTemplate;
  onView: () => void;
  onPublish?: () => void;
}

function TemplateCard({ template, onView, onPublish }: TemplateCardProps) {
  const statusConfig = STATUS_CONFIG[template.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs mb-1">
                {template.doc_type}
              </Badge>
              <div className="font-medium text-foreground text-sm">
                {template.name}
              </div>
            </div>
          </div>
          <Badge className={cn('text-xs', statusConfig.color)}>
            {statusConfig.icon}
            <span className="ml-1">{template.status}</span>
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Version</span>
            <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
              v{template.version}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Required Signers</span>
            <span className="text-foreground">{template.required_signers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Effective From</span>
            <span className="text-foreground">{template.effective_from}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {template.status === 'Draft' && onPublish && (
            <Button size="sm" className="flex-1" onClick={onPublish}>
              <Lock className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          {template.status === 'Published' && (
            <Button size="sm" variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-1" />
              New Version
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs text-muted-foreground font-mono">
          {template.template_id}
        </div>
      </CardContent>
    </Card>
  );
}
