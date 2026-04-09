import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Building2, Home, ArrowRight, Zap } from 'lucide-react';
import { DealPipeline } from '@/types/pipeline';
import { useDevelopers, useDeveloperProjects } from '@/hooks/useDevelopers';
import { cn } from '@/lib/utils';

interface ConvertToDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  leadRequirements?: {
    budget_min?: number;
    budget_max?: number;
    property_types?: string[];
    locations?: string[];
    bedrooms_min?: number;
  };
  onConfirm: (config: {
    pipeline: DealPipeline;
    dealType: 'Sale' | 'Rent';
    side: 'Buy' | 'Sell';
    developerId?: string;
    developerProjectId?: string;
    developerProjectName?: string;
    transactionValue?: number;
    commissionPercent?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function ConvertToDealModal({
  open,
  onOpenChange,
  leadName,
  leadRequirements,
  onConfirm,
  isLoading = false,
}: ConvertToDealModalProps) {
  const [pipeline, setPipeline] = useState<DealPipeline>('Secondary');
  const [dealType, setDealType] = useState<'Sale' | 'Rent'>('Sale');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [developerId, setDeveloperId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [transactionValue, setTransactionValue] = useState<string>(
    leadRequirements?.budget_max?.toString() || leadRequirements?.budget_min?.toString() || ''
  );
  const [commissionPercent, setCommissionPercent] = useState<string>('');

  const { data: developers } = useDevelopers();
  const { data: projects } = useDeveloperProjects(developerId || undefined);

  const selectedProject = projects?.find(p => p.id === projectId);

  // Default commission based on deal type (UAE caps: 2% sales, 5% rent)
  const defaultCommission = dealType === 'Sale' ? 2 : 5;
  const effectiveCommission = commissionPercent ? parseFloat(commissionPercent) : defaultCommission;
  const parsedValue = transactionValue ? parseFloat(transactionValue.replace(/,/g, '')) : 0;
  const expectedCommission = parsedValue * (effectiveCommission / 100);

  const handleConfirm = async () => {
    await onConfirm({
      pipeline,
      dealType,
      side,
      developerId: pipeline === 'OffPlan' ? developerId : undefined,
      developerProjectId: pipeline === 'OffPlan' ? projectId : undefined,
      developerProjectName: pipeline === 'OffPlan' ? selectedProject?.name : undefined,
      transactionValue: parsedValue || undefined,
      commissionPercent: effectiveCommission,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gold" />
            Convert Lead to Deal
          </DialogTitle>
          <DialogDescription>
            Create a new deal for <span className="font-medium text-foreground">{leadName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pipeline Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pipeline Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPipeline('Secondary')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                  pipeline === 'Secondary'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Home className={cn('h-8 w-8', pipeline === 'Secondary' ? 'text-primary' : 'text-muted-foreground')} />
                <span className="font-medium">Secondary</span>
                <span className="text-xs text-muted-foreground">Resale / Ready</span>
              </button>
              <button
                type="button"
                onClick={() => setPipeline('OffPlan')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                  pipeline === 'OffPlan'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Building2 className={cn('h-8 w-8', pipeline === 'OffPlan' ? 'text-primary' : 'text-muted-foreground')} />
                <span className="font-medium">Off-Plan</span>
                <span className="text-xs text-muted-foreground">New Development</span>
              </button>
            </div>
          </div>

          {/* Deal Type & Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction Type</Label>
              <Select value={dealType} onValueChange={(v) => setDealType(v as 'Sale' | 'Rent')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Client Side</Label>
              <Select value={side} onValueChange={(v) => setSide(v as 'Buy' | 'Sell')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buyer</SelectItem>
                  <SelectItem value="Sell">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Off-Plan Developer Selection */}
          {pipeline === 'OffPlan' && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Developer</Label>
                <Select value={developerId} onValueChange={(v) => {
                  setDeveloperId(v);
                  setProjectId('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select developer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {developers?.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {developerId && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Deal Economics */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium">Deal Economics (Optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Est. Transaction Value (AED)</Label>
                <Input
                  type="text"
                  placeholder={leadRequirements?.budget_max?.toLocaleString() || "e.g. 2,500,000"}
                  value={transactionValue}
                  onChange={(e) => setTransactionValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Commission %</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max={dealType === 'Sale' ? 2 : 5}
                  placeholder={defaultCommission.toString()}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  UAE cap: {dealType === 'Sale' ? '2%' : '5%'}
                </p>
              </div>
            </div>
            {parsedValue > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Expected Commission:</span>
                <span className="font-semibold text-primary">
                  AED {expectedCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            )}
          </div>

          {/* Lead Requirements Summary */}
          {leadRequirements && (
            <div className="p-3 rounded-lg bg-muted/30 border text-sm">
              <p className="font-medium mb-2">Lead Requirements</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                {leadRequirements.budget_min && (
                  <p>Budget: AED {leadRequirements.budget_min.toLocaleString()}+</p>
                )}
                {leadRequirements.bedrooms_min && (
                  <p>Bedrooms: {leadRequirements.bedrooms_min}+</p>
                )}
                {leadRequirements.locations?.length && (
                  <p className="col-span-2">Areas: {leadRequirements.locations.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Deal
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
