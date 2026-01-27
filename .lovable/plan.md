
# Connect Listings Section to Real Database Data

## Overview

Remove all demo/dummy listings and connect the Listings section to use real data from the Supabase database with full CRUD operations (Create, Read, Update, Delete).

---

## Current State

The Listings section has two sources of data that are merged together:
1. **Hardcoded `DEMO_LISTINGS` array** in `ListingsSection.tsx` (lines 58-134) - 5 fake listings
2. **Demo mode fallback** in `useListings.ts` - returns `DEMO_LISTINGS` from `demoData.ts` when demo mode is on
3. **Real database query** - only used when demo mode is off

This creates confusion and always shows dummy data mixed with real data.

---

## Changes Required

### File 1: `src/hooks/useListings.ts`

**Remove demo mode fallback** and always fetch from database:
- Remove import of `useDemoMode` and `DEMO_LISTINGS`
- Remove the `isDemoMode` check in the query
- Simplify to always query the real `listings` table

**Add `useDeleteListing` hook** for full CRUD support:
- Follow existing pattern from `useLeads.ts` and `useDeals.ts`
- Invalidate cache on success
- Show success/error toasts

### File 2: `src/components/listings/ListingsSection.tsx`

**Remove hardcoded `DEMO_LISTINGS`** array (lines 58-134):
- Delete the entire static array of 5 dummy listings

**Update data transformation** to only use database listings:
- Remove the spread of `DEMO_LISTINGS` 
- Properly extract images from `listing_attributes.images`
- Map database fields correctly to display format

**Add delete functionality**:
- Import `useDeleteListing` hook
- Add delete option to the "more" menu on each listing card
- Show confirmation dialog before deletion

### File 3: `src/components/listings/AddListingModal.tsx`

**Save extracted images** when creating listings from URL import:
- Include `imageUrls` from extraction result in `listing_attributes`
- This ensures scraped listings display their photos

---

## Technical Details

### Updated useListings Hook

```typescript
// Remove demo mode - always use real data
export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Listing[];
    },
  });
}

// Add delete mutation
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete listing', { description: error.message });
    },
  });
}
```

### Updated ListingsSection Data Mapping

```typescript
// Only use real database listings - no demo data
const allListings: Listing[] = (dbListings || []).map(dbListing => ({
  id: dbListing.id,
  listing_id: dbListing.listing_id,
  property_type: (dbListing.listing_attributes as any)?.propertyType || 'Property',
  listing_type: dbListing.listing_type as 'Sale' | 'Rent' | 'OffPlan',
  status: dbListing.status as 'Draft' | 'Active' | 'Reserved' | 'Sold' | 'Withdrawn',
  location: {
    community: (dbListing.listing_attributes as any)?.community || 'Abu Dhabi',
    building: (dbListing.listing_attributes as any)?.building,
    city: 'Abu Dhabi',
  },
  price: (dbListing.asking_terms as any)?.price || 0,
  currency: 'AED',
  bedrooms: (dbListing.listing_attributes as any)?.bedrooms || 0,
  bathrooms: (dbListing.listing_attributes as any)?.bathrooms || 0,
  sqft: (dbListing.listing_attributes as any)?.sqft || 0,
  images: (dbListing.listing_attributes as any)?.images || [],  // Extract images
  created_at: dbListing.created_at,
  // Include compliance fields
  madhmoun_listing_id: dbListing.madhmoun_listing_id,
  madhmoun_status: dbListing.madhmoun_status,
  compliance_status: dbListing.compliance_status,
}));
```

### Save Images on Creation

```typescript
await createListing({
  listing_id: `LST-${Date.now()}`,
  listing_type: formData.listingType as 'Sale' | 'Lease' | 'OffPlan',
  status: 'Draft',
  listing_attributes: {
    propertyType: formData.propertyType,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    sqft: formData.sqft,
    community: formData.community,
    building: formData.building,
    description: formData.description,
    images: extractResult?.listing.imageUrls || [],  // Save scraped images
  },
  asking_terms: {
    price: formData.price,
    currency: 'AED',
  },
});
```

---

## UI Enhancements

### Delete Confirmation

Add a dropdown menu to each listing card with:
- **View** - Open detail modal (existing)
- **Edit** - Edit listing (existing button)
- **Delete** - Delete with confirmation dialog

### Empty State

When no listings exist in the database, users see:
- Building icon
- "No listings found" message
- Call-to-action buttons visible in header

---

## Files Summary

| File | Changes |
|------|---------|
| `src/hooks/useListings.ts` | Remove demo mode, add `useDeleteListing` |
| `src/components/listings/ListingsSection.tsx` | Remove `DEMO_LISTINGS`, fix image extraction, add delete functionality |
| `src/components/listings/AddListingModal.tsx` | Save extracted images to database |

---

## Result

After these changes:
- Only real listings from the database will display
- Empty state shows when no listings exist
- Scraped listings include their extracted images
- Full CRUD operations available (Create, Read, Update, Delete)
- Delete confirmation prevents accidental deletions
