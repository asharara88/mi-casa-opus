import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateContact, useCreateOpportunity, usePipelineStages, useContacts, type Financing } from '@/hooks/useUnifiedCRM';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (opportunityId: string) => void;
}

export function NewOpportunityDialog({ open, onOpenChange, onCreated }: Props) {
  const { data: stages = [] } = usePipelineStages();
  const { data: contacts = [] } = useContacts();
  const createContact = useCreateContact();
  const createOpp = useCreateOpportunity();

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [existingContactId, setExistingContactId] = useState('');
  // Contact
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('Website');
  // Opportunity
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [listingType, setListingType] = useState('Sale');
  const [bedroomsMin, setBedroomsMin] = useState('');
  const [bedroomsMax, setBedroomsMax] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [unitCount, setUnitCount] = useState('1');
  const [financing, setFinancing] = useState<Financing>('unknown');
  const [mortgagePre, setMortgagePre] = useState(false);
  const [locations, setLocations] = useState('');
  const [timeframe, setTimeframe] = useState('3-6 months');
  const [urgency, setUrgency] = useState('normal');
  const [keyReq, setKeyReq] = useState('');

  const reset = () => {
    setMode('new'); setExistingContactId(''); setFullName(''); setPhone(''); setEmail(''); setSource('Website');
    setTitle(''); setPropertyType('Apartment'); setListingType('Sale'); setBedroomsMin(''); setBedroomsMax('');
    setBudgetMin(''); setBudgetMax(''); setUnitCount('1'); setFinancing('unknown'); setMortgagePre(false);
    setLocations(''); setTimeframe('3-6 months'); setUrgency('normal'); setKeyReq('');
  };

  const submit = async () => {
    let contactId = existingContactId;
    if (mode === 'new') {
      if (!fullName.trim()) return;
      const c = await createContact.mutateAsync({
        full_name: fullName, phone: phone || null, email: email || null, source, lifecycle_stage: 'Lead',
      });
      contactId = c.id;
    }
    if (!contactId) return;
    const firstStage = stages.find((s) => s.stage_type === 'active') ?? stages[0];
    if (!firstStage) return;
    const opp = await createOpp.mutateAsync({
      title: title.trim() || `${propertyType} · ${listingType}${bedroomsMin ? ` · ${bedroomsMin}BR` : ''}`,
      contact_id: contactId,
      stage_id: firstStage.id,
      source,
      property_type: propertyType,
      listing_type: listingType,
      bedrooms_min: bedroomsMin ? parseInt(bedroomsMin) : null,
      bedrooms_max: bedroomsMax ? parseInt(bedroomsMax) : null,
      budget_min: budgetMin ? parseFloat(budgetMin) : null,
      budget_max: budgetMax ? parseFloat(budgetMax) : null,
      unit_count: parseInt(unitCount) || 1,
      financing,
      mortgage_pre_approved: mortgagePre,
      preferred_locations: locations.split(',').map((s) => s.trim()).filter(Boolean),
      timeframe,
      urgency,
      key_requirements: keyReq || null,
      currency: 'AED',
    });
    reset();
    onOpenChange(false);
    onCreated?.(opp.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lead / Opportunity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant={mode === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setMode('new')}>New contact</Button>
              <Button variant={mode === 'existing' ? 'default' : 'outline'} size="sm" onClick={() => setMode('existing')}>Existing contact</Button>
            </div>

            {mode === 'new' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Full name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971…" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
              </div>
            ) : (
              <div>
                <Label>Select contact</Label>
                <Select value={existingContactId} onValueChange={setExistingContactId}>
                  <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}{c.phone ? ` · ${c.phone}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Listing type</Label>
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="OffPlan">Off-Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Property type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Beds min</Label>
                <Input type="number" value={bedroomsMin} onChange={(e) => setBedroomsMin(e.target.value)} />
              </div>
              <div>
                <Label>Beds max</Label>
                <Input type="number" value={bedroomsMax} onChange={(e) => setBedroomsMax(e.target.value)} />
              </div>
              <div>
                <Label>Budget min (AED)</Label>
                <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
              </div>
              <div>
                <Label>Budget max (AED)</Label>
                <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
              </div>
              <div>
                <Label>Units needed</Label>
                <Input type="number" min="1" value={unitCount} onChange={(e) => setUnitCount(e.target.value)} />
              </div>
              <div>
                <Label>Financing</Label>
                <Select value={financing} onValueChange={(v) => setFinancing(v as Financing)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Not specified</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input id="pre" type="checkbox" checked={mortgagePre} onChange={(e) => setMortgagePre(e.target.checked)} className="rounded border-input" />
                <Label htmlFor="pre" className="cursor-pointer">Mortgage pre-approved</Label>
              </div>
              <div className="col-span-2">
                <Label>Preferred locations (comma-separated)</Label>
                <Input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="Yas Island, Saadiyat, Reem" />
              </div>
              <div>
                <Label>Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3 months">0-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="12+ months">12+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Key requirements / notes</Label>
                <Textarea value={keyReq} onChange={(e) => setKeyReq(e.target.value)} rows={2} placeholder="Sea view, high floor, ready to move…" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={createContact.isPending || createOpp.isPending}>
            Create opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
