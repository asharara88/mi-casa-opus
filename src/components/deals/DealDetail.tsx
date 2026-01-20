import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  PenTool, 
  Camera, 
  Clock,
  Building2,
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react';
import { Deal, DealState, ValidationContext, DEAL_STATE_REQUIREMENTS } from '@/types/bos';
import { DealStateRail } from './DealStateRail';
import { DealPartiesPanel } from './DealPartiesPanel';
import { DealEconomicsSnapshot } from './DealEconomicsSnapshot';
import { RegistryActionsChecklist } from './RegistryActionsChecklist';
import { EvidenceDrawer } from './EvidenceDrawer';
import { validateDealTransition } from '@/lib/state-machine';
import { StateBadge } from '@/components/dashboard/StateBadge';
import { CompliancePanel } from '@/components/compliance/CompliancePanel';
import { useRunCompliance, useComplianceResult, useSubmitOverride, useCanOverride } from '@/hooks/useCompliance';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { OverridePayload } from '@/types/compliance';
import { AIChatPanel } from '@/components/ai/AIChatPanel';

interface DealDetailProps {
  deal: Deal;
  context: ValidationContext;
  onBack: () => void;
  onTransition: (deal: Deal, targetState: DealState) => void;
  dealDbId?: string;
}

// States that require compliance checks before proceeding
const COMPLIANCE_GATED_STATES: DealState[] = ['Offer', 'Reservation', 'SPA', 'Closed_Won'];

export const DealDetail: React.FC<DealDetailProps> = ({
  deal,
  context,
  onBack,
  onTransition,
  dealDbId,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const runCompliance = useRunCompliance();
  const submitOverride = useSubmitOverride();
  const { data: canOverrideData } = useCanOverride();
  const canOverride = canOverrideData ?? false;
  
  const { data: complianceResult, isLoading: isLoadingResult, refetch: refetchCompliance } = 
    useComplianceResult('deal', dealDbId || null);

  const requirements = DEAL_STATE_REQUIREMENTS[deal.deal_state];
  const nextState = requirements.next_states.find(s => s !== 'Closed_Lost');
  const validation = nextState ? validateDealTransition(deal, nextState, context) : null;

  // Check if the next state requires compliance
  const nextStateRequiresCompliance = nextState && COMPLIANCE_GATED_STATES.includes(nextState);
  const compliancePassed = complianceResult?.complianceStatus === 'APPROVED';

  const canTransition = (state: DealState) => {
    const basicValidation = validateDealTransition(deal, state, context).allowed;
    
    // If transitioning to a compliance-gated state, also check compliance
    if (COMPLIANCE_GATED_STATES.includes(state)) {
      return basicValidation && compliancePassed;
    }
    
    return basicValidation;
  };

  const handleStateClick = (state: DealState) => {
    if (canTransition(state)) {
      onTransition(deal, state);
    } else if (COMPLIANCE_GATED_STATES.includes(state) && !compliancePassed) {
      toast.error('Compliance check required before advancing to ' + state);
    }
  };

  const handleRunCompliance = async () => {
    if (!dealDbId) return;

    const dealWithAml = deal as Deal & { aml_risk_level?: string; aml_flags?: Record<string, boolean> };

    try {
      await runCompliance.mutateAsync({
        contextType: 'transaction',
        entityId: dealDbId,
        entityType: 'deal',
        payload: {
          transaction: {
            stage: deal.deal_state,
            createdInBOS: true,
          },
          aml: dealWithAml.aml_risk_level ? {
            riskLevel: dealWithAml.aml_risk_level as any,
            flags: dealWithAml.aml_flags as any,
          } : undefined,
        },
      });
      refetchCompliance();
    } catch (error) {
      toast.error('Failed to run compliance check');
    }
  };

  const handleOverride = async (payload: OverridePayload) => {
    if (!complianceResult?.resultId) return;

    try {
      await submitOverride.mutateAsync({
        complianceResultId: complianceResult.resultId,
        payload,
      });
      refetchCompliance();
      toast.success('Override submitted successfully');
    } catch (error) {
      toast.error('Failed to submit override');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{deal.deal_id}</h1>
              <StateBadge state={deal.deal_state} type="deal" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {deal.deal_type} • {deal.side} Side • Created {formatDate(deal.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EvidenceDrawer
            evidence={context.evidence}
            entityId={deal.deal_id}
            entityType="Deal"
          />
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
        </div>
      </div>

      {/* Block Reasons Alert */}
      {validation && !validation.allowed && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Cannot progress to {nextState}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {validation.missing_documents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <FileText className="h-3 w-3" />
                        Missing Documents
                      </div>
                      <ul className="space-y-1">
                        {validation.missing_documents.map((doc, i) => (
                          <li key={i} className="text-foreground">• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {validation.missing_signatures.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <PenTool className="h-3 w-3" />
                        Missing Signatures
                      </div>
                      <ul className="space-y-1">
                        {validation.missing_signatures.map((sig, i) => (
                          <li key={i} className="text-foreground">• {sig}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {validation.missing_evidence.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Camera className="h-3 w-3" />
                        Missing Evidence
                      </div>
                      <ul className="space-y-1">
                        {validation.missing_evidence.map((ev, i) => (
                          <li key={i} className="text-foreground">• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - State Rail */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Deal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DealStateRail
                currentState={deal.deal_state}
                onStateClick={handleStateClick}
                canTransition={canTransition}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="compliance">
                <Shield className="h-4 w-4 mr-1" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="h-4 w-4 mr-1" />
                AI
              </TabsTrigger>
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="registry">Registry</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <DealEconomicsSnapshot deal={deal} />
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">
                      {context.documents.filter(d => d.entity_ref.entity_id === deal.deal_id).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Documents</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <PenTool className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">
                      {context.signatures.filter(s => 
                        context.documents.some(d => 
                          d.document_id === s.document_id && d.entity_ref.entity_id === deal.deal_id
                        )
                      ).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Signatures</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Camera className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">
                      {context.evidence.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Evidence</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <CompliancePanel
                result={complianceResult}
                isLoading={runCompliance.isPending || isLoadingResult}
                onRefresh={handleRunCompliance}
                onProceed={nextState ? () => handleStateClick(nextState) : undefined}
                onOverride={handleOverride}
                canOverride={canOverride}
                amlFlags={(deal as any).aml_flags}
                amlRiskLevel={(deal as any).aml_risk_level}
                auditLog={{
                  entriesCount: 1,
                  createdAt: deal.created_at,
                  lastAction: 'Created',
                }}
                proceedLabel={nextState ? `Proceed to ${nextState}` : 'Complete'}
                isOverrideSubmitting={submitOverride.isPending}
              />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AIChatPanel
                entityType="deal"
                entityData={{
                  deal_id: deal.deal_id,
                  deal_type: deal.deal_type,
                  deal_state: deal.deal_state,
                  side: deal.side,
                  parties: deal.parties,
                  registry_actions: deal.registry_actions,
                  created_at: deal.created_at,
                }}
                complianceResult={complianceResult ? {
                  status: complianceResult.complianceStatus,
                  blockingReasons: complianceResult.blockingReasons,
                  requiredActions: complianceResult.requiredActions,
                } : undefined}
                collapsed={false}
              />
            </TabsContent>

            <TabsContent value="parties">
              <DealPartiesPanel parties={deal.parties} />
            </TabsContent>

            <TabsContent value="registry">
              <RegistryActionsChecklist actions={deal.registry_actions} />
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Event timeline for this deal</p>
                  <p className="text-sm mt-1">View all state transitions and actions</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
