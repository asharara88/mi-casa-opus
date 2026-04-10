import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, User, Home, Banknote, CheckCircle2 } from 'lucide-react';
import { LeadInsert } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'contact', label: 'Contact', icon: User },
  { id: 'property', label: 'Property', icon: Home },
  { id: 'finance', label: 'Finance', icon: Banknote },
] as const;

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial'] as const;
const PURCHASE_METHODS = ['Cash', 'Mortgage', 'Payment Plan', 'Undecided'] as const;
const TIMELINE_OPTIONS = ['Immediate', '1-3 Months', '3-6 Months', '6-12 Months', 'Just Exploring'] as const;
const LEAD_SOURCES = ['Website', 'Referral', 'Portal', 'WalkIn', 'SocialMedia', 'Event', 'Other'] as const;

function generateLeadId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LD-${timestamp}-${random}`;
}

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadInsert) => Promise<void>;
  isLoading?: boolean;
}

function ChipSelect({ options, value, onChange, multi = false }: {
  options: readonly string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (opt: string) => {
    if (multi) {
      const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
      onChange(next);
    } else {
      onChange(opt);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
            selected.includes(opt)
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
          )}
        >
          {opt === 'WalkIn' ? 'Walk-In' : opt === 'SocialMedia' ? 'Social Media' : opt}
        </button>
      ))}
    </div>
  );
}

export function AddLeadModal({ open, onOpenChange, onSubmit, isLoading = false }: AddLeadModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    source: 'Other' as string,
    // Property
    property_types: [] as string[],
    bedrooms: '',
    preferred_locations: '',
    units_needed: '1',
    // Finance
    purchase_method: '',
    budget_min: '',
    budget_max: '',
    timeline: '',
    notes: '',
  });

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.contact_name.trim().length > 0;
    if (step === 1) return form.property_types.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    const leadData: LeadInsert = {
      lead_id: generateLeadId(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      source: (LEAD_SOURCES.includes(form.source as any) ? form.source : 'Other') as any,
      lead_state: 'New',
      notes: form.notes || null,
      qualification_data: {
        property_types: form.property_types,
        bedrooms: form.bedrooms || null,
        preferred_locations: form.preferred_locations || null,
        units_needed: form.units_needed || '1',
        purchase_method: form.purchase_method || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        timeline: form.timeline || null,
      },
    };
    await onSubmit(leadData);
    resetForm();
  };

  const resetForm = () => {
    setStep(0);
    setForm({
      contact_name: '', contact_email: '', contact_phone: '', source: 'Other',
      property_types: [], bedrooms: '', preferred_locations: '', units_needed: '1',
      purchase_method: '', budget_min: '', budget_max: '', timeline: '', notes: '',
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-lg">New Lead</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="px-6 pb-4 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium transition-colors',
                  i === step ? 'text-primary' : i < step ? 'text-primary/60 cursor-pointer' : 'text-muted-foreground'
                )}
              >
                {i < step ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-primary/40' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 space-y-4 min-h-[260px]">
          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <Label className="text-xs font-medium">Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Full name" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className="mt-1" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input placeholder="+971 50 123 4567" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Email</Label>
                  <Input type="email" placeholder="email@example.com" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Source</Label>
                <div className="mt-1.5">
                  <ChipSelect options={LEAD_SOURCES} value={form.source} onChange={v => set('source', v as string)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Property */}
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <Label className="text-xs font-medium">What are they looking for? <span className="text-destructive">*</span></Label>
                <div className="mt-1.5">
                  <ChipSelect options={PROPERTY_TYPES} value={form.property_types} onChange={v => set('property_types', v)} multi />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Bedrooms</Label>
                  <Input placeholder="e.g. 2-3" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">How many units?</Label>
                  <Input type="number" min="1" placeholder="1" value={form.units_needed} onChange={e => set('units_needed', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Preferred locations</Label>
                <Input placeholder="e.g. Al Reem Island, Saadiyat" value={form.preferred_locations} onChange={e => set('preferred_locations', e.target.value)} className="mt-1" />
              </div>
            </div>
          )}

          {/* Step 2: Finance */}
          {step === 2 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <Label className="text-xs font-medium">Payment method</Label>
                <div className="mt-1.5">
                  <ChipSelect options={PURCHASE_METHODS} value={form.purchase_method} onChange={v => set('purchase_method', v as string)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Budget min (AED)</Label>
                  <Input type="number" placeholder="500,000" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Budget max (AED)</Label>
                  <Input type="number" placeholder="2,000,000" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Timeline</Label>
                <div className="mt-1.5">
                  <ChipSelect options={TIMELINE_OPTIONS} value={form.timeline} onChange={v => set('timeline', v as string)} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="mt-1 resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => step === 0 ? handleOpenChange(false) : setStep(s => s - 1)}
            disabled={isLoading}
          >
            {step === 0 ? 'Cancel' : <><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back</>}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={isLoading || !canNext()}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              Add Lead
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
