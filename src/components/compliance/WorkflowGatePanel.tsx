import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, 
  ShieldX, 
  FileText, 
  Upload, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useWorkflowGate } from "@/hooks/useManifestExecutor";
import { cn } from "@/lib/utils";

interface WorkflowGatePanelProps {
  dealId?: string;
  dealType: "sales" | "leasing";
  documentsPresent: string[];
  requestedAction: string;
  onDocumentUpload?: (documentType: string) => void;
  onProceed?: (action: string) => void;
}

// Document display names
const DOCUMENT_LABELS: Record<string, string> = {
  "signed_brokerage_contract": "Signed Brokerage Contract",
  "ownership_proof": "Ownership/Authority Proof",
  "kyc_folder": "KYC Folder",
  "aml_assessment": "AML Risk Assessment",
  "tenant_id": "Tenant ID",
  "landlord_id": "Landlord ID",
  "title_deed": "Title Deed",
  "power_of_attorney": "Power of Attorney",
  "passport_copy": "Passport Copy",
  "emirates_id": "Emirates ID",
};

export function WorkflowGatePanel({
  dealId,
  dealType,
  documentsPresent,
  requestedAction,
  onDocumentUpload,
  onProceed,
}: WorkflowGatePanelProps) {
  const { evaluateGate, isLoading, error } = useWorkflowGate();
  const [gateResult, setGateResult] = useState<{
    status: "APPROVED" | "BLOCKED";
    missing: string[];
    nextActions: string[];
  } | null>(null);

  const gateId = dealType === "sales" ? "FLOW_SALES_GATE" : "FLOW_LEASING_GATE";

  const handleEvaluate = async () => {
    const result = await evaluateGate(
      gateId as "FLOW_SALES_GATE" | "FLOW_LEASING_GATE",
      documentsPresent,
      requestedAction,
      dealId
    );
    setGateResult(result);
  };

  // Auto-evaluate on mount or when documents change
  useEffect(() => {
    handleEvaluate();
  }, [documentsPresent.length, requestedAction]);

  const isApproved = gateResult?.status === "APPROVED";
  const missingCount = gateResult?.missing?.length || 0;
  const totalRequired = missingCount + documentsPresent.length;
  const progress = totalRequired > 0 ? ((documentsPresent.length / totalRequired) * 100) : 0;

  return (
    <Card className={cn(
      "transition-colors",
      isApproved 
        ? "border-green-500/30 bg-green-500/5" 
        : gateResult?.status === "BLOCKED" 
          ? "border-amber-500/30 bg-amber-500/5" 
          : ""
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isApproved ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldX className="h-5 w-5 text-amber-500" />
            )}
            Workflow Gate
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isApproved ? "default" : "secondary"}>
              {dealType === "sales" ? "Sales Gate" : "Leasing Gate"}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEvaluate}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Banner */}
        {gateResult && (
          <div className={cn(
            "p-4 rounded-lg flex items-center gap-3",
            isApproved 
              ? "bg-green-500/10 border border-green-500/30" 
              : "bg-amber-500/10 border border-amber-500/30"
          )}>
            {isApproved ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={cn(
                "font-medium",
                isApproved ? "text-green-600" : "text-amber-600"
              )}>
                {isApproved 
                  ? "Gate Approved - Ready to proceed" 
                  : `Gate Blocked - ${missingCount} document${missingCount !== 1 ? 's' : ''} missing`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Action: {requestedAction}
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Document Completeness</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Missing Documents */}
        {gateResult && missingCount > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Missing Requirements</h4>
            <div className="space-y-2">
              {gateResult.missing.map((doc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <span className="text-sm font-medium">
                      {DOCUMENT_LABELS[doc] || doc.replace(/_/g, " ")}
                    </span>
                  </div>
                  {onDocumentUpload && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDocumentUpload(doc)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Present Documents */}
        {documentsPresent.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Documents Present</h4>
            <div className="flex flex-wrap gap-2">
              {documentsPresent.map((doc, idx) => (
                <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {DOCUMENT_LABELS[doc] || doc.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Actions */}
        {gateResult && isApproved && gateResult.nextActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Next Allowed Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {gateResult.nextActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start"
                  onClick={() => onProceed?.(action)}
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  {action.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
