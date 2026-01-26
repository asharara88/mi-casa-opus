import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MarketingAd, AdPlatform, AdStatus, PermitStatus } from '@/types/marketing';

interface AdInsert {
  name: string;
  platform: AdPlatform;
  type?: string;
  status?: AdStatus;
  listing_id?: string;
  campaign_id?: string;
  dari_permit_no?: string;
  permit_status?: PermitStatus;
  permit_valid_from?: string;
  permit_valid_until?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

export function useMarketingAds() {
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['marketing-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_ads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as MarketingAd[];
    },
  });

  const createAd = useMutation({
    mutationFn: async (ad: AdInsert) => {
      const adId = `AD-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('marketing_ads')
        .insert({
          ...ad,
          ad_id: adId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-ads'] });
      toast.success('Advertisement created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create advertisement: ${error.message}`);
    },
  });

  const updateAd = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingAd> & { id: string }) => {
      const { ad_content, ...safeUpdates } = updates;
      const { data, error } = await supabase
        .from('marketing_ads')
        .update(safeUpdates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-ads'] });
      toast.success('Advertisement updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update advertisement: ${error.message}`);
    },
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_ads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-ads'] });
      toast.success('Advertisement deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete advertisement: ${error.message}`);
    },
  });

  // Get ads with expiring permits (within 7 days)
  const expiringPermits = ads.filter(ad => {
    if (ad.permit_status !== 'Approved' || !ad.permit_valid_until) return false;
    const expiryDate = new Date(ad.permit_valid_until);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiryDate <= sevenDaysFromNow && expiryDate >= now;
  });

  return {
    ads,
    expiringPermits,
    isLoading,
    error,
    createAd,
    updateAd,
    deleteAd,
  };
}
