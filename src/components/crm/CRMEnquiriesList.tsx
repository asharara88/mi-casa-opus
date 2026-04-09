import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEnquiries } from '@/hooks/useCRMEnquiries';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  onBack: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  contacted: { label: 'Contacted', className: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  viewing: { label: 'Viewing', className: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  negotiating: { label: 'Negotiating', className: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  closed: { label: 'Closed', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  lost: { label: 'Lost', className: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

function formatBudget(min: number | null, max: number | null): string {
  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1_000)}K`;
  if (min && max) return `AED ${fmt(min)} – ${fmt(max)}`;
  if (max) return `up to AED ${fmt(max)}`;
  if (min) return `from AED ${fmt(min)}`;
  return '—';
}

export function CRMEnquiriesList({ onBack, onNew, onSelect }: Props) {
  const { data: enquiries, isLoading } = useEnquiries();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <h2 className="text-xl font-bold text-foreground">Enquiries</h2>
        </div>
        <Button size="sm" onClick={onNew}><Plus className="w-4 h-4 mr-1" /> New Enquiry</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : !enquiries?.length ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">No enquiries yet.</p>
          <Button onClick={onNew}><Plus className="w-4 h-4 mr-1" /> Create your first enquiry</Button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {enquiries.map(e => {
            const s = STATUS_MAP[e.status] || { label: e.status, className: 'bg-muted text-muted-foreground border-border' };
            return (
              <button
                key={e.id}
                onClick={() => onSelect(e.id)}
                className="w-full text-left px-4 py-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{e.client_name}</p>
                      {e.company && <span className="text-xs text-muted-foreground">({e.company})</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {e.property_type || 'Any type'} · {e.preferred_location || 'Any area'} · {formatBudget(e.budget_min, e.budget_max)}
                    </p>
                    {e.key_requirements && (
                      <p className="text-xs text-muted-foreground/70 truncate">{e.key_requirements}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className={`text-[10px] border ${s.className}`}>{s.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
