import { Clock, FileText, CheckCircle2 } from "lucide-react";

interface AuditTrailSummaryProps {
  entriesCount: number;
  createdAt?: string;
  lastActionAt?: string;
  lastAction?: string;
}

export function AuditTrailSummary({
  entriesCount,
  createdAt,
  lastActionAt,
  lastAction,
}: AuditTrailSummaryProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const isCompliant = entriesCount >= 1 && !!createdAt;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h4 className="font-semibold">Audit Trail</h4>
        {isCompliant && (
          <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Created
          </p>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {formatDate(createdAt)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Log Entries
          </p>
          <p className="text-sm font-medium">
            {entriesCount ?? 0} {entriesCount === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {lastActionAt && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Last Activity
            </p>
            <p className="text-sm font-medium">
              {formatDate(lastActionAt)}
            </p>
          </div>
        )}

        {lastAction && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Last Action
            </p>
            <p className="text-sm font-medium truncate" title={lastAction}>
              {lastAction}
            </p>
          </div>
        )}
      </div>

      {!isCompliant && (
        <p className="mt-3 text-xs text-destructive">
          ⚠️ Audit trail incomplete. Minimum 1 log entry with creation timestamp required.
        </p>
      )}
    </div>
  );
}
