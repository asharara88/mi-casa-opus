import React, { useState } from 'react';
import { Phone, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSendSMS } from '@/hooks/useCommunications';

interface SMSNotificationButtonProps {
  entityType: 'prospect' | 'lead' | 'deal';
  entityId: string;
  recipientName: string;
  recipientPhone: string | null;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const smsTemplates = [
  { id: 'new_listing_alert', name: 'New Listing Alert' },
  { id: 'viewing_reminder', name: 'Viewing Reminder' },
  { id: 'follow_up', name: 'Follow Up' },
  { id: 'document_request', name: 'Document Request' },
  { id: 'booking_confirmation', name: 'Booking Confirmation' },
];

export function SMSNotificationButton({
  entityType,
  entityId,
  recipientName,
  recipientPhone,
  variant = 'outline',
  size = 'sm',
}: SMSNotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sendSMS = useSendSMS();

  const handleSendTemplate = (templateId: string) => {
    if (!recipientPhone) return;

    sendSMS.mutate({
      to: recipientPhone,
      template: templateId,
      variables: { name: recipientName },
      entityType,
      entityId,
    });
    setIsOpen(false);
  };

  if (!recipientPhone) {
    return (
      <Button variant={variant} size={size} disabled>
        <Phone className="h-4 w-4 mr-2" />
        No Phone
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={sendSMS.isPending}>
          {sendSMS.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Phone className="h-4 w-4 mr-2" />
          )}
          SMS
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {smsTemplates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => handleSendTemplate(template.id)}
          >
            <Send className="h-4 w-4 mr-2" />
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
