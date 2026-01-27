import React from 'react';
import { format } from 'date-fns';
import { MessageCircle, Phone, Mail, CheckCheck, Clock, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommunicationLogs, CommunicationLog, MessageStatus } from '@/hooks/useCommunications';

interface CommunicationHistoryProps {
  entityType: string;
  entityId: string;
}

const channelIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4 text-green-500" />,
  sms: <Phone className="h-4 w-4 text-blue-500" />,
  email: <Mail className="h-4 w-4 text-purple-500" />,
};

const statusIcons: Record<MessageStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3 text-muted-foreground" />,
  sent: <CheckCheck className="h-3 w-3 text-muted-foreground" />,
  delivered: <CheckCheck className="h-3 w-3 text-green-500" />,
  read: <Eye className="h-3 w-3 text-blue-500" />,
  failed: <XCircle className="h-3 w-3 text-destructive" />,
};

const statusColors: Record<MessageStatus, string> = {
  pending: 'secondary',
  sent: 'secondary',
  delivered: 'default',
  read: 'default',
  failed: 'destructive',
};

export function CommunicationHistory({ entityType, entityId }: CommunicationHistoryProps) {
  const { data: logs, isLoading } = useCommunicationLogs(entityType, entityId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!logs?.length) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No messages yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Communication History</span>
          <Badge variant="secondary">{logs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-4 pt-0">
            {logs.map((log) => (
              <CommunicationLogItem key={log.id} log={log} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CommunicationLogItem({ log }: { log: CommunicationLog }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="mt-0.5">
        {channelIcons[log.channel]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium capitalize">{log.channel}</span>
          {log.template_used && (
            <Badge variant="outline" className="text-xs">
              {log.template_used.replace(/_/g, ' ')}
            </Badge>
          )}
          <Badge variant={statusColors[log.status] as any} className="text-xs flex items-center gap-1">
            {statusIcons[log.status]}
            {log.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {log.content}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>
            {log.sent_at 
              ? format(new Date(log.sent_at), 'MMM d, h:mm a')
              : format(new Date(log.created_at), 'MMM d, h:mm a')
            }
          </span>
          {log.delivered_at && (
            <span className="text-green-600">
              • Delivered {format(new Date(log.delivered_at), 'h:mm a')}
            </span>
          )}
          {log.read_at && (
            <span className="text-blue-600">
              • Read {format(new Date(log.read_at), 'h:mm a')}
            </span>
          )}
        </div>
        {log.error_message && (
          <p className="text-xs text-destructive mt-1">
            Error: {log.error_message}
          </p>
        )}
      </div>
    </div>
  );
}
