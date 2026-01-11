import { StateTransitionResult } from '@/types/bos';
import { AlertCircle, FileText, PenTool, Camera, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockReasonsDisplayProps {
  validation: StateTransitionResult;
  targetState: string;
  onResolve?: (type: 'document' | 'signature' | 'evidence', item: string) => void;
}

export function BlockReasonsDisplay({ validation, targetState, onResolve }: BlockReasonsDisplayProps) {
  if (validation.allowed) {
    return (
      <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <CheckCircle className="w-5 h-5 text-emerald-500" />
        <div>
          <p className="text-sm font-medium text-emerald-500">Ready to Transition</p>
          <p className="text-xs text-muted-foreground">
            All requirements met for transition to {targetState}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Block Reasons */}
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Transition to {targetState} Blocked
          </p>
        </div>
        <ul className="space-y-2">
          {validation.block_reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-destructive mt-0.5">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Missing Documents */}
      {validation.missing_documents.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Missing Documents</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {validation.missing_documents.length} required
            </span>
          </div>
          <div className="divide-y">
            {validation.missing_documents.map((doc) => (
              <button
                key={doc}
                onClick={() => onResolve?.('document', doc)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{formatDocumentName(doc)}</p>
                  <p className="text-xs text-muted-foreground">Generate document</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Missing Signatures */}
      {validation.missing_signatures.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
            <PenTool className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Missing Signatures</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {validation.missing_signatures.length} required
            </span>
          </div>
          <div className="divide-y">
            {validation.missing_signatures.map((sig) => (
              <button
                key={sig}
                onClick={() => onResolve?.('signature', sig)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <PenTool className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{formatSignatureName(sig)}</p>
                  <p className="text-xs text-muted-foreground">Request signature</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Missing Evidence */}
      {validation.missing_evidence.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
            <Camera className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Missing Evidence</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {validation.missing_evidence.length} required
            </span>
          </div>
          <div className="divide-y">
            {validation.missing_evidence.map((evidence) => (
              <button
                key={evidence}
                onClick={() => onResolve?.('evidence', evidence)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{formatEvidenceName(evidence)}</p>
                  <p className="text-xs text-muted-foreground">Capture evidence</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions to format names
function formatDocumentName(doc: string): string {
  return doc
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatSignatureName(sig: string): string {
  return sig
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatEvidenceName(evidence: string): string {
  return evidence
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
