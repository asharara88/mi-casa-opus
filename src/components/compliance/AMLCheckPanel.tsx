import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  FileText,
  Loader2,
  RefreshCw,
  AlertOctagon,
  Info
} from "lucide-react";
import { useAMLCheck } from "@/hooks/useManifestExecutor";
import { cn } from "@/lib/utils";

interface AMLCheckPanelProps {
  dealValueAed?: number;
  paymentMethod?: "cash" | "bank_transfer" | "mortgage" | "crypto" | "mixed" | "unknown";
  buyerFlags?: {
    pep_declared?: boolean;
    unusual_urgency?: boolean;
    complex_structure?: boolean;
    sanctions_concern?: boolean;
  };
  onResultChange?: (result: {
    riskLevel: "Low" | "Medium" | "High";
    sourceOfFundsRequired: boolean;
    goamlTriggerLikely: boolean;
    requiredDocuments: string[];
  }) => void;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mortgage", label: "Mortgage" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "mixed", label: "Mixed" },
  { value: "unknown", label: "Unknown" },
];

const RISK_LEVEL_CONFIG = {
  Low: {
    color: "text-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: CheckCircle2,
  },
  Medium: {
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: AlertTriangle,
  },
  High: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertOctagon,
  },
};

export function AMLCheckPanel({
  dealValueAed: initialDealValue,
  paymentMethod: initialPaymentMethod,
  buyerFlags: initialBuyerFlags,
  onResultChange,
}: AMLCheckPanelProps) {
  const [dealValue, setDealValue] = useState(initialDealValue || 0);
  const [paymentMethod, setPaymentMethod] = useState<typeof PAYMENT_METHODS[0]["value"]>(
    initialPaymentMethod || "bank_transfer"
  );
  const [buyerFlags, setBuyerFlags] = useState({
    pep_declared: initialBuyerFlags?.pep_declared || false,
    unusual_urgency: initialBuyerFlags?.unusual_urgency || false,
    complex_structure: initialBuyerFlags?.complex_structure || false,
    sanctions_concern: initialBuyerFlags?.sanctions_concern || false,
  });
  
  const [result, setResult] = useState<{
    riskLevel: "Low" | "Medium" | "High";
    sourceOfFundsRequired: boolean;
    goamlTriggerLikely: boolean;
    requiredDocuments: string[];
    notes: string;
  } | null>(null);

  const { checkAML, isLoading, error } = useAMLCheck();

  const handleCheck = async () => {
    const amlResult = await checkAML(
      dealValue,
      paymentMethod as any,
      buyerFlags
    );
    
    setResult(amlResult);
    
    if (onResultChange) {
      onResultChange({
        riskLevel: amlResult.riskLevel,
        sourceOfFundsRequired: amlResult.sourceOfFundsRequired,
        goamlTriggerLikely: amlResult.goamlTriggerLikely,
        requiredDocuments: amlResult.requiredDocuments,
      });
    }
  };

  const handleFlagChange = (flag: keyof typeof buyerFlags, value: boolean) => {
    setBuyerFlags(prev => ({ ...prev, [flag]: value }));
  };

  const riskConfig = result ? RISK_LEVEL_CONFIG[result.riskLevel] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            AML Risk Assessment
          </CardTitle>
          {result && (
            <Badge 
              variant="outline" 
              className={cn(riskConfig?.bg, riskConfig?.border, riskConfig?.color)}
            >
              {result.riskLevel} Risk
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Deal Value (AED)</Label>
            <Input
              type="number"
              value={dealValue || ""}
              onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)}
              placeholder="Enter deal value in AED"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Buyer Profile Flags */}
        <div className="space-y-3">
          <Label className="text-muted-foreground">Buyer Profile Flags</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">PEP Declared</span>
                <p className="text-xs text-muted-foreground">Politically Exposed Person</p>
              </div>
              <Switch
                checked={buyerFlags.pep_declared}
                onCheckedChange={(v) => handleFlagChange("pep_declared", v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Unusual Urgency</span>
                <p className="text-xs text-muted-foreground">Rushing to close deal</p>
              </div>
              <Switch
                checked={buyerFlags.unusual_urgency}
                onCheckedChange={(v) => handleFlagChange("unusual_urgency", v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Complex Structure</span>
                <p className="text-xs text-muted-foreground">Multiple entities/layers</p>
              </div>
              <Switch
                checked={buyerFlags.complex_structure}
                onCheckedChange={(v) => handleFlagChange("complex_structure", v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Sanctions Concern</span>
                <p className="text-xs text-muted-foreground">Potential sanctions risk</p>
              </div>
              <Switch
                checked={buyerFlags.sanctions_concern}
                onCheckedChange={(v) => handleFlagChange("sanctions_concern", v)}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleCheck} 
          disabled={isLoading || dealValue <= 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Run AML Assessment
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <>
            <Separator />

            {/* Risk Level Banner */}
            <div className={cn(
              "p-4 rounded-lg flex items-start gap-3",
              riskConfig?.bg,
              "border",
              riskConfig?.border
            )}>
              {riskConfig && <riskConfig.icon className={cn("h-6 w-6 flex-shrink-0", riskConfig.color)} />}
              <div className="flex-1">
                <p className={cn("font-semibold", riskConfig?.color)}>
                  {result.riskLevel} Risk Level
                </p>
                {result.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{result.notes}</p>
                )}
              </div>
            </div>

            {/* Key Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "p-4 rounded-lg border",
                result.sourceOfFundsRequired 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : "bg-green-500/10 border-green-500/30"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {result.sourceOfFundsRequired ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium text-sm">Source of Funds</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.sourceOfFundsRequired 
                    ? "Required - must collect SOF documentation" 
                    : "Not required for this transaction"
                  }
                </p>
              </div>

              <div className={cn(
                "p-4 rounded-lg border",
                result.goamlTriggerLikely 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-green-500/10 border-green-500/30"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {result.goamlTriggerLikely ? (
                    <AlertOctagon className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium text-sm">goAML Reporting</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.goamlTriggerLikely 
                    ? "Likely triggered - prepare STR" 
                    : "Not expected to trigger reporting"
                  }
                </p>
              </div>
            </div>

            {/* Required Documents */}
            {result.requiredDocuments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Required Documents
                </h4>
                <div className="space-y-2">
                  {result.requiredDocuments.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {idx + 1}
                      </div>
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                This is an operational assessment only and does not constitute legal advice. 
                If requirements are uncertain, verify with ADM before proceeding.
              </p>
            </div>
          </>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
