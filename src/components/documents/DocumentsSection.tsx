import { useState } from 'react';
import { useDocumentTemplates, useDocumentInstances } from '@/hooks/useDocuments';
import { DocumentTemplateCard } from './DocumentTemplateCard';
import { DocumentInstanceRow } from './DocumentInstanceRow';
import { DocumentGeneratorPanel } from './DocumentGeneratorPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  FileText, 
  FileCheck, 
  Filter,
  FolderOpen,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export function DocumentsSection() {
  const { data: rawTemplates, isLoading: templatesLoading } = useDocumentTemplates();
  const { data: rawDocuments, isLoading: documentsLoading } = useDocumentInstances();
  
  const [activeTab, setActiveTab] = useState('instances');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');

  // Transform templates to expected format
  const templates = (rawTemplates || []).map(t => ({
    template_id: t.template_id,
    doc_type: t.doc_type,
    template_version: parseInt(t.template_version) || 1,
    effective_from: t.effective_from,
    required_signers_schema: t.required_signers_schema || {},
    data_binding_schema: t.data_binding_schema || {},
    template_content: t.template_content || '',
    is_published: t.status === 'Published',
    created_at: t.created_at,
  }));

  // Transform documents to expected format
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
                          template.template_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = docTypeFilter === 'all' || template.doc_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.template_ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewTemplate = (template: typeof templates[0]) => {
    toast.info(`Viewing template: ${template.doc_type}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Center</h1>
          <p className="text-sm text-muted-foreground">
            Templates and executed documents
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-xs text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'PendingSignature').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Signature</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'Executed').length}
                </p>
                <p className="text-xs text-muted-foreground">Executed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="instances">Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="generator">AI Generator</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            
            {activeTab === 'instances' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Generated">Generated</SelectItem>
                  <SelectItem value="PendingSignature">Pending Signature</SelectItem>
                  <SelectItem value="Executed">Executed</SelectItem>
                  <SelectItem value="Voided">Voided</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === 'templates' && (
              <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Doc Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MOU">MOU</SelectItem>
                  <SelectItem value="SPA">SPA</SelectItem>
                  <SelectItem value="Reservation">Reservation</SelectItem>
                  <SelectItem value="Mandate">Mandate</SelectItem>
                  <SelectItem value="ICA">ICA</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Documents Tab */}
        <TabsContent value="instances" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Instances</CardTitle>
              <CardDescription>
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
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <DocumentTemplateCard
                key={template.template_id}
                template={template as any}
                onView={handleViewTemplate as any}
                onEdit={(t) => toast.info(`Editing ${t.template_id}`)}
                onDuplicate={(t) => toast.success(`Template duplicated: ${t.doc_type}`)}
              />
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="p-8 text-center border rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </TabsContent>

        {/* AI Generator Tab */}
        <TabsContent value="generator" className="mt-0">
          <DocumentGeneratorPanel
            onDocumentGenerated={(docId, title) => {
              toast.success(`Document created: ${title}`, {
                description: `ID: ${docId}`,
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
