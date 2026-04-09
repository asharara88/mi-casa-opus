import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, CheckCircle2, Clock, Phone, Mail, Building2 } from 'lucide-react';
import { useEnquiry, useEnquiryFollowUps, useUpdateEnquiry, useCreateFollowUp } from '@/hooks/useCRMEnquiries';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  enquiryId: string;
  onBack: () => void;
}

const STATUSES = ['new', 'contacted', 'viewing', 'negotiating', 'closed', 'lost'];
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  contacted: { label: 'Contacted', className: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  viewing: { label: 'Viewing', className: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  negotiating: { label: 'Negotiating', className: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  closed: { label: 'Closed', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  lost: { label: 'Lost', className: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

function formatBudget(min: number | null, max: number | null): string {
  const fmt = (n: number) => n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(1)}M` : `AED ${Math.round(n / 1_000)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (max) return `up to ${fmt(max)}`;
  if (min) return `from ${fmt(min)}`;
  return '—';
}

export function CRMEnquiryDetail({ enquiryId, onBack }: Props) {
  const { data: enquiry, isLoading } = useEnquiry(enquiryId);
  const { data: followUps } = useEnquiryFollowUps(enquiryId);
  const updateEnquiry = useUpdateEnquiry();
  const createFollowUp = useCreateFollowUp();

  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [fuType, setFuType] = useState('call');
  const [fuBody, setFuBody] = useState('');

  if (isLoading || !enquiry) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const s = STATUS_MAP[enquiry.status] || { label: enquiry.status, className: '' };

  const handleAddFollowUp = () => {
    if (!fuBody.trim()) return;
    createFollowUp.mutate({
      enquiry_id: enquiryId,
      follow_up_type: fuType,
      body: fuBody.trim(),
      follow_up_date: null,
      completed: false,
    });
    setFuBody('');
    setShowFollowUpForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{enquiry.client_name}</h2>
            {enquiry.company && <p className="text-sm text-muted-foreground">{enquiry.company}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`border ${s.className}`}>{s.label}</Badge>
          <Select
            value={enquiry.status}
            onValueChange={(val) => updateEnquiry.mutate({ id: enquiryId, status: val })}
          >
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(st => (
                <SelectItem key={st} value={st}>{STATUS_MAP[st]?.label || st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact & Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Contact</h3>
          {enquiry.client_phone && (
            <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{enquiry.client_phone}</p>
          )}
          {enquiry.client_email && (
            <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{enquiry.client_email}</p>
          )}
          {enquiry.source && (
            <p className="text-xs text-muted-foreground">Source: {enquiry.source}</p>
          )}
        </div>

        <div className="rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              {enquiry.property_type || 'Any type'} · {enquiry.preferred_location || 'Any location'}
            </p>
            <p>Budget: {formatBudget(enquiry.budget_min, enquiry.budget_max)}</p>
            {(enquiry.bedrooms_min || enquiry.bedrooms_max) && (
              <p>Bedrooms: {enquiry.bedrooms_min || '?'} – {enquiry.bedrooms_max || '?'}</p>
            )}
            {enquiry.key_requirements && (
              <p className="text-xs italic">{enquiry.key_requirements}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {enquiry.notes && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{enquiry.notes}</p>
        </div>
      )}

      {/* Follow-ups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Follow-ups</h3>
          <Button size="sm" variant="outline" onClick={() => setShowFollowUpForm(!showFollowUpForm)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {showFollowUpForm && (
          <div className="rounded-xl border border-border p-4 space-y-3 bg-accent/20">
            <Select value={fuType} onValueChange={setFuType}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="viewing">Viewing</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Details..." value={fuBody} onChange={e => setFuBody(e.target.value)} rows={2} />
            <Button size="sm" onClick={handleAddFollowUp} disabled={createFollowUp.isPending}>
              {createFollowUp.isPending ? 'Saving...' : 'Save Follow-up'}
            </Button>
          </div>
        )}

        {followUps && followUps.length > 0 ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {followUps.map(fu => (
              <div key={fu.id} className="px-4 py-3 flex items-start gap-3">
                {fu.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{fu.follow_up_type}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(fu.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{fu.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No follow-ups yet.</p>
        )}
      </div>
    </div>
  );
}
