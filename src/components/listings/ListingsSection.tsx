import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListingDetailModal } from './ListingDetailModal';
import { CompetitorAnalysis } from './CompetitorAnalysis';
import { DeveloperCatalog } from './DeveloperCatalog';
import { MarketBlogInsights } from './MarketBlogInsights';
import { AddListingModal } from './AddListingModal';
import { useListings, useDeleteListing } from '@/hooks/useListings';

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
  madhmoun_listing_id?: string | null;
  madhmoun_status?: string | null;
  compliance_status?: string | null;
}

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  
  // Fetch real listings from database
  const { data: dbListings, refetch: refetchListings, isLoading } = useListings();
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

  // Convert DB listings to display format - only use real data
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
    images: (dbListing.listing_attributes as any)?.images || [],
    created_at: dbListing.created_at,
    madhmoun_listing_id: dbListing.madhmoun_listing_id,
    madhmoun_status: dbListing.madhmoun_status,
    compliance_status: dbListing.compliance_status,
  }));

  const handleViewListing = (listing: Listing) => {
    setSelectedListing(listing);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (listing: Listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (listingToDelete) {
      deleteListing(listingToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setListingToDelete(null);
        },
      });
    }
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
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">Listings</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Property inventory management
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="btn-gold h-9 md:h-10" 
            onClick={() => setAddListingModalOpen(true)}
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Add Listing</span>
          </Button>
        </div>

        {/* Scraping Tools - Responsive Grid */}
        <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDeveloperCatalogOpen(true)}
            className="h-9 text-xs md:text-sm px-2 md:px-4"
          >
            <Landmark className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden sm:inline">Developer Catalog</span>
            <span className="sm:hidden">Off-Plan</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCompetitorAnalysisOpen(true)}
            className="h-9 text-xs md:text-sm px-2 md:px-4"
          >
            <TrendingUp className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden sm:inline">Secondary Market</span>
            <span className="sm:hidden">Secondary</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setMarketInsightsOpen(true)}
            className="h-9 text-xs md:text-sm px-2 md:px-4"
          >
            <Newspaper className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden sm:inline">Market Insights</span>
            <span className="sm:hidden">Insights</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold text-foreground">{allListings.length}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground truncate">Total Listings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Eye className="h-5 w-5 md:h-6 md:w-6 text-emerald shrink-0" />
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold text-foreground">{activeCount}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold text-foreground">
                  {(totalValue / 1000000).toFixed(0)}M
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground truncate">Active Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-bold text-foreground truncate">Abu Dhabi</div>
                <div className="text-[10px] md:text-xs text-muted-foreground truncate">Primary Market</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 md:h-10 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 sm:w-28 md:w-36 h-9 md:h-10 text-sm">
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
                <SelectTrigger className="flex-1 sm:w-28 md:w-36 h-9 md:h-10 text-sm">
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
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground">Loading listings...</p>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      {!isLoading && (
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
                      {listing.compliance_status === 'APPROVED' 
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewListing(listing)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(listing)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* ID */}
                <div className="mt-2 text-xs text-muted-foreground font-mono">
                  {listing.listing_id}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredListings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No listings found</p>
            <Button onClick={() => setAddListingModalOpen(true)} className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Listing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete listing "{listingToDelete?.listing_id}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          madhmoun_listing_id: selectedListing.madhmoun_listing_id,
          madhmoun_status: selectedListing.madhmoun_status,
          compliance_status: selectedListing.compliance_status,
        } : null}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Competitor Analysis Modal */}
      <CompetitorAnalysis
        open={competitorAnalysisOpen}
        onOpenChange={setCompetitorAnalysisOpen}
      />

      {/* Developer Catalog Modal */}
      <DeveloperCatalog
        open={developerCatalogOpen}
        onOpenChange={setDeveloperCatalogOpen}
      />

      {/* Market Insights Modal */}
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
