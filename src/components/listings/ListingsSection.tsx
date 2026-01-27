import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Eye,
  Edit,
  MoreHorizontal,
  Shield,
  TrendingUp,
  Landmark,
  Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListingDetailModal } from './ListingDetailModal';
import { CompetitorAnalysis } from './CompetitorAnalysis';
import { DeveloperCatalog } from './DeveloperCatalog';
import { MarketBlogInsights } from './MarketBlogInsights';
import { AddListingModal } from './AddListingModal';
import { useListings } from '@/hooks/useListings';

interface Listing {
  id: string;
  listing_id: string;
  property_type: string;
  listing_type: 'Sale' | 'Rent' | 'OffPlan';
  status: 'Draft' | 'Active' | 'Reserved' | 'Sold' | 'Withdrawn';
  location: {
    community: string;
    building?: string;
    city: string;
  };
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  created_at: string;
}

const DEMO_LISTINGS: Listing[] = [
  {
    id: '1',
    listing_id: 'LST-2024-001',
    property_type: 'Apartment',
    listing_type: 'Sale',
    status: 'Active',
    location: { community: 'Al Reem Island', building: 'Sky Tower', city: 'Abu Dhabi' },
    price: 2500000,
    currency: 'AED',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2100,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop'],
    created_at: '2024-01-10',
  },
  {
    id: '2',
    listing_id: 'LST-2024-002',
    property_type: 'Villa',
    listing_type: 'Sale',
    status: 'Reserved',
    location: { community: 'Saadiyat Island', city: 'Abu Dhabi' },
    price: 8500000,
    currency: 'AED',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6500,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop'],
    created_at: '2024-01-08',
  },
  {
    id: '3',
    listing_id: 'LST-2024-003',
    property_type: 'Apartment',
    listing_type: 'Rent',
    status: 'Active',
    location: { community: 'Corniche Area', building: 'Nation Towers', city: 'Abu Dhabi' },
    price: 180000,
    currency: 'AED',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1450,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop'],
    created_at: '2024-01-12',
  },
  {
    id: '4',
    listing_id: 'LST-2024-004',
    property_type: 'Townhouse',
    listing_type: 'OffPlan',
    status: 'Active',
    location: { community: 'Yas Island', city: 'Abu Dhabi' },
    price: 3200000,
    currency: 'AED',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3200,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop'],
    created_at: '2024-01-05',
  },
  {
    id: '5',
    listing_id: 'LST-2024-005',
    property_type: 'Penthouse',
    listing_type: 'Sale',
    status: 'Draft',
    location: { community: 'Al Raha Beach', building: 'Al Muneera', city: 'Abu Dhabi' },
    price: 12000000,
    currency: 'AED',
    bedrooms: 4,
    bathrooms: 5,
    sqft: 5800,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop'],
    created_at: '2024-01-15',
  },
];

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Active: 'bg-emerald/20 text-emerald',
  Reserved: 'bg-amber-500/20 text-amber-600',
  Sold: 'bg-primary/20 text-primary',
  Withdrawn: 'bg-destructive/20 text-destructive',
};

const TYPE_COLORS: Record<string, string> = {
  Sale: 'bg-blue-500/20 text-blue-600',
  Rent: 'bg-purple-500/20 text-purple-600',
  OffPlan: 'bg-amber-500/20 text-amber-600',
};

