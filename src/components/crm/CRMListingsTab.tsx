import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Bed, Ruler, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useExternalListings, formatCRMPrice, CRMListing } from '@/hooks/useMiCasaCRM';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  booked: 'bg-muted text-muted-foreground border-border',
  sold: 'bg-red-500/20 text-red-400 border-red-500/40',
  june2026: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  off_market: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
};

const SHAKHBOUT_NAMES = ['venice', 'lahore', 'berlin', 'york'];

interface Props {
  onSelect: (id: string) => void;
}

function ListingCard({ listing, onClick }: { listing: CRMListing; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="h-40 bg-muted relative">
        {listing.thumbnail_url ? (
          <img
            src={listing.thumbnail_url}
            alt={listing.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        <Badge className={cn('absolute top-2 right-2 text-[10px] border', STATUS_COLORS[listing.status] || STATUS_COLORS.off_market)}>
          {listing.status === 'june2026' ? 'June 2026' : listing.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-foreground truncate">{listing.name}</p>
            {listing.unit && <p className="text-xs text-muted-foreground">Unit {listing.unit}</p>}
          </div>
          <p className="text-sm font-bold text-primary whitespace-nowrap">
            {formatCRMPrice(listing.price, listing.listing_type)}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {listing.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.location}
            </span>
          )}
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              {listing.bedrooms} BR
            </span>
          )}
          {listing.area_sqft != null && (
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              {listing.area_sqft.toLocaleString()} sqft
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ShakhboutComplexCard({ villas, onSelect }: { villas: CRMListing[]; onSelect: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const availableCount = villas.filter(v => v.status === 'available').length;
  const totalRent = villas.reduce((s, v) => s + (v.price || 0), 0);

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Shakhbout Villa Complex</p>
            <p className="text-xs text-muted-foreground">
              {villas.length} villas · {availableCount} available · 3 BR each · Shakhbout, Abu Dhabi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm font-bold text-primary">
            AED {Math.round(totalRent / 1000)}K/yr total
          </p>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {villas.map(v => (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className="text-left rounded-lg border border-border bg-background/50 hover:bg-accent/40 transition-colors p-3 space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-foreground">{v.name}</p>
                <Badge className={cn('text-[10px] border', STATUS_COLORS[v.status] || STATUS_COLORS.off_market)}>
                  {v.status === 'june2026' ? 'Jun 2026' : v.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm font-bold text-primary">{formatCRMPrice(v.price, v.listing_type)}</p>
              <p className="text-xs text-muted-foreground">3 BR · 3,800 sqft</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CRMListingsTab({ onSelect }: Props) {
  const [tab, setTab] = useState<'rent' | 'sale'>('rent');
  const { data: listings, isLoading } = useExternalListings(tab);

  const { shakhboutVillas, otherListings } = useMemo(() => {
    if (!listings) return { shakhboutVillas: [], otherListings: [] };
    const shakhbout: CRMListing[] = [];
    const other: CRMListing[] = [];
    for (const l of listings) {
      if (SHAKHBOUT_NAMES.includes(l.name.toLowerCase().trim())) {
        shakhbout.push(l);
      } else {
        other.push(l);
      }
    }
    return { shakhboutVillas: shakhbout, otherListings: other };
  }, [listings]);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'rent' | 'sale')}>
        <TabsList>
          <TabsTrigger value="rent">For Rent</TabsTrigger>
          <TabsTrigger value="sale">For Sale</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !listings?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No {tab === 'rent' ? 'rental' : 'sale'} listings found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherListings.map(l => (
            <ListingCard key={l.id} listing={l} onClick={() => onSelect(l.id)} />
          ))}
          {shakhboutVillas.length > 0 && (
            <ShakhboutComplexCard villas={shakhboutVillas} onSelect={onSelect} />
          )}
        </div>
      )}
    </div>
  );
}
