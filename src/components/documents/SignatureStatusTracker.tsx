import React from 'react';
import { CheckCircle, Clock, Eye, XCircle, FileSignature } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Signer {
  name: string;
  email: string;
  role: string;
  status: string;
  signedAt?: string;
}

interface SignatureStatusTrackerProps {
  envelopeId: string;
  status: string;
  signers: Signer[];
  sentAt?: string;
  completedAt?: string;
}

const signerStatusIcons: Record<string, React.ReactNode> = {
  sent: <Clock className="h-4 w-4 text-muted-foreground" />,
  delivered: <Eye className="h-4 w-4 text-blue-500" />,
  signed: <CheckCircle className="h-4 w-4 text-green-500" />,
  declined: <XCircle className="h-4 w-4 text-destructive" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export function SignatureStatusTracker({
  envelopeId,
  status,
  signers,
  sentAt,
  completedAt,
}: SignatureStatusTrackerProps) {
  const signedCount = signers.filter(s => s.status === 'signed' || s.status === 'completed').length;
  const progress = signers.length > 0 ? (signedCount / signers.length) * 100 : 0;

  const overallStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
      case 'voided':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sent':
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Signature Status</span>
        </div>
        <Badge className={overallStatusColor()}>
          {status}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {signedCount} of {signers.length} signed
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Signers List */}
      <div className="space-y-2">
        {signers.map((signer, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
          >
            <Badge variant="outline" className="h-6 w-6 p-0 justify-center">
              {index + 1}
            </Badge>
            {signerStatusIcons[signer.status] || signerStatusIcons.sent}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{signer.name}</p>
              <p className="text-xs text-muted-foreground truncate">{signer.email}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="capitalize text-xs">
                {signer.role}
              </Badge>
              <p className="text-xs text-muted-foreground mt-0.5">
                {signer.signedAt
                  ? `Signed ${new Date(signer.signedAt).toLocaleDateString()}`
                  : signer.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        {sentAt && (
          <p>Sent: {new Date(sentAt).toLocaleString()}</p>
        )}
        {completedAt && (
          <p className="text-green-600">
            Completed: {new Date(completedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
