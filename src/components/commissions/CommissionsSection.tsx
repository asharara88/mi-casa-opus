import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, FileCheck } from 'lucide-react';
import { CommissionLedger } from './CommissionLedger';
import { PayoutBatchBuilder } from './PayoutBatchBuilder';
import { toast } from 'sonner';

// Demo data
const demoCommissions = [
  {
    id: '1',
    commission_id: 'COM-2024-001',
    deal_id: 'deal-1',
    broker_id: 'broker-1',
    broker_name: 'Ahmed Hassan',
    deal_reference: 'DEAL-2024-001',
    status: 'Received' as const,
    gross_amount: 150000,
    net_amount: 112500,
    split_percent: 75,
    calculation_trace: { baseRate: 2, grossValue: 7500000 },
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    commission_id: 'COM-2024-002',
    deal_id: 'deal-2',
    broker_id: 'broker-2',
    broker_name: 'Sara Al Maktoum',
    deal_reference: 'DEAL-2024-002',
    status: 'Allocated' as const,
    gross_amount: 200000,
    net_amount: 160000,
    split_percent: 80,
    calculation_trace: { baseRate: 2.5, grossValue: 8000000 },
    created_at: '2024-01-18T14:30:00Z',
  },
  {
    id: '3',
    commission_id: 'COM-2024-003',
    deal_id: 'deal-3',
    broker_id: 'broker-1',
    broker_name: 'Ahmed Hassan',
    deal_reference: 'DEAL-2024-003',
    status: 'Expected' as const,
    gross_amount: 100000,
    net_amount: 75000,
    split_percent: 75,
    calculation_trace: { baseRate: 2, grossValue: 5000000 },
    created_at: '2024-01-20T09:15:00Z',
  },
  {
    id: '4',
    commission_id: 'COM-2024-004',
    deal_id: 'deal-4',
    broker_id: 'broker-3',
    broker_name: 'Mohammed Khan',
    deal_reference: 'DEAL-2024-004',
    status: 'PaidOut' as const,
    gross_amount: 180000,
    net_amount: 135000,
    split_percent: 75,
    calculation_trace: { baseRate: 2, grossValue: 9000000 },
    created_at: '2024-01-10T11:00:00Z',
  },
  {
    id: '5',
    commission_id: 'COM-2024-005',
    deal_id: 'deal-5',
    broker_id: 'broker-2',
    broker_name: 'Sara Al Maktoum',
    deal_reference: 'DEAL-2024-005',
    status: 'Received' as const,
    gross_amount: 250000,
    net_amount: 200000,
    split_percent: 80,
    calculation_trace: { baseRate: 2.5, grossValue: 10000000 },
    created_at: '2024-01-22T16:45:00Z',
  },
];

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

const demoBatches: PayoutBatch[] = [
  {
    id: 'batch-1',
    batch_id: 'PAY-2024-001',
    status: 'Executed',
    total_amount: 135000,
    line_count: 1,
    created_by: 'user-1',
    created_by_name: 'Admin User',
    approved_by: 'user-2',
    approved_by_name: 'Finance Manager',
    created_at: '2024-01-11T10:00:00Z',
    approved_at: '2024-01-11T14:00:00Z',
    executed_at: '2024-01-12T09:00:00Z',
  },
  {
    id: 'batch-2',
    batch_id: 'PAY-2024-002',
    status: 'PendingApproval',
    total_amount: 272500,
    line_count: 2,
    created_by: 'user-1',
    created_by_name: 'Admin User',
    created_at: '2024-01-23T11:30:00Z',
  },
  {
    id: 'batch-3',
    batch_id: 'PAY-2024-003',
    status: 'Draft',
    total_amount: 200000,
    line_count: 1,
    created_by: 'user-1',
    created_by_name: 'Admin User',
    created_at: '2024-01-24T09:00:00Z',
  },
];

export const CommissionsSection: React.FC = () => {
  const [commissions, setCommissions] = useState(demoCommissions);
  const [batches, setBatches] = useState(demoBatches);
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('ledger');

  const selectedTotal = commissions
    .filter(c => selectedCommissionIds.includes(c.id))
    .reduce((sum, c) => sum + c.net_amount, 0);

  const handleCreateBatch = (commissionIds: string[]) => {
    const selectedCommissions = commissions.filter(c => commissionIds.includes(c.id));
    const totalAmount = selectedCommissions.reduce((sum, c) => sum + c.net_amount, 0);
    
    const newBatch = {
      id: `batch-${Date.now()}`,
      batch_id: `PAY-2024-${String(batches.length + 1).padStart(3, '0')}`,
      status: 'Draft' as const,
      total_amount: totalAmount,
      line_count: commissionIds.length,
      created_by: 'current-user',
      created_by_name: 'Current User',
      created_at: new Date().toISOString(),
    };

    setBatches([newBatch, ...batches]);
    setSelectedCommissionIds([]);
    toast.success(`Payout batch ${newBatch.batch_id} created with ${commissionIds.length} commission(s)`);
    setActiveTab('payouts');
  };

  const handleViewBatch = (batch: typeof demoBatches[0]) => {
    toast.info(`Viewing batch ${batch.batch_id}`);
  };

  const handleSubmitForApproval = (batch: typeof demoBatches[0]) => {
    setBatches(batches.map(b => 
      b.id === batch.id ? { ...b, status: 'PendingApproval' as const } : b
    ));
    toast.success(`Batch ${batch.batch_id} submitted for approval`);
  };

  const handleApprove = (batch: typeof demoBatches[0]) => {
    setBatches(batches.map(b => 
      b.id === batch.id ? { 
        ...b, 
        status: 'Approved' as const,
        approved_by: 'current-user',
        approved_by_name: 'Current User',
        approved_at: new Date().toISOString(),
      } : b
    ));
    toast.success(`Batch ${batch.batch_id} approved`);
  };

  const handleReject = (batch: typeof demoBatches[0]) => {
    setBatches(batches.map(b => 
      b.id === batch.id ? { ...b, status: 'Rejected' as const } : b
    ));
    toast.error(`Batch ${batch.batch_id} rejected`);
  };

  const handleExecute = (batch: typeof demoBatches[0]) => {
    setBatches(batches.map(b => 
      b.id === batch.id ? { 
        ...b, 
        status: 'Executed' as const,
        executed_at: new Date().toISOString(),
      } : b
    ));
    toast.success(`Batch ${batch.batch_id} executed successfully`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commissions & Payouts</h1>
        <p className="text-muted-foreground mt-1">
          Manage commission records and process broker payouts
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
            commissions={commissions}
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
            batches={batches}
            selectedCommissionIds={selectedCommissionIds}
            selectedTotal={selectedTotal}
            onCreateBatch={handleCreateBatch}
            onViewBatch={handleViewBatch}
            onSubmitForApproval={handleSubmitForApproval}
            onApprove={handleApprove}
            onReject={handleReject}
            onExecute={handleExecute}
            canApprove={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
