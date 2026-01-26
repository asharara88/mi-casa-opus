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
import { useMarketingEvents } from '@/hooks/useMarketingEvents';
import type { EventType } from '@/types/marketing';

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventTypes: EventType[] = ['Roadshow', 'PropertyLaunch', 'Exhibition', 'Networking', 'Seminar', 'OpenHouse', 'Other'];

export function AddEventModal({ open, onOpenChange }: AddEventModalProps) {
  const { createEvent } = useMarketingEvents();
  const [formData, setFormData] = useState({
    name: '',
    type: '' as EventType,
    event_date: '',
    end_date: '',
    venue: '',
    location: '',
    budget: '',
    expected_attendees: '',
    organizer: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.event_date) return;

    await createEvent.mutateAsync({
      name: formData.name,
      type: formData.type,
      event_date: formData.event_date,
      end_date: formData.end_date || undefined,
      venue: formData.venue || undefined,
      location: formData.location || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      expected_attendees: formData.expected_attendees ? parseInt(formData.expected_attendees) : 0,
      organizer: formData.organizer || undefined,
      contact_email: formData.contact_email || undefined,
      contact_phone: formData.contact_phone || undefined,
      notes: formData.notes || undefined,
    });

    setFormData({
      name: '',
      type: '' as EventType,
      event_date: '',
      end_date: '',
      venue: '',
      location: '',
      budget: '',
      expected_attendees: '',
      organizer: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dubai Property Expo 2025"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: EventType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'PropertyLaunch' ? 'Property Launch' : 
                       type === 'OpenHouse' ? 'Open House' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (AED)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
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

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Dubai World Trade Centre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location/Address</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Sheikh Zayed Road, Dubai"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_attendees">Expected Attendees</Label>
            <Input
              id="expected_attendees"
              type="number"
              value={formData.expected_attendees}
              onChange={(e) => setFormData({ ...formData, expected_attendees: e.target.value })}
              placeholder="500"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Contact Information</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="Marketing Team"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="events@micasa.ae"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+971 50 123 4567"
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
              placeholder="Event details and requirements..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
