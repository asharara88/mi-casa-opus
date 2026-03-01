import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketingStats } from '@/types/marketing';

export function useMarketingStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: async (): Promise<MarketingStats> => {
      // Fetch campaigns
      const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('status, budget, spend, metrics');
      
      // Fetch events
      const { data: events } = await supabase
        .from('marketing_events')
        .select('status, event_date, leads_captured');
      
      // Fetch ads
      const { data: ads } = await supabase
        .from('marketing_ads')
        .select('status, leads_generated, permit_valid_until, permit_status');
      
      // Fetch referral sources
      const { data: sources } = await supabase
        .from('referral_sources')
        .select('leads_generated');
      
      // Fetch prospects by source
      const { data: prospects } = await supabase
        .from('prospects')
        .select('source');
      
      // Calculate stats
      const campaignsList = campaigns || [];
      const eventsList = events || [];
      const adsList = ads || [];
      const sourcesList = sources || [];
      const prospectsList = prospects || [];

      const activeCampaigns = campaignsList.filter(c => c.status === 'Active').length;
      const totalBudget = campaignsList.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
      const totalSpend = campaignsList.reduce((sum, c) => sum + (Number(c.spend) || 0), 0);
      
      const campaignLeads = campaignsList.reduce((sum, c) => {
        const metrics = c.metrics as { leads?: number } | null;
        return sum + (metrics?.leads || 0);
      }, 0);
      const adLeads = adsList.reduce((sum, a) => sum + (a.leads_generated || 0), 0);
      const eventLeads = eventsList.reduce((sum, e) => sum + (e.leads_captured || 0), 0);
      
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingEvents = eventsList.filter(e => {
        const eventDate = new Date(e.event_date);
        return eventDate >= now && eventDate <= thirtyDaysFromNow && e.status !== 'Cancelled';
      }).length;

      const activeAds = adsList.filter(a => a.status === 'Active').length;

      // DARI permit expiry check (within 14 days)
      const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const expiringPermits = adsList.filter(a => {
        if (!a.permit_valid_until || a.permit_status === 'Expired') return false;
        const expiry = new Date(a.permit_valid_until);
        return expiry >= now && expiry <= fourteenDaysFromNow;
      }).length;

      // Paused campaigns
      const pausedCampaigns = campaignsList.filter(c => c.status === 'Paused').length;

      // Active campaigns with zero leads
      const zeroLeadCampaigns = campaignsList.filter(c => {
        if (c.status !== 'Active') return false;
        const metrics = c.metrics as { leads?: number } | null;
        return !metrics?.leads;
      }).length;

      // Group prospects by source
      const sourceMap = new Map<string, number>();
      prospectsList.forEach(p => {
        const source = p.source || 'Unknown';
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });
      
      const prospectsBySource = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalCampaigns: campaignsList.length,
        activeCampaigns,
        totalSpend,
        totalBudget,
        totalLeadsGenerated: campaignLeads + adLeads + eventLeads,
        totalEvents: eventsList.length,
        upcomingEvents,
        totalAds: adsList.length,
        activeAds,
        totalReferralSources: sourcesList.length,
        prospectsBySource,
        expiringPermits,
        pausedCampaigns,
        zeroLeadCampaigns,
      };
    },
  });

  return {
    stats: stats || {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalSpend: 0,
      totalBudget: 0,
      totalLeadsGenerated: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalAds: 0,
      activeAds: 0,
      totalReferralSources: 0,
      prospectsBySource: [],
      expiringPermits: 0,
      pausedCampaigns: 0,
      zeroLeadCampaigns: 0,
    },
    isLoading,
    error,
  };
}
