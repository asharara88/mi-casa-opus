import { DocumentInstance, DocumentStatus } from '@/types/bos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  PenTool, 
  CheckCircle,
  Clock,
  XCircle,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentInstanceRowProps {
  document: DocumentInstance;
  onView: (doc: DocumentInstance) => void;
  onDownload?: (doc: DocumentInstance) => void;
  onRequestSignature?: (doc: DocumentInstance) => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { 
  icon: React.ElementType; 
  color: string; 
  bg: string;
  label: string;
}> = {
  Draft: { 
    icon: FileText, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted',
    label: 'Draft' 
  },
  Generated: { 
    icon: FileCheck, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20',
    label: 'Generated' 
  },
  PendingSignature: { 
    icon: Clock, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/20',
    label: 'Pending Signature' 
  },
  Executed: { 
    icon: CheckCircle, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/20',
    label: 'Executed' 
  },
  Voided: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/20',
    label: 'Voided' 
  },
};

export function DocumentInstanceRow({ 
  document, 
  onView, 
  onDownload,
  onRequestSignature 
}: DocumentInstanceRowProps) {
  const status = STATUS_CONFIG[document.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Icon & Info */}
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", status.bg)}>
        <StatusIcon className={cn("w-5 h-5", status.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">
            {formatTemplateRef(document.template_ref)}
          </p>
          <Badge variant="outline" className={cn("shrink-0", status.color)}>
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="font-mono">{document.document_id.slice(-8)}</span>
          <span>•</span>
          <span>{document.entity_ref.entity_type}: {document.entity_ref.entity_id.slice(-6)}</span>
          <span>•</span>
          <span>{new Date(document.generated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Hash Badge */}
      <div className="hidden md:block">
        <Badge variant="secondary" className="font-mono text-xs">
          #{document.data_snapshot_hash.slice(0, 8)}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => onView(document)}>
          <Eye className="w-4 h-4" />
        </Button>
        {onDownload && (
          <Button size="sm" variant="ghost" onClick={() => onDownload(document)}>
            <Download className="w-4 h-4" />
          </Button>
        )}
        {document.status === 'Generated' && onRequestSignature && (
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onRequestSignature(document)}
          >
            <PenTool className="w-4 h-4 mr-1" />
            Request Signature
          </Button>
        )}
      </div>
    </div>
  );
}

function formatTemplateRef(templateRef: string): string {
  // Extract doc type from template reference
  const parts = templateRef.split('_');
  if (parts.length > 1) {
    return parts.slice(0, -1).join(' ').replace(/([A-Z])/g, ' $1').trim();
  }
  return templateRef.replace(/([A-Z])/g, ' $1').trim();
}
