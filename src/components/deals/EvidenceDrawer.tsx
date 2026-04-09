import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Camera, 
  FileImage, 
  Mail, 
  MessageSquare, 
  FileCheck, 
  CreditCard,
  Hash,
  Shield,
  Clock,
  User,
  Plus,
  ExternalLink,
  FileText
} from 'lucide-react';
import { EvidenceObject, EvidenceType, ImmutabilityClass } from '@/types/bos';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface EvidenceDrawerProps {
  evidence: EvidenceObject[];
  entityId: string;
  entityType: string;
  onAddEvidence?: () => void;
}

interface GeneratedDocEvidence {
  id: string;
  document_id: string;
  document_title: string;
  reference_number: string;
  template_id: string;
  created_at: string;
  content_hash?: string;
}

const EVIDENCE_ICONS: Record<EvidenceType | string, React.ReactNode> = {
  Screenshot: <Camera className="h-4 w-4" />,
  EmailConfirmation: <Mail className="h-4 w-4" />,
  SMSConfirmation: <MessageSquare className="h-4 w-4" />,
  SignedDocument: <FileCheck className="h-4 w-4" />,
  PaymentReceipt: <CreditCard className="h-4 w-4" />,
  PhotoEvidence: <FileImage className="h-4 w-4" />,
  SystemLog: <Hash className="h-4 w-4" />,
  GeneratedDocument: <FileText className="h-4 w-4" />,
};

const IMMUTABILITY_CONFIG: Record<ImmutabilityClass | string, { label: string; color: string }> = {
  HASH_LOCKED: { label: 'Hash Locked', color: 'bg-blue-500/20 text-blue-600' },
  BLOCKCHAIN_ANCHORED: { label: 'Blockchain', color: 'bg-purple-500/20 text-purple-600' },
  NOTARIZED: { label: 'Notarized', color: 'bg-emerald/20 text-emerald' },
  System: { label: 'System', color: 'bg-primary/20 text-primary' },
  Internal: { label: 'Internal', color: 'bg-muted text-muted-foreground' },
  External: { label: 'External', color: 'bg-amber-500/20 text-amber-600' },
};

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidence,
  entityId,
  entityType,
  onAddEvidence,
}) => {
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocEvidence[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch generated documents when drawer opens
  useEffect(() => {
    if (isOpen && entityId) {
      fetchGeneratedDocuments();
    }
  }, [isOpen, entityId]);

  const fetchGeneratedDocuments = async () => {
    try {
      const { data } = await supabase
        .from('generated_documents')
        .select('id, document_id, document_title, prompt_id, created_at, output')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (data) {
        setGeneratedDocs(data.map(d => ({
          id: d.id,
          document_id: d.document_id,
          document_title: d.document_title,
          reference_number: (d.output as any)?.reference_number || 'N/A',
          template_id: d.prompt_id,
          created_at: d.created_at,
          content_hash: (d.output as any)?.content_hash,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch generated documents:', err);
    }
  };

  const relatedEvidence = evidence.filter(
    (e) => e.metadata?.entity_id === entityId || e.storage_ref.includes(entityId)
  );

  const totalItems = relatedEvidence.length + generatedDocs.length;
  const verifiedCount = relatedEvidence.filter(e => e.hash).length + generatedDocs.filter(d => d.content_hash).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Evidence ({totalItems})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Evidence Trail
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">
                {totalItems}
              </div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald/10">
              <div className="text-lg font-bold text-emerald">
                {verifiedCount}
              </div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="text-lg font-bold text-primary">
                {generatedDocs.length}
              </div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
          </div>

          {/* Add Evidence Button */}
          {onAddEvidence && (
            <Button className="w-full" variant="outline" onClick={onAddEvidence}>
              <Plus className="h-4 w-4 mr-2" />
              Capture New Evidence
            </Button>
          )}

          {/* Evidence List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Generated Documents */}
            {generatedDocs.map((doc) => (
              <GeneratedDocCard key={doc.id} document={doc} />
            ))}

            {/* Evidence Objects */}
            {relatedEvidence.map((item) => (
              <EvidenceCard key={item.evidence_id} evidence={item} />
            ))}

            {totalItems === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No evidence captured yet</p>
                <p className="text-xs mt-1">
                  Evidence is automatically captured during state transitions
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

function EvidenceCard({ evidence }: { evidence: EvidenceObject }) {
  const icon = EVIDENCE_ICONS[evidence.type] || <FileImage className="h-4 w-4" />;
  const immutability = IMMUTABILITY_CONFIG[evidence.immutability_class] || IMMUTABILITY_CONFIG.Internal;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">
                {evidence.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <Badge
                variant="outline"
                className={cn('text-xs', immutability.color)}
              >
                <Shield className="h-3 w-3 mr-1" />
                {immutability.label}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              Source: {evidence.source}
            </div>

            {/* Hash */}
            {evidence.hash && (
              <div className="flex items-center gap-2 text-xs font-mono bg-muted px-2 py-1 rounded">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{evidence.hash.slice(0, 24)}...</span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{evidence.captured_by.slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(evidence.captured_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {evidence.storage_ref && (
            <Button size="sm" variant="ghost" className="flex-shrink-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GeneratedDocCard({ document }: { document: GeneratedDocEvidence }) {
  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground truncate">
                {document.document_title}
              </span>
              {document.content_hash && (
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald/10 text-emerald border-emerald/30"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              Ref: {document.reference_number}
            </div>

            {/* Hash */}
            {document.content_hash && (
              <div className="flex items-center gap-2 text-xs font-mono bg-muted px-2 py-1 rounded">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{document.content_hash.slice(0, 24)}...</span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(document.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button size="sm" variant="ghost" className="flex-shrink-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
