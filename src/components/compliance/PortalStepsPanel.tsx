import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  RefreshCw, 
  MapPin, 
  CheckCircle2, 
  FileText,
  ExternalLink,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { useManifestExecutor } from "@/hooks/useManifestExecutor";

type DealType = "sales" | "leasing";
type TransactionStage = "intake" | "brokerage_contract" | "advertising" | "offer" | "closing" | "registration" | "commission" | "closeout";

interface PortalStepsPanelProps {
  dealType?: DealType;
  initialStage?: TransactionStage;
  onStepsLoaded?: (result: PortalStepsResult) => void;
}

interface PortalStepsResult {
  portal_steps: string[];
  evidence_to_save: string[];
  folder_target: string;
  notes: string;
}

const STAGE_OPTIONS: { value: TransactionStage; label: string }[] = [
  { value: "intake", label: "Intake" },
  { value: "brokerage_contract", label: "Brokerage Contract" },
  { value: "advertising", label: "Advertising" },
  { value: "offer", label: "Offer" },
  { value: "closing", label: "Closing" },
  { value: "registration", label: "Registration" },
  { value: "commission", label: "Commission" },
  { value: "closeout", label: "Closeout" },
];

export function PortalStepsPanel({
  dealType = "sales",
  initialStage = "intake",
  onStepsLoaded
}: PortalStepsPanelProps) {
  const { execute, isLoading, error } = useManifestExecutor();
  
  const [selectedDealType, setSelectedDealType] = useState<DealType>(dealType);
  const [selectedStage, setSelectedStage] = useState<TransactionStage>(initialStage);
  const [result, setResult] = useState<PortalStepsResult | null>(null);

  const handleLoadSteps = async () => {
    const response = await execute({
      promptId: "COMPLIANCE_PORTALS_MAP",
      inputPayload: {
        deal_type: selectedDealType,
        stage: selectedStage
      }
    });

    if (response.success) {
      const stepsResult: PortalStepsResult = {
        portal_steps: (response as any).portal_steps || [],
        evidence_to_save: (response as any).evidence_to_save || [],
        folder_target: (response as any).folder_target || "",
        notes: (response as any).notes || ""
      };
      setResult(stepsResult);
      onStepsLoaded?.(stepsResult);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Portal & Platform Steps
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {selectedDealType} • {selectedStage.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Required portal touchpoints and evidence for this transaction stage
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Deal Type</label>
            <Select
              value={selectedDealType}
              onValueChange={(v) => setSelectedDealType(v as DealType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="leasing">Leasing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Transaction Stage</label>
            <Select
              value={selectedStage}
              onValueChange={(v) => setSelectedStage(v as TransactionStage)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Portal Steps */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Portal Steps Required
              </h4>
              {result.portal_steps.length > 0 ? (
                <ul className="space-y-2">
                  {result.portal_steps.map((step, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-start gap-2 p-2 rounded-lg border bg-muted/50"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No portal steps required for this stage
                </p>
              )}
            </div>

            {/* Evidence to Save */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evidence to Save
              </h4>
              {result.evidence_to_save.length > 0 ? (
                <ul className="space-y-2">
                  {result.evidence_to_save.map((evidence, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-start gap-2 p-2 rounded-lg border"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{evidence}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No evidence items specified
                </p>
              )}
            </div>

            {/* Folder Target */}
            {result.folder_target && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <strong>File to:</strong> {result.folder_target}
                </span>
              </div>
            )}

            {/* Notes */}
            {result.notes && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">{result.notes}</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleLoadSteps}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading Steps...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Load Portal Requirements
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
