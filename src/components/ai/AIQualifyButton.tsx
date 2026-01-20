import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Target, ArrowRight, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useBosLlmLeadQualify } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';
import { Lead } from '@/types/bos';

interface AIQualifyButtonProps {
  lead: Lead;
  onApplyRecommendation?: (recommendation: {
    tier: string;
    routing: string;
    next_action: string;
  }) => void;
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

export function AIQualifyButton({ lead, onApplyRecommendation }: AIQualifyButtonProps) {
  const [showResult, setShowResult] = useState(false);
  const { qualifyLead, isQualifying, qualification } = useBosLlmLeadQualify();

  const handleQualify = async () => {
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

    const result = await qualifyLead(
      'Analyze this lead and provide qualification recommendation',
      leadData
    );

    if (result) {
      setShowResult(true);
    }
  };

  const handleApply = () => {
    if (qualification && onApplyRecommendation) {
      onApplyRecommendation({
        tier: qualification.tier,
        routing: qualification.routing,
        next_action: qualification.next_action,
      });
    }
    setShowResult(false);
  };

  if (showResult && qualification) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Qualification Result
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowResult(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score & Tier */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{qualification.score}/100</span>
              <Badge className={cn("border", TIER_COLORS[qualification.tier])}>
                {qualification.tier}
              </Badge>
            </div>
          </div>

          {/* Routing Recommendation */}
          <div className="p-3 rounded-lg bg-background border">
            <div className="text-xs text-muted-foreground mb-1">Recommended Action</div>
            <div className="font-medium text-sm">
              {ROUTING_LABELS[qualification.routing] || qualification.routing}
            </div>
          </div>

          {/* Gaps */}
          {qualification.gaps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                Information Gaps
              </div>
              <ul className="text-xs space-y-1">
                {qualification.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Action */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1">
              <CheckCircle className="h-3 w-3" />
              Suggested Next Step
            </div>
            <div className="text-sm">{qualification.next_action}</div>
          </div>

          {/* Rationale */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">AI Analysis:</span> {qualification.rationale}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowResult(false)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleApply}
            >
              Apply Recommendation
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleQualify}
      disabled={isQualifying}
      className="gap-2"
    >
      {isQualifying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-primary" />
          AI Qualify
        </>
      )}
    </Button>
  );
}
