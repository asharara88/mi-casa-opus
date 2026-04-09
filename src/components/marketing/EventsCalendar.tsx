import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketingEvents } from '@/hooks/useMarketingEvents';
import { Plus, Search, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { AddEventModal } from './AddEventModal';
import type { EventStatus } from '@/types/marketing';

const eventStatusColors: Record<EventStatus, string> = {
  Planning: 'bg-muted text-muted-foreground',
  Confirmed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  InProgress: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  Completed: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  Cancelled: 'bg-destructive/20 text-destructive',
  Postponed: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
};

export function EventsCalendar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { events, isLoading } = useMarketingEvents();

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Events & Roadshows</CardTitle>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No events found' : 'No events yet. Create your first event!'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.event_id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{event.type}</Badge>
                            <Badge className={eventStatusColors[event.status]}>
                              {event.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(event.event_date), 'MMM d, yyyy')}
                            {event.end_date && event.end_date !== event.event_date && (
                              <span> - {format(new Date(event.end_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                          {(event.venue || event.location) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.venue || event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.actual_attendees > 0 
                              ? `${event.actual_attendees}/${event.expected_attendees} attended`
                              : `${event.expected_attendees} expected`
                            }
                          </div>
                        </div>

                        {event.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 min-w-[120px]">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">{formatCurrency(event.budget)}</p>
                        </div>
                        {event.leads_captured > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Leads Captured</p>
                            <p className="font-semibold text-emerald-600">{event.leads_captured}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddEventModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
