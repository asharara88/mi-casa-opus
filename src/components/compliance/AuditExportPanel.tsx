import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  RefreshCw, 
  FileArchive, 
  CheckCircle2, 
  XCircle,
  FileText,
  AlertTriangle,
  Download,
  ClipboardList
} from "lucide-react";
import { useManifestExecutor } from "@/hooks/useManifestExecutor";

type DealType = "sales" | "leasing";

interface AuditExportPanelProps {
  dealType?: DealType;
  propertyRef?: string;
  documentsPresent?: string[];
  onExportReady?: (result: AuditExportResult) => void;
}

interface AuditExportResult {
  status: "AUDIT-READY" | "INCOMPLETE";
  bundle_list: string[];
  missing: string[];
  closeout_steps: string[];
}

const COMMON_DOCUMENTS = [
  "Signed Brokerage Contract",
  "Client ID / Emirates ID",
  "Ownership Proof / Title Deed",
  "AML Assessment",
  "Offer Letter",
  "MOU / Agreement",
  "Commission Invoice",
  "Payment Receipt",
  "Transfer Certificate",
  "Tawtheeq / Ejari"
];

export function AuditExportPanel({
  dealType = "sales",
  propertyRef = "",
  documentsPresent: initialDocs = [],
  onExportReady
}: AuditExportPanelProps) {
  const { execute, isLoading, error } = useManifestExecutor();
  
  const [selectedDealType, setSelectedDealType] = useState<DealType>(dealType);
  const [propRef, setPropRef] = useState(propertyRef);
  const [selectedDocs, setSelectedDocs] = useState<string[]>(initialDocs);
  const [result, setResult] = useState<AuditExportResult | null>(null);

  const toggleDocument = (doc: string) => {
    setSelectedDocs(prev => 
      prev.includes(doc) 
        ? prev.filter(d => d !== doc)
        : [...prev, doc]
    );
  };

  const handleGenerateIndex = async () => {
    const response = await execute({
      promptId: "ADMIN_DOC_INDEX",
      inputPayload: {
        deal_type: selectedDealType,
        property_ref: propRef,
        documents_present: selectedDocs
      }
    });

    if (response.success) {
      // After generating index, run audit check
      const auditResponse = await execute({
        promptId: "ADMIN_AUDIT_EXPORT",
        inputPayload: {
          deal_type: selectedDealType,
          property_ref: propRef,
          documents_present: selectedDocs
        }
      });

      if (auditResponse.success) {
        const auditResult: AuditExportResult = {
          status: (auditResponse as any).audit_status || "INCOMPLETE",
          bundle_list: (auditResponse as any).bundle_list || [],
          missing: (auditResponse as any).missing || [],
          closeout_steps: (auditResponse as any).closeout_steps || []
        };
        setResult(auditResult);
        onExportReady?.(auditResult);
      }
    }
  };

  const isAuditReady = result?.status === "AUDIT-READY";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileArchive className="h-5 w-5" />
            Audit Export Checklist
          </CardTitle>
          {result && (
            <Badge variant={isAuditReady ? "default" : "destructive"}>
              {isAuditReady ? "Audit Ready" : "Incomplete"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Prepare audit-ready document bundle for the deal folder
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configuration */}
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
            <label className="text-sm font-medium">Property Reference</label>
            <Input
              value={propRef}
              onChange={(e) => setPropRef(e.target.value)}
              placeholder="e.g., APT-101-AL-REEM"
            />
          </div>
        </div>

        {/* Document Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Documents Present ({selectedDocs.length})
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
            {COMMON_DOCUMENTS.map((doc) => (
              <div key={doc} className="flex items-center gap-2">
                <Checkbox
                  id={doc}
                  checked={selectedDocs.includes(doc)}
                  onCheckedChange={() => toggleDocument(doc)}
                />
                <label 
                  htmlFor={doc} 
                  className="text-xs cursor-pointer truncate"
                  title={doc}
                >
                  {doc}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg ${isAuditReady ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="flex items-start gap-3">
                {isAuditReady ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${isAuditReady ? 'text-green-800' : 'text-amber-800'}`}>
                    {isAuditReady ? "Deal is Audit-Ready" : "Missing Required Documents"}
                  </p>
                  {!isAuditReady && result.missing.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.missing.map((item, idx) => (
                        <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                          <XCircle className="h-3 w-3 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Bundle List */}
            {result.bundle_list.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">PDF Bundle Contents</h4>
                <ul className="space-y-1 p-2 border rounded-lg bg-muted/30">
                  {result.bundle_list.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Closeout Steps */}
            {result.closeout_steps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Closeout Steps</h4>
                <ol className="space-y-1 p-2 border rounded-lg">
                  {result.closeout_steps.map((step, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground font-medium">
                        {idx + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Export Button */}
            {isAuditReady && (
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Audit Bundle (PDF)
              </Button>
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
          onClick={handleGenerateIndex}
          disabled={isLoading || !propRef}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileArchive className="h-4 w-4 mr-2" />
              Generate Audit Checklist
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
