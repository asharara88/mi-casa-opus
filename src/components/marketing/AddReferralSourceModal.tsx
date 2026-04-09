import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReferralSources } from '@/hooks/useReferralSources';
import type { ReferralType } from '@/types/marketing';

interface AddReferralSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const referralTypes: ReferralType[] = ['Broker', 'Developer', 'Bank', 'Agency', 'Individual', 'Corporate', 'Other'];

export function AddReferralSourceModal({ open, onOpenChange }: AddReferralSourceModalProps) {
  const { createSource } = useReferralSources();
  const [formData, setFormData] = useState({
    name: '',
    type: '' as ReferralType,
    company_name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    commission_percent: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) return;

    await createSource.mutateAsync({
      name: formData.name,
      type: formData.type,
      company_name: formData.company_name || undefined,
      contact_name: formData.contact_name || undefined,
      contact_phone: formData.contact_phone || undefined,
      contact_email: formData.contact_email || undefined,
      commission_percent: formData.commission_percent ? parseFloat(formData.commission_percent) : 0,
      notes: formData.notes || undefined,
    });

    setFormData({
      name: '',
      type: '' as ReferralType,
      company_name: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      commission_percent: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Referral Partner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ahmed Al Mansoori"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Partner Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ReferralType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {referralTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_percent">Commission %</Label>
              <Input
                id="commission_percent"
                type="number"
                step="0.5"
                value={formData.commission_percent}
                onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
                placeholder="25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="ABC Real Estate"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Contact Information</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Primary contact name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="partner@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this partner..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSource.isPending}>
              {createSource.isPending ? 'Creating...' : 'Add Partner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
