import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, MapPin, Bed, Ruler, Image as ImageIcon } from 'lucide-react';
import { useExternalListing, useUpdateListingStatus, useUploadListingMedia, formatCRMPrice } from '@/hooks/useMiCasaCRM';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  booked: 'bg-muted text-muted-foreground border-border',
  sold: 'bg-red-500/20 text-red-400 border-red-500/40',
  june2026: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  off_market: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
};

const STATUSES = ['available', 'booked', 'sold', 'june2026', 'off_market'];

interface Props {
  listingId: string;
  onBack: () => void;
}

export function CRMListingDetail({ listingId, onBack }: Props) {
  const { data, isLoading } = useExternalListing(listingId);
  const updateStatus = useUpdateListingStatus();
  const uploadMedia = useUploadListingMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const { listing, media, documents } = data;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      uploadMedia.mutate({ listingId, file });
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{listing.name}</h2>
            {listing.unit && <p className="text-sm text-muted-foreground">Unit {listing.unit}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn('border', STATUS_COLORS[listing.status])}>
            {listing.status === 'june2026' ? 'June 2026' : listing.status.replace('_', ' ')}
          </Badge>
          <Select
            value={listing.status}
            onValueChange={(val) => updateStatus.mutate({ id: listingId, status: val })}
          >
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s === 'june2026' ? 'June 2026' : s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Price" value={formatCRMPrice(listing.price, listing.listing_type)} />
        <InfoCard label="Type" value={listing.listing_type === 'rent' ? 'For Rent' : 'For Sale'} />
        {listing.location && (
          <InfoCard label="Location" value={listing.location} icon={<MapPin className="w-3.5 h-3.5" />} />
        )}
        {listing.bedrooms != null && (
          <InfoCard label="Bedrooms" value={`${listing.bedrooms} BR`} icon={<Bed className="w-3.5 h-3.5" />} />
        )}
        {listing.area_sqft != null && (
          <InfoCard label="Area" value={`${listing.area_sqft.toLocaleString()} sqft`} icon={<Ruler className="w-3.5 h-3.5" />} />
        )}
      </div>

      {/* Description */}
      {listing.description && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
        </div>
      )}

      {/* Photo / Video Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Gallery ({media.length})
          </h3>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadMedia.isPending}>
              <Upload className="w-4 h-4 mr-1" /> Upload
            </Button>
          </div>
        </div>
        {media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map(m => (
              <div key={m.id} className="relative rounded-lg overflow-hidden border border-border aspect-[4/3]">
                {m.media_type === 'video' ? (
                  <video src={m.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover" loading="lazy" />
                )}
                {m.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                    <p className="text-[10px] text-white truncate">{m.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No photos or videos yet.</p>
        )}
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" /> Documents ({documents.length})
        </h3>
        {documents.length > 0 ? (
          <div className="divide-y divide-border border border-border rounded-lg">
            {documents.map(d => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.label || d.doc_type}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.doc_type.replace('_', ' ')}</p>
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No documents attached.</p>
        )}
      </div>

      {/* Notes */}
      {listing.notes && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Internal Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{listing.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        {icon}{value}
      </p>
    </div>
  );
}
