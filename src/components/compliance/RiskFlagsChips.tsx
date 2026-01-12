import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, Users, Globe, Banknote } from "lucide-react";
import type { AmlFlags } from "@/types/compliance";

interface RiskFlagsChipsProps {
  flags?: AmlFlags;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

const FLAG_CONFIG = {
  cashInvolved: {
    label: "Cash Payment",
    icon: DollarSign,
    description: "Transaction involves cash payment",
  },
  foreignPEP: {
    label: "Foreign PEP",
    icon: Users,
    description: "Politically Exposed Person from foreign jurisdiction",
  },
  thirdPartyPayments: {
    label: "Third Party",
    icon: Banknote,
    description: "Payment from third party source",
  },
  sanctionedCountry: {
    label: "Sanctioned Country",
    icon: Globe,
    description: "Connection to sanctioned jurisdiction",
  },
  unusualTransaction: {
    label: "Unusual Pattern",
    icon: AlertTriangle,
    description: "Transaction shows unusual patterns",
  },
};

const RISK_COLORS = {
  LOW: "bg-green-500/10 text-green-700 border-green-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  HIGH: "bg-destructive/10 text-destructive border-destructive/30",
};

export function RiskFlagsChips({ flags, riskLevel }: RiskFlagsChipsProps) {
  const activeFlags = Object.entries(flags || {}).filter(([, value]) => value);

  if (!activeFlags.length && !riskLevel) return null;

  return (
    <div className="space-y-3">
      {riskLevel && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">AML Risk Level:</span>
          <Badge 
            variant="outline" 
            className={`${RISK_COLORS[riskLevel]} font-semibold`}
          >
            {riskLevel}
          </Badge>
        </div>
      )}

      {activeFlags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Risk Flags:</span>
          <div className="flex flex-wrap gap-2">
            {activeFlags.map(([key]) => {
              const config = FLAG_CONFIG[key as keyof typeof FLAG_CONFIG];
              if (!config) return null;
              
              const Icon = config.icon;
              
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/30 gap-1.5"
                  title={config.description}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
