import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MarketingCampaign, CampaignType, CampaignChannel, CampaignStatus } from '@/types/marketing';

interface CampaignInsert {
  name: string;
  type: CampaignType;
  channel: CampaignChannel;
  status?: CampaignStatus;
  budget?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export function useMarketingCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as MarketingCampaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: CampaignInsert) => {
      const campaignId = `CMP-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert({
          ...campaign,
          campaign_id: campaignId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingCampaign> & { id: string }) => {
      const { target_audience, metrics, ...safeUpdates } = updates;
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update(safeUpdates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });

  return {
    campaigns,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
