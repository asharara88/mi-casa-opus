import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { ComplianceStatus } from "@/types/compliance";

interface ComplianceStatusBannerProps {
  status: ComplianceStatus;
  escalationReason?: string | null;
  failedCount?: number;
}

export function ComplianceStatusBanner({
  status,
  escalationReason,
  failedCount = 0,
}: ComplianceStatusBannerProps) {
  const config = {
    APPROVED: {
      title: "Compliance Approved",
      description: "All compliance checks passed. This entity meets all regulatory requirements.",
      icon: CheckCircle2,
      variant: "default" as const,
      className: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
    },
    BLOCKED: {
      title: "Compliance Blocked",
      description: `${failedCount} compliance requirement${failedCount !== 1 ? 's' : ''} must be addressed before proceeding.`,
      icon: XCircle,
      variant: "destructive" as const,
      className: "border-destructive/50 bg-destructive/10",
    },
    ESCALATED: {
      title: "Escalation Required",
      description: escalationReason 
        ? `Requires Compliance Officer review: ${escalationReason}`
        : "This entity requires review by a Compliance Officer or Managing Director.",
      icon: AlertTriangle,
      variant: "default" as const,
      className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
  };

  const { title, description, icon: Icon, className } = config[status];

  return (
    <Alert className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
