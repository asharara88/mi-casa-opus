import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Eye, TrendingUp, Mail, Phone, Calendar, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ListingPipelineTabProps {
  listingId: string;
}

/* ── Deal + linked lead query ── */
function useListingDeals(listingId: string) {
  return useQuery({
    queryKey: ['listing-pipeline-deals', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, deal_id, deal_state, deal_type, side, created_at, deal_economics, linked_lead_id, offplan_state, secondary_state')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch linked leads in one go
      const leadIds = (data || []).map(d => d.linked_lead_id).filter(Boolean) as string[];
      let leadsMap: Record<string, any> = {};
      if (leadIds.length > 0) {
        const { data: leads } = await supabase
          .from('leads')
          .select('id, lead_id, contact_name, contact_email, contact_phone, source, lead_state, qualification_data')
          .in('id', leadIds);
        if (leads) {
          leadsMap = Object.fromEntries(leads.map(l => [l.id, l]));
        }
      }
      return (data || []).map(d => ({ ...d, lead: d.linked_lead_id ? leadsMap[d.linked_lead_id] ?? null : null }));
    },
    enabled: !!listingId,
  });
}

/* ── Viewings query ── */
function useListingViewings(listingId: string) {
  return useQuery({
    queryKey: ['listing-pipeline-viewings', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .select('*')
        .eq('listing_id', listingId)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!listingId,
  });
}

/* ── Portal inquiries query ── */
function useListingInquiries(listingId: string) {
  return useQuery({
    queryKey: ['listing-pipeline-inquiries', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portal_inquiries')
        .select('*')
        .eq('listing_id', listingId)
        .order('received_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!listingId,
  });
}

/* ── Badge helpers ── */
const DEAL_STATE_COLORS: Record<string, string> = {
  Open: 'bg-blue-500/20 text-blue-600',
  UnderOffer: 'bg-amber-500/20 text-amber-600',
  Agreed: 'bg-emerald-500/20 text-emerald-600',
  Closed: 'bg-primary/20 text-primary',
  Lost: 'bg-destructive/20 text-destructive',
};

const LEAD_STATE_COLORS: Record<string, string> = {
  New: 'bg-blue-500/20 text-blue-600',
  Contacted: 'bg-amber-500/20 text-amber-600',
  Qualified: 'bg-emerald-500/20 text-emerald-600',
  Converted: 'bg-primary/20 text-primary',
  Lost: 'bg-destructive/20 text-destructive',
};

const VIEWING_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-600',
  confirmed: 'bg-emerald-500/20 text-emerald-600',
  completed: 'bg-primary/20 text-primary',
  cancelled: 'bg-destructive/20 text-destructive',
  no_show: 'bg-muted text-muted-foreground',
  rescheduled: 'bg-amber-500/20 text-amber-600',
};

export function ListingPipelineTab({ listingId }: ListingPipelineTabProps) {
  const { data: deals = [], isLoading: loadingDeals } = useListingDeals(listingId);
  const { data: viewings = [], isLoading: loadingViewings } = useListingViewings(listingId);
  const { data: inquiries = [], isLoading: loadingInquiries } = useListingInquiries(listingId);

  const isLoading = loadingDeals || loadingViewings || loadingInquiries;

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const hasData = deals.length > 0 || viewings.length > 0 || inquiries.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p className="font-medium">No pipeline activity yet</p>
        <p className="text-sm">Leads, viewings, and deals linked to this listing will appear here.</p>
      </div>
    );
  }

  // Collect unique leads from deals + portal inquiries
  const linkedLeads = deals.filter(d => d.lead).map(d => d.lead!);

  return (
    <div className="space-y-6">
      {/* ── Leads & Inquiries ── */}
      <section>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          Leads & Inquiries
          <Badge variant="secondary" className="text-xs">{linkedLeads.length + inquiries.length}</Badge>
        </h4>

        {linkedLeads.length === 0 && inquiries.length === 0 && (
          <p className="text-sm text-muted-foreground">No leads linked to this listing.</p>
        )}

        <div className="space-y-2">
          {linkedLeads.map((lead: any) => (
            <div key={lead.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{lead.contact_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {lead.contact_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.contact_email}</span>}
                  {lead.contact_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.contact_phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                <Badge className={LEAD_STATE_COLORS[lead.lead_state] || 'bg-muted text-muted-foreground'}>
                  {lead.lead_state}
                </Badge>
              </div>
            </div>
          ))}

          {inquiries.map((inq: any) => (
            <div key={inq.id} className="flex items-center justify-between rounded-lg border border-border p-3 border-dashed">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{inq.inquirer_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {inq.inquirer_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{inq.inquirer_email}</span>}
                  {inq.inquirer_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{inq.inquirer_phone}</span>}
                  {inq.message && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />"{inq.message.slice(0, 60)}{inq.message.length > 60 ? '…' : ''}"</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{inq.portal}</Badge>
                <span className="text-xs text-muted-foreground">{format(new Date(inq.received_at), 'dd MMM')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Viewings ── */}
      <section>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-primary" />
          Viewings
          <Badge variant="secondary" className="text-xs">{viewings.length}</Badge>
        </h4>

        {viewings.length === 0 && (
          <p className="text-sm text-muted-foreground">No viewings scheduled for this listing.</p>
        )}

        <div className="space-y-2">
          {viewings.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{format(new Date(v.scheduled_at), 'EEE, dd MMM yyyy')}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(v.scheduled_at), 'HH:mm')} · {v.duration_minutes}min
                    {v.location && <span>· {v.location}</span>}
                  </div>
                </div>
              </div>
              <Badge className={VIEWING_STATUS_COLORS[v.status] || 'bg-muted text-muted-foreground'}>
                {v.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Deals / Sales Status ── */}
      <section>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          Deal Status
          <Badge variant="secondary" className="text-xs">{deals.length}</Badge>
        </h4>

        {deals.length === 0 && (
          <p className="text-sm text-muted-foreground">No deals linked to this listing.</p>
        )}

        <div className="space-y-2">
          {deals.map((deal: any) => {
            const economics = deal.deal_economics as Record<string, any> | null;
            const agreedPrice = economics?.agreed_price || economics?.agreedPrice;
            return (
              <div key={deal.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono">{deal.deal_id}</span>
                    <Badge variant="outline" className="text-xs">{deal.deal_type}</Badge>
                    <Badge variant="outline" className="text-xs">{deal.side}</Badge>
                  </div>
                  <Badge className={DEAL_STATE_COLORS[deal.deal_state] || 'bg-muted text-muted-foreground'}>
                    {deal.deal_state}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {agreedPrice && (
                    <span className="font-medium text-foreground">
                      AED {Number(agreedPrice).toLocaleString()}
                    </span>
                  )}
                  {deal.lead && <span>Lead: {deal.lead.contact_name}</span>}
                  <span>Created {format(new Date(deal.created_at), 'dd MMM yyyy')}</span>
                </div>

                {(deal.offplan_state || deal.secondary_state) && (
                  <div className="flex gap-2">
                    {deal.offplan_state && <Badge variant="outline" className="text-xs">Off-Plan: {deal.offplan_state}</Badge>}
                    {deal.secondary_state && <Badge variant="outline" className="text-xs">Secondary: {deal.secondary_state}</Badge>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