export function ListingsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [competitorAnalysisOpen, setCompetitorAnalysisOpen] = useState(false);
  const [developerCatalogOpen, setDeveloperCatalogOpen] = useState(false);
  const [marketInsightsOpen, setMarketInsightsOpen] = useState(false);
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);
  
  // Fetch real listings from database
  const { data: dbListings, refetch: refetchListings } = useListings();

  // Convert DB listings to display format, merge with demo data
  const allListings: Listing[] = [
    ...DEMO_LISTINGS,
    ...(dbListings || []).map(dbListing => ({
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
      images: [],
      created_at: dbListing.created_at,
      madhmoun_listing_id: dbListing.madhmoun_listing_id,
      madhmoun_status: dbListing.madhmoun_status,
      compliance_status: dbListing.compliance_status,
    })),
  ];

  const handleViewListing = (listing: Listing) => {
    setSelectedListing(listing);
    setDetailModalOpen(true);
  };

  const filteredListings = allListings.filter((listing) => {
    const matchesSearch =
      listing.listing_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.community.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesType = typeFilter === 'all' || listing.listing_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatPrice = (price: number, currency: string) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currency}`;
    }
    return `${(price / 1000).toFixed(0)}K ${currency}`;
  };

  const activeCount = allListings.filter(l => l.status === 'Active').length;
  const totalValue = allListings.filter(l => l.status === 'Active' && l.listing_type === 'Sale')
    .reduce((sum, l) => sum + l.price, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Listings</h2>
            <p className="text-sm text-muted-foreground">
              Property inventory management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setDeveloperCatalogOpen(true)}
            className="hidden sm:flex"
          >
            <Landmark className="h-4 w-4 mr-2" />
            Developer Catalog
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCompetitorAnalysisOpen(true)}
            className="hidden sm:flex"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Secondary Market Listings
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMarketInsightsOpen(true)}
            className="hidden sm:flex"
          >
            <Newspaper className="h-4 w-4 mr-2" />
            Market Insights
          </Button>
          <Button className="btn-gold" onClick={() => setAddListingModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">{allListings.length}</div>
                <div className="text-xs text-muted-foreground">Total Listings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-emerald" />
              <div>
                <div className="text-xl font-bold text-foreground">{activeCount}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">
                  {(totalValue / 1000000).toFixed(0)}M
                </div>
                <div className="text-xs text-muted-foreground">Active Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-amber-500" />
              <div>
                <div className="text-xl font-bold text-foreground">Abu Dhabi</div>
                <div className="text-xs text-muted-foreground">Primary Market</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="OffPlan">Off-Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="h-40 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={`${listing.property_type} in ${listing.location.community}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn('text-xs', STATUS_COLORS[listing.status])}>
                  {listing.status}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', TYPE_COLORS[listing.listing_type])}>
                  {listing.listing_type}
                </Badge>
              </div>

              {/* Price */}
              <div className="text-lg font-bold text-primary mb-1">
                {formatPrice(listing.price, listing.currency)}
                {listing.listing_type === 'Rent' && <span className="text-sm font-normal">/yr</span>}
              </div>

              {/* Property Type */}
              <div className="text-sm font-medium text-foreground mb-1">
                {listing.property_type}
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                {listing.location.community}
                {listing.location.building && `, ${listing.location.building}`}
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {listing.bedrooms}
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {listing.bathrooms}
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="h-4 w-4" />
                  {listing.sqft.toLocaleString()} sqft
                </div>
              </div>

              {/* Compliance Badge */}
              {listing.status === 'Draft' && (
                <div className="flex items-center gap-1 mb-2">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {(listing as any).compliance_status === 'APPROVED' 
                      ? 'Compliance Approved' 
                      : 'Compliance Check Required'}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleViewListing(listing)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* ID */}
              <div className="mt-2 text-xs text-muted-foreground font-mono">
                {listing.listing_id}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No listings found</p>
          </CardContent>
        </Card>
      )}

      {/* Listing Detail Modal with Compliance */}
      <ListingDetailModal
        listing={selectedListing ? {
          id: selectedListing.id,
          listing_id: selectedListing.listing_id,
          property_type: selectedListing.property_type,
          listing_type: selectedListing.listing_type === 'Rent' ? 'Lease' : selectedListing.listing_type as any,
          status: selectedListing.status,
          location: selectedListing.location,
          price: selectedListing.price,
          currency: selectedListing.currency,
          bedrooms: selectedListing.bedrooms,
          bathrooms: selectedListing.bathrooms,
          sqft: selectedListing.sqft,
          madhmoun_listing_id: (selectedListing as any).madhmoun_listing_id,
          madhmoun_status: (selectedListing as any).madhmoun_status,
          compliance_status: (selectedListing as any).compliance_status,
        } : null}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onPublishSuccess={() => {
          refetchListings();
          setSelectedListing(null);
        }}
      />

      {/* Competitor Analysis Sheet */}
      <CompetitorAnalysis
        open={competitorAnalysisOpen}
        onOpenChange={setCompetitorAnalysisOpen}
        ownListings={allListings
          .filter(l => l.status === 'Active')
          .map(l => ({
            id: l.listing_id,
            price: l.price,
            community: l.location.community,
            bedrooms: l.bedrooms,
          }))
        }
      />

      {/* Developer Catalog Sheet */}
      <DeveloperCatalog
        open={developerCatalogOpen}
        onOpenChange={setDeveloperCatalogOpen}
      />

      {/* Market Blog Insights Sheet */}
      <MarketBlogInsights
        open={marketInsightsOpen}
        onOpenChange={setMarketInsightsOpen}
      />

      {/* Add Listing Modal */}
      <AddListingModal
        open={addListingModalOpen}
        onOpenChange={setAddListingModalOpen}
        onSuccess={() => refetchListings()}
      />
    </div>
  );
}
