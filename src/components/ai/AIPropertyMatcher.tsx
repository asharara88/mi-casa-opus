import { useState } from 'react';
import { Lead } from '@/types/bos';
import { useListings } from '@/hooks/useListings';
import { useBosLlmPropertyMatch, PropertyMatch } from '@/hooks/useBosLlm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Sparkles, 
  Home, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  ChevronDown,
  MapPin,
  Bed,
  DollarSign,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIPropertyMatcherProps {
  lead: Lead;
  onViewListing?: (listingId: string) => void;
  onStartDeal?: (listingId: string) => void;
}

const TIER_STYLES = {
  EXCELLENT: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  GOOD: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  PARTIAL: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  STRETCH: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
};

export function AIPropertyMatcher({ lead, onViewListing, onStartDeal }: AIPropertyMatcherProps) {
  const { data: listings, isLoading: isLoadingListings } = useListings();
  const { matchProperties, isMatching, matchResult } = useBosLlmPropertyMatch();
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindMatches = async () => {
    if (!lead.requirements || !listings) return;

    const formattedListings = listings.map(l => ({
      id: l.id,
      listing_id: l.listing_id,
      listing_type: l.listing_type,
      status: l.status,
      listing_attributes: l.listing_attributes as {
        title?: string;
        community?: string;
        bedrooms?: number;
        bathrooms?: number;
        size_sqft?: number;
        property_type?: string;
      },
      asking_terms: l.asking_terms as {
        price?: number;
      },
    }));

    await matchProperties(lead.requirements, formattedListings);
    setHasSearched(true);
  };

  // Get listing details by ID
  const getListingDetails = (listingId: string) => {
    return listings?.find(l => l.listing_id === listingId);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price TBD';
    return `AED ${price.toLocaleString()}`;
  };

  if (!lead.requirements) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Capture lead requirements first to find matching properties</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Property Matches</CardTitle>
              <CardDescription className="text-xs">
                Find properties matching {lead.contact_identity.full_name}'s requirements
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={handleFindMatches}
            disabled={isMatching || isLoadingListings}
            size="sm"
          >
            {isMatching ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Matches
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Loading State */}
        {isMatching && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {/* Results */}
        {!isMatching && matchResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-sm">{matchResult.summary}</p>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-sm text-muted-foreground">{matchResult.recommendation}</p>
              </div>
            </div>

            {/* Match Cards */}
            {matchResult.matches.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No matching properties found</p>
                <p className="text-xs mt-1">Try adjusting the lead's requirements</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchResult.matches.map((match: PropertyMatch) => {
                  const listing = getListingDetails(match.listing_id);
                  const tierStyle = TIER_STYLES[match.match_tier];
                  const attrs = listing?.listing_attributes as {
                    title?: string;
                    community?: string;
                    bedrooms?: number;
                    size_sqft?: number;
                    property_type?: string;
                  };
                  const terms = listing?.asking_terms as { price?: number };

                  return (
                    <Collapsible key={match.listing_id}>
                      <Card className={cn("border", tierStyle.border)}>
                        <CardContent className="pt-4 pb-3">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              {/* Score Ring */}
                              <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 transform -rotate-90">
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-muted"
                                  />
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={`${(match.match_score / 100) * 125.6} 125.6`}
                                    className={tierStyle.text}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                  {match.match_score}%
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn(tierStyle.bg, tierStyle.text, "border-0")}>
                                    {match.match_tier}
                                  </Badge>
                                </div>
                                <p className="font-medium text-sm mt-1">
                                  {attrs?.title || match.listing_id}
                                </p>
                              </div>
                            </div>

                            <p className="font-semibold text-sm">
                              {formatPrice(terms?.price)}
                            </p>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                            {attrs?.community && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {attrs.community}
                              </span>
                            )}
                            {attrs?.bedrooms !== undefined && (
                              <span className="flex items-center gap-1">
                                <Bed className="w-3 h-3" />
                                {attrs.bedrooms} BR
                              </span>
                            )}
                            {attrs?.property_type && (
                              <span className="flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                {attrs.property_type}
                              </span>
                            )}
                          </div>

                          {/* Match Reasons */}
                          <div className="space-y-1 mb-3">
                            {match.match_reasons.slice(0, 3).map((reason, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          {/* Concerns */}
                          {match.concerns.length > 0 && (
                            <div className="space-y-1 mb-3">
                              {match.concerns.slice(0, 2).map((concern, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground">{concern}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Expandable Details */}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                              <ChevronDown className="w-3 h-3 mr-1" />
                              More Details
                            </Button>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="pt-3 border-t mt-3 space-y-3">
                            {/* Negotiation Angle */}
                            {match.negotiation_angle && (
                              <div className="p-2 bg-primary/5 rounded-lg">
                                <div className="flex items-start gap-2 text-xs">
                                  <Lightbulb className="w-3 h-3 text-primary mt-0.5" />
                                  <div>
                                    <p className="font-medium text-primary mb-1">Negotiation Angle</p>
                                    <p className="text-muted-foreground">{match.negotiation_angle}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Broker Talking Points */}
                            {match.broker_talking_points && match.broker_talking_points.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Broker Talking Points</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {match.broker_talking_points.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              {onViewListing && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => onViewListing(listing?.id || match.listing_id)}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View Listing
                                </Button>
                              )}
                              {onStartDeal && (
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => onStartDeal(listing?.id || match.listing_id)}
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Start Deal
                                </Button>
                              )}
                            </div>
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isMatching && !matchResult && !hasSearched && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Click "Find Matches" to discover properties for this lead</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
