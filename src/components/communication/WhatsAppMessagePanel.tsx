import React, { useState } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSendWhatsApp } from '@/hooks/useCommunications';

interface WhatsAppMessagePanelProps {
  entityType: 'prospect' | 'lead' | 'deal';
  entityId: string;
  recipientName: string;
  recipientPhone: string | null;
}

const messageTemplates = [
  { id: 'new_listing_alert', name: 'New Listing Alert', description: 'Notify about matching properties' },
  { id: 'viewing_reminder', name: 'Viewing Reminder', description: 'Remind about scheduled viewing' },
  { id: 'follow_up', name: 'Follow Up', description: 'Follow up on previous conversation' },
  { id: 'document_request', name: 'Document Request', description: 'Request required documents' },
  { id: 'booking_confirmation', name: 'Booking Confirmation', description: 'Confirm property booking' },
  { id: 'custom', name: 'Custom Message', description: 'Write a custom message' },
];

export function WhatsAppMessagePanel({
  entityType,
  entityId,
  recipientName,
  recipientPhone,
}: WhatsAppMessagePanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({
    name: recipientName,
  });

  const sendWhatsApp = useSendWhatsApp();

  const handleSend = () => {
    if (!recipientPhone) return;

    const params: any = {
      to: recipientPhone,
      entityType,
      entityId,
      variables,
    };

    if (selectedTemplate === 'custom') {
      params.content = customMessage;
    } else {
      params.template = selectedTemplate;
    }

    sendWhatsApp.mutate(params);
  };

  const isReady = recipientPhone && (selectedTemplate === 'custom' ? customMessage.trim() : selectedTemplate);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-green-500" />
          Send WhatsApp Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recipientPhone ? (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            No phone number available for this contact.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">To:</span>
              <Badge variant="secondary">{recipientName}</Badge>
              <span className="text-muted-foreground">{recipientPhone}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {selectedTemplate && selectedTemplate !== 'custom' && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                Template will be personalized with recipient's name and relevant details.
              </div>
            )}

            <Button 
              onClick={handleSend} 
              disabled={!isReady || sendWhatsApp.isPending}
              className="w-full"
            >
              {sendWhatsApp.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send WhatsApp
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
