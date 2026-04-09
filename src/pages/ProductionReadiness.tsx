import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Shield,
  Database,
  HardDrive,
  Key,
  Plug,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CheckResult {
  id: string;
  category: string;
  name: string;
  status: "pass" | "fail" | "warn";
  detail: string;
}

interface AuditResponse {
  timestamp: string;
  summary: { total: number; passed: number; warned: number; failed: number };
  results: CheckResult[];
}

const categoryIcons: Record<string, React.ElementType> = {
  Storage: HardDrive,
  Secrets: Key,
  Database: Database,
  "Database Functions": Wrench,
  Integrations: Plug,
};

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Pass" },
  warn: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", label: "Warning" },
  fail: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Fail" },
};

export default function ProductionReadiness() {
  const [runKey, setRunKey] = useState(0);

  const { data, isLoading, error, refetch } = useQuery<AuditResponse>({
    queryKey: ["production-readiness-audit", runKey],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("You must be logged in to run the audit");

      const res = await supabase.functions.invoke("production-readiness-audit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw res.error;
      return res.data as AuditResponse;
    },
    retry: false,
    staleTime: 0,
  });

  const grouped = data?.results.reduce<Record<string, CheckResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {}) ?? {};

  const score = data ? Math.round((data.summary.passed / data.summary.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Production Readiness Audit
            </h1>
            <p className="text-sm text-muted-foreground">
              System health check for storage, secrets, database, and integrations
            </p>
          </div>
          <Button
            onClick={() => { setRunKey((k) => k + 1); refetch(); }}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Auditing…" : "Run Audit"}
          </Button>
        </div>

        {/* Score Card */}
        {data && (
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-4xl font-bold text-foreground">{score}%</div>
                  <div className="text-sm text-muted-foreground">
                    {data.summary.passed} passed · {data.summary.warned} warnings · {data.summary.failed} failed
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  Last run: {new Date(data.timestamp).toLocaleString()}
                </div>
              </div>
              <Progress
                value={score}
                className="h-3"
              />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">
                {(error as Error).message || "Failed to run audit. Make sure you're logged in."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading skeleton */}
        {isLoading && !data && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border bg-card animate-pulse">
                <CardHeader><div className="h-5 w-32 bg-muted rounded" /></CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-10 bg-muted/50 rounded" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results by category */}
        {data && Object.entries(grouped).map(([category, checks]) => {
          const Icon = categoryIcons[category] ?? Database;
          const catPassed = checks.filter((c) => c.status === "pass").length;
          return (
            <Card key={category} className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {category}
                  </span>
                  <Badge variant="outline" className="text-xs font-normal">
                    {catPassed}/{checks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {checks.map((check) => {
                  const cfg = statusConfig[check.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={check.id}
                      className={`flex items-center gap-3 p-2.5 rounded-md ${cfg.bg}`}
                    >
                      <StatusIcon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {check.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {check.detail}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${cfg.color} border-current/20`}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {!data && !isLoading && !error && (
          <Card className="border-border bg-card">
            <CardContent className="pt-12 pb-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">
                Click <strong>Run Audit</strong> to check production readiness
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
