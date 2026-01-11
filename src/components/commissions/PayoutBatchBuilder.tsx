import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Package, 
  Banknote, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { PayoutBatchCard } from './PayoutBatchCard';

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

interface PayoutBatchBuilderProps {
  batches: PayoutBatch[];
  selectedCommissionIds: string[];
  selectedTotal: number;
  onCreateBatch: (commissionIds: string[]) => void;
  onViewBatch: (batch: PayoutBatch) => void;
  onSubmitForApproval: (batch: PayoutBatch) => void;
  onApprove: (batch: PayoutBatch) => void;
  onReject: (batch: PayoutBatch) => void;
  onExecute: (batch: PayoutBatch) => void;
  canApprove: boolean;
}

export const PayoutBatchBuilder: React.FC<PayoutBatchBuilderProps> = ({
  batches,
  selectedCommissionIds,
  selectedTotal,
  onCreateBatch,
  onViewBatch,
  onSubmitForApproval,
  onApprove,
  onReject,
  onExecute,
  canApprove,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filterBatches = (status: string) => {
    if (status === 'all') return batches;
    return batches.filter(b => b.status === status);
  };

  const handleCreateBatch = () => {
    onCreateBatch(selectedCommissionIds);
    setConfirmDialogOpen(false);
  };

  const draftCount = batches.filter(b => b.status === 'Draft').length;
  const pendingCount = batches.filter(b => b.status === 'PendingApproval').length;
  const approvedCount = batches.filter(b => b.status === 'Approved').length;
  const executedCount = batches.filter(b => b.status === 'Executed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Payout Batches</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {batches.length} batch{batches.length !== 1 ? 'es' : ''} total
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setConfirmDialogOpen(true)}
            disabled={selectedCommissionIds.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
            {selectedCommissionIds.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCommissionIds.length}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4" />
              Draft
            </div>
            <div className="text-2xl font-bold">{draftCount}</div>
          </div>
          <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mb-1">
              <AlertCircle className="h-4 w-4" />
              Pending
            </div>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </div>
          <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </div>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </div>
          <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-1">
              <Banknote className="h-4 w-4" />
              Executed
            </div>
            <div className="text-2xl font-bold">{executedCount}</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({batches.length})</TabsTrigger>
            <TabsTrigger value="Draft">Draft ({draftCount})</TabsTrigger>
            <TabsTrigger value="PendingApproval">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="Approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="Executed">Executed ({executedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterBatches(activeTab).map((batch) => (
                <PayoutBatchCard
                  key={batch.id}
                  batch={batch}
                  onView={onViewBatch}
                  onSubmitForApproval={onSubmitForApproval}
                  onApprove={onApprove}
                  onReject={onReject}
                  onExecute={onExecute}
                  canApprove={canApprove}
                />
              ))}
              {filterBatches(activeTab).length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No batches in this category</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Batch Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payout Batch</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground mb-4">
                You are about to create a new payout batch with the following:
              </p>
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commissions Selected:</span>
                  <span className="font-medium">{selectedCommissionIds.length}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Payout Amount:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(selectedTotal)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                The batch will be created as a draft and require approval before execution.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBatch}>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
