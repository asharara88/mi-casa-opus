import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Lock, 
  Edit2, 
  Copy, 
  Eye,
  Calendar,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocType } from '@/types/bos';

// Define a flexible template type for the card
export interface DocumentTemplateCardData {
  template_id: string;
  name?: string;
  doc_type: DocType;
  template_version: string | number;
  effective_from: string;
  required_signers_schema?: { roles?: string[]; min_signers?: number } | null;
  data_binding_schema?: Record<string, unknown> | null;
  template_content?: string;
  is_published: boolean;
  created_at?: string;
}

interface DocumentTemplateCardProps {
  template: DocumentTemplateCardData;
  onView: (template: DocumentTemplateCardData) => void;
  onEdit?: (template: DocumentTemplateCardData) => void;
  onDuplicate?: (template: DocumentTemplateCardData) => void;
}

// Colors for doc types matching database enum
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

export function DocumentTemplateCard({ 
  template, 
  onView, 
  onEdit, 
  onDuplicate 
}: DocumentTemplateCardProps) {
  const colors = DOC_TYPE_COLORS[template.doc_type] || { bg: 'bg-muted', text: 'text-muted-foreground' };

  return (
    <Card className="hover:border-primary/50 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colors.bg)}>
            <FileText className={cn("w-6 h-6", colors.text)} />
          </div>
          {template.is_published ? (
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              <Lock className="w-3 h-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
              Draft
            </Badge>
          )}
        </div>
        <CardTitle className="text-base mt-3">
          {template.name || formatDocType(template.doc_type)}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Hash className="w-3 h-3" />
          <span className="font-mono">{template.template_id.slice(-8)}</span>
          <span>•</span>
          <span>v{template.template_version}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Doc Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", colors.text)}>
              {template.doc_type}
            </Badge>
          </div>
          
          {/* Required Signers */}
          {(template.required_signers_schema as { roles?: string[] })?.roles?.length ? (
            <div className="text-xs">
              <span className="text-muted-foreground">Required Signers:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(template.required_signers_schema as { roles: string[] }).roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {/* Effective Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Effective: {new Date(template.effective_from).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="secondary" 
              className="flex-1"
              onClick={() => onView(template)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {!template.is_published && onEdit && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(template)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
            {onDuplicate && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDuplicate(template)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const DOC_TYPE_LABELS: Record<DocType, string> = {
  MOU: 'Memorandum of Understanding',
  SPA: 'Sale & Purchase Agreement',
  Reservation: 'Reservation Form',
  Mandate: 'Mandate Agreement',
  ICA: 'Inter-Company Agreement',
  NDA: 'Non-Disclosure Agreement',
  POA: 'Power of Attorney',
  CommissionInvoice: 'Commission Invoice',
  Receipt: 'Receipt',
  Other: 'Other Document',
};

function formatDocType(docType: DocType): string {
  return DOC_TYPE_LABELS[docType] || docType.replace(/([A-Z])/g, ' $1').trim();
}
