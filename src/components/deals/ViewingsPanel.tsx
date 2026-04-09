import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useViewingBookings, ViewingBooking } from '@/hooks/useViewingBookings';
import { useViewingCompletion } from '@/hooks/useViewingCompletion';
import { ViewingCompletionDialog } from './ViewingCompletionDialog';
import { ViewingScheduler } from '@/components/scheduling/ViewingScheduler';
import { cn } from '@/lib/utils';

interface ViewingsPanelProps {
  dealId: string;
  propertyName?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  scheduled: { label: 'Scheduled', variant: 'outline', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  completed: { label: 'Completed', variant: 'secondary', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  no_show: { label: 'No Show', variant: 'destructive', icon: AlertTriangle },
  rescheduled: { label: 'Rescheduled', variant: 'outline', icon: Clock },
};

export function ViewingsPanel({ dealId, propertyName }: ViewingsPanelProps) {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedViewing, setSelectedViewing] = useState<ViewingBooking | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);

  const { data: viewings, isLoading } = useViewingBookings({ dealId });
  const { completeViewing, markNoShow, isLoading: isCompletingViewing } = useViewingCompletion();

  const handleOpenCompletion = (viewing: ViewingBooking) => {
    setSelectedViewing(viewing);
    setCompletionDialogOpen(true);
  };

  const handleComplete = async (data: {
    feedbackScore: number;
    feedbackNotes: string;
    clientInterest: 'high' | 'medium' | 'low' | 'none';
  }) => {
    if (!selectedViewing) return;
    
    const success = await completeViewing(selectedViewing.id, dealId, data);
    if (success) {
      setCompletionDialogOpen(false);
      setSelectedViewing(null);
    }
  };

  const handleNoShow = async (viewing: ViewingBooking) => {
    await markNoShow(viewing.id, dealId);
  };

  const activeViewings = viewings?.filter(v => 
    ['scheduled', 'confirmed', 'rescheduled'].includes(v.status)
  ) || [];

  const pastViewings = viewings?.filter(v => 
    ['completed', 'cancelled', 'no_show'].includes(v.status)
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading viewings...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Viewings
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowScheduler(!showScheduler)}>
            <Calendar className="h-4 w-4 mr-1" />
            {showScheduler ? 'Hide Scheduler' : 'Schedule Viewing'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showScheduler && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <ViewingScheduler
                dealId={dealId}
                propertyName={propertyName}
                onScheduled={() => setShowScheduler(false)}
              />
            </div>
          )}

          {/* Active Viewings */}
          {activeViewings.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Upcoming</h4>
              {activeViewings.map((viewing) => {
                const viewingDate = new Date(viewing.scheduled_at);
                const isPastViewing = isPast(viewingDate);
                const isTodayViewing = isToday(viewingDate);
                const config = statusConfig[viewing.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={viewing.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      isPastViewing && 'border-amber-500/50 bg-amber-500/5',
                      isTodayViewing && !isPastViewing && 'border-primary/50 bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(viewingDate, 'EEEE, MMM d, yyyy')}
                          </span>
                          <Badge variant={config.variant} className="text-xs">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(viewingDate, 'h:mm a')} ({viewing.duration_minutes} min)
                          </span>
                          {viewing.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {viewing.location}
                            </span>
                          )}
                        </div>
                        {viewing.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{viewing.notes}</p>
                        )}
                      </div>

                      {/* Actions for past/today viewings */}
                      {(isPastViewing || isTodayViewing) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenCompletion(viewing)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNoShow(viewing)}
                          >
                            No Show
                          </Button>
                        </div>
                      )}
                    </div>

                    {isPastViewing && (
                      <div className="mt-3 p-2 rounded bg-amber-500/10 text-amber-600 text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        This viewing is overdue. Please mark as completed or no-show.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !showScheduler ? (
            <div className="text-center py-6 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No viewings scheduled</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowScheduler(true)}
                className="mt-2"
              >
                Schedule a viewing
              </Button>
            </div>
          ) : null}

          {/* Past Viewings */}
          {pastViewings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">History</h4>
              {pastViewings.slice(0, 3).map((viewing) => {
                const viewingDate = new Date(viewing.scheduled_at);
                const config = statusConfig[viewing.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={viewing.id}
                    className="p-3 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {format(viewingDate, 'MMM d, yyyy')}
                        </span>
                        <Badge variant={config.variant} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      {viewing.notes && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {viewing.notes}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <ViewingCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        viewingId={selectedViewing?.id || ''}
        propertyName={propertyName}
        onComplete={handleComplete}
        isLoading={isCompletingViewing}
      />
    </div>
  );
}
