import { SignatureEnvelope, Signer } from '@/types/bos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  PenTool, 
  CheckCircle, 
  Clock, 
  XCircle,
  User,
  Mail,
  ExternalLink,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignatureEnvelopeCardProps {
  envelope: SignatureEnvelope;
  onView: (envelope: SignatureEnvelope) => void;
  onResend?: (envelope: SignatureEnvelope, signer: Signer) => void;
}

export function SignatureEnvelopeCard({ 
  envelope, 
  onView,
  onResend 
}: SignatureEnvelopeCardProps) {
  const signedCount = envelope.signers.filter(s => s.status === 'Signed').length;
  const totalSigners = envelope.signers.length;
  const progress = (signedCount / totalSigners) * 100;
  
  const isComplete = signedCount === totalSigners;
  const hasDeclined = envelope.signers.some(s => s.status === 'Declined');

  return (
    <Card className={cn(
      "transition-all",
      isComplete && "border-emerald-500/50",
      hasDeclined && "border-destructive/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isComplete ? "bg-emerald-500/20" : hasDeclined ? "bg-destructive/20" : "bg-amber-500/20"
            )}>
              <PenTool className={cn(
                "w-5 h-5",
                isComplete ? "text-emerald-400" : hasDeclined ? "text-destructive" : "text-amber-400"
              )} />
            </div>
            <div>
              <CardTitle className="text-sm">
                Envelope {envelope.envelope_id.slice(-8)}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Doc: {envelope.document_id.slice(-8)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            isComplete ? "border-emerald-500/50 text-emerald-400" : 
            hasDeclined ? "border-destructive/50 text-destructive" : 
            "border-amber-500/50 text-amber-400"
          )}>
            {isComplete ? 'Complete' : hasDeclined ? 'Declined' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Signatures</span>
            <span className="font-medium">{signedCount} of {totalSigners}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Signers */}
        <div className="space-y-2">
          {envelope.signers.map((signer) => (
            <SignerRow 
              key={signer.signer_id} 
              signer={signer} 
              onResend={onResend ? () => onResend(envelope, signer) : undefined}
            />
          ))}
        </div>

        {/* Authority Checks */}
        {envelope.authority_checks.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Authority Checks
            </p>
            <div className="space-y-1">
              {envelope.authority_checks.map((check, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    check.passed ? "text-emerald-400" : "text-destructive"
                  )}
                >
                  {check.passed ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>{check.check_type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Evidence */}
        {envelope.completed_at && envelope.execution_evidence.certificate_hash && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Execution Evidence</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                Cert: {envelope.execution_evidence.certificate_hash?.slice(0, 12)}
              </Badge>
              {envelope.execution_evidence.audit_trail_hash && (
                <Badge variant="secondary" className="font-mono text-xs">
                  Audit: {envelope.execution_evidence.audit_trail_hash?.slice(0, 12)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onView(envelope)}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

interface SignerRowProps {
  signer: Signer;
  onResend?: () => void;
}

function SignerRow({ signer, onResend }: SignerRowProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        signer.status === 'Signed' ? "bg-emerald-500/20" :
        signer.status === 'Declined' ? "bg-destructive/20" :
        "bg-muted"
      )}>
        {signer.status === 'Signed' ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : signer.status === 'Declined' ? (
          <XCircle className="w-4 h-4 text-destructive" />
        ) : (
          <Clock className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{signer.identity.full_name}</p>
          <Badge variant="secondary" className="text-xs shrink-0">{signer.role}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {signer.identity.email}
        </p>
      </div>

      {signer.status === 'Signed' && signer.signed_at && (
        <p className="text-xs text-muted-foreground">
          {new Date(signer.signed_at).toLocaleDateString()}
        </p>
      )}

      {signer.status === 'Pending' && onResend && (
        <Button size="sm" variant="ghost" onClick={onResend}>
          Resend
        </Button>
      )}
    </div>
  );
}
