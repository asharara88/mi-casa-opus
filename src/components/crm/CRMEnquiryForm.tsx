import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useCreateEnquiry } from '@/hooks/useCRMEnquiries';

interface Props {
  onBack: () => void;
  onCreated: () => void;
}

export function CRMEnquiryForm({ onBack, onCreated }: Props) {
  const create = useCreateEnquiry();
  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    company: '',
    budget_min: '',
    budget_max: '',
    preferred_location: '',
    property_type: '',
    bedrooms_min: '',
    bedrooms_max: '',
    key_requirements: '',
    source: 'direct',
    urgency: 'normal',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim()) return;
    create.mutate(
      {
        client_name: form.client_name.trim(),
        client_phone: form.client_phone || null,
        client_email: form.client_email || null,
        company: form.company || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        preferred_location: form.preferred_location || null,
        property_type: form.property_type || null,
        bedrooms_min: form.bedrooms_min ? Number(form.bedrooms_min) : null,
        bedrooms_max: form.bedrooms_max ? Number(form.bedrooms_max) : null,
        key_requirements: form.key_requirements || null,
        source: form.source,
        urgency: form.urgency,
        status: 'new',
        assigned_to: null,
        notes: form.notes || null,
      },
      { onSuccess: onCreated }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="text-xl font-bold text-foreground">New Enquiry</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Client Info */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">Client Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Client name *" value={form.client_name} onChange={e => set('client_name', e.target.value)} required />
            <Input placeholder="Phone" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} />
            <Input placeholder="Email" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} />
            <Input placeholder="Company" value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
        </fieldset>

        {/* Requirements */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">Property Requirements</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Preferred location" value={form.preferred_location} onChange={e => set('preferred_location', e.target.value)} />
            <Select value={form.property_type} onValueChange={v => set('property_type', v)}>
              <SelectTrigger><SelectValue placeholder="Property type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input placeholder="Budget min (AED)" type="number" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} />
              <Input placeholder="Budget max (AED)" type="number" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Input placeholder="Min beds" type="number" value={form.bedrooms_min} onChange={e => set('bedrooms_min', e.target.value)} />
              <Input placeholder="Max beds" type="number" value={form.bedrooms_max} onChange={e => set('bedrooms_max', e.target.value)} />
            </div>
          </div>
          <Textarea placeholder="Key requirements (e.g. beach view, high floor, parking...)" value={form.key_requirements} onChange={e => set('key_requirements', e.target.value)} rows={2} />
        </fieldset>

        {/* Meta */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={form.source} onValueChange={v => set('source', v)}>
              <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="portal">Portal</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.urgency} onValueChange={v => set('urgency', v)}>
              <SelectTrigger><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High — Immediate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Internal notes..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        </fieldset>

        <Button type="submit" disabled={create.isPending} className="w-full sm:w-auto">
          {create.isPending ? 'Saving...' : 'Create Enquiry'}
        </Button>
      </form>
    </div>
  );
}
