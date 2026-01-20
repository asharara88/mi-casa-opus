import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Target, ArrowRight, AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useBosLlmLeadQualify, LeadQualification } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';
import { Lead } from '@/types/bos';

interface AIQualifyButtonProps {
  lead: Lead;
  onApplyRecommendation?: (
    recommendation: { tier: string; routing: string; next_action: string },
    fullQualification: LeadQualification
  ) => void;
  onDismissRecommendation?: (fullQualification: LeadQualification) => void;
}

const TIER_COLORS: Record<string, string> = {
  HOT: 'bg-red-500/20 text-red-600 border-red-500/30',
  WARM: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  COOL: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  COLD: 'bg-slate-500/20 text-slate-600 border-slate-500/30',
};

const ROUTING_LABELS: Record<string, string> = {
  ASSIGN_SENIOR: 'Assign to Senior Broker',
  ASSIGN_AVAILABLE: 'Assign to Available Broker',
  NURTURE: 'Add to Nurture Campaign',
  DISQUALIFY: 'Mark as Disqualified',
};

export function AIQualifyButton({ 
  lead, 
  onApplyRecommendation,
  onDismissRecommendation 
}: AIQualifyButtonProps) {
  const [showResult, setShowResult] = useState(false);
  const { qualifyLead, isQualifying } = useBosLlmLeadQualify();
  const [result, setResult] = useState<LeadQualification | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQualify = async () => {
    setErrorMsg(null);
    const leadData = {
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
    };

    const qualification = await qualifyLead(
      'Analyze this lead and provide qualification recommendation',
      leadData
    );

    if (qualification) {
      setResult(qualification);
      setShowResult(true);
    } else {
      setResult(null);
      setShowResult(false);
      setErrorMsg('Could not get an AI recommendation. Please try again.');
    }
  };

  const handleApply = () => {
    if (result && onApplyRecommendation) {
      onApplyRecommendation(
        {
          tier: result.tier,
          routing: result.routing,
          next_action: result.next_action,
        },
        result
      );
    }
    setShowResult(false);
    setResult(null);
  };

  const handleDismiss = () => {
    if (result && onDismissRecommendation) {
      onDismissRecommendation(result);
    }
    setShowResult(false);
    setResult(null);
  };

  // Button state - not showing result yet
  if (!showResult) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleQualify}
          disabled={isQualifying}
          className="w-full gap-2"
        >
          {isQualifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-primary" />
              AI Qualify Lead
            </>
          )}
        </Button>
        
        {errorMsg ? (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {errorMsg}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            Advisory only. No changes happen unless you click Apply.
          </p>
        )}
      </div>
    );
  }

  // No result available
  if (!result) return null;

  // Result card with Apply/Dismiss
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          AI Recommendation (Advisory)
        </CardTitle>
        <Badge className={cn("border", TIER_COLORS[result.tier])}>
          {result.tier}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score & Tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Score</span>
          </div>
          <span className="text-lg font-bold">{result.score}/100</span>
        </div>

        {/* Routing Recommendation */}
        <div className="p-3 rounded-lg bg-background border">
          <div className="text-xs text-muted-foreground mb-1">Routing Suggestion</div>
          <div className="font-medium text-sm">
            {ROUTING_LABELS[result.routing] || result.routing}
          </div>
        </div>

        {/* Next Action */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1">
            <CheckCircle className="h-3 w-3" />
            Suggested Next Step
          </div>
          <div className="text-sm">{result.next_action}</div>
        </div>

        {/* Gaps */}
        {result.gaps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Information Gaps
            </div>
            <ul className="text-xs space-y-1">
              {result.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-amber-500">•</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rationale */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">AI Analysis:</span> {result.rationale}
        </div>

        {/* Advisory disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-dashed flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>Clicking Apply does not auto-route or change lead state. It only saves this recommendation for broker review.</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleApply}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Apply
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Retry */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleQualify}
          disabled={isQualifying}
          className="w-full text-xs"
        >
          {isQualifying ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
