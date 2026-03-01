import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useBrokerageContext } from '@/hooks/useBrokerage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Channel = 'portal' | 'whatsapp' | 'brochure' | 'sms';
type Tone = 'professional' | 'premium' | 'concise';

interface CopyResult {
  status: 'READY' | 'REFUSED';
  reason: string | null;
  copy: string | null;
  includedIdentifiers: string[];
}

export function MarketingCopyGenerator() {
  const { data: listings, isLoading: listingsLoading } = useListings();
  const { data: brokerage } = useBrokerageContext();

  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [channel, setChannel] = useState<Channel>('portal');
  const [tone, setTone] = useState<Tone>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CopyResult | null>(null);

  const activeListings = listings?.filter(l => l.status === 'Active') || [];
  const selectedListing = listings?.find(l => l.id === selectedListingId);

  const getAttrs = (listing: any) => {
    const attrs = listing?.listing_attributes as Record<string, any> || {};
    const terms = listing?.asking_terms as Record<string, any> || {};
    return {
      title: attrs.title || `${attrs.bedrooms || ''}BR ${attrs.propertyType || ''} in ${attrs.location?.community || ''}`,
      property_type: attrs.propertyType || attrs.property_type,
      listing_type: listing?.listing_type,
      community: attrs.location?.community || attrs.community,
      sub_community: attrs.location?.subCommunity || attrs.sub_community,
      bedrooms: attrs.bedrooms,
      bathrooms: attrs.bathrooms,
      area_sqft: attrs.areaSqft || attrs.area_sqft,
      price: terms.price || terms.askingPrice,
      description: attrs.description,
      amenities: attrs.amenities,
    };
  };

  const generate = async () => {
    if (!selectedListing) return;
    setIsGenerating(true);
    setResult(null);

    const attrs = getAttrs(selectedListing);

    try {
      const licenseCtx = brokerage?.license_context as Record<string, unknown> | null;

      const { data, error } = await supabase.functions.invoke('bos-llm-marketing-copy', {
        body: {
          listingPayload: {
            listing_id: selectedListing.listing_id,
            ...attrs,
          },
          complianceStatus: 'APPROVED',
          channel,
          tone,
          broker: {
            name: (licenseCtx as any)?.broker_name || 'Agent',
            license_number: (licenseCtx as any)?.broker_license || 'BRN-PENDING',
          },
          brokerage: {
            name: brokerage?.trade_name || 'MiCasa Properties',
            license_number: (licenseCtx as any)?.trade_license || 'TL-PENDING',
          },
          madhmoun_id: (licenseCtx as any)?.madhmoun_id || 'MDH-PENDING',
        },
      });

      if (error) throw error;
      setResult(data as CopyResult);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.copy) {
      navigator.clipboard.writeText(result.copy);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Marketing Copy Generator
          </CardTitle>
          <CardDescription>
            Generate ADREC-compliant ad copy for any active listing. Select a listing, channel, and tone.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Listing selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Listing</label>
            <Select value={selectedListingId} onValueChange={setSelectedListingId}>
              <SelectTrigger>
                <SelectValue placeholder={listingsLoading ? 'Loading...' : 'Select a listing'} />
              </SelectTrigger>
              <SelectContent>
                {activeListings.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.listing_id} — {(() => { const a = getAttrs(l); return a.title || `${a.bedrooms || ''}BR ${a.property_type || ''} in ${a.community || ''}`; })()}
                  </SelectItem>
                ))}
                {activeListings.length === 0 && !listingsLoading && (
                  <SelectItem value="_none" disabled>No active listings</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Channel + Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Channel</label>
              <Select value={channel} onValueChange={v => setChannel(v as Channel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portal">Portal (Bayut/PF)</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="brochure">Brochure</SelectItem>
                  <SelectItem value="sms">SMS (160 chars)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tone</label>
              <Select value={tone} onValueChange={v => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="premium">Premium / Lifestyle</SelectItem>
                  <SelectItem value="concise">Concise / Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={!selectedListingId || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              'Generate Copy'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className={result.status === 'READY' ? 'border-primary/30' : 'border-destructive/30'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.status === 'READY' ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <CardTitle className="text-base">
                  {result.status === 'READY' ? 'Copy Generated' : 'Generation Refused'}
                </CardTitle>
              </div>
              {result.status === 'READY' && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.status === 'REFUSED' && (
              <p className="text-sm text-destructive">{result.reason}</p>
            )}

            {result.copy && (
              <ScrollArea className="max-h-[300px] rounded-md border bg-muted/20 p-4">
                <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">{result.copy}</pre>
              </ScrollArea>
            )}

            {result.includedIdentifiers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.includedIdentifiers.map((id, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{id}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
