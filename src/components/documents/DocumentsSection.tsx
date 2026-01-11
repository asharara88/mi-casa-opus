import { useState } from 'react';
import { DocumentTemplate, DocumentInstance, DocType } from '@/types/bos';
import { DocumentTemplateCard } from './DocumentTemplateCard';
import { DocumentInstanceRow } from './DocumentInstanceRow';
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
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

// Demo data
const DEMO_TEMPLATES: DocumentTemplate[] = [
  {
    template_id: 'TPL-OL-001',
    doc_type: 'OfferLetter',
    template_version: 1,
    effective_from: '2024-01-01',
    required_signers_schema: {
      roles: ['Buyer', 'Seller'],
      min_signers: 2,
    },
    data_binding_schema: {
      buyer_name: 'string',
      seller_name: 'string',
      property_address: 'string',
      offer_amount: 'number',
    },
    template_content: '# Offer Letter\n\nThis offer...',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    template_id: 'TPL-RF-001',
    doc_type: 'ReservationForm',
    template_version: 1,
    effective_from: '2024-01-01',
    required_signers_schema: {
      roles: ['Buyer', 'Developer'],
      min_signers: 2,
    },
    data_binding_schema: {
      buyer_name: 'string',
      unit_number: 'string',
      deposit_amount: 'number',
    },
    template_content: '# Reservation Form\n\nThis reservation...',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    template_id: 'TPL-SPA-001',
    doc_type: 'SPA',
    template_version: 2,
    effective_from: '2024-01-15',
    required_signers_schema: {
      roles: ['Buyer', 'Seller', 'Witness'],
      min_signers: 3,
    },
    data_binding_schema: {
      buyer_name: 'string',
      seller_name: 'string',
      property_address: 'string',
      sale_price: 'number',
      completion_date: 'date',
    },
    template_content: '# Sales Purchase Agreement\n\nThis agreement...',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    template_id: 'TPL-ICA-001',
    doc_type: 'ICA',
    template_version: 1,
    effective_from: '2024-01-01',
    required_signers_schema: {
      roles: ['Broker', 'Brokerage'],
      min_signers: 2,
    },
    data_binding_schema: {
      broker_name: 'string',
      license_no: 'string',
      commission_split: 'number',
    },
    template_content: '# Independent Contractor Agreement\n\nThis agreement...',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    template_id: 'TPL-MA-001',
    doc_type: 'MandateAgreement',
    template_version: 1,
    effective_from: '2024-01-01',
    required_signers_schema: {
      roles: ['Owner', 'Brokerage'],
      min_signers: 2,
    },
    data_binding_schema: {
      owner_name: 'string',
      property_address: 'string',
      listing_price: 'number',
      mandate_type: 'string',
    },
    template_content: '# Mandate Agreement\n\nThis mandate...',
    is_published: false,
    created_at: new Date().toISOString(),
  },
];

const DEMO_DOCUMENTS: DocumentInstance[] = [
  {
    document_id: 'DOC-001',
    template_ref: 'OfferLetter_v1',
    entity_ref: { entity_type: 'Deal', entity_id: 'DEAL-001' },
    data_snapshot_hash: 'abc123def456',
    rendered_artifact_hash: 'xyz789ghi012',
    status: 'Executed',
    generated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    executed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    document_id: 'DOC-002',
    template_ref: 'ReservationForm_v1',
    entity_ref: { entity_type: 'Deal', entity_id: 'DEAL-001' },
    data_snapshot_hash: 'def456abc789',
    rendered_artifact_hash: 'ghi012xyz345',
    status: 'PendingSignature',
    generated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    document_id: 'DOC-003',
    template_ref: 'SPA_v2',
    entity_ref: { entity_type: 'Deal', entity_id: 'DEAL-002' },
    data_snapshot_hash: 'jkl345mno678',
    rendered_artifact_hash: 'pqr901stu234',
    status: 'Generated',
    generated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    document_id: 'DOC-004',
    template_ref: 'ICA_v1',
    entity_ref: { entity_type: 'Broker', entity_id: 'BRK-001' },
    data_snapshot_hash: 'vwx567yza890',
    rendered_artifact_hash: 'bcd123efg456',
    status: 'Executed',
    generated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    executed_at: new Date(Date.now() - 86400000 * 28).toISOString(),
  },
];

export function DocumentsSection() {
  const [activeTab, setActiveTab] = useState('instances');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');

  const filteredTemplates = DEMO_TEMPLATES.filter(template => {
    const matchesSearch = template.doc_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.template_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = docTypeFilter === 'all' || template.doc_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredDocuments = DEMO_DOCUMENTS.filter(doc => {
    const matchesSearch = doc.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.template_ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewTemplate = (template: DocumentTemplate) => {
    toast.info(`Viewing template: ${template.doc_type}`);
  };

  const handleViewDocument = (doc: DocumentInstance) => {
    toast.info(`Viewing document: ${doc.document_id}`);
  };

  const handleRequestSignature = (doc: DocumentInstance) => {
    toast.success('Signature request sent', {
      description: `Envelope created for ${doc.document_id}`,
    });
  };

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
                <p className="text-2xl font-bold">{DEMO_TEMPLATES.length}</p>
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
                <p className="text-2xl font-bold">{DEMO_DOCUMENTS.length}</p>
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
                  {DEMO_DOCUMENTS.filter(d => d.status === 'PendingSignature').length}
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
                  {DEMO_DOCUMENTS.filter(d => d.status === 'Executed').length}
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
                  <SelectItem value="OfferLetter">Offer Letter</SelectItem>
                  <SelectItem value="ReservationForm">Reservation Form</SelectItem>
                  <SelectItem value="SPA">SPA</SelectItem>
                  <SelectItem value="ICA">ICA</SelectItem>
                  <SelectItem value="MandateAgreement">Mandate Agreement</SelectItem>
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
                      document={doc}
                      onView={handleViewDocument}
                      onDownload={(d) => toast.info(`Downloading ${d.document_id}`)}
                      onRequestSignature={handleRequestSignature}
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
                template={template}
                onView={handleViewTemplate}
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
      </Tabs>
    </div>
  );
}
