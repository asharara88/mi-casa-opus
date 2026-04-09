import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Eye, FileText, PenLine, RefreshCw, MessageSquare } from 'lucide-react';
import { useActivityLog, useCreateActivity, useExternalListings } from '@/hooks/useMiCasaCRM';
import { format } from 'date-fns';

const ACTIVITY_TYPES = ['note', 'call', 'viewing', 'offer', 'update', 'document'] as const;

const TYPE_ICONS: Record<string, React.ReactNode> = {
  note: <PenLine className="w-3.5 h-3.5" />,
  call: <Phone className="w-3.5 h-3.5" />,
  viewing: <Eye className="w-3.5 h-3.5" />,
  offer: <MessageSquare className="w-3.5 h-3.5" />,
  update: <RefreshCw className="w-3.5 h-3.5" />,
  document: <FileText className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  note: 'bg-blue-500/20 text-blue-400',
  call: 'bg-green-500/20 text-green-400',
  viewing: 'bg-purple-500/20 text-purple-400',
  offer: 'bg-amber-500/20 text-amber-400',
  update: 'bg-cyan-500/20 text-cyan-400',
  document: 'bg-rose-500/20 text-rose-400',
};

export function CRMActivityLog() {
  const { data: activities, isLoading } = useActivityLog();
  const createActivity = useCreateActivity();
  const { data: rentListings } = useExternalListings('rent');
  const { data: saleListings } = useExternalListings('sale');
  const allListings = [...(rentListings || []), ...(saleListings || [])];

  const [showForm, setShowForm] = useState(false);
  const [actType, setActType] = useState<string>('note');
  const [actListingId, setActListingId] = useState<string>('');
  const [actBody, setActBody] = useState('');

  const handleSubmit = () => {
    if (!actBody.trim()) return;
    createActivity.mutate(
      {
        activity_type: actType,
        listing_id: actListingId || null,
        body: actBody.trim(),
      },
      {
        onSuccess: () => {
          setActBody('');
          setActListingId('');
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activity Log</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Add Entry
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-lg border border-border p-4 space-y-3 bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={actType} onValueChange={setActType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actListingId} onValueChange={setActListingId}>
              <SelectTrigger><SelectValue placeholder="Listing (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {allListings.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}{l.unit ? ` — ${l.unit}` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Details…" value={actBody} onChange={e => setActBody(e.target.value)} rows={3} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={createActivity.isPending || !actBody.trim()}>Save</Button>
          </div>
        </div>
      )}

      {/* Log entries */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : !activities?.length ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity logged yet.</p>
      ) : (
        <div className="divide-y divide-border border border-border rounded-lg">
          {activities.map(a => (
            <div key={a.id} className="px-4 py-3 flex items-start gap-3">
              <Badge className={`${TYPE_COLORS[a.activity_type] || TYPE_COLORS.note} border-0 gap-1 text-[10px]`}>
                {TYPE_ICONS[a.activity_type]}
                {a.activity_type}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{a.body}</p>
                {a.listing_name && (
                  <p className="text-xs text-muted-foreground mt-0.5">Re: {a.listing_name}</p>
                )}
              </div>
              <time className="text-[10px] text-muted-foreground whitespace-nowrap">
                {format(new Date(a.created_at), 'dd MMM yyyy HH:mm')}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
