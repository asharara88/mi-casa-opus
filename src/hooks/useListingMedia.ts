import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ListingMediaRow {
  id: string;
  listing_id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  display_order: number;
  is_primary: boolean;
  file_hash: string | null;
  created_at: string;
}

export function useListingMedia(listingId: string | null) {
  return useQuery({
    queryKey: ['listing-media', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const { data, error } = await supabase
        .from('listing_media')
        .select('*')
        .eq('listing_id', listingId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ListingMediaRow[];
    },
    enabled: !!listingId,
  });
}

export function useInsertListingMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Omit<ListingMediaRow, 'id' | 'created_at'>[]) => {
      const { data, error } = await supabase
        .from('listing_media')
        .insert(rows)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      if (vars.length > 0) qc.invalidateQueries({ queryKey: ['listing-media', vars[0].listing_id] });
    },
  });
}

export function useUpdateListingMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listingId, updates }: { id: string; listingId: string; updates: Partial<ListingMediaRow> }) => {
      const { error } = await supabase
        .from('listing_media')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return listingId;
    },
    onSuccess: (listingId) => {
      qc.invalidateQueries({ queryKey: ['listing-media', listingId] });
    },
  });
}

export function useDeleteListingMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listingId, storagePath }: { id: string; listingId: string; storagePath: string }) => {
      // Remove from storage
      await supabase.storage.from('listing-photos').remove([storagePath]);
      // Remove DB row
      const { error } = await supabase.from('listing_media').delete().eq('id', id);
      if (error) throw error;
      return listingId;
    },
    onSuccess: (listingId) => {
      qc.invalidateQueries({ queryKey: ['listing-media', listingId] });
      toast.success('Photo removed');
    },
    onError: () => {
      toast.error('Failed to delete photo');
    },
  });
}

export function useReorderListingMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, orderedIds }: { listingId: string; orderedIds: { id: string; display_order: number; is_primary: boolean }[] }) => {
      // Batch update display_order
      const promises = orderedIds.map((item) =>
        supabase
          .from('listing_media')
          .update({ display_order: item.display_order, is_primary: item.is_primary })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      return listingId;
    },
    onSuccess: (listingId) => {
      qc.invalidateQueries({ queryKey: ['listing-media', listingId] });
    },
  });
}

export function useSetPrimaryMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listingId }: { id: string; listingId: string }) => {
      // Unset all primaries
      await supabase
        .from('listing_media')
        .update({ is_primary: false })
        .eq('listing_id', listingId)
        .eq('is_primary', true);
      // Set new primary
      const { error } = await supabase
        .from('listing_media')
        .update({ is_primary: true })
        .eq('id', id);
      if (error) throw error;
      return listingId;
    },
    onSuccess: (listingId) => {
      qc.invalidateQueries({ queryKey: ['listing-media', listingId] });
      toast.success('Primary photo updated');
    },
  });
}
