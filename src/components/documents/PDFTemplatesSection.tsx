import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Building2, 
  Users, 
  Shield, 
  Receipt, 
  FileCheck,
  ClipboardList,
  AlertTriangle,
  Scale,
  Printer,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateProfessionalPDFHTML } from '@/lib/pdf-document-generator';

// Define all PDF templates from docs/templates
const PDF_TEMPLATES = [
  // ── High frequency (daily/weekly) ──
  {
    id: '07',
    filename: '07_offer_letter_expression_of_interest.md',
    title: 'Offer Letter / EOI',
    subtitle: 'Expression of Interest',
    category: 'Transaction',
    description: 'Formal offer letter and expression of interest document',
    icon: FileText,
    tags: ['Transaction', 'Offer', 'Sales'],
  },
  {
    id: '01',
    filename: '01_seller_landlord_authorization.md',
    title: 'Seller / Landlord Authorization',
    subtitle: 'Form A Equivalent',
    category: 'Authorization',
    description: 'Official authorization form for seller or landlord representation',
    icon: FileCheck,
    tags: ['ADM', 'Mandatory', 'Sales', 'Leasing'],
  },
  {
    id: '02',
    filename: '02_buyer_tenant_representation_agreement.md',
    title: 'Buyer / Tenant Representation Agreement',
    subtitle: 'Form B Equivalent',
    category: 'Authorization',
    description: 'Buyer or tenant representation and engagement terms',
    icon: Users,
    tags: ['ADM', 'Mandatory', 'Sales', 'Leasing'],
  },
  {
    id: '12',
    filename: '12_commission_vat_invoice.md',
    title: 'Commission VAT Invoice',
    subtitle: 'Tax Invoice',
    category: 'Finance',
    description: 'Commission invoice with VAT calculation',
    icon: Receipt,
    tags: ['Finance', 'Invoice', 'VAT'],
  },
  {
    id: '09',
    filename: '09_reservation_booking_form.md',
    title: 'Reservation / Booking Form',
    subtitle: 'Unit Reservation',
    category: 'Transaction',
    description: 'Property reservation and booking confirmation',
    icon: ClipboardList,
    tags: ['Transaction', 'Booking', 'Off-Plan'],
  },
  {
    id: '03',
    filename: '03_property_listing_authorization_marketing_consent.md',
    title: 'Property Listing Authorization',
    subtitle: 'Marketing Consent',
    category: 'Marketing',
    description: 'Authorization to list and market property',
    icon: Building2,
    tags: ['Marketing', 'Compliance'],
  },
  {
    id: '06',
    filename: '06_agent_to_agent_agency_agreement.md',
    title: 'Agent-to-Agent Agreement',
    subtitle: 'Co-Broker Terms',
    category: 'Agreements',
    description: 'Inter-agency cooperation and commission split agreement',
    icon: Users,
    tags: ['Co-Broker', 'Commission', 'Agreement'],
  },
  // ── Medium frequency (weekly/monthly) ──
  {
    id: '08',
    filename: '08_memorandum_of_understanding_pre_spa.md',
    title: 'Memorandum of Understanding',
    subtitle: 'Pre-SPA Agreement',
    category: 'Transaction',
    description: 'MOU document preceding Sale and Purchase Agreement',
    icon: Scale,
    tags: ['Transaction', 'MOU', 'Sales'],
  },
  {
    id: '13',
    filename: '13_commission_authorization_split_sheet.md',
    title: 'Commission Split Sheet',
    subtitle: 'Authorization & Splits',
    category: 'Finance',
    description: 'Commission authorization and split breakdown',
    icon: Receipt,
    tags: ['Finance', 'Commission', 'Splits'],
  },
  {
    id: '10',
    filename: '10_deal_completion_closing_checklist.md',
    title: 'Deal Completion Checklist',
    subtitle: 'Closing Checklist',
    category: 'Operations',
    description: 'Comprehensive deal closing and completion checklist',
    icon: FileCheck,
    tags: ['Operations', 'Checklist', 'Closing'],
  },
  {
    id: '11',
    filename: '11_noc_request_clearance_tracker.md',
    title: 'NOC Request Tracker',
    subtitle: 'Clearance Tracker',
    category: 'Operations',
    description: 'No Objection Certificate request and tracking',
    icon: Shield,
    tags: ['Operations', 'NOC', 'Compliance'],
  },
  {
    id: '16',
    filename: '16_client_data_consent_privacy_acknowledgment.md',
    title: 'Client Data Consent',
    subtitle: 'Privacy Acknowledgment',
    category: 'Compliance',
    description: 'Client data consent and privacy acknowledgment form',
    icon: Shield,
    tags: ['Compliance', 'Privacy', 'GDPR'],
  },
  // ── Low frequency (monthly/quarterly) ──
  {
    id: '14',
    filename: '14_refund_cancellation_approval_form.md',
    title: 'Refund / Cancellation Form',
    subtitle: 'Approval Form',
    category: 'Finance',
    description: 'Refund and cancellation approval documentation',
    icon: AlertTriangle,
    tags: ['Finance', 'Refund', 'Cancellation'],
  },
  {
    id: '15',
    filename: '15_financial_reconciliation_deal_ledger.md',
    title: 'Financial Reconciliation',
    subtitle: 'Deal Ledger',
    category: 'Finance',
    description: 'Financial reconciliation and deal ledger record',
    icon: Receipt,
    tags: ['Finance', 'Reconciliation', 'Ledger'],
  },
  {
    id: '17',
    filename: '17_complaint_dispute_incident_register.md',
    title: 'Complaint & Dispute Register',
    subtitle: 'Incident Register',
    category: 'Compliance',
    description: 'Complaint, dispute, and incident tracking register',
    icon: AlertTriangle,
    tags: ['Compliance', 'Disputes', 'Register'],
  },
  {
    id: '04',
    filename: '04_agent_license_registration_record.md',
    title: 'Agent License Registration Record',
    subtitle: 'BRN Record',
    category: 'Compliance',
    description: 'Agent licensing and registration documentation',
    icon: Shield,
    tags: ['Compliance', 'Agent', 'License'],
  },
  {
    id: '05',
    filename: '05_company_trade_license_regulatory_record.md',
    title: 'Company Trade License',
    subtitle: 'Regulatory Record',
    category: 'Compliance',
    description: 'Company trade license and regulatory compliance record',
    icon: Building2,
    tags: ['Compliance', 'Company', 'License'],
  },
  {
    id: '18',
    filename: '18_internal_agent_governance_pack.md',
    title: 'Agent Governance Pack',
    subtitle: 'Internal Governance',
    category: 'Compliance',
    description: 'Internal agent governance and policy documentation',
    icon: Shield,
    tags: ['Compliance', 'Governance', 'Internal'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Authorization: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Marketing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Compliance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Agreements: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Transaction: 'bg-primary/20 text-primary border-primary/30',
  Operations: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Finance: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function PDFTemplatesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<typeof PDF_TEMPLATES[0] | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const categories = [...new Set(PDF_TEMPLATES.map(t => t.category))];

  const filteredTemplates = PDF_TEMPLATES.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handlePreview = async (template: typeof PDF_TEMPLATES[0]) => {
    setPreviewTemplate(template);
    setIsLoadingPreview(true);
    
    try {
      // Fetch the markdown content
      const response = await fetch(`/docs/templates/${template.filename}`);
      if (response.ok) {
        const content = await response.text();
        setPreviewContent(content);
      } else {
        setPreviewContent('Template content not available for preview.');
      }
    } catch {
      setPreviewContent('Unable to load template preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownload = (template: typeof PDF_TEMPLATES[0]) => {
    // Create download link for the markdown file
    const link = document.createElement('a');
    link.href = `/docs/templates/${template.filename}`;
    link.download = template.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async (template: typeof PDF_TEMPLATES[0]) => {
    setIsExporting(template.id);
    
    try {
      // Fetch the markdown content
      const response = await fetch(`/docs/templates/${template.filename}`);
      if (!response.ok) throw new Error('Failed to load template');
      
      const content = await response.text();
      
      // Generate professional PDF HTML with branding
      const htmlContent = generateProfessionalPDFHTML(content, {
        id: template.id,
        title: template.title,
        subtitle: template.subtitle,
        category: template.category
      });
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast.error('Please allow pop-ups to export PDF');
        return;
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close after print dialog (user may cancel or complete)
          printWindow.onafterprint = () => printWindow.close();
        }, 250);
      };
      
      toast.success('PDF export ready - use "Save as PDF" in print dialog');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Official Document Templates</h3>
        <p className="text-sm text-muted-foreground">
          ADM-compliant forms and regulatory templates for UAE real estate transactions
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{PDF_TEMPLATES.length}</div>
            <div className="text-xs text-muted-foreground">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{categories.length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {PDF_TEMPLATES.filter(t => t.tags.includes('ADM')).length}
            </div>
            <div className="text-xs text-muted-foreground">ADM Forms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {PDF_TEMPLATES.filter(t => t.tags.includes('Mandatory')).length}
            </div>
            <div className="text-xs text-muted-foreground">Mandatory</div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs mb-1', CATEGORY_COLORS[template.category])}
                        >
                          {template.category}
                        </Badge>
                        <CardTitle className="text-sm line-clamp-1">{template.title}</CardTitle>
                        <CardDescription className="text-xs">{template.subtitle}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      #{template.id}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleExportPDF(template)}
                      disabled={isExporting === template.id}
                    >
                      {isExporting === template.id ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Printer className="h-3.5 w-3.5 mr-1" />
                      )}
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No templates match your search</p>
          </div>
        )}
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewTemplate?.title}
              <Badge variant="outline" className="ml-2">
                {previewTemplate?.subtitle}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg">
                {previewContent}
              </pre>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            {previewTemplate && (
              <>
                <Button variant="outline" onClick={() => handleDownload(previewTemplate)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download MD
                </Button>
                <Button onClick={() => handleExportPDF(previewTemplate)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
