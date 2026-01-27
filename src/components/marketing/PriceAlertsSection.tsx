import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  usePriceWatches,
  usePriceAlerts,
  useUnreadAlertCount,
  useUpdatePriceWatch,
  useDeletePriceWatch,
  useRunPriceCheck,
  useMarkAlertRead,
  useDismissAlert,
  useMarkAllAlertsRead,
  PriceWatch,
  PriceAlert,
  AlertType,
} from '@/hooks/usePriceAlerts';
import { AddPriceWatchModal } from './AddPriceWatchModal';
import { 
  Bell, 
  Eye, 
  RefreshCw, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  PlusCircle,
  XCircle,
  ExternalLink,
  CheckCheck,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const ALERT_CONFIG: Record<AlertType, { 
  icon: React.ElementType; 
  label: string; 
  color: string;
}> = {
  new_listing: { icon: PlusCircle, label: 'New Listing', color: 'text-primary' },
  price_drop: { icon: TrendingDown, label: 'Price Drop', color: 'text-primary' },
  price_increase: { icon: TrendingUp, label: 'Price Up', color: 'text-destructive' },
  listing_removed: { icon: XCircle, label: 'Removed', color: 'text-muted-foreground' },
};

function formatPrice(price: number | null): string {
  if (!price) return 'N/A';
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
  return price.toString();
}

export function PriceAlertsSection() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedWatch, setSelectedWatch] = useState<string | null>(null);

  const { data: watches = [], isLoading: loadingWatches } = usePriceWatches();
  const { data: alerts = [], isLoading: loadingAlerts } = usePriceAlerts({ 
    watchId: selectedWatch || undefined 
  });
  const { data: unreadCount = 0 } = useUnreadAlertCount();
  
  const updateWatch = useUpdatePriceWatch();
  const deleteWatch = useDeletePriceWatch();
  const runCheck = useRunPriceCheck();
  const markRead = useMarkAlertRead();
  const dismissAlert = useDismissAlert();
  const markAllRead = useMarkAllAlertsRead();

  const handleToggleWatch = (watch: PriceWatch) => {
    updateWatch.mutate({ id: watch.id, updates: { is_active: !watch.is_active } });
  };

  const handleRunCheck = (watchId?: string) => {
    runCheck.mutate(watchId);
  };

  const handleAlertClick = (alert: PriceAlert) => {
    if (!alert.is_read) {
      markRead.mutate(alert.id);
    }
    if (alert.url) {
      window.open(alert.url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Price Alerts</h2>
          <p className="text-muted-foreground">
            Monitor portal listings for price changes in your focus areas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleRunCheck()}
            disabled={runCheck.isPending}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", runCheck.isPending && "animate-spin")} />
            Check All
          </Button>
          <AddPriceWatchModal />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="watches" className="gap-2">
            <Eye className="h-4 w-4" />
            Watches ({watches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
                <div className="flex items-center gap-2">
                  {selectedWatch && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedWatch(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAllRead.mutate()}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark All Read
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts yet</p>
                  <p className="text-sm">Create a price watch to start monitoring</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {alerts.map(alert => {
                      const config = ALERT_CONFIG[alert.alert_type];
                      const Icon = config.icon;
                      
                      return (
                        <div
                          key={alert.id}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                            !alert.is_read && "bg-primary/5 border-primary/20"
                          )}
                          onClick={() => handleAlertClick(alert)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("mt-0.5", config.color)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {alert.portal}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                </span>
                                {!alert.is_read && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="font-medium text-sm truncate">
                                {alert.title || 'Unknown Listing'}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <span className={config.color}>
                                  {config.label}
                                </span>
                                {alert.alert_type !== 'listing_removed' && (
                                  <span className="font-medium">
                                    AED {formatPrice(alert.current_price)}
                                  </span>
                                )}
                                {alert.previous_price && alert.current_price && (
                                  <span className="text-muted-foreground">
                                    (was {formatPrice(alert.previous_price)})
                                  </span>
                                )}
                                {alert.price_change_percent && (
                                  <Badge 
                                    variant={alert.price_change_percent < 0 ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {alert.price_change_percent > 0 ? '+' : ''}
                                    {alert.price_change_percent}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {alert.url && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissAlert.mutate(alert.id);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watches" className="mt-4">
          {loadingWatches ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : watches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Price Watches</h3>
                <p className="text-muted-foreground mb-4">
                  Create a watch to monitor price changes in specific communities
                </p>
                <AddPriceWatchModal />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {watches.map(watch => (
                <Card key={watch.id} className={cn(!watch.is_active && "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{watch.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {watch.community}, {watch.city}
                        </div>
                      </div>
                      <Switch
                        checked={watch.is_active}
                        onCheckedChange={() => handleToggleWatch(watch)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {watch.portals.map(portal => (
                        <Badge key={portal} variant="outline" className="text-xs">
                          {portal}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Type: {watch.listing_type}</div>
                      {watch.bedrooms && <div>Beds: {watch.bedrooms}</div>}
                      {(watch.min_price || watch.max_price) && (
                        <div>
                          Price: {watch.min_price ? `${formatPrice(watch.min_price)}` : '0'} - {watch.max_price ? formatPrice(watch.max_price) : 'Any'}
                        </div>
                      )}
                      {watch.last_checked_at && (
                        <div>
                          Last check: {formatDistanceToNow(new Date(watch.last_checked_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRunCheck(watch.id)}
                        disabled={runCheck.isPending}
                      >
                        <RefreshCw className={cn(
                          "h-3 w-3 mr-1",
                          runCheck.isPending && "animate-spin"
                        )} />
                        Check Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWatch(watch.id)}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Alerts
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteWatch.mutate(watch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
