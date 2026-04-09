import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreatePriceWatch, PortalName } from '@/hooks/usePriceAlerts';
import { Plus } from 'lucide-react';

interface FormData {
  name: string;
  community: string;
  city: string;
  listing_type: string;
  property_type: string;
  bedrooms: string;
  min_price: string;
  max_price: string;
}

const PORTALS: { value: PortalName; label: string }[] = [
  { value: 'PropertyFinder', label: 'Property Finder' },
  { value: 'Bayut', label: 'Bayut' },
  { value: 'Dubizzle', label: 'Dubizzle' },
];

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Townhouse',
  'Penthouse',
  'Duplex',
  'Studio',
  'Office',
  'Shop',
  'Land',
];

interface AddPriceWatchModalProps {
  trigger?: React.ReactNode;
}

export function AddPriceWatchModal({ trigger }: AddPriceWatchModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedPortals, setSelectedPortals] = useState<PortalName[]>(['PropertyFinder', 'Bayut', 'Dubizzle']);
  const createWatch = useCreatePriceWatch();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      city: 'Abu Dhabi',
      listing_type: 'Sale',
    }
  });

  const togglePortal = (portal: PortalName) => {
    setSelectedPortals(prev => 
      prev.includes(portal) 
        ? prev.filter(p => p !== portal)
        : [...prev, portal]
    );
  };

  const onSubmit = async (data: FormData) => {
    await createWatch.mutateAsync({
      name: data.name,
      community: data.community,
      city: data.city,
      listing_type: data.listing_type,
      property_type: data.property_type || undefined,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
      min_price: data.min_price ? parseFloat(data.min_price) : undefined,
      max_price: data.max_price ? parseFloat(data.max_price) : undefined,
      portals: selectedPortals,
    });
    
    reset();
    setSelectedPortals(['PropertyFinder', 'Bayut', 'Dubizzle']);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Watch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Price Watch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Watch Name</Label>
            <Input 
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Al Reem Island 2BR"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Input 
                id="community"
                {...register('community', { required: 'Community is required' })}
                placeholder="e.g., Al Reem Island"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                {...register('city')}
                placeholder="Abu Dhabi"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Listing Type</Label>
              <Select 
                defaultValue="Sale"
                onValueChange={(value) => register('listing_type').onChange({ target: { value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">For Sale</SelectItem>
                  <SelectItem value="Lease">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select onValueChange={(value) => register('property_type').onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Portals to Monitor</Label>
            <div className="flex gap-4">
              {PORTALS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={selectedPortals.includes(value)}
                    onCheckedChange={() => togglePortal(value)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input 
                id="bedrooms"
                type="number"
                {...register('bedrooms')}
                placeholder="Any"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_price">Min Price</Label>
              <Input 
                id="min_price"
                type="number"
                {...register('min_price')}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_price">Max Price</Label>
              <Input 
                id="max_price"
                type="number"
                {...register('max_price')}
                placeholder="Any"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWatch.isPending}>
              {createWatch.isPending ? 'Creating...' : 'Create Watch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
