import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Banknote, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send,
  Eye,
  FileCheck,
  User,
  Calendar
} from 'lucide-react';

interface PayoutBatch {
  id: string;
  batch_id: string;
  status: 'Draft' | 'PendingApproval' | 'Approved' | 'Executed' | 'Rejected';
  total_amount: number;
  line_count: number;
  created_by: string;
  created_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  created_at: string;
  approved_at?: string;
  executed_at?: string;
}

interface PayoutBatchCardProps {
  batch: PayoutBatch;
  onView: (batch: PayoutBatch) => void;
  onSubmitForApproval: (batch: PayoutBatch) => void;
  onApprove: (batch: PayoutBatch) => void;
  onReject: (batch: PayoutBatch) => void;
  onExecute: (batch: PayoutBatch) => void;
  canApprove: boolean;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  Draft: { icon: Clock, color: 'bg-muted text-muted-foreground', label: 'Draft' },
  PendingApproval: { icon: Clock, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', label: 'Pending Approval' },
  Approved: { icon: CheckCircle2, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Approved' },
  Executed: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Executed' },
  Rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Rejected' },
};

export const PayoutBatchCard: React.FC<PayoutBatchCardProps> = ({
  batch,
  onView,
  onSubmitForApproval,
  onApprove,
  onReject,
  onExecute,
  canApprove,
}) => {
  const config = statusConfig[batch.status];
  const StatusIcon = config.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-mono">{batch.batch_id}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {batch.line_count} commission{batch.line_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Badge className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground">Total Payout</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(batch.total_amount)}</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Created by {batch.created_by_name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(batch.created_at)}</span>
          </div>
          {batch.approved_by_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileCheck className="h-4 w-4" />
              <span>Approved by {batch.approved_by_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onView(batch)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          
          {batch.status === 'Draft' && (
            <Button size="sm" onClick={() => onSubmitForApproval(batch)} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          )}
          
          {batch.status === 'PendingApproval' && canApprove && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onReject(batch)} 
                className="flex-1 text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                size="sm" 
                onClick={() => onApprove(batch)} 
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          
          {batch.status === 'Approved' && (
            <Button size="sm" onClick={() => onExecute(batch)} className="flex-1">
              <Banknote className="h-4 w-4 mr-2" />
              Execute
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
