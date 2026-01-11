import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Calculator, Eye, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CommissionRecord {
  id: string;
  commission_id: string;
  deal_id: string;
  broker_id: string;
  broker_name?: string;
  deal_reference?: string;
  status: 'Expected' | 'Received' | 'Allocated' | 'PaidOut';
  gross_amount: number;
  net_amount: number;
  split_percent: number;
  calculation_trace: Record<string, any>;
  created_at: string;
}

interface CommissionLedgerRowProps {
  commission: CommissionRecord;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  selectable: boolean;
}

const statusColors: Record<string, string> = {
  Expected: 'bg-muted text-muted-foreground',
  Received: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Allocated: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  PaidOut: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export const CommissionLedgerRow: React.FC<CommissionLedgerRowProps> = ({
  commission,
  isSelected,
  onSelect,
  selectable,
}) => {
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
    });
  };

  return (
    <TableRow className={isSelected ? 'bg-accent/50' : ''}>
      {selectable && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(commission.id, !!checked)}
            disabled={commission.status === 'PaidOut'}
          />
        </TableCell>
      )}
      <TableCell className="font-mono text-sm">{commission.commission_id}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{commission.deal_reference || 'Deal'}</span>
          <span className="text-xs text-muted-foreground">{commission.deal_id.slice(0, 8)}...</span>
        </div>
      </TableCell>
      <TableCell>{commission.broker_name || 'Broker'}</TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(commission.gross_amount)}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="font-mono">
          {commission.split_percent}%
        </Badge>
      </TableCell>
      <TableCell className="text-right font-medium text-primary">
        {formatCurrency(commission.net_amount)}
      </TableCell>
      <TableCell>
        <Badge className={statusColors[commission.status]}>{commission.status}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDate(commission.created_at)}
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Calculator className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculation Trace
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="font-medium mb-2">Commission ID: {commission.commission_id}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Amount:</span>
                    <span className="font-mono">{formatCurrency(commission.gross_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Split Percentage:</span>
                    <span className="font-mono">{commission.split_percent}%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-medium">Net Amount:</span>
                    <span className="font-mono font-medium">{formatCurrency(commission.net_amount)}</span>
                  </div>
                </div>
              </div>
              {Object.keys(commission.calculation_trace).length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Trace Details</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                    {JSON.stringify(commission.calculation_trace, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};
