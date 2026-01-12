import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { ComplianceStatus } from "@/types/compliance";

interface ComplianceGateButtonProps {
  status: ComplianceStatus;
  labelApproved?: string;
  labelBlocked?: string;
  labelEscalated?: string;
  onClick: () => void;
  isLoading?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ComplianceGateButton({
  status,
  labelApproved = "Proceed",
  labelBlocked = "Blocked - Fix Issues",
  labelEscalated = "Pending Approval",
  onClick,
  isLoading = false,
  size = "default",
  className = "",
}: ComplianceGateButtonProps) {
  const disabled = status !== "APPROVED" || isLoading;
  
  const config = {
    APPROVED: {
      label: labelApproved,
      icon: CheckCircle2,
      variant: "default" as const,
    },
    BLOCKED: {
      label: labelBlocked,
      icon: XCircle,
      variant: "destructive" as const,
    },
    ESCALATED: {
      label: labelEscalated,
      icon: AlertTriangle,
      variant: "secondary" as const,
    },
  };

  const { label, icon: Icon, variant } = config[status];

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={`w-full ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Icon className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Evaluating..." : label}
    </Button>
  );
}
