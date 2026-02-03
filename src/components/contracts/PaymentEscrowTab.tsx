import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ban,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePaymentEscrows,
  useCreateEscrow,
  useFundEscrow,
  useReleaseEscrow,
  type PaymentEscrow,
} from '@/hooks/useSmartContracts';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Created: { color: 'bg-muted text-muted-foreground', icon: <Clock className="h-3 w-3" /> },
  Funded: { color: 'bg-emerald/20 text-emerald border-emerald/30', icon: <CheckCircle className="h-3 w-3" /> },
  PartiallyFunded: { color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', icon: <AlertTriangle className="h-3 w-3" /> },
  Released: { color: 'bg-blue-500/20 text-blue-600 border-blue-500/30', icon: <ArrowUpRight className="h-3 w-3" /> },
  Refunded: { color: 'bg-purple-500/20 text-purple-600 border-purple-500/30', icon: <ArrowDownRight className="h-3 w-3" /> },
  Disputed: { color: 'bg-destructive/20 text-destructive border-destructive/30', icon: <Ban className="h-3 w-3" /> },
};

const PAYMENT_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'reservation', label: 'Reservation Fee' },
  { value: 'installment', label: 'Installment' },
  { value: 'commission', label: 'Commission' },
  { value: 'downpayment', label: 'Down Payment' },
  { value: 'balance', label: 'Balance Payment' },
];

