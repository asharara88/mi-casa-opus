import { AlertCircle } from "lucide-react";

interface RequiredActionListProps {
  actions: string[];
}

export function RequiredActionList({ actions }: RequiredActionListProps) {
  if (!actions?.length) return null;

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <h4 className="font-semibold text-destructive">
          Required Actions ({actions.length})
        </h4>
      </div>
      
      <ul className="space-y-2">
        {actions.map((action, index) => (
          <li 
            key={index} 
            className="flex items-start gap-2 text-sm"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center font-medium mt-0.5">
              {index + 1}
            </span>
            <span className="text-foreground">{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
