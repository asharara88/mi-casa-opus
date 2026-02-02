import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard, Receipt, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFunnelAutomation } from '@/hooks/useFunnelAutomation';
import { toast } from 'sonner';

interface EOIPaymentModalProps {
  dealId: string;
  dealDbId?: string;
  currentEoiAmount?: number;
  isEoiPaid?: boolean;
  onPaymentRecorded?: () => void;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'manager_cheque', label: 'Manager\'s Cheque' },
];

export const EOIPaymentModal: React.FC<EOIPaymentModalProps> = ({
  dealId,
  dealDbId,
  currentEoiAmount,
  isEoiPaid,
  onPaymentRecorded,
}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentEoiAmount?.toString() || '');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { onEOIPaid } = useFunnelAutomation();

  const formatAED = (value: string) => {
    const num = value.replace(/[^\d]/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('en-AE').format(parseInt(num));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setAmount(raw);
  };

  const handleSubmit = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error('Please enter a valid EOI amount');
      return;
    }

    if (!dealDbId) {
      toast.error('Deal ID not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await onEOIPaid(dealDbId);
      
      toast.success('EOI payment recorded successfully', {
        description: `AED ${formatAED(amount)} via ${PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}`,
      });
      
      setOpen(false);
      onPaymentRecorded?.();
    } catch (error) {
      toast.error('Failed to record EOI payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isEoiPaid ? "outline" : "default"} 
          size="sm"
          className={cn(
            isEoiPaid && "border-green-500 text-green-600 hover:bg-green-50"
          )}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {isEoiPaid ? 'EOI Paid' : 'Record EOI Payment'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Record EOI Payment
          </DialogTitle>
          <DialogDescription>
            Record the Expression of Interest payment for deal {dealId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* EOI Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">EOI Amount (AED)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                AED
              </span>
              <Input
                id="amount"
                value={formatAED(amount)}
                onChange={handleAmountChange}
                className="pl-12"
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div className="grid gap-2">
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Method */}
          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number */}
          <div className="grid gap-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g., CHQ-12345 or TRX-67890"
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
