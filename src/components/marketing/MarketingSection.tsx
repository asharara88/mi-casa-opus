import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Megaphone, Calendar, Users, BarChart3, Bell } from 'lucide-react';
import { MarketingDashboard } from './MarketingDashboard';
import { CampaignsList } from './CampaignsList';
import { AdsManager } from './AdsManager';
import { EventsCalendar } from './EventsCalendar';
import { NetworkDirectory } from './NetworkDirectory';
import { PriceAlertsSection } from './PriceAlertsSection';
import { useUnreadAlertCount } from '@/hooks/usePriceAlerts';

export function MarketingSection() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: unreadCount = 0 } = useUnreadAlertCount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Hub</h1>
        <p className="text-muted-foreground">
          Manage campaigns, advertisements, events, and referral networks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Ads</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Network</span>
          </TabsTrigger>
          <TabsTrigger value="price-alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Price Alerts</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <MarketingDashboard />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignsList />
        </TabsContent>

        <TabsContent value="ads" className="mt-4">
          <AdsManager />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventsCalendar />
        </TabsContent>

        <TabsContent value="network" className="mt-4">
          <NetworkDirectory />
        </TabsContent>

        <TabsContent value="price-alerts" className="mt-4">
          <PriceAlertsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
