import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketingStats } from '@/hooks/useMarketingStats';
import { useMarketingEvents } from '@/hooks/useMarketingEvents';
import { 
  Megaphone, 
  DollarSign, 
  Users, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { SourceAttributionChart } from './SourceAttributionChart';

export function MarketingDashboard() {
  const { stats, isLoading } = useMarketingStats();
  const { upcomingEvents } = useMarketingEvents();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpiCards = [
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns,
      subtitle: `${stats.totalCampaigns} total`,
      icon: Megaphone,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Spend',
      value: formatCurrency(stats.totalSpend),
      subtitle: `${formatCurrency(stats.totalBudget)} budget`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Leads Generated',
      value: stats.totalLeadsGenerated.toLocaleString(),
      subtitle: 'From all channels',
      icon: Users,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Active Ads',
      value: stats.activeAds,
      subtitle: `${stats.totalAds} total`,
      icon: BarChart3,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      subtitle: 'Next 30 days',
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Referral Sources',
      value: stats.totalReferralSources,
      subtitle: 'Active partners',
      icon: Target,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Attribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Prospects by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SourceAttributionChart data={stats.prospectsBySource} />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming events in the next 30 days
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.venue || event.location || 'TBD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.expected_attendees} expected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
