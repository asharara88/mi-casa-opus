import { useState } from 'react';
import { Lead, LeadState, LEAD_STATE_REQUIREMENTS } from '@/types/bos';
import { validateLeadTransition, transitionLeadState, LEAD_STATE_COLORS } from '@/lib/state-machine';
import { LeadStateRail } from './LeadStateRail';
import { LeadQualificationPanel } from './LeadQualificationPanel';
import { BlockReasonsDisplay } from './BlockReasonsDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Globe,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  History,
  Edit2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { AIPropertyMatcher } from '@/components/ai/AIPropertyMatcher';
import { QuickConvertButton } from '@/components/funnel/QuickConvertButton';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  onUpdate: (lead: Lead) => void;
  onConvertToDeal?: (lead: Lead) => void;
}

export function LeadDetail({ lead, onBack, onUpdate, onConvertToDeal }: LeadDetailProps) {
  const [showQualificationPanel, setShowQualificationPanel] = useState(false);
  const [selectedTargetState, setSelectedTargetState] = useState<LeadState | null>(null);
  const [notes, setNotes] = useState(lead.notes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const currentRequirements = LEAD_STATE_REQUIREMENTS[lead.lead_state];
  const nextStates = currentRequirements.next_states.filter(s => s !== 'Disqualified');
  const stateColors = LEAD_STATE_COLORS[lead.lead_state];

  const handleStateClick = (targetState: LeadState) => {
    // Show qualification panel when moving to Qualified from early stages
    if (targetState === 'Qualified' && ['New', 'Contacted', 'Interested'].includes(lead.lead_state)) {
      setShowQualificationPanel(true);
    } else {
      setSelectedTargetState(targetState);
    }
  };

  const handleTransition = (targetState: LeadState) => {
    const result = transitionLeadState(
      lead,
      targetState,
      'current-user-id', // Would come from auth context
      'Operator'
    );

    if (result.success && result.lead) {
      onUpdate(result.lead);
      toast.success(`Lead transitioned to ${targetState}`);
      setSelectedTargetState(null);
    } else {
      toast.error('Transition blocked', {
        description: result.eventLog.block_reasons[0],
      });
    }
  };

  const handleQualificationSave = (updates: Partial<Lead>) => {
    const updatedLead: Lead = {
      ...lead,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Attempt transition to Qualified
    const result = transitionLeadState(
      updatedLead,
      'Qualified',
      'current-user-id',
      'Operator'
    );

    if (result.success && result.lead) {
      onUpdate(result.lead);
      toast.success('Lead qualified successfully');
      setShowQualificationPanel(false);
    } else {
      toast.error('Qualification failed', {
        description: result.eventLog.block_reasons[0],
      });
    }
  };

  const handleNotesUpdate = () => {
    onUpdate({
      ...lead,
      notes,
      updated_at: new Date().toISOString(),
    });
    setIsEditingNotes(false);
    toast.success('Notes updated');
  };

  const handleDisqualify = () => {
    const result = transitionLeadState(
      { ...lead, notes: notes || 'Disqualified by operator' },
      'Disqualified',
      'current-user-id',
      'Operator'
    );

    if (result.success && result.lead) {
      onUpdate(result.lead);
      toast.success('Lead disqualified');
    }
  };

  const handleConvert = async () => {
    if (lead.lead_state === 'Qualified' && onConvertToDeal) {
      onConvertToDeal(lead);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {lead.contact_identity.full_name}
            </h1>
            <Badge className={cn(stateColors.bg, stateColors.text, stateColors.border, "border")}>
              {lead.lead_state}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Lead ID: {lead.lead_id}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - State Rail + Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pipeline Position</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStateRail 
                currentState={lead.lead_state} 
                onStateClick={handleStateClick}
              />
            </CardContent>
          </Card>

          {/* Transition Actions */}
          {lead.lead_state !== 'Converted' && lead.lead_state !== 'Disqualified' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextStates.map((state) => {
                  const validation = validateLeadTransition(lead, state);
                  return (
                    <Button
                      key={state}
                      variant={validation.allowed ? 'default' : 'outline'}
                      className="w-full justify-between"
                      onClick={() => handleStateClick(state)}
                    >
                      <span>Move to {state}</span>
                      {validation.allowed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </Button>
                  );
                })}

                {lead.lead_state === 'Qualified' && onConvertToDeal && (
                  <div className="p-3 rounded-lg bg-gold/10 border border-gold/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium text-foreground">Ready for Deal</span>
                    </div>
                    <QuickConvertButton
                      type="lead-to-deal"
                      onConvert={handleConvert}
                      className="w-full"
                    />
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDisqualify}
                >
                  Disqualify Lead
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center Column - Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Qualification Panel (shown when qualifying) */}
          {showQualificationPanel && (
            <LeadQualificationPanel
              lead={lead}
              onSave={handleQualificationSave}
              onCancel={() => setShowQualificationPanel(false)}
            />
          )}

          {/* Transition Validation (shown when selecting a state) */}
          {selectedTargetState && !showQualificationPanel && (
            <Card>
              <CardHeader>
                <CardTitle>Transition to {selectedTargetState}</CardTitle>
                <CardDescription>
                  Review requirements before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <BlockReasonsDisplay
                  validation={validateLeadTransition(lead, selectedTargetState)}
                  targetState={selectedTargetState}
                />
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setSelectedTargetState(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleTransition(selectedTargetState)}
                    disabled={!validateLeadTransition(lead, selectedTargetState).allowed}
                  >
                    Confirm Transition
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead Info Card */}
          {!showQualificationPanel && !selectedTargetState && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.contact_identity.full_name}</p>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.contact_identity.phone}</p>
                        <p className="text-xs text-muted-foreground">Phone</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.contact_identity.email}</p>
                        <p className="text-xs text-muted-foreground">Email</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.source}</p>
                        <p className="text-xs text-muted-foreground">Source</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements (if captured) */}
              {lead.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget Range</p>
                        <p className="font-medium">
                          AED {lead.requirements.budget_min?.toLocaleString() || '0'} - {lead.requirements.budget_max?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Bedrooms</p>
                        <p className="font-medium">{lead.requirements.bedrooms_min || 'Any'}</p>
                      </div>
                      {lead.requirements.property_types && lead.requirements.property_types.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1">Property Types</p>
                          <div className="flex flex-wrap gap-1">
                            {lead.requirements.property_types.map((type) => (
                              <Badge key={type} variant="secondary">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {lead.requirements.locations && lead.requirements.locations.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1">Locations</p>
                          <div className="flex flex-wrap gap-1">
                            {lead.requirements.locations.map((loc) => (
                              <Badge key={loc} variant="outline">{loc}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Property Matching */}
              {lead.requirements && ['Qualified', 'Contacted', 'Interested', 'HighIntent'].includes(lead.lead_state) && (
                <AIPropertyMatcher 
                  lead={lead}
                  onViewListing={(listingId) => {
                    console.log('View listing:', listingId);
                    // TODO: Open listing detail modal
                  }}
                  onStartDeal={(listingId) => {
                    console.log('Start deal with listing:', listingId);
                    // TODO: Trigger deal creation flow
                  }}
                />
              )}

              {/* Notes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Notes</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    {isEditingNotes ? 'Cancel' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <div className="space-y-3">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this lead..."
                        rows={4}
                      />
                      <Button onClick={handleNotesUpdate} size="sm">
                        Save Notes
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {lead.notes || 'No notes added yet.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(lead.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(lead.updated_at).toLocaleString()}</span>
                    </div>
                    {lead.assigned_broker_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Assigned Broker</span>
                        <span className="font-mono text-xs">{lead.assigned_broker_id.slice(-8)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Chat Panel */}
              <AIChatPanel
                entityType="lead"
                entityData={{
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
                  updated_at: lead.updated_at,
                }}
                collapsed={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
