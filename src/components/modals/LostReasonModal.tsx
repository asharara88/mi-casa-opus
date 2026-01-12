import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle } from 'lucide-react';

export type LostReason = 
  | 'NoContact'
  | 'NotQualified'
  | 'BudgetMismatch'
  | 'TimelineMismatch'
  | 'ChoseCompetitor'
  | 'PropertyUnavailable'
  | 'FinancingFailed'
  | 'ClientWithdrew'
  | 'DuplicateLead'
  | 'Other';

const LOST_REASON_LABELS: Record<LostReason, string> = {
  NoContact: 'No Contact (3+ attempts)',
  NotQualified: 'Not Qualified',
  BudgetMismatch: 'Budget Mismatch',
  TimelineMismatch: 'Timeline Mismatch',
  ChoseCompetitor: 'Chose Competitor',
  PropertyUnavailable: 'Property Unavailable',
  FinancingFailed: 'Financing Failed',
  ClientWithdrew: 'Client Withdrew',
  DuplicateLead: 'Duplicate Lead',
  Other: 'Other',
};

interface LostReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'Lead' | 'Deal';
  entityName: string;
  onConfirm: (reason: LostReason, notes: string) => void;
}

export function LostReasonModal({
  open,
  onOpenChange,
  entityType,
  entityName,
  onConfirm,
}: LostReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<LostReason | null>(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason, notes);
    // Reset state
    setSelectedReason(null);
    setNotes('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Mark {entityType} as Lost
          </DialogTitle>
          <DialogDescription>
            You are about to mark <span className="font-medium text-foreground">{entityName}</span> as lost.
            This action requires a reason for tracking and analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={selectedReason || ''}
              onValueChange={(value) => setSelectedReason(value as LostReason)}
              className="grid grid-cols-2 gap-2"
            >
              {(Object.entries(LOST_REASON_LABELS) as [LostReason, string][]).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={value} />
                  <Label 
                    htmlFor={value} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional Notes {selectedReason === 'Other' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'Other' && !notes.trim())}
          >
            Confirm Lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
