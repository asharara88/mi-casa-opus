import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Building2
} from 'lucide-react';
import { RegistryAction } from '@/types/bos';
import { cn } from '@/lib/utils';

interface RegistryActionsChecklistProps {
  actions: RegistryAction[];
  onActionClick?: (action: RegistryAction) => void;
  onSubmitAction?: (actionId: string) => void;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  NOC: { 
    label: 'NOC Application', 
    icon: <FileText className="h-4 w-4" />,
    description: 'No Objection Certificate from developer/community'
  },
  TitleDeed: { 
    label: 'Title Deed Transfer', 
    icon: <Building2 className="h-4 w-4" />,
    description: 'Property ownership transfer at Land Department'
  },
  Ejari: { 
    label: 'Ejari Registration', 
    icon: <FileText className="h-4 w-4" />,
    description: 'Tenancy contract registration (for rentals)'
  },
  OQOOD: { 
    label: 'OQOOD Registration', 
    icon: <FileText className="h-4 w-4" />,
    description: 'Off-plan property registration'
  },
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending: { 
    color: 'bg-muted text-muted-foreground', 
    icon: <Clock className="h-3 w-3" /> 
  },
  Submitted: { 
    color: 'bg-blue-500/20 text-blue-600', 
    icon: <Clock className="h-3 w-3 animate-spin" /> 
  },
  Completed: { 
    color: 'bg-emerald/20 text-emerald', 
    icon: <CheckCircle className="h-3 w-3" /> 
  },
  Failed: { 
    color: 'bg-destructive/20 text-destructive', 
    icon: <AlertCircle className="h-3 w-3" /> 
  },
};

export const RegistryActionsChecklist: React.FC<RegistryActionsChecklistProps> = ({
  actions,
  onActionClick,
  onSubmitAction,
}) => {
  const completedCount = actions.filter(a => a.status === 'Completed').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Registry Actions</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{actions.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const config = ACTION_CONFIG[action.action_type] || {
            label: action.action_type,
            icon: <FileText className="h-4 w-4" />,
            description: '',
          };
          const statusConfig = STATUS_CONFIG[action.status];

          return (
            <div
              key={action.action_id}
              className={cn(
                'p-3 rounded-lg border transition-colors',
                action.status === 'Completed' && 'bg-emerald/5 border-emerald/20',
                action.status === 'Failed' && 'bg-destructive/5 border-destructive/20',
                onActionClick && 'cursor-pointer hover:bg-muted/50'
              )}
              onClick={() => onActionClick?.(action)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  action.status === 'Completed' ? 'bg-emerald/20 text-emerald' : 'bg-muted text-muted-foreground'
                )}>
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {config.label}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', statusConfig.color)}
                    >
                      {statusConfig.icon}
                      <span className="ml-1">{action.status}</span>
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>

                  {action.reference_no && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Ref:</span>
                      <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                        {action.reference_no}
                      </code>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}

                  {action.completed_at && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Completed: {new Date(action.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {action.status === 'Pending' && onSubmitAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubmitAction(action.action_id);
                    }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {actions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No registry actions required</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
