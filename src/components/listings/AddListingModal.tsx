import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Link,
  Loader2,
  Globe,
  Search,
} from 'lucide-react';
import { firecrawlApi, type ListingExtractResult } from '@/lib/api/firecrawl';
import { ListingImportForm } from './ListingImportForm';
import { useDemoMode } from '@/contexts/DemoContext';
import { useCreateListing } from '@/hooks/useListings';

interface AddListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PORTAL_PRESETS = [
  { name: 'Bayut', urlPattern: 'bayut.com' },
  { name: 'Property Finder', urlPattern: 'propertyfinder.ae' },
  { name: 'Dubizzle', urlPattern: 'dubizzle.com' },
];

// Demo extracted listing
const DEMO_EXTRACTION: ListingExtractResult = {
  listing: {
    title: 'Stunning 3BR Apartment with Sea View',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 2500000,
    currency: 'AED',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2100,
    community: 'Al Reem Island',
    building: 'Sky Tower',
    city: 'Abu Dhabi',
    description: 'Beautiful 3-bedroom apartment featuring stunning sea views, modern finishes, and premium amenities. The property includes a spacious living area, fully equipped kitchen, and covered parking.',
    amenities: ['Pool', 'Gym', 'Parking', 'Security'],
    permitNumber: 'DARI-2024-78901',
    agentName: null,
    agentPhone: null,
    referenceNumber: 'AP-2024-001',
    imageUrls: [],
  },
  confidence: 0.92,
  extractedFields: ['title', 'propertyType', 'listingType', 'price', 'bedrooms', 'bathrooms', 'sqft', 'community', 'building', 'city', 'description', 'permitNumber'],
  missingFields: ['agentName', 'agentPhone'],
  sourcePlatform: 'Bayut',
  sourceUrl: 'https://bayut.com/property/demo',
  extractedAt: new Date().toISOString(),
};

const initialFormData = {
  propertyType: '',
  listingType: 'Sale',
  price: 0,
  bedrooms: 0,
  bathrooms: 0,
  sqft: 0,
  community: '',
  building: '',
  city: 'Abu Dhabi',
  description: '',
  permitNumber: '',
};

export function AddListingModal({ open, onOpenChange, onSuccess }: AddListingModalProps) {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const { mutateAsync: createListing } = useCreateListing();
  
  const [activeTab, setActiveTab] = useState('manual');
  const [importUrl, setImportUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractResult, setExtractResult] = useState<ListingExtractResult | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    setExtractResult(null);
    setImportUrl('');
    setActiveTab('manual');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleExtract = async () => {
    if (!importUrl.trim()) return;

    if (isDemoMode) {
      // Use demo data
      setExtractResult(DEMO_EXTRACTION);
      setFormData({
        propertyType: DEMO_EXTRACTION.listing.propertyType,
        listingType: DEMO_EXTRACTION.listing.listingType,
        price: DEMO_EXTRACTION.listing.price,
        bedrooms: DEMO_EXTRACTION.listing.bedrooms,
        bathrooms: DEMO_EXTRACTION.listing.bathrooms,
        sqft: DEMO_EXTRACTION.listing.sqft,
        community: DEMO_EXTRACTION.listing.community,
        building: DEMO_EXTRACTION.listing.building || '',
        city: DEMO_EXTRACTION.listing.city,
        description: DEMO_EXTRACTION.listing.description,
        permitNumber: DEMO_EXTRACTION.listing.permitNumber || '',
      });
      toast({
        title: 'Demo Mode',
        description: 'Showing sample extracted listing data',
      });
      return;
    }

    setIsExtracting(true);
    setExtractResult(null);

    try {
      // Step 1: Scrape the URL
      const scrapeResponse = await firecrawlApi.scrape(importUrl, {
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 5000,
      });

      if (!scrapeResponse.success || !scrapeResponse.data?.markdown) {
        throw new Error(scrapeResponse.error || 'Failed to scrape listing page');
      }

      // Step 2: Extract listing details using AI
      const extractResponse = await firecrawlApi.extractListingFromUrl(
        scrapeResponse.data.markdown,
        importUrl
      );

      if (!extractResponse.success || !extractResponse.data) {
        throw new Error(extractResponse.error || 'Failed to extract listing details');
      }

      setExtractResult(extractResponse.data);
      
      // Pre-fill form with extracted data
      const listing = extractResponse.data.listing;
      setFormData({
        propertyType: listing.propertyType || '',
        listingType: listing.listingType || 'Sale',
        price: listing.price || 0,
        bedrooms: listing.bedrooms || 0,
        bathrooms: listing.bathrooms || 0,
        sqft: listing.sqft || 0,
        community: listing.community || '',
        building: listing.building || '',
        city: listing.city || 'Abu Dhabi',
        description: listing.description || '',
        permitNumber: listing.permitNumber || '',
      });

      toast({
        title: 'Extraction Complete',
        description: `${Math.round(extractResponse.data.confidence * 100)}% confidence. Please review and save.`,
      });
    } catch (error) {
      console.error('Extract error:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.propertyType || !formData.price || !formData.community) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in required fields: Property Type, Price, Community',
        variant: 'destructive',
      });
      return;
    }

    if (isDemoMode) {
      toast({
        title: 'Demo Mode',
        description: 'Listing creation simulated successfully',
      });
      handleClose();
      onSuccess?.();
      return;
    }

    setIsSubmitting(true);

    try {
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
        },
        asking_terms: {
          price: formData.price,
          currency: 'AED',
        },
      });

      toast({
        title: 'Listing Created',
        description: 'New listing has been added to your inventory',
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectPlatform = (url: string): string => {
    for (const preset of PORTAL_PRESETS) {
      if (url.includes(preset.urlPattern)) {
        return preset.name;
      }
    }
    return 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Listing
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Plus className="h-4 w-4 mr-1.5" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="import">
              <Link className="h-4 w-4 mr-1.5" />
              Import from URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-6">
            {/* URL Import Section */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Paste a listing URL from Bayut, Property Finder, or Dubizzle to auto-fill the form.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://bayut.com/property/..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleExtract}
                    disabled={isExtracting || !importUrl.trim()}
                  >
                    {isExtracting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-1.5">Extract</span>
                  </Button>
                </div>
              </div>

              {/* Portal indicators */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Supported:</span>
                {PORTAL_PRESETS.map((preset) => (
                  <span
                    key={preset.name}
                    className={importUrl.includes(preset.urlPattern) ? 'text-primary font-medium' : ''}
                  >
                    {preset.name}
                  </span>
                ))}
              </div>

              {isExtracting && (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-sm">Extracting listing details...</p>
                </div>
              )}
            </div>

            {/* Show form after extraction */}
            {extractResult && !isExtracting && (
              <ListingImportForm
                data={formData}
                onChange={setFormData}
                confidence={extractResult.confidence}
                extractedFields={extractResult.extractedFields}
                missingFields={extractResult.missingFields}
              />
            )}
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <ListingImportForm
              data={formData}
              onChange={setFormData}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="btn-gold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Listing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
