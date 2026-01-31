import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  RefreshCw, 
  UserCheck, 
  CheckCircle2, 
  XCircle,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useKYCCheck } from "@/hooks/useManifestExecutor";

interface KYCCheckPanelProps {
  landlordIdPresent?: boolean;
  tenantIdPresent?: boolean;
  ownershipProofPresent?: boolean;
  onCheckComplete?: (result: { status: string; missing: string[] }) => void;
}

export function KYCCheckPanel({
  landlordIdPresent: initialLandlordId = false,
  tenantIdPresent: initialTenantId = false,
  ownershipProofPresent: initialOwnershipProof = false,
  onCheckComplete
}: KYCCheckPanelProps) {
  const { checkKYC, isLoading, error } = useKYCCheck();
  
  const [landlordId, setLandlordId] = useState(initialLandlordId);
  const [tenantId, setTenantId] = useState(initialTenantId);
  const [ownershipProof, setOwnershipProof] = useState(initialOwnershipProof);
  const [result, setResult] = useState<{ status: "COMPLETE" | "INCOMPLETE"; missing: string[] } | null>(null);

  useEffect(() => {
    setLandlordId(initialLandlordId);
    setTenantId(initialTenantId);
    setOwnershipProof(initialOwnershipProof);
  }, [initialLandlordId, initialTenantId, initialOwnershipProof]);

  const handleCheck = async () => {
    const checkResult = await checkKYC(landlordId, tenantId, ownershipProof);
    setResult(checkResult);
    onCheckComplete?.(checkResult);
  };

  const isComplete = result?.status === "COMPLETE";
  const documentCount = [landlordId, tenantId, ownershipProof].filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5" />
            KYC Completeness Check
          </CardTitle>
          {result && (
            <Badge variant={isComplete ? "default" : "destructive"}>
              {isComplete ? "Complete" : "Incomplete"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Verify KYC documents for leasing transactions
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Checklist */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Required Documents</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg border">
              <Checkbox
                id="landlord-id"
                checked={landlordId}
                onCheckedChange={(checked) => setLandlordId(checked === true)}
              />
              <label 
                htmlFor="landlord-id" 
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Landlord ID / Emirates ID</span>
              </label>
              {landlordId ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg border">
              <Checkbox
                id="tenant-id"
                checked={tenantId}
                onCheckedChange={(checked) => setTenantId(checked === true)}
              />
              <label 
                htmlFor="tenant-id" 
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tenant ID / Emirates ID</span>
              </label>
              {tenantId ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg border">
              <Checkbox
                id="ownership-proof"
                checked={ownershipProof}
                onCheckedChange={(checked) => setOwnershipProof(checked === true)}
              />
              <label 
                htmlFor="ownership-proof" 
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Ownership / Authority Proof</span>
              </label>
              {ownershipProof ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {documentCount}/3 documents present
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className={`p-4 rounded-lg ${isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border`}>
            <div className="flex items-start gap-3">
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${isComplete ? 'text-green-800' : 'text-amber-800'}`}>
                  {isComplete ? "KYC Requirements Met" : "KYC Incomplete"}
                </p>
                {!isComplete && result.missing.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.missing.map((item, idx) => (
                      <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                        <XCircle className="h-3 w-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleCheck}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Verify KYC Completeness
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
