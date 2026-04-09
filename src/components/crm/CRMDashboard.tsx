import { Building2, Search, ClipboardList, Plus } from 'lucide-react';
import { useEnquiries } from '@/hooks/useCRMEnquiries';
import { useExternalListings } from '@/hooks/useMiCasaCRM';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type View = 'dashboard' | 'portfolio' | 'enquiries' | 'activity' | 'new-enquiry' | 'enquiry-detail';

interface Props {
  onNavigate: (view: View, id?: string) => void;
}

export function CRMDashboard({ onNavigate }: Props) {
  const { data: enquiries } = useEnquiries();
  const { data: rentals } = useExternalListings('rent');
  const { data: sales } = useExternalListings('sale');

  const totalListings = (rentals?.length || 0) + (sales?.length || 0);
  const newEnquiries = enquiries?.filter(e => e.status === 'new').length || 0;
  const activeEnquiries = enquiries?.filter(e => !['closed', 'lost'].includes(e.status)).length || 0;

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('new-enquiry')}
          className="group relative rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/70 transition-all p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">New Enquiry</p>
              <p className="text-sm text-muted-foreground">Log a client requirement</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('portfolio')}
          className="group rounded-2xl border border-border bg-card hover:bg-accent/50 transition-all p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Portfolio</p>
              <p className="text-sm text-muted-foreground">{totalListings} properties</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('enquiries')}
          className="group rounded-2xl border border-border bg-card hover:bg-accent/50 transition-all p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Enquiries</p>
              <p className="text-sm text-muted-foreground">
                {newEnquiries > 0 ? `${newEnquiries} new · ` : ''}{activeEnquiries} active
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Enquiries */}
      {enquiries && enquiries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Recent Enquiries
            </h2>
            <button onClick={() => onNavigate('enquiries')} className="text-xs text-primary hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {enquiries.slice(0, 5).map(e => (
              <button
                key={e.id}
                onClick={() => onNavigate('enquiry-detail', e.id)}
                className="w-full text-left px-4 py-3 hover:bg-accent/30 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.client_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.preferred_location || 'Any location'} · {e.property_type || 'Any type'}
                    {e.budget_max ? ` · up to AED ${(e.budget_max / 1_000_000).toFixed(1)}M` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={e.status} />
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  contacted: { label: 'Contacted', className: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  viewing: { label: 'Viewing', className: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  negotiating: { label: 'Negotiating', className: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  closed: { label: 'Closed', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  lost: { label: 'Lost', className: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return <Badge className={`text-[10px] border ${s.className}`}>{s.label}</Badge>;
}
