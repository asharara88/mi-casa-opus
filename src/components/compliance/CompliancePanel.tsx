import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Shield } from "lucide-react";
import type { ComplianceResult, OverridePayload, AmlFlags } from "@/types/compliance";
import { ComplianceStatusBanner } from "./ComplianceStatusBanner";
import { ModuleAccordion } from "./ModuleAccordion";
import { RequiredActionList } from "./RequiredActionList";
import { OverridePanel } from "./OverridePanel";
import { RiskFlagsChips } from "./RiskFlagsChips";
import { AuditTrailSummary } from "./AuditTrailSummary";
import { ComplianceGateButton } from "./ComplianceGateButton";

interface CompliancePanelProps {
  result: ComplianceResult | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onProceed?: () => void;
  onOverride?: (payload: OverridePayload) => void;
  canOverride?: boolean;
  amlFlags?: AmlFlags;
  amlRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  auditLog?: {
    entriesCount: number;
    createdAt?: string;
    lastActionAt?: string;
    lastAction?: string;
  };
  proceedLabel?: string;
  isOverrideSubmitting?: boolean;
}

export function CompliancePanel({
  result,
  isLoading = false,
  onRefresh,
  onProceed,
  onOverride,
  canOverride = false,
  amlFlags,
  amlRiskLevel,
  auditLog,
  proceedLabel = "Proceed",
  isOverrideSubmitting = false,
}: CompliancePanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!result && !isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Compliance Check
            </CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Check
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No compliance evaluation has been run yet. Click "Run Check" to evaluate.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Compliance Check
          </CardTitle>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Checking...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {result && (
          <>
            <ComplianceStatusBanner
              status={result.complianceStatus}
              escalationReason={result.escalationReason}
              failedCount={result.blockingReasons.length}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="modules">
                  Modules ({result.modules.length})
                </TabsTrigger>
                <TabsTrigger value="actions">
                  Actions ({result.requiredActions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-green-600">
                      {result.modules.filter(m => m.passed).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Modules Passed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-destructive">
                      {result.modules.filter(m => !m.passed).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Modules Failed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">
                      {result.modules.reduce((sum, m) => sum + m.rules.length, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Rules</p>
                  </div>
                </div>

                {(amlFlags || amlRiskLevel) && (
                  <RiskFlagsChips flags={amlFlags} riskLevel={amlRiskLevel} />
                )}

                {auditLog && (
                  <AuditTrailSummary {...auditLog} />
                )}
              </TabsContent>

              <TabsContent value="modules" className="mt-4">
                <ModuleAccordion modules={result.modules} />
              </TabsContent>

              <TabsContent value="actions" className="mt-4">
                <RequiredActionList actions={result.requiredActions} />
              </TabsContent>
            </Tabs>

            {result.complianceStatus !== "APPROVED" && canOverride && onOverride && (
              <OverridePanel
                canOverride={canOverride}
                onSubmit={onOverride}
                isSubmitting={isOverrideSubmitting}
              />
            )}

            {onProceed && (
              <ComplianceGateButton
                status={result.complianceStatus}
                labelApproved={proceedLabel}
                onClick={onProceed}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
