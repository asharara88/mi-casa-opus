import React, { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DollarSign,
  Users,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Loader2,
  PartyPopper,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCommissionPreview,
  useCalculateCommissionBreakdown,
  useCloseDealWithCommissions,
} from '@/hooks/useCommissionAutoGeneration';
import type { PipelineDeal } from '@/hooks/usePipelineDeals';

interface DealCloseConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: PipelineDeal | null;
  onSuccess?: () => void;
}

const DEFAULT_COMMISSION_SALE = 2;
const DEFAULT_COMMISSION_RENT = 5;
const VAT_PERCENT = 5;

export function DealCloseConfirmation({
  open,
  onOpenChange,
  deal,
  onSuccess,
}: DealCloseConfirmationProps) {
  const [transactionValue, setTransactionValue] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [pushToNatoor, setPushToNatoor] = useState(true);

  const { data: preview, isLoading: previewLoading } = useCommissionPreview(deal?.id || null);
  const calculateBreakdown = useCalculateCommissionBreakdown();
  const closeDeal = useCloseDealWithCommissions();

  // Determine deal type and default commission
  const dealType = deal?.deal_type === 'Rent' ? 'Rent' : 'Sale';
  const defaultCommission = dealType === 'Sale' ? DEFAULT_COMMISSION_SALE : DEFAULT_COMMISSION_RENT;
  const maxCommission = dealType === 'Sale' ? 2 : 5;

  // Parse values
  const txValue = parseFloat(transactionValue) || 0;
  const commPct = parseFloat(commissionPercent) || defaultCommission;

  // Calculate commission breakdown
  const breakdown = useMemo(() => {
    if (!preview?.brokers?.length || txValue <= 0) return [];
    return calculateBreakdown({
      transactionValue: txValue,
      commissionPercent: commPct,
      brokers: preview.brokers,
      vatPercent: VAT_PERCENT,
    });
  }, [preview?.brokers, txValue, commPct, calculateBreakdown]);

  const grossCommission = txValue * (commPct / 100);
  const totalSplit = preview?.totalSplitPercent || 0;
  const isValidSplit = totalSplit === 100 || (preview?.brokers?.length || 0) === 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleClose = async () => {
    if (!deal || txValue <= 0 || !isValidSplit) return;

    try {
      await closeDeal.mutateAsync({
        dealId: deal.id,
        transactionValue: txValue,
        commissionPercent: commPct,
        dealType,
        pipeline: deal.pipeline as 'OffPlan' | 'Secondary',
      });

      // Push to Natoor if lease deal and checkbox is checked
      if (dealType === 'Rent' && pushToNatoor) {
        try {
          const { error: syncError } = await supabase.functions.invoke('natoor-deal-sync', {
            body: { dealId: deal.id, transactionValue: txValue, commissionPercent: commPct, dealType },
          });
          if (syncError) {
            toast.warning('Deal closed but Natoor sync failed. You can retry later.');
          } else {
            toast.success('Deal synced to Natoor Rent Protect');
          }
        } catch {
          toast.warning('Deal closed but Natoor sync failed. You can retry later.');
        }
      }

      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTransactionValue('');
      setCommissionPercent('');
    }
    onOpenChange(open);
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            Close Deal as Won
          </DialogTitle>
          <DialogDescription>
            Complete the deal and auto-generate commission records for all assigned brokers.
          </DialogDescription>
        </DialogHeader>

        {showConfetti ? (
          <div className="py-12 text-center">
            <PartyPopper className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
            <h3 className="text-xl font-bold text-foreground mb-2">Deal Closed! 🎉</h3>
            <p className="text-muted-foreground">
              Commission records generated successfully
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 px-1">
              {/* Deal Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{deal.deal_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {deal.developer_project_name || deal.property_id || 'Property TBD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{deal.pipeline}</Badge>
                      <Badge variant="secondary" className="ml-2">{dealType}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Value */}
              <div className="space-y-2">
                <Label htmlFor="transaction_value" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Transaction Value (AED) *
                </Label>
                <Input
                  id="transaction_value"
                  type="number"
                  placeholder="e.g., 2500000"
                  value={transactionValue}
                  onChange={(e) => setTransactionValue(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Commission Rate */}
              <div className="space-y-2">
                <Label htmlFor="commission_percent" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  Commission Rate (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="commission_percent"
                    type="number"
                    step="0.1"
                    min="0"
                    max={maxCommission}
                    placeholder={defaultCommission.toString()}
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    className="font-mono"
                  />
                  <Badge variant="outline" className="whitespace-nowrap">
                    Max {maxCommission}% ({dealType})
                  </Badge>
                </div>
                {commPct > maxCommission && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Exceeds regulatory cap for {dealType.toLowerCase()} transactions
                  </p>
                )}
              </div>

              {/* Gross Commission Preview */}
              {txValue > 0 && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Gross Commission</span>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(grossCommission)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {commPct}% of {formatCurrency(txValue)}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Broker Splits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Broker Commission Splits
                  </Label>
                  {!isValidSplit && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {totalSplit}% (need 100%)
                    </Badge>
                  )}
                  {isValidSplit && (preview?.brokers?.length || 0) > 0 && (
                    <Badge variant="outline" className="text-xs border-emerald text-emerald">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      100% allocated
                    </Badge>
                  )}
                </div>

                {previewLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (preview?.brokers?.length || 0) === 0 ? (
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-sm font-medium text-foreground">No Brokers Assigned</p>
                      <p className="text-xs text-muted-foreground">
                        Add brokers to the deal to auto-generate commissions
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {breakdown.map((broker, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{broker.brokerName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {broker.role}
                              </Badge>
                            </div>
                            <Badge variant="outline">{broker.splitPercent}%</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Net</span>
                              <div className="font-mono font-medium">
                                {formatCurrency(broker.netAmount)}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">VAT ({VAT_PERCENT}%)</span>
                              <div className="font-mono text-muted-foreground">
                                -{formatCurrency(broker.vatAmount)}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Final</span>
                              <div className="font-mono font-medium text-emerald">
                                {formatCurrency(broker.netAmount - broker.vatAmount)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Split Progress */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Split Allocation</span>
                        <span className={cn(
                          "font-medium",
                          isValidSplit ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                        )}>
                          {totalSplit}%
                        </span>
                      </div>
                      <Progress 
                        value={totalSplit} 
                        className={cn(
                          "h-2",
                          !isValidSplit && "bg-destructive/20"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* What will happen */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    What happens when you close:
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Deal state changes to "Closed Won"</li>
                    <li>• Commission records created for each broker (status: Earned)</li>
                    <li>• Calculation trace stored for audit</li>
                    <li>• Event log entry recorded</li>
                    <li>• Evidence object created for compliance</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}

        {!showConfetti && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClose}
              disabled={
                closeDeal.isPending ||
                txValue <= 0 ||
                !isValidSplit ||
                commPct > maxCommission
              }
              className="btn-gold"
            >
              {closeDeal.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Close Deal & Generate Commissions
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
