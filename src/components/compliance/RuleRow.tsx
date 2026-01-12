import type { RuleResult } from "@/types/compliance";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface RuleRowProps {
  rule: RuleResult;
}

export function RuleRow({ rule }: RuleRowProps) {
  return (
    <div className="flex items-start justify-between py-3 px-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        {rule.passed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
        ) : rule.severity === "ESCALATE" ? (
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">
              {rule.ruleId}
            </span>
            <span className="text-sm font-medium">
              {rule.ruleName}
            </span>
          </div>
          
          {!rule.passed && rule.message && (
            <p className="text-sm text-muted-foreground mt-1">
              {rule.message}
            </p>
          )}
          
          {!rule.passed && rule.requiredAction && (
            <p className="text-sm text-destructive mt-1 font-medium">
              → {rule.requiredAction}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Badge 
          variant={rule.severity === "BLOCK" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {rule.severity}
        </Badge>
        <Badge 
          variant={rule.passed ? "outline" : "destructive"}
          className={rule.passed ? "bg-green-500/10 text-green-700 border-green-500/30" : ""}
        >
          {rule.passed ? "Pass" : "Fail"}
        </Badge>
      </div>
    </div>
  );
}
