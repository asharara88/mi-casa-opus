import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MapPin, Calendar, User, Building, Hash, MessageSquare, UserPlus, ChevronRight } from 'lucide-react';
import type { Prospect } from '@/hooks/useProspects';
import { format } from 'date-fns';

interface Props {
  prospect: Prospect | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Prospect>) => void;
  onConvertToLead?: (prospect: Prospect) => void;
}

const outreachStatuses = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted to Lead' },
];

export function ProspectDetailSheet({ prospect, onClose, onUpdate, onConvertToLead }: Props) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('not_contacted');

  useEffect(() => {
    if (prospect) {
      setNotes(prospect.notes || '');
      setStatus(prospect.outreach_status);
    }
  }, [prospect]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onUpdate({ 
      outreach_status: newStatus,
      last_contacted_at: newStatus !== 'not_contacted' ? new Date().toISOString() : prospect?.last_contacted_at,
      contact_attempts: newStatus !== 'not_contacted' ? (prospect?.contact_attempts || 0) + 1 : prospect?.contact_attempts
    });
  };

  const handleSaveNotes = () => {
    onUpdate({ notes });
  };

  const handleCall = () => {
    if (prospect?.phone) {
      window.open(`tel:${prospect.phone}`, '_self');
    }
  };

  const handleEmail = () => {
    if (prospect?.email) {
      window.open(`mailto:${prospect.email}`, '_blank');
    }
  };

  const handleWhatsApp = () => {
    if (prospect?.phone) {
      const cleanPhone = prospect.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleConvertToLead = () => {
    if (prospect && onConvertToLead) {
      onConvertToLead(prospect);
      onUpdate({ outreach_status: 'converted' });
    }
  };

  const canConvert = prospect?.outreach_status === 'qualified' || prospect?.outreach_status === 'interested';

  if (!prospect) return null;

  return (
    <Sheet open={!!prospect} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{prospect.full_name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCall} disabled={!prospect.phone} className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp} disabled={!prospect.phone} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail} disabled={!prospect.email} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Convert to Lead - Only show when qualified/interested */}
          {canConvert && onConvertToLead && (
            <Button 
              className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
              onClick={handleConvertToLead}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Convert to Lead
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Outreach Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outreachStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            
            {prospect.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{prospect.phone}</span>
              </div>
            )}
            
            {prospect.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{prospect.email}</span>
              </div>
            )}
            
            {prospect.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{prospect.city}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* CRM Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">CRM Details</h4>
            
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{prospect.crm_customer_id || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Source: {prospect.source || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Stage: {prospect.crm_stage || 'Prospect'}</span>
            </div>
            
            {prospect.crm_created_date && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created: {format(new Date(prospect.crm_created_date), 'PP')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge variant="outline" className={
                prospect.crm_confidence_level === 'High' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : prospect.crm_confidence_level === 'Medium'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }>
                {prospect.crm_confidence_level || 'Unknown'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Engagement Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Engagement</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{prospect.contact_attempts}</p>
                <p className="text-xs text-muted-foreground">Contact Attempts</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">
                  {prospect.last_contacted_at 
                    ? format(new Date(prospect.last_contacted_at), 'PP')
                    : 'Never'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Last Contacted</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this prospect..."
              rows={4}
            />
            <Button size="sm" onClick={handleSaveNotes} disabled={notes === (prospect.notes || '')}>
              Save Notes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
