import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, Loader2 } from 'lucide-react';
import { CommissionLedger } from './CommissionLedger';
import { PayoutBatchBuilder } from './PayoutBatchBuilder';
import { useCommissions, usePayoutBatches, useUpdatePayoutBatch, useCreatePayoutBatch } from '@/hooks/useCommissions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const CommissionsSection: React.FC = () => {
  const { profile } = useAuth();
  const { data: rawCommissions, isLoading: commissionsLoading } = useCommissions();
  const { data: rawBatches, isLoading: batchesLoading } = usePayoutBatches();
  const createBatch = useCreatePayoutBatch();
  const updateBatch = useUpdatePayoutBatch();
  
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('ledger');

  // Transform commissions to expected format
  const commissions = (rawCommissions || []).map(c => ({
    id: c.id,
    commission_id: c.commission_id,
    deal_id: c.deal_id,
    broker_id: c.broker_id,
    broker_name: (c as any).broker_profiles?.broker_id || 'Unknown Broker',
    deal_reference: (c as any).deals?.deal_id || c.deal_id,
    status: c.status === 'Expected' ? 'Expected' :
            c.status === 'Earned' ? 'Allocated' :
            c.status === 'Received' ? 'Received' :
            c.status === 'Paid' ? 'PaidOut' : 'Expected',
    gross_amount: Number(c.gross_amount) || 0,
    net_amount: Number(c.net_amount) || 0,
    split_percent: Number(c.split_percent) || 100,
    calculation_trace: c.calculation_trace || {},
    created_at: c.created_at,
  }));

  // Transform batches to expected format
  const batches = (rawBatches || []).map(b => ({
    id: b.id,
    batch_id: b.batch_id,
    status: b.status,
    total_amount: Number(b.total_amount) || 0,
    line_count: 0, // Would need to query payout_lines to get this
    created_by: b.created_by,
    created_by_name: 'User',
    approved_by: b.approved_by || undefined,
    approved_by_name: b.approved_by ? 'Approver' : undefined,
    created_at: b.created_at,
    approved_at: b.approved_at || undefined,
    executed_at: b.executed_at || undefined,
  }));

  const selectedTotal = commissions
    .filter(c => selectedCommissionIds.includes(c.id))
    .reduce((sum, c) => sum + c.net_amount, 0);

  const handleCreateBatch = async (commissionIds: string[]) => {
    const selectedCommissions = commissions.filter(c => commissionIds.includes(c.id));
    const totalAmount = selectedCommissions.reduce((sum, c) => sum + c.net_amount, 0);
    
    try {
      await createBatch.mutateAsync({
        batch_id: `PAY-${Date.now()}`,
        total_amount: totalAmount,
        created_by: profile?.user_id || '',
        status: 'Draft',
      });
      setSelectedCommissionIds([]);
      setActiveTab('payouts');
    } catch (error) {
      console.error('Failed to create batch', error);
    }
  };

  const handleViewBatch = (batch: typeof batches[0]) => {
    toast.info(`Viewing batch ${batch.batch_id}`);
  };

  const handleSubmitForApproval = async (batch: typeof batches[0]) => {
    await updateBatch.mutateAsync({
      id: batch.id,
      updates: { status: 'PendingApproval' },
    });
  };

  const handleApprove = async (batch: typeof batches[0]) => {
    await updateBatch.mutateAsync({
      id: batch.id,
      updates: { 
        status: 'Approved',
        approved_by: profile?.user_id,
        approved_at: new Date().toISOString(),
      },
    });
  };

  const handleReject = async (batch: typeof batches[0]) => {
    await updateBatch.mutateAsync({
      id: batch.id,
      updates: { status: 'Voided' },
    });
  };

  const handleExecute = async (batch: typeof batches[0]) => {
    await updateBatch.mutateAsync({
      id: batch.id,
      updates: { 
        status: 'Executed',
        executed_at: new Date().toISOString(),
      },
    });
  };

  if (commissionsLoading || batchesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commissions & Payouts</h1>
        <p className="text-muted-foreground mt-1">
          {commissions.length} commission records • {batches.length} payout batches
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ledger" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission Ledger
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Payout Batches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-6">
          <CommissionLedger
            commissions={commissions as any}
            selectedIds={selectedCommissionIds}
            onSelectionChange={setSelectedCommissionIds}
            selectable={true}
          />
          
          {selectedCommissionIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
              <span>
                {selectedCommissionIds.length} commission{selectedCommissionIds.length !== 1 ? 's' : ''} selected
              </span>
              <span className="font-bold">
                {new Intl.NumberFormat('en-AE', {
                  style: 'currency',
                  currency: 'AED',
                  minimumFractionDigits: 0,
                }).format(selectedTotal)}
              </span>
              <button
                onClick={() => handleCreateBatch(selectedCommissionIds)}
                className="bg-primary-foreground text-primary px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Create Batch
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <PayoutBatchBuilder
            batches={batches as any}
            selectedCommissionIds={selectedCommissionIds}
            selectedTotal={selectedTotal}
            onCreateBatch={handleCreateBatch}
            onViewBatch={handleViewBatch as any}
            onSubmitForApproval={handleSubmitForApproval as any}
            onApprove={handleApprove as any}
            onReject={handleReject as any}
            onExecute={handleExecute as any}
            canApprove={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
