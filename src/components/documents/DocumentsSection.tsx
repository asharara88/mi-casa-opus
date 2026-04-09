import { useState } from 'react';
import { useDocumentTemplates, useDocumentInstances } from '@/hooks/useDocuments';
import { DocumentTemplateCard, DocumentTemplateCardData } from './DocumentTemplateCard';
import { DocumentInstanceRow } from './DocumentInstanceRow';
import { DocumentGeneratorPanel } from './DocumentGeneratorPanel';
import { PDFTemplatesSection } from './PDFTemplatesSection';
import { DocumentTemplatePreviewModal } from './DocumentTemplatePreviewModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  FileText, 
  FileCheck, 
  Filter,
  Loader2,
  Sparkles,
  ClipboardList,
  PenLine
} from 'lucide-react';
import { toast } from 'sonner';
import type { DocType } from '@/types/bos';

export function DocumentsSection() {
  const { data: rawTemplates, isLoading: templatesLoading } = useDocumentTemplates();
  const { data: rawDocuments, isLoading: documentsLoading } = useDocumentInstances();
  
  const [activeTab, setActiveTab] = useState('official-forms');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplateCardData | null>(null);

  const templates: DocumentTemplateCardData[] = (rawTemplates || []).map(t => ({
    template_id: t.template_id,
    doc_type: t.doc_type as DocType,
    template_version: t.template_version ? String(t.template_version).replace('v', '') : '1',
    effective_from: t.effective_from,
    required_signers_schema: (t.required_signers_schema as { roles?: string[] }) || { roles: [] },
    data_binding_schema: (t.data_binding_schema as Record<string, string>) || {},
    template_content: t.template_content || '',
    is_published: t.status === 'Published',
    created_at: t.created_at,
    name: t.name,
  }));

  const documents = (rawDocuments || []).map(d => ({
    document_id: d.document_id,
    template_ref: `${(d as any).document_templates?.doc_type || 'Unknown'}_v${(d as any).document_templates?.template_version || '1'}`,
    entity_ref: { entity_type: d.entity_type, entity_id: d.entity_id },
    data_snapshot_hash: d.data_snapshot_hash || '',
    rendered_artifact_hash: d.rendered_artifact_hash || '',
    status: d.status === 'Draft' ? 'Draft' :
            d.status === 'Pending' ? 'PendingSignature' :
            d.status === 'Executed' ? 'Executed' : 'Generated',
    generated_at: d.created_at,
    executed_at: d.executed_at || undefined,
  }));

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.doc_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.template_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (template.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesType = docTypeFilter === 'all' || template.doc_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.template_ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewTemplate = (template: DocumentTemplateCardData) => {
    setPreviewTemplate(template);
  };

  const handleViewDocument = (doc: typeof documents[0]) => {
    toast.info(`Viewing document: ${doc.document_id}`);
  };

  const handleRequestSignature = (doc: typeof documents[0]) => {
    toast.success('Signature request sent', {
      description: `Envelope created for ${doc.document_id}`,
    });
  };

  const isLoading = templatesLoading || documentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = documents.filter(d => d.status === 'PendingSignature').length;
  const executedCount = documents.filter(d => d.status === 'Executed').length;

  return (
    <div className="space-y-4">
      {/* Compact Header with inline stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Document Center</h1>
            <p className="text-xs text-muted-foreground">
              Fill, generate & manage official documents
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">{templates.length} templates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">{pendingCount} pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">{executedCount} executed</span>
            </div>
          </div>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-3">
          <TabsList className="h-9">
            <TabsTrigger value="official-forms" className="gap-1.5 text-xs">
              <PenLine className="w-3.5 h-3.5" />
              Fill & Generate
            </TabsTrigger>
            <TabsTrigger value="instances" className="text-xs">
              <FileCheck className="w-3.5 h-3.5 mr-1" />
              Documents
              {documents.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{documents.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
            <TabsTrigger value="generator" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-48 h-9 text-sm"
              />
            </div>
            
            {activeTab === 'instances' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-xs">
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Generated">Generated</SelectItem>
                  <SelectItem value="PendingSignature">Pending Signature</SelectItem>
                  <SelectItem value="Executed">Executed</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === 'templates' && (
              <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                <SelectTrigger className="w-40 h-9 text-xs">
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Doc Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Mandate">Mandate</SelectItem>
                  <SelectItem value="MOU">MOU</SelectItem>
                  <SelectItem value="SPA">SPA</SelectItem>
                  <SelectItem value="Reservation">Reservation</SelectItem>
                  <SelectItem value="CommissionInvoice">Commission Invoice</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Official Forms Tab - Primary, Fill & Generate */}
        <TabsContent value="official-forms" className="mt-3">
          <PDFTemplatesSection />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="instances" className="mt-3">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Document Instances</CardTitle>
              <CardDescription className="text-xs">
                Generated documents linked to deals and entities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredDocuments.length > 0 ? (
                <div className="divide-y">
                  {filteredDocuments.map((doc) => (
                    <DocumentInstanceRow
                      key={doc.document_id}
                      document={doc as any}
                      onView={handleViewDocument as any}
                      onDownload={(d) => toast.info(`Downloading ${d.document_id}`)}
                      onRequestSignature={handleRequestSignature as any}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No documents found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((template) => (
              <DocumentTemplateCard
                key={template.template_id}
                template={template}
                onView={handleViewTemplate}
                onEdit={(t) => toast.info(`Editing ${t.template_id}`)}
                onDuplicate={(t) => toast.success(`Template duplicated: ${t.doc_type}`)}
              />
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="p-8 text-center border rounded-lg">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No templates found</p>
            </div>
          )}
        </TabsContent>

        {/* Generate Documents Tab */}
        <TabsContent value="generator" className="mt-3">
          <DocumentGeneratorPanel
            onDocumentGenerated={(docId, title) => {
              toast.success(`Document created: ${title}`, {
                description: `ID: ${docId}`,
              });
            }}
          />
        </TabsContent>
      </Tabs>

      <DocumentTemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      />
    </div>
  );
}
