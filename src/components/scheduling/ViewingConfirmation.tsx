import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ViewingBooking, ViewingStatus } from '@/hooks/useViewingBookings';

interface ViewingConfirmationProps {
  booking: ViewingBooking;
  propertyName?: string;
  agentName?: string;
  onClose?: () => void;
}

const statusColors: Record<ViewingStatus, string> = {
  scheduled: 'default',
  confirmed: 'default',
  completed: 'default',
  cancelled: 'destructive',
  no_show: 'destructive',
  rescheduled: 'secondary',
};

export function ViewingConfirmation({
  booking,
  propertyName,
  agentName,
  onClose,
}: ViewingConfirmationProps) {
  const scheduledDate = new Date(booking.scheduled_at);

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Viewing Scheduled!</h3>
          <p className="text-sm text-muted-foreground">
            Confirmation details below
          </p>
        </div>

        <div className="space-y-4">
          {propertyName && (
            <div className="text-center">
              <p className="font-medium text-lg">{propertyName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(scheduledDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(scheduledDate, 'h:mm a')} ({booking.duration_minutes} min)</span>
            </div>
            {booking.location && (
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{booking.location}</span>
              </div>
            )}
            {agentName && (
              <div className="flex items-center gap-2 col-span-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Agent: {agentName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant={statusColors[booking.status] as any}>
              {booking.status}
            </Badge>
            {booking.confirmation_sent && (
              <Badge variant="outline" className="text-green-600">
                Confirmation Sent
              </Badge>
            )}
          </div>

          {booking.notes && (
            <div className="text-sm text-muted-foreground bg-background p-3 rounded-md">
              <p className="font-medium mb-1">Notes:</p>
              <p>{booking.notes}</p>
            </div>
          )}

          {onClose && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
