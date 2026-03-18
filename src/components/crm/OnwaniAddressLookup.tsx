import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, RefreshCw, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchOnwaniAddress } from '@/services/onwani';
import { mergeOnwaniIntoExisting } from '@/utils/mapOnwaniAddress';
import type { OnwaniAddress, OnwaniAddressLookupProps, OnwaniStatus, OnwaniFieldKey } from '@/types/onwani';

const DISPLAY_FIELDS: { key: OnwaniFieldKey; label: string; dir?: 'rtl' }[] = [
  { key: 'full_address_en', label: 'Full Address EN' },
  { key: 'full_address_ar', label: 'Full Address AR', dir: 'rtl' },
  { key: 'building_number', label: 'Building Number' },
  { key: 'street_name_en', label: 'Street Name EN' },
  { key: 'street_name_ar', label: 'Street Name AR', dir: 'rtl' },
  { key: 'district', label: 'District' },
  { key: 'sector', label: 'Sector' },
  { key: 'municipality', label: 'Municipality' },
  { key: 'postal_code', label: 'Postal Code' },
  { key: 'plot_number', label: 'Plot Number' },
  { key: 'property_number', label: 'Property Number' },
  { key: 'property_name_en', label: 'Property Name EN' },
  { key: 'property_type', label: 'Property Type' },
  { key: 'qr_code', label: 'QR Code' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
];

const STATUS_CONFIG: Record<OnwaniStatus, { icon: React.ReactNode; label: string; variant: string }> = {
  idle: { icon: <MapPin className="h-3.5 w-3.5" />, label: 'Ready', variant: 'bg-muted text-muted-foreground' },
  loading: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: 'Fetching…', variant: 'bg-primary/20 text-primary' },
  success: { icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Resolved', variant: 'bg-emerald-500/20 text-emerald-600' },
  'no-result': { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'No Result', variant: 'bg-amber-500/20 text-amber-600' },
  error: { icon: <XCircle className="h-3.5 w-3.5" />, label: 'Error', variant: 'bg-destructive/20 text-destructive' },
};

export function OnwaniAddressLookup({
  currentValues = {},
  onAddressResolved,
  initialLat = '',
  initialLng = '',
}: OnwaniAddressLookupProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [status, setStatus] = useState<OnwaniStatus>('idle');
  const [resolved, setResolved] = useState<OnwaniAddress | null>(null);

  const handleFetch = useCallback(async () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Please enter valid latitude and longitude values');
      return;
    }

    setStatus('loading');
    try {
      const result = await fetchOnwaniAddress(latNum, lngNum);

      if (!result) {
        setStatus('no-result');
        toast.warning('No Onwani address found for this pin');
        return;
      }

      const merged = mergeOnwaniIntoExisting(currentValues, result.address);
      setResolved(merged);
      setStatus('success');
      onAddressResolved(merged);
      toast.success('Onwani address loaded');
    } catch (err) {
      setStatus('error');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch Onwani address');
    }
  }, [lat, lng, currentValues, onAddressResolved]);

  const statusCfg = STATUS_CONFIG[status];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Onwani Address Lookup
          </CardTitle>
          <Badge className={statusCfg.variant + ' gap-1 text-xs font-normal'}>
            {statusCfg.icon}
            {statusCfg.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coordinate inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Latitude</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="24.4539"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Longitude</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="54.3773"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleFetch}
            disabled={status === 'loading' || !lat || !lng}
            className="flex-1"
            size="sm"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <MapPin className="h-4 w-4 mr-1" />
            )}
            Fetch Onwani Address
          </Button>
          <Button
            onClick={handleFetch}
            disabled={status === 'loading' || !lat || !lng}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Resolved fields */}
        {resolved && status === 'success' && (
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Resolved Address
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {DISPLAY_FIELDS.map(({ key, label, dir }) => (
                <div key={key} className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                  <span
                    className="text-sm truncate"
                    dir={dir}
                    title={resolved[key]}
                  >
                    {resolved[key] || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
