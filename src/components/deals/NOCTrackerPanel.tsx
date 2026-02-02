import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { cn } from '@/lib/utils';
import { useFunnelAutomation } from '@/hooks/useFunnelAutomation';
import { toast } from 'sonner';

interface NOCTrackerPanelProps {
  dealId: string;
  dealDbId?: string;
  nocStatus?: string | null;
  nocReference?: string | null;
  nocObtainedAt?: string | null;
  developerName?: string;
  onStatusUpdate?: () => void;
}

type NocStatusType = 'pending' | 'submitted' | 'in_review' | 'obtained' | 'rejected';

const NOC_STATUSES: { value: NocStatusType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'pending', label: 'Pending Submission', icon: Clock, color: 'text-muted-foreground' },
  { value: 'submitted', label: 'Submitted', icon: FileCheck, color: 'text-blue-500' },
  { value: 'in_review', label: 'Under Review', icon: RefreshCw, color: 'text-amber-500' },
  { value: 'obtained', label: 'Obtained', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-500' },
];

export const NOCTrackerPanel: React.FC<NOCTrackerPanelProps> = ({
  dealId,
  dealDbId,
  nocStatus = 'pending',
  nocReference,
  nocObtainedAt,
  developerName,
  onStatusUpdate,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<NocStatusType>((nocStatus as NocStatusType) || 'pending');
  const [newReference, setNewReference] = useState(nocReference || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { onNOCObtained } = useFunnelAutomation();

  const currentStatus = NOC_STATUSES.find(s => s.value === nocStatus) || NOC_STATUSES[0];
  const CurrentIcon = currentStatus.icon;

  const handleUpdateStatus = async () => {
    if (!dealDbId) {
      toast.error('Deal ID not found');
      return;
    }

    if (newStatus === 'obtained' && !newReference) {
      toast.error('Please enter the NOC reference number');
      return;
    }

    setIsSubmitting(true);
    try {
      if (newStatus === 'obtained') {
        await onNOCObtained(dealDbId, newReference);
      }
      
      toast.success('NOC status updated', {
        description: `Status changed to: ${NOC_STATUSES.find(s => s.value === newStatus)?.label}`,
      });
      
      setIsDialogOpen(false);
      onStatusUpdate?.();
    } catch (error) {
      toast.error('Failed to update NOC status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              NOC Tracker
            </CardTitle>
            <CardDescription className="mt-1">
              {developerName ? `Developer: ${developerName}` : 'No Objection Certificate Status'}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update NOC Status</DialogTitle>
                <DialogDescription>
                  Track the NOC application progress for deal {dealId}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Status Selection */}
                <div className="grid gap-2">
                  <Label>NOC Status</Label>
                  <Select 
                    value={newStatus} 
                    onValueChange={(v) => setNewStatus(v as NocStatusType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOC_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <status.icon className={cn("h-4 w-4", status.color)} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Number - Required when obtained */}
                <div className="grid gap-2">
                  <Label htmlFor="nocRef">
                    NOC Reference Number
                    {newStatus === 'obtained' && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id="nocRef"
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    placeholder="e.g., NOC-2026-12345"
                  />
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="nocNotes">Notes (Optional)</Label>
                  <Textarea
                    id="nocNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details about the NOC status..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Timeline */}
        <div className="space-y-4">
          {/* Current Status Display */}
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg border",
            nocStatus === 'obtained' && "border-green-500/50 bg-green-500/10",
            nocStatus === 'rejected' && "border-red-500/50 bg-red-500/10",
            nocStatus === 'in_review' && "border-amber-500/50 bg-amber-500/10",
            !['obtained', 'rejected', 'in_review'].includes(nocStatus || '') && "border-border"
          )}>
            <CurrentIcon className={cn("h-6 w-6", currentStatus.color)} />
            <div className="flex-1">
              <div className="font-medium">{currentStatus.label}</div>
              {nocReference && (
                <div className="text-sm text-muted-foreground">
                  Ref: {nocReference}
                </div>
              )}
              {nocObtainedAt && (
                <div className="text-xs text-muted-foreground">
                  Obtained: {format(new Date(nocObtainedAt), 'PPP')}
                </div>
              )}
            </div>
            <Badge variant={nocStatus === 'obtained' ? 'default' : 'outline'}>
              {currentStatus.label}
            </Badge>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            {NOC_STATUSES.slice(0, -1).map((status, index) => {
              const StatusIcon = status.icon;
              const statusIndex = NOC_STATUSES.findIndex(s => s.value === nocStatus);
              const isCompleted = index < statusIndex;
              const isCurrent = status.value === nocStatus;
              
              return (
                <div 
                  key={status.value} 
                  className={cn(
                    "relative flex items-center gap-3 py-2 pl-8",
                    isCompleted && "opacity-60"
                  )}
                >
                  <div className={cn(
                    "absolute left-2 w-4 h-4 rounded-full border-2 bg-background",
                    isCompleted && "border-green-500 bg-green-500",
                    isCurrent && "border-primary bg-primary",
                    !isCompleted && !isCurrent && "border-muted-foreground"
                  )}>
                    {isCompleted && (
                      <CheckCircle2 className="h-3 w-3 text-white absolute -left-0.5 -top-0.5" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm",
                    isCurrent && "font-medium",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Warning for Rejected */}
          {nocStatus === 'rejected' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-red-600">NOC Application Rejected</div>
                <p className="text-muted-foreground mt-1">
                  Please review the rejection reason and resubmit with required corrections.
                </p>
              </div>
            </div>
          )}

          {/* External Link to Developer Portal */}
          {developerName && (
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open {developerName} Portal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
