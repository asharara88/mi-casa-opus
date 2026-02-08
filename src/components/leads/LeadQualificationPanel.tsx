import { useMemo, useState } from 'react';
import { Lead, LeadConsent } from '@/types/bos';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CheckCircle, AlertCircle, Sparkles, Copy, MessageSquare } from 'lucide-react';
import { AIQualifyButton } from '@/components/ai/AIQualifyButton';
import { AiAssistantPanel } from '@/components/ai/AiAssistantPanel';
import { LeadQualification } from '@/hooks/useBosLlm';

interface LeadQualificationPanelProps {
  lead: Lead;
  onSave: (updates: Partial<Lead>) => void;
  onCancel: () => void;
}

const PROPERTY_TYPES = ['Villa', 'Apartment', 'Townhouse', 'Penthouse', 'Studio', 'Land'];
const LOCATIONS = ['Saadiyat Island', 'Yas Island', 'Al Reem Island', 'Al Raha', 'Khalifa City', 'Downtown Abu Dhabi'];

export function LeadQualificationPanel({ lead, onSave, onCancel }: LeadQualificationPanelProps) {
  const [requirements, setRequirements] = useState(
    lead.requirements || {
      budget_min: undefined,
      budget_max: undefined,
      property_types: [],
      locations: [],
      bedrooms_min: undefined,
    }
  );

  const [consents, setConsents] = useState<LeadConsent[]>(lead.consents || []);
  const [showAssistant, setShowAssistant] = useState(false);
  const [lastApplied, setLastApplied] = useState<{
    tier: string;
    routing: string;
    next_action: string;
  } | null>(null);

  const hasDataProcessingConsent = consents.some(
    c => c.consent_type === 'DataProcessing' && c.granted
  );
  const hasMarketingConsent = consents.some(
    c => c.consent_type === 'Marketing' && c.granted
  );

  // Build lead payload for AI context
  const leadPayload = useMemo(() => ({
    lead_id: lead.lead_id,
    contact_name: lead.contact_identity.full_name,
    contact_email: lead.contact_identity.email,
    contact_phone: lead.contact_identity.phone,
    source: lead.source,
    lead_state: lead.lead_state,
    requirements: lead.requirements,
    consents: lead.consents,
    notes: lead.notes,
    created_at: lead.created_at,
  }), [lead]);

  const updateConsent = (type: LeadConsent['consent_type'], granted: boolean) => {
    const existing = consents.find(c => c.consent_type === type);
    if (existing) {
      setConsents(consents.map(c =>
        c.consent_type === type
          ? { ...c, granted, granted_at: new Date().toISOString() }
          : c
      ));
    } else {
      setConsents([...consents, {
        consent_type: type,
        granted,
        granted_at: new Date().toISOString(),
        version: 1,
      }]);
    }
  };

  const canSave = hasDataProcessingConsent && requirements.budget_max && requirements.budget_max > 0;

  const handleSave = () => {
    onSave({ requirements, consents });
  };

  // Non-blocking audit log for AI decisions
  const logAiDecisionBestEffort = async (
    decision: 'APPLIED' | 'DISMISSED',
    qualification: LeadQualification
  ) => {
    try {
      // Cast to Json via JSON.parse/stringify to satisfy Supabase types
      const rationalePayload = JSON.parse(JSON.stringify({
        decision,
        qualification,
        decided_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('ai_insights').insert([{
        entity_type: 'LEAD',
        entity_id: lead.lead_id,
        insight_type: 'LEAD_QUALIFY',
        score: qualification.score,
        rationale: rationalePayload,
        next_best_action: qualification.next_action,
        is_authoritative: false,
      }]);

      if (error) throw error;
    } catch (err) {
      console.error('[AI Audit] Non-blocking log failed:', err);
      // Non-blocking: just log, don't interrupt user flow
      toast('AI decision could not be logged (non-blocking).');
    }
  };

  const onApplyRecommendation = async (
    rec: { tier: string; routing: string; next_action: string },
    full: LeadQualification
  ) => {
    // Explicit broker action. Still advisory: no auto-routing/state change.
    setLastApplied(rec);
    await logAiDecisionBestEffort('APPLIED', full);
    toast.success('AI recommendation saved for review.');
  };

  const onDismissRecommendation = async (full: LeadQualification) => {
    await logAiDecisionBestEffort('DISMISSED', full);
    toast('Dismissed (no changes applied).');
  };

  const copyNextAction = async () => {
    if (!lastApplied?.next_action) return;
    try {
      await navigator.clipboard.writeText(lastApplied.next_action);
      toast.success('Next action copied to clipboard.');
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Requirements Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Requirements Capture</CardTitle>
          <CardDescription>Capture the lead's property requirements for qualification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Min Budget (AED)</Label>
              <Input
                id="budget_min"
                type="number"
                placeholder="500,000"
                value={requirements.budget_min || ''}
                onChange={e =>
                  setRequirements({
                    ...requirements,
                    budget_min: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Max Budget (AED) *</Label>
              <Input
                id="budget_max"
                type="number"
                placeholder="2,000,000"
                value={requirements.budget_max || ''}
                onChange={e =>
                  setRequirements({
                    ...requirements,
                    budget_max: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Minimum Bedrooms</Label>
            <Select
              value={requirements.bedrooms_min?.toString() || ''}
              onValueChange={value =>
                setRequirements({
                  ...requirements,
                  bedrooms_min: value ? Number(value) : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Types */}
          <div className="space-y-2">
            <Label>Property Types</Label>
            <div className="grid grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={requirements.property_types?.includes(type) || false}
                    onCheckedChange={(checked) => {
                      const types = requirements.property_types || [];
                      setRequirements({
                        ...requirements,
                        property_types: checked
                          ? [...types, type]
                          : types.filter(t => t !== type)
                      });
                    }}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Preferred Locations</Label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATIONS.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`loc-${location}`}
                    checked={requirements.locations?.includes(location) || false}
                    onCheckedChange={(checked) => {
                      const locs = requirements.locations || [];
                      setRequirements({
                        ...requirements,
                        locations: checked
                          ? [...locs, location]
                          : locs.filter(l => l !== location)
                      });
                    }}
                  />
                  <Label htmlFor={`loc-${location}`} className="text-sm font-normal">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consent Records</CardTitle>
          <CardDescription>
            Required consents must be captured before qualification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Processing Consent - Required */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              id="consent-data"
              checked={hasDataProcessingConsent}
              onCheckedChange={(checked) => updateConsent('DataProcessing', checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="consent-data" className="text-sm font-medium flex items-center gap-2">
                Data Processing Consent
                <span className="text-xs text-destructive">* Required</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                I consent to the processing of my personal data for property matching and communication purposes.
              </p>
            </div>
            {hasDataProcessingConsent && (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
          </div>

          {/* Marketing Consent - Optional */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              id="consent-marketing"
              checked={hasMarketingConsent}
              onCheckedChange={(checked) => updateConsent('Marketing', checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="consent-marketing" className="text-sm font-medium">
                Marketing Communications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                I would like to receive marketing communications about new listings and market updates.
              </p>
            </div>
            {hasMarketingConsent && (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {!canSave && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-500">Missing Requirements</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {!hasDataProcessingConsent && <li>• Data processing consent is required</li>}
              {(!requirements.budget_max || requirements.budget_max <= 0) && <li>• Maximum budget is required</li>}
            </ul>
          </div>
        </div>
      )}

      {/* AI Qualification */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Assisted Qualification
          </CardTitle>
          <CardDescription>
            AI provides advisory recommendations; broker decides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AIQualifyButton
            lead={lead}
            onApplyRecommendation={onApplyRecommendation}
            onDismissRecommendation={onDismissRecommendation}
          />

          {/* Last applied recommendation display */}
          {lastApplied && (
            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Last applied AI recommendation</p>
              <p className="text-sm">
                <span className="font-medium">Tier:</span> {lastApplied.tier} ·{' '}
                <span className="font-medium">Routing:</span> {lastApplied.routing}
              </p>
              <p className="text-sm">
                <span className="font-medium">Next action:</span> {lastApplied.next_action}
              </p>
              <Button variant="ghost" size="sm" onClick={copyNextAction} className="h-6 px-2 text-xs">
                <Copy className="h-3 w-3 mr-1" />
                Copy next action
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mi Asistente Panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Mi Asistente
          </CardTitle>
          <CardDescription>
            Ask questions; routed to OPS / Lead Qualify. Advisory only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setShowAssistant(v => !v)}
            className="w-full mb-3"
          >
            {showAssistant ? 'Hide assistant' : 'Show assistant'}
          </Button>

          {showAssistant && (
            <AiAssistantPanel
              contextType="lead"
              bosPayload={{ lead: leadPayload }}
            />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Save & Qualify
        </Button>
      </div>
    </div>
  );
}