export function PaymentEscrowTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<PaymentEscrow | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundReference, setFundReference] = useState('');
  
  const [formData, setFormData] = useState({
    payer_name: '',
    payer_email: '',
    payee_name: '',
    payee_email: '',
    total_amount: '',
    payment_type: '',
    due_date: '',
  });

  const { data: escrows = [], isLoading } = usePaymentEscrows();
  const createEscrow = useCreateEscrow();
  const fundEscrow = useFundEscrow();
  const releaseEscrow = useReleaseEscrow();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreate = () => {
    if (!formData.payer_name || !formData.payee_name || !formData.total_amount || !formData.payment_type) {
      toast.error('Please fill all required fields');
      return;
    }

    createEscrow.mutate({
      payer_name: formData.payer_name,
      payer_email: formData.payer_email || undefined,
      payee_name: formData.payee_name,
      payee_email: formData.payee_email || undefined,
      total_amount: parseFloat(formData.total_amount),
      payment_type: formData.payment_type,
      due_date: formData.due_date || undefined,
    }, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({
          payer_name: '',
          payer_email: '',
          payee_name: '',
          payee_email: '',
          total_amount: '',
          payment_type: '',
          due_date: '',
        });
      },
    });
  };

  const handleFund = () => {
    if (!selectedEscrow || !fundAmount) return;

    fundEscrow.mutate({
      escrowId: selectedEscrow.id,
      amount: parseFloat(fundAmount),
      reference: fundReference || undefined,
    }, {
      onSuccess: () => {
        setShowFundDialog(false);
        setSelectedEscrow(null);
        setFundAmount('');
        setFundReference('');
      },
    });
  };

  const openFundDialog = (escrow: PaymentEscrow) => {
    setSelectedEscrow(escrow);
    setFundAmount((escrow.total_amount - escrow.funded_amount).toString());
    setShowFundDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Payment Escrow</h3>
          <p className="text-sm text-muted-foreground">
            Secure payment holding for real estate transactions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              Create Escrow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Payment Escrow</DialogTitle>
              <DialogDescription>
                Set up a secure escrow for transaction payments
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payer_name">Payer Name *</Label>
                  <Input
                    id="payer_name"
                    placeholder="Buyer name"
                    value={formData.payer_name}
                    onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer_email">Payer Email</Label>
                  <Input
                    id="payer_email"
                    type="email"
                    placeholder="buyer@email.com"
                    value={formData.payer_email}
                    onChange={(e) => setFormData({ ...formData, payer_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payee_name">Payee Name *</Label>
                  <Input
                    id="payee_name"
                    placeholder="Seller/Developer"
                    value={formData.payee_name}
                    onChange={(e) => setFormData({ ...formData, payee_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee_email">Payee Email</Label>
                  <Input
                    id="payee_email"
                    type="email"
                    placeholder="seller@email.com"
                    value={formData.payee_email}
                    onChange={(e) => setFormData({ ...formData, payee_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Amount (AED) *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    placeholder="100000"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Type *</Label>
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value) => setFormData({ ...formData, payment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createEscrow.isPending}>
                {createEscrow.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Escrow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fund Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund Escrow</DialogTitle>
            <DialogDescription>
              Record a payment to this escrow account
            </DialogDescription>
          </DialogHeader>

          {selectedEscrow && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Escrow Balance</div>
                <div className="text-lg font-bold">
                  {formatCurrency(selectedEscrow.funded_amount)} / {formatCurrency(selectedEscrow.total_amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Remaining: {formatCurrency(selectedEscrow.total_amount - selectedEscrow.funded_amount)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fund_amount">Amount (AED)</Label>
                <Input
                  id="fund_amount"
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fund_reference">Bank Reference (optional)</Label>
                <Input
                  id="fund_reference"
                  placeholder="Transfer reference"
                  value={fundReference}
                  onChange={(e) => setFundReference(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFund} disabled={fundEscrow.isPending}>
              {fundEscrow.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escrow Cards */}
      {escrows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-foreground mb-1">No Escrow Accounts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an escrow to hold transaction payments securely
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Escrow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escrows.map((escrow) => (
            <EscrowCard
              key={escrow.id}
              escrow={escrow}
              onFund={() => openFundDialog(escrow)}
              onRelease={() => releaseEscrow.mutate(escrow.id)}
              isReleasing={releaseEscrow.isPending}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EscrowCardProps {
  escrow: PaymentEscrow;
  onFund: () => void;
  onRelease: () => void;
  isReleasing: boolean;
  formatCurrency: (amount: number) => string;
}

function EscrowCard({ escrow, onFund, onRelease, isReleasing, formatCurrency }: EscrowCardProps) {
  const statusConfig = STATUS_CONFIG[escrow.status];
  const progress = (escrow.funded_amount / escrow.total_amount) * 100;
  const isFullyFunded = escrow.funded_amount >= escrow.total_amount;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              escrow.status === 'Funded' ? "bg-emerald/10" : 
              escrow.status === 'Released' ? "bg-blue-500/10" : "bg-primary/10"
            )}>
              <Wallet className={cn(
                "h-5 w-5",
                escrow.status === 'Funded' ? "text-emerald" :
                escrow.status === 'Released' ? "text-blue-500" : "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-base capitalize">{escrow.payment_type}</CardTitle>
              <code className="text-xs font-mono text-muted-foreground">
                {escrow.escrow_id}
              </code>
            </div>
          </div>
          <Badge className={cn('text-xs flex items-center gap-1', statusConfig?.color)}>
            {statusConfig?.icon}
            {escrow.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(escrow.total_amount)}
          </div>
          <div className="text-xs text-muted-foreground">Total Amount</div>
        </div>

        {/* Progress */}
        {escrow.status !== 'Released' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Funded</span>
              <span className="font-medium">
                {formatCurrency(escrow.funded_amount)} ({Math.round(progress)}%)
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">From</div>
            <div className="font-medium truncate">{escrow.payer_name}</div>
            {escrow.payer_email && (
              <div className="text-xs text-muted-foreground truncate">{escrow.payer_email}</div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">To</div>
            <div className="font-medium truncate">{escrow.payee_name}</div>
            {escrow.payee_email && (
              <div className="text-xs text-muted-foreground truncate">{escrow.payee_email}</div>
            )}
          </div>
        </div>

        {/* Due Date */}
        {escrow.due_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Due: {escrow.due_date}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {escrow.status === 'Created' && (
            <Button className="flex-1" onClick={onFund}>
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Fund Escrow
            </Button>
          )}
          {escrow.status === 'PartiallyFunded' && (
            <Button className="flex-1" onClick={onFund}>
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          )}
          {escrow.status === 'Funded' && (
            <Button
              className="flex-1"
              onClick={onRelease}
              disabled={isReleasing}
            >
              {isReleasing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-2" />
              )}
              Release Funds
            </Button>
          )}
          {escrow.status === 'Released' && (
            <Button className="flex-1" variant="outline" disabled>
              <CheckCircle className="h-4 w-4 mr-2 text-emerald" />
              Released {escrow.released_at ? new Date(escrow.released_at).toLocaleDateString() : ''}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
