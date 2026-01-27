import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateViewingBooking } from '@/hooks/useViewingBookings';
import { cn } from '@/lib/utils';

interface ViewingSchedulerProps {
  dealId?: string;
  prospectId?: string;
  listingId?: string;
  propertyName?: string;
  propertyAddress?: string;
  onScheduled?: () => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00',
];

const durations = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
];

export function ViewingScheduler({
  dealId,
  prospectId,
  listingId,
  propertyName,
  propertyAddress,
  onScheduled,
}: ViewingSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');
  const [location, setLocation] = useState(propertyAddress || '');
  const [notes, setNotes] = useState('');

  const createBooking = useCreateViewingBooking();

  const handleSchedule = () => {
    if (!date || !time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledAt = setMinutes(setHours(date, hours), minutes);

    createBooking.mutate({
      deal_id: dealId || null,
      prospect_id: prospectId || null,
      listing_id: listingId || null,
      agent_id: null,
      cal_booking_id: null,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parseInt(duration),
      status: 'scheduled',
      location: location || null,
      notes: notes || null,
      reminder_sent: false,
      confirmation_sent: false,
      cancelled_at: null,
      cancelled_reason: null,
    }, {
      onSuccess: () => {
        onScheduled?.();
      },
    });
  };

  const isReady = date && time;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Viewing
        </CardTitle>
        {propertyName && (
          <CardDescription>
            Book a viewing for {propertyName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Slot */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Time</label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot..." />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {slot}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration</label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durations.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Meeting Location
          </label>
          <Input
            placeholder="Property address or meeting point..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            placeholder="Special instructions or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Summary */}
        {isReady && (
          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">Viewing Summary</p>
            <p>{format(date!, 'EEEE, MMMM d, yyyy')} at {time}</p>
            <p>{duration} minute viewing</p>
            {location && <p>📍 {location}</p>}
          </div>
        )}

        {/* Actions */}
        <Button 
          onClick={handleSchedule} 
          disabled={!isReady || createBooking.isPending}
          className="w-full"
        >
          {createBooking.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Viewing
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
