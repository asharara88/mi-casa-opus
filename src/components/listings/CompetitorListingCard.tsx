import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Bed, Bath, Maximize, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompetitorListing } from '@/lib/api/firecrawl';

interface CompetitorListingCardProps {
  listing: CompetitorListing;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Bayut': 'bg-blue-500/20 text-blue-600',
  'Property Finder': 'bg-purple-500/20 text-purple-600',
  'Dubizzle': 'bg-orange-500/20 text-orange-600',
  'Unknown': 'bg-muted text-muted-foreground',
};

export function CompetitorListingCard({ listing }: CompetitorListingCardProps) {
  const formatPrice = (price: number | null | undefined, currency: string) => {
    if (price == null) return 'Price TBD';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currency}`;
    }
    return `${(price / 1000).toFixed(0)}K ${currency}`;
  };

  const formatSqft = (sqft: number | null | undefined) => {
    if (sqft == null) return 'N/A';
    return sqft.toLocaleString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Placeholder */}
      <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
        <Building2 className="h-10 w-10 text-muted-foreground/50" />
        <Badge 
          className={`absolute top-2 right-2 text-xs ${PLATFORM_COLORS[listing.sourcePlatform] || PLATFORM_COLORS['Unknown']}`}
        >
          {listing.sourcePlatform}
        </Badge>
      </div>

      <CardContent className="p-3">
        {/* Price */}
        <div className="text-lg font-bold text-primary mb-1">
          {formatPrice(listing.price, listing.currency || 'AED')}
          {listing.listingType === 'Rent' && <span className="text-sm font-normal">/yr</span>}
        </div>

        {/* Property Type */}
        <div className="text-sm font-medium text-foreground mb-1 truncate">
          {listing.propertyType || 'Property'}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 truncate">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {listing.community || 'Location TBD'}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {listing.bedrooms ?? '-'}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {listing.bathrooms ?? '-'}
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-3 w-3" />
            {formatSqft(listing.sqft)}
          </div>
        </div>

        {/* View Source */}
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs"
          onClick={() => window.open(listing.sourceUrl, '_blank')}
          disabled={!listing.sourceUrl}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on {listing.sourcePlatform}
        </Button>
      </CardContent>
    </Card>
  );
}
