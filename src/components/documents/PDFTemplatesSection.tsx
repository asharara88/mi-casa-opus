import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  Loader2,
  PenLine,
  Share2,
  Mail,
  MessageCircle,
  Copy,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateProfessionalPDFHTML, generateFilledPDF } from '@/lib/pdf-document-generator';
import { StaticFormFiller } from '@/components/documents/StaticFormFiller';
import { useStaticFormFiller } from '@/hooks/useStaticFormFiller';
import { TEMPLATE_SCHEMAS } from '@/lib/template-schemas';

const PDF_TO_FORM_MAP: Record<string, string> = {
  '01': 'FORM_01_SELLER_AUTH',
  '02': 'FORM_02_BUYER_REP',
  '03': 'FORM_03_MARKETING',
  '04': 'FORM_04_AGENT_LICENSE',
  '05': 'FORM_05_COMPANY_LICENSE',
  '06': 'FORM_06_AGENT_AGREEMENT',
  '07': 'FORM_07_OFFER',
  '08': 'FORM_08_MOU',
  '09': 'FORM_09_RESERVATION',
  '10': 'FORM_10_CLOSING',
  '11': 'FORM_11_NOC',
  '12': 'FORM_12_INVOICE',
  '13': 'FORM_13_SPLIT',
  '14': 'FORM_14_REFUND',
  '15': 'FORM_15_LEDGER',
  '16': 'FORM_16_PRIVACY',
  '17': 'FORM_17_COMPLAINT',
  '18': 'FORM_18_GOVERNANCE',
};

const PDF_TEMPLATES = [
  { id: '07', filename: '07_offer_letter_expression_of_interest.md', title: 'Offer Letter / EOI', subtitle: 'Expression of Interest', category: 'Transaction', description: 'Formal offer letter and expression of interest', icon: FileText, tags: ['Transaction', 'Offer', 'Sales'] },
  { id: '01', filename: '01_seller_landlord_authorization.md', title: 'Seller / Landlord Authorization', subtitle: 'Form A', category: 'Authorization', description: 'Seller or landlord representation authorization', icon: FileCheck, tags: ['ADM', 'Mandatory'] },
  { id: '02', filename: '02_buyer_tenant_representation_agreement.md', title: 'Buyer / Tenant Representation', subtitle: 'Form B', category: 'Authorization', description: 'Buyer or tenant representation agreement', icon: Users, tags: ['ADM', 'Mandatory'] },
  { id: '12', filename: '12_commission_vat_invoice.md', title: 'Commission VAT Invoice', subtitle: 'Tax Invoice', category: 'Finance', description: 'Commission invoice with VAT calculation', icon: Receipt, tags: ['Finance', 'Invoice'] },
  { id: '09', filename: '09_reservation_booking_form.md', title: 'Reservation / Booking Form', subtitle: 'Unit Reservation', category: 'Transaction', description: 'Property reservation and booking', icon: ClipboardList, tags: ['Transaction', 'Booking'] },
  { id: '03', filename: '03_property_listing_authorization_marketing_consent.md', title: 'Listing Authorization', subtitle: 'Marketing Consent', category: 'Marketing', description: 'Authorization to list and market', icon: Building2, tags: ['Marketing'] },
  { id: '06', filename: '06_agent_to_agent_agency_agreement.md', title: 'Agent-to-Agent Agreement', subtitle: 'Co-Broker Terms', category: 'Agreements', description: 'Inter-agency cooperation agreement', icon: Users, tags: ['Co-Broker'] },
  { id: '08', filename: '08_memorandum_of_understanding_pre_spa.md', title: 'MOU / Pre-SPA', subtitle: 'Memorandum of Understanding', category: 'Transaction', description: 'MOU preceding Sale and Purchase Agreement', icon: Scale, tags: ['Transaction', 'MOU'] },
  { id: '13', filename: '13_commission_authorization_split_sheet.md', title: 'Commission Split Sheet', subtitle: 'Authorization & Splits', category: 'Finance', description: 'Commission split breakdown', icon: Receipt, tags: ['Finance', 'Commission'] },
  { id: '10', filename: '10_deal_completion_closing_checklist.md', title: 'Closing Checklist', subtitle: 'Deal Completion', category: 'Operations', description: 'Deal closing and completion checklist', icon: FileCheck, tags: ['Operations'] },
  { id: '11', filename: '11_noc_request_clearance_tracker.md', title: 'NOC Request Tracker', subtitle: 'Clearance Tracker', category: 'Operations', description: 'NOC request and tracking', icon: Shield, tags: ['Operations', 'NOC'] },
  { id: '16', filename: '16_client_data_consent_privacy_acknowledgment.md', title: 'Client Data Consent', subtitle: 'Privacy Acknowledgment', category: 'Compliance', description: 'Data consent and privacy form', icon: Shield, tags: ['Compliance', 'Privacy'] },
  { id: '14', filename: '14_refund_cancellation_approval_form.md', title: 'Refund / Cancellation', subtitle: 'Approval Form', category: 'Finance', description: 'Refund and cancellation approval', icon: AlertTriangle, tags: ['Finance', 'Refund'] },
  { id: '15', filename: '15_financial_reconciliation_deal_ledger.md', title: 'Financial Reconciliation', subtitle: 'Deal Ledger', category: 'Finance', description: 'Financial reconciliation ledger', icon: Receipt, tags: ['Finance'] },
  { id: '17', filename: '17_complaint_dispute_incident_register.md', title: 'Complaint & Dispute Register', subtitle: 'Incident Register', category: 'Compliance', description: 'Complaint and incident tracking', icon: AlertTriangle, tags: ['Compliance'] },
  { id: '04', filename: '04_agent_license_registration_record.md', title: 'Agent License Record', subtitle: 'BRN Record', category: 'Compliance', description: 'Agent licensing documentation', icon: Shield, tags: ['Compliance', 'License'] },
  { id: '05', filename: '05_company_trade_license_regulatory_record.md', title: 'Company Trade License', subtitle: 'Regulatory Record', category: 'Compliance', description: 'Company trade license record', icon: Building2, tags: ['Compliance'] },
  { id: '18', filename: '18_internal_agent_governance_pack.md', title: 'Agent Governance Pack', subtitle: 'Internal Governance', category: 'Compliance', description: 'Agent governance and policy pack', icon: Shield, tags: ['Compliance'] },
];

