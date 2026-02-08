import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Phone,
  Send,
  Edit2,
  User,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSendWhatsApp, useSendSMS, useSendEmail } from '@/hooks/useCommunications';
import { toast } from 'sonner';
import type { ActivityEntityType } from '@/types/bos';

export interface FollowUpAction {
  entity_type: 'prospect' | 'lead' | 'deal';
  entity_id: string;
  entity_db_id?: string;
  recipient_name: string;
  recipient_phone?: string;
  recipient_email?: string;
  suggested_message: string;
  channel: 'whatsapp' | 'sms' | 'email';
  follow_up_type: string;
  subject?: string;
}

interface FollowUpActionCardProps {
  action: FollowUpAction;
  onSent?: () => void;
}

export function FollowUpActionCard({ action, onSent }: FollowUpActionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(action.suggested_message);
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms' | 'email'>(action.channel);
  const [isSent, setIsSent] = useState(false);

  const sendWhatsApp = useSendWhatsApp();
  const sendSMS = useSendSMS();
  const sendEmail = useSendEmail();

  const isSending = sendWhatsApp.isPending || sendSMS.isPending || sendEmail.isPending;

  const canSendWhatsApp = !!action.recipient_phone;
  const canSendSMS = !!action.recipient_phone;
  const canSendEmail = !!action.recipient_email;

  const handleSend = async () => {
    try {
      const entityType = action.entity_type as ActivityEntityType;
      const entityId = action.entity_db_id || action.entity_id;

      if (selectedChannel === 'whatsapp' && action.recipient_phone) {
        await sendWhatsApp.mutateAsync({
          to: action.recipient_phone,
          content: editedMessage,
          entityType,
          entityId,
        });
      } else if (selectedChannel === 'sms' && action.recipient_phone) {
        await sendSMS.mutateAsync({
          to: action.recipient_phone,
          content: editedMessage,
          entityType,
          entityId,
        });
      } else if (selectedChannel === 'email' && action.recipient_email) {
        await sendEmail.mutateAsync({
          to: [action.recipient_email],
          template: 'follow_up',
          subject: action.subject || 'Following up on your property search',
          variables: {
            message: editedMessage,
            recipient_name: action.recipient_name,
          },
          entityType,
          entityId,
        });
      }

      setIsSent(true);
      onSent?.();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (isSent) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Message sent to {action.recipient_name}</p>
              <p className="text-sm text-muted-foreground">
                via {selectedChannel === 'whatsapp' ? 'WhatsApp' : selectedChannel === 'sms' ? 'SMS' : 'Email'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 px-4 py-3 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedChannel === 'whatsapp' && <MessageSquare className="w-4 h-4 text-primary" />}
            {selectedChannel === 'sms' && <Phone className="w-4 h-4 text-primary" />}
            {selectedChannel === 'email' && <Mail className="w-4 h-4 text-primary" />}
            <span className="font-medium text-sm">
              {selectedChannel === 'whatsapp' ? 'WhatsApp' : selectedChannel === 'sms' ? 'SMS' : 'Email'} to {action.recipient_name}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {action.entity_type.toUpperCase()} · {action.follow_up_type.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Message Preview/Editor */}
        {isEditing ? (
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows={4}
            className="text-sm"
            autoFocus
          />
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
            {editedMessage}
          </div>
        )}

        {/* Channel Selector */}
        <Tabs value={selectedChannel} onValueChange={(v) => setSelectedChannel(v as typeof selectedChannel)}>
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="whatsapp" disabled={!canSendWhatsApp} className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="sms" disabled={!canSendSMS} className="text-xs">
              <Phone className="w-3 h-3 mr-1" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" disabled={!canSendEmail} className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Email
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            {isEditing ? 'Done Editing' : 'Edit'}
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={isSending || !editedMessage.trim()}
            className="flex-1"
          >
            {isSending ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Send className="w-3 h-3 mr-1" />
            )}
            Send {selectedChannel === 'whatsapp' ? 'WhatsApp' : selectedChannel === 'sms' ? 'SMS' : 'Email'}
          </Button>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          {action.recipient_phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {action.recipient_phone}
            </span>
          )}
          {action.recipient_email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {action.recipient_email}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Parse follow-up action blocks from AI response
const FOLLOWUP_ACTION_REGEX = /\[FOLLOWUP_ACTION\]([\s\S]*?)\[\/FOLLOWUP_ACTION\]/g;

export function parseFollowUpActions(response: string): { text: string; actions: FollowUpAction[] } {
  const actions: FollowUpAction[] = [];
  
  const text = response.replace(FOLLOWUP_ACTION_REGEX, (_, content: string) => {
    try {
      const action = parseYamlLikeBlock(content.trim());
      if (action.entity_type && action.recipient_name && action.suggested_message) {
        actions.push(action as FollowUpAction);
      }
    } catch (e) {
      console.error('[FollowUp] Failed to parse action block:', e);
    }
    return '';
  });
  
  return { text: text.trim(), actions };
}

function parseYamlLikeBlock(content: string): Partial<FollowUpAction> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    result[key] = value;
  }
  
  return {
    entity_type: result.entity_type as FollowUpAction['entity_type'],
    entity_id: result.entity_id,
    entity_db_id: result.entity_db_id,
    recipient_name: result.recipient_name,
    recipient_phone: result.recipient_phone,
    recipient_email: result.recipient_email,
    suggested_message: result.suggested_message,
    channel: (result.channel || 'whatsapp') as FollowUpAction['channel'],
    follow_up_type: result.follow_up_type || 'general_checkin',
    subject: result.subject,
  };
}
