import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import { EvidenceObject, EvidenceType, ImmutabilityClass } from '@/types/bos';
import { cn } from '@/lib/utils';

interface EvidenceDrawerProps {
  evidence: EvidenceObject[];
  entityId: string;
  entityType: string;
  onAddEvidence?: () => void;
}

const EVIDENCE_ICONS: Record<EvidenceType, React.ReactNode> = {
  Screenshot: <Camera className="h-4 w-4" />,
  EmailConfirmation: <Mail className="h-4 w-4" />,
  SMSConfirmation: <MessageSquare className="h-4 w-4" />,
  SignedDocument: <FileCheck className="h-4 w-4" />,
  PaymentReceipt: <CreditCard className="h-4 w-4" />,
  PhotoEvidence: <FileImage className="h-4 w-4" />,
  SystemLog: <Hash className="h-4 w-4" />,
};

const IMMUTABILITY_CONFIG: Record<ImmutabilityClass, { label: string; color: string }> = {
  HASH_LOCKED: { label: 'Hash Locked', color: 'bg-blue-500/20 text-blue-600' },
  BLOCKCHAIN_ANCHORED: { label: 'Blockchain', color: 'bg-purple-500/20 text-purple-600' },
  NOTARIZED: { label: 'Notarized', color: 'bg-emerald/20 text-emerald' },
};

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidence,
  entityId,
  entityType,
  onAddEvidence,
}) => {
  const relatedEvidence = evidence.filter(
    (e) => e.metadata?.entity_id === entityId || e.storage_ref.includes(entityId)
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Evidence ({relatedEvidence.length})
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
                {relatedEvidence.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald/10">
              <div className="text-lg font-bold text-emerald">
                {relatedEvidence.filter(e => e.hash).length}
              </div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="text-lg font-bold text-primary">
                {relatedEvidence.filter(e => e.immutability_class === 'BLOCKCHAIN_ANCHORED').length}
              </div>
              <div className="text-xs text-muted-foreground">On-Chain</div>
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
            {relatedEvidence.map((item) => (
              <EvidenceCard key={item.evidence_id} evidence={item} />
            ))}

            {relatedEvidence.length === 0 && (
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
  const immutability = IMMUTABILITY_CONFIG[evidence.immutability_class];

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
