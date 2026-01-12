import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Megaphone } from "lucide-react";

interface AdCompliancePreviewProps {
  brokerageLicenseNumber?: string;
  brokerName?: string;
  brokerLicenseNumber?: string;
  madhmounListingId?: string;
  madhmounStatus?: string;
  priceText?: string;
}

export function AdCompliancePreview({
  brokerageLicenseNumber,
  brokerName,
  brokerLicenseNumber,
  madhmounListingId,
  madhmounStatus,
  priceText,
}: AdCompliancePreviewProps) {
  const hasBrokerageLicense = !!brokerageLicenseNumber;
  const hasBrokerInfo = !!brokerName && !!brokerLicenseNumber;
  const hasMadhmoun = !!madhmounListingId && madhmounStatus === "VERIFIED";
  const hasValidPrice = priceText && !/(from|starting)/i.test(priceText);

  const allValid = hasBrokerageLicense && hasBrokerInfo && hasMadhmoun && hasValidPrice !== false;

  const renderField = (label: string, value?: string, isValid?: boolean) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value || "—"}</span>
        {isValid !== undefined && (
          isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-semibold">Ad Compliance Preview</h4>
        </div>
        <Badge 
          variant={allValid ? "outline" : "destructive"}
          className={allValid ? "bg-green-500/10 text-green-700 border-green-500/30" : ""}
        >
          {allValid ? "Ready to Publish" : "Missing Requirements"}
        </Badge>
      </div>

      <div className="space-y-0">
        {renderField("Brokerage License #", brokerageLicenseNumber, hasBrokerageLicense)}
        {renderField("Broker Name", brokerName, !!brokerName)}
        {renderField("Broker License #", brokerLicenseNumber, !!brokerLicenseNumber)}
        {renderField(
          "Madhmoun ID", 
          madhmounListingId ? `${madhmounListingId} (${madhmounStatus || 'Unknown'})` : undefined, 
          hasMadhmoun
        )}
        {renderField("Price Text", priceText, hasValidPrice !== false)}
      </div>

      {priceText && /(from|starting)/i.test(priceText) && (
        <p className="mt-3 text-xs text-destructive">
          ⚠️ Price text contains prohibited language ("from"/"starting"). Use exact approved price.
        </p>
      )}

      {!hasMadhmoun && madhmounListingId && (
        <p className="mt-3 text-xs text-destructive">
          ⚠️ Madhmoun listing must be VERIFIED before advertising.
        </p>
      )}
    </div>
  );
}
