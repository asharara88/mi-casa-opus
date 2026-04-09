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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMarketingAds } from '@/hooks/useMarketingAds';
import type { AdPlatform, PermitStatus } from '@/types/marketing';

interface AddAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const adPlatforms: AdPlatform[] = ['Bayut', 'PropertyFinder', 'Dubizzle', 'Instagram', 'Facebook', 'LinkedIn', 'Google', 'TikTok', 'YouTube', 'Print', 'Billboard', 'Brochure'];
const permitStatuses: PermitStatus[] = ['NotRequired', 'Pending', 'Approved'];

export function AddAdModal({ open, onOpenChange }: AddAdModalProps) {
  const { createAd } = useMarketingAds();
  const [formData, setFormData] = useState({
    name: '',
    platform: '' as AdPlatform,
    type: '',
    budget: '',
    dari_permit_no: '',
    permit_status: 'NotRequired' as PermitStatus,
    permit_valid_from: '',
    permit_valid_until: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.platform) return;

    await createAd.mutateAsync({
      name: formData.name,
      platform: formData.platform,
      type: formData.type || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      dari_permit_no: formData.dari_permit_no || undefined,
      permit_status: formData.permit_status,
      permit_valid_from: formData.permit_valid_from || undefined,
      permit_valid_until: formData.permit_valid_until || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });

    setFormData({
      name: '',
      platform: '' as AdPlatform,
      type: '',
      budget: '',
      dari_permit_no: '',
      permit_status: 'NotRequired',
      permit_valid_from: '',
      permit_valid_until: '',
      start_date: '',
      end_date: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Advertisement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Marina Views - Bayut Featured"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value: AdPlatform) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {adPlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Ad Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Featured, Premium, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (AED)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="5000"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">DARI Permit (Required for Abu Dhabi)</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Permit Status</Label>
                  <Select
                    value={formData.permit_status}
                    onValueChange={(value: PermitStatus) => setFormData({ ...formData, permit_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {permitStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === 'NotRequired' ? 'Not Required' : status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dari_permit_no">Permit Number</Label>
                  <Input
                    id="dari_permit_no"
                    value={formData.dari_permit_no}
                    onChange={(e) => setFormData({ ...formData, dari_permit_no: e.target.value })}
                    placeholder="DARI-12345"
                    disabled={formData.permit_status === 'NotRequired'}
                  />
                </div>
              </div>

              {formData.permit_status !== 'NotRequired' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permit_valid_from">Valid From</Label>
                    <Input
                      id="permit_valid_from"
                      type="date"
                      value={formData.permit_valid_from}
                      onChange={(e) => setFormData({ ...formData, permit_valid_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permit_valid_until">Valid Until</Label>
                    <Input
                      id="permit_valid_until"
                      type="date"
                      value={formData.permit_valid_until}
                      onChange={(e) => setFormData({ ...formData, permit_valid_until: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Ad Duration</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAd.isPending}>
              {createAd.isPending ? 'Creating...' : 'Create Ad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