const CATEGORY_COLORS: Record<string, string> = {
  Authorization: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
  Marketing: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
  Compliance: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
  Agreements: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  Transaction: 'bg-primary/15 text-primary border-primary/25',
  Operations: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/25',
  Finance: 'bg-green-500/15 text-green-500 border-green-500/25',
};

export function PDFTemplatesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<typeof PDF_TEMPLATES[0] | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [fillingTemplateId, setFillingTemplateId] = useState<string | null>(null);
  const [filledResult, setFilledResult] = useState<{ title: string; content: string; referenceNumber: string } | null>(null);
  const { saveDocument, createFollowUpTask, isLoading: isSaving } = useStaticFormFiller();

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
      const response = await fetch(`/docs/templates/${template.filename}`);
      setPreviewContent(response.ok ? await response.text() : 'Template not available.');
    } catch {
      setPreviewContent('Unable to load preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExportPDF = async (template: typeof PDF_TEMPLATES[0]) => {
    setIsExporting(template.id);
    try {
      const response = await fetch(`/docs/templates/${template.filename}`);
      if (!response.ok) throw new Error('Failed to load');
      const content = await response.text();
      const htmlContent = generateProfessionalPDFHTML(content, {
        id: template.id, title: template.title, subtitle: template.subtitle, category: template.category
      });
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) { toast.error('Allow pop-ups to export'); return; }
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => { setTimeout(() => { printWindow.print(); printWindow.onafterprint = () => printWindow.close(); }, 250); };
      toast.success('PDF export ready');
    } catch { toast.error('Failed to export'); } finally { setIsExporting(null); }
  };

  const handleStartFill = (templateId: string) => {
    const formId = PDF_TO_FORM_MAP[templateId];
    if (!formId || !TEMPLATE_SCHEMAS[formId]) { toast.error('Fill-in not available for this template'); return; }
    setPreviewTemplate(null);
    setFillingTemplateId(formId);
  };

  const handleFillComplete = async (formData: Record<string, unknown>, filledContent: string) => {
    if (!fillingTemplateId) return;
    const result = await saveDocument(fillingTemplateId, formData, filledContent);
    if (result) {
      await createFollowUpTask(fillingTemplateId, result.documentId);
      setFilledResult({ title: result.title, content: result.body, referenceNumber: result.referenceNumber });
    }
    setFillingTemplateId(null);
  };

  const handlePrintLetterhead = () => {
    if (!filledResult) return;
    generateFilledPDF(filledResult.content, filledResult.title, filledResult.referenceNumber);
  };

  const handleShare = (method: 'email' | 'whatsapp' | 'copy') => {
    if (!filledResult) return;
    const subject = encodeURIComponent(filledResult.title);
    const body = encodeURIComponent(`${filledResult.title}\nRef: ${filledResult.referenceNumber}\n\n${filledResult.content.slice(0, 500)}...`);
    if (method === 'email') window.open(`mailto:?subject=${subject}&body=${body}`);
    else if (method === 'whatsapp') window.open(`https://wa.me/?text=${body}`);
    else { navigator.clipboard.writeText(filledResult.content); toast.success('Copied to clipboard'); }
  };

  return (
    <div className="space-y-4">
      {/* Compact Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search 18 official templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant={selectedCategory === null ? 'default' : 'outline'} onClick={() => setSelectedCategory(null)} className="h-8 text-xs px-2.5">
            All ({PDF_TEMPLATES.length})
          </Button>
          {categories.map(cat => (
            <Button key={cat} size="sm" variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)} className="h-8 text-xs px-2.5">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Compact Template List */}
      <ScrollArea className="h-[520px]">
        <div className="space-y-1.5 pr-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const formId = PDF_TO_FORM_MAP[template.id];
            const hasFillForm = formId && TEMPLATE_SCHEMAS[formId];
            return (
              <Card key={template.id} className="group hover:border-primary/40 transition-all">
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Number badge */}
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border", CATEGORY_COLORS[template.category])}>
                    {template.id}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{template.title}</h4>
                      {template.tags.includes('ADM') && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0 border-blue-500/30 text-blue-500">ADM</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{template.subtitle} · {template.description}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePreview(template)} title="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleExportPDF(template)} disabled={isExporting === template.id} title="Export blank PDF">
                      {isExporting === template.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    </Button>
                    {hasFillForm ? (
                      <Button size="sm" onClick={() => handleStartFill(template.id)} className="h-7 text-xs gap-1 px-2.5">
                        <PenLine className="h-3 w-3" />
                        Fill & Issue
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleExportPDF(template)} className="h-7 text-xs gap-1 px-2.5">
                        <Download className="h-3 w-3" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No templates match your search</p>
          </div>
        )}
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              {previewTemplate?.title}
              <Badge variant="outline" className="ml-1 text-xs">{previewTemplate?.subtitle}</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[55vh] mt-3">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg">{previewContent}</pre>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>Close</Button>
            {previewTemplate && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleExportPDF(previewTemplate)}>
                  <Printer className="h-3.5 w-3.5 mr-1.5" />Export PDF
                </Button>
                <Button size="sm" onClick={() => handleStartFill(previewTemplate.id)}>
                  <PenLine className="h-3.5 w-3.5 mr-1.5" />Fill & Issue
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fill & Generate Dialog */}
      <Dialog open={!!fillingTemplateId} onOpenChange={() => setFillingTemplateId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <PenLine className="h-4 w-4 text-primary" />
              Fill Document
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete the fields below to generate a ready-to-sign document on branded letterhead.
            </DialogDescription>
          </DialogHeader>
          {fillingTemplateId && (
            <StaticFormFiller
              templateId={fillingTemplateId}
              onComplete={handleFillComplete}
              onCancel={() => setFillingTemplateId(null)}
              isProcessing={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Filled Result Dialog */}
      <Dialog open={!!filledResult} onOpenChange={() => setFilledResult(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-4 w-4 text-emerald-500" />
              {filledResult?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reference: {filledResult?.referenceNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[50vh] mt-2">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg">{filledResult?.content}</pre>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setFilledResult(null)}>Close</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Share2 className="h-3.5 w-3.5 mr-1.5" />Share</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('email')}><Mail className="h-3.5 w-3.5 mr-2" />Email</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}><MessageCircle className="h-3.5 w-3.5 mr-2" />WhatsApp</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy')}><Copy className="h-3.5 w-3.5 mr-2" />Copy</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handlePrintLetterhead}><Printer className="h-3.5 w-3.5 mr-1.5" />Print on Letterhead</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
