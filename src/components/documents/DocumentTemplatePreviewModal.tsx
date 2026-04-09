import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Copy,
  Check,
  Calendar,
  Printer
} from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DocType } from "@/types/bos";
import { generateProfessionalPDFHTML } from "@/lib/pdf-document-generator";

interface DocumentTemplatePreviewModalProps {
  template: {
    template_id: string;
    name?: string;
    doc_type: DocType;
    template_version: string | number;
    effective_from: string;
    template_content?: string;
    is_published: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DOC_TYPE_COLORS: Record<DocType, { bg: string; text: string }> = {
  MOU: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  SPA: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Reservation: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Mandate: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  ICA: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  NDA: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  POA: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  CommissionInvoice: { bg: 'bg-green-500/20', text: 'text-green-400' },
  Receipt: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  Other: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
};

// Map template_id to category
function getTemplateCategory(templateId: string): string {
  if (templateId.includes('authorization') || templateId.includes('representation')) return 'Client Authorization';
  if (templateId.includes('listing') || templateId.includes('marketing')) return 'Listing & Marketing';
  if (templateId.includes('license') || templateId.includes('trade')) return 'Regulatory';
  if (templateId.includes('offer') || templateId.includes('mou') || templateId.includes('reservation')) return 'Transaction';
  if (templateId.includes('commission') || templateId.includes('invoice') || templateId.includes('financial')) return 'Financial';
  if (templateId.includes('compliance') || templateId.includes('consent') || templateId.includes('dispute')) return 'Compliance';
  return 'General';
}

export function DocumentTemplatePreviewModal({
  template,
  open,
  onOpenChange,
}: DocumentTemplatePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (template?.template_content) {
      navigator.clipboard.writeText(template.template_content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [template]);

  const handleDownload = useCallback(() => {
    if (template) {
      const blob = new Blob([template.template_content || ''], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.template_id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Template downloaded");
    }
  }, [template]);

  const handlePrint = useCallback(() => {
    if (template) {
      const templateData = {
        id: template.template_id,
        title: template.name || template.template_id.replace(/_/g, ' ').replace(/^\d+\s*/, ''),
        subtitle: `Version ${template.template_version}`,
        category: getTemplateCategory(template.template_id),
      };
      
      const professionalHTML = generateProfessionalPDFHTML(
        template.template_content || '',
        templateData
      );
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(professionalHTML);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
      }
    }
  }, [template]);

  if (!template) return null;

  const colors = DOC_TYPE_COLORS[template.doc_type] || { bg: 'bg-muted', text: 'text-muted-foreground' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colors.bg)}>
                <FileText className={cn("w-6 h-6", colors.text)} />
              </div>
              <div>
                <DialogTitle className="text-left">
                  {template.name || template.template_id}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn("text-xs", colors.text)}>
                    {template.doc_type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    v{template.template_version}
                  </Badge>
                  {template.is_published && (
                    <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-500">
                      Published
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Effective: {new Date(template.effective_from).toLocaleDateString()}</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh] border rounded-lg p-4 bg-muted/30">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
            {template.template_content || "No content available"}
          </pre>
        </ScrollArea>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-2">Copy</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              <span className="ml-2">Print</span>
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="ml-2">Download</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
