import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Bed, Bath, Maximize, Sparkles, HelpCircle, Map } from 'lucide-react';
import { CompliancePanel } from '@/components/compliance/CompliancePanel';
import { useRunCompliance, useComplianceResult, useSubmitOverride, useCanOverride } from '@/hooks/useCompliance';
import { useUpdateListing } from '@/hooks/useListings';
import { toast } from 'sonner';
import type { OverridePayload } from '@/types/compliance';
import { AIGenerateDescription } from '@/components/ai/AIGenerateDescription';
import { AIListingFAQ } from '@/components/ai/AIListingFAQ';
import { ListingAudioTour } from '@/components/voice/ListingAudioTour';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { NeighborhoodInsights } from '@/components/maps/NeighborhoodInsights';
import { CommuteCalculator } from '@/components/maps/CommuteCalculator';

interface ListingDisplayData {
  id: string;
  listing_id: string;
  property_type?: string;
  listing_type: 'Sale' | 'Lease' | 'OffPlan';
  status: 'Draft' | 'Active' | 'Reserved' | 'Sold' | 'Withdrawn';
  location?: {
    community: string;
    building?: string;
    city: string;
  };
  price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  madhmoun_listing_id?: string | null;
  madhmoun_status?: string | null;
  compliance_status?: string | null;
}

interface ListingDetailModalProps {
  listing: ListingDisplayData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublishSuccess?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Active: 'bg-emerald-500/20 text-emerald-600',
  Reserved: 'bg-amber-500/20 text-amber-600',
  Sold: 'bg-primary/20 text-primary',
  Withdrawn: 'bg-destructive/20 text-destructive',
};

export function ListingDetailModal({
  listing,
  open,
  onOpenChange,
  onPublishSuccess,
}: ListingDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  const runCompliance = useRunCompliance();
  const submitOverride = useSubmitOverride();
  const updateListing = useUpdateListing();
  const { data: canOverrideData } = useCanOverride();
  const canOverride = canOverrideData ?? false;
  
  const { data: complianceResult, isLoading: isLoadingResult, refetch: refetchCompliance } = 
    useComplianceResult('listing', listing?.id || null);

  const handleRunCompliance = async () => {
    if (!listing) return;

    try {
      await runCompliance.mutateAsync({
        contextType: 'listing',
        entityId: listing.id,
        entityType: 'listing',
        payload: {
          listing: {
            price: listing.price || 0,
            listingAgreement: undefined, // Would be populated from real data
          },
          madhmoun: {
            listingId: listing.madhmoun_listing_id || undefined,
            status: (listing.madhmoun_status as any) || undefined,
          },
          property: {
            projectName: listing.location?.community,
            unitNumber: listing.location?.building,
            sizeSqm: listing.sqft ? listing.sqft * 0.0929 : undefined, // Convert sqft to sqm
          },
        },
      });
      refetchCompliance();
    } catch (error) {
      toast.error('Failed to run compliance check');
    }
  };

  const handleOverride = async (payload: OverridePayload) => {
    if (!complianceResult?.resultId) return;

    try {
      await submitOverride.mutateAsync({
        complianceResultId: complianceResult.resultId,
        payload,
      });
      refetchCompliance();
      toast.success('Override submitted successfully');
    } catch (error) {
      toast.error('Failed to submit override');
    }
  };

  const handlePublish = async () => {
    if (!listing) return;

    try {
      await updateListing.mutateAsync({
        id: listing.id,
        updates: { 
          status: 'Active',
          compliance_status: 'APPROVED',
        },
      });
      toast.success('Listing published successfully');
      onPublishSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to publish listing');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currency}`;
    }
    return `${(price / 1000).toFixed(0)}K ${currency}`;
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{listing.listing_id}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={STATUS_COLORS[listing.status]}>
                  {listing.status}
                </Badge>
                <Badge variant="outline">{listing.listing_type}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">
              <Map className="h-4 w-4 mr-1" />
              Location
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Property Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Property Type</div>
                <div className="font-medium">{listing.property_type || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-medium text-primary">
                  {listing.price ? formatPrice(listing.price, listing.currency || 'AED') : 'N/A'}
                  {listing.listing_type === 'Lease' && <span className="text-sm font-normal">/yr</span>}
                </div>
              </div>
            </div>

            {/* Location */}
            {listing.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {listing.location.community}
                  {listing.location.building && `, ${listing.location.building}`}
                  {listing.location.city && `, ${listing.location.city}`}
                </span>
              </div>
            )}

            {/* Specs */}
            <div className="flex items-center gap-6 text-sm">
              {listing.bedrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.bedrooms} Beds</span>
                </div>
              )}
              {listing.bathrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.bathrooms} Baths</span>
                </div>
              )}
              {listing.sqft !== undefined && (
                <div className="flex items-center gap-1">
                  <Maximize className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.sqft.toLocaleString()} sqft</span>
                </div>
              )}
            </div>

            {/* Madhmoun Status */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Madhmoun Status</div>
              <div className="flex items-center gap-2">
                <Badge variant={listing.madhmoun_status === 'VERIFIED' ? 'default' : 'outline'}>
                  {listing.madhmoun_status || 'Not Registered'}
                </Badge>
                {listing.madhmoun_listing_id && (
                  <span className="text-sm font-mono">{listing.madhmoun_listing_id}</span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            {/* Property Map */}
            <PropertyMap
              propertyName={listing.listing_id}
              address={listing.location ? `${listing.location.community}, ${listing.location.city}` : undefined}
              // Demo coordinates for Dubai Marina area
              latitude={25.0808}
              longitude={55.1385}
              height="250px"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Neighborhood Insights */}
              <NeighborhoodInsights
                latitude={25.0808}
                longitude={55.1385}
              />

              {/* Commute Calculator */}
              <CommuteCalculator
                originLatitude={25.0808}
                originLongitude={55.1385}
              />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            {/* Generate Description */}
            <AIGenerateDescription
              listingData={{
                listing_id: listing.listing_id,
                property_type: listing.property_type,
                listing_type: listing.listing_type,
                location: listing.location,
                price: listing.price,
                currency: listing.currency,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                sqft: listing.sqft,
              }}
              madhmounId={listing.madhmoun_listing_id || undefined}
              onApply={(headline, body) => {
                // Could update listing description
                console.log('Apply copy:', headline, body);
                toast.success('Description copied to clipboard');
              }}
            />

            <Separator />

            {/* Audio Tour */}
            <ListingAudioTour
              listingData={{
                listing_id: listing.listing_id,
                property_type: listing.property_type,
                listing_type: listing.listing_type,
                location: listing.location,
                price: listing.price,
                currency: listing.currency,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                sqft: listing.sqft,
              }}
            />

            <Separator />

            {/* FAQ */}
            <AIListingFAQ
              listingData={{
                listing_id: listing.listing_id,
                property_type: listing.property_type,
                listing_type: listing.listing_type,
                location: listing.location,
                price: listing.price,
                currency: listing.currency,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                sqft: listing.sqft,
                madhmoun_status: listing.madhmoun_status,
              }}
            />
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <CompliancePanel
              result={complianceResult}
              isLoading={runCompliance.isPending || isLoadingResult}
              onRefresh={handleRunCompliance}
              onProceed={handlePublish}
              onOverride={handleOverride}
              canOverride={canOverride}
              proceedLabel={listing.status === 'Draft' ? 'Publish Listing' : 'Update Status'}
              isOverrideSubmitting={submitOverride.isPending}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
