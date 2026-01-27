import React, { useState } from 'react';
import { Mail, Send, Loader2, Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSendEmail } from '@/hooks/useCommunications';

const emailTemplates = [
  { id: 'new_listing_alert', name: 'New Listing Alert', description: 'Notify about matching properties' },
  { id: 'viewing_confirmation', name: 'Viewing Confirmation', description: 'Confirm scheduled viewing' },
  { id: 'viewing_reminder', name: 'Viewing Reminder', description: '24-hour reminder before viewing' },
  { id: 'document_request', name: 'Document Request', description: 'Request required documents' },
  { id: 'deal_milestone', name: 'Deal Milestone', description: 'Update on deal progress' },
];

interface EmailCampaignBuilderProps {
  onClose?: () => void;
}

export function EmailCampaignBuilder({ onClose }: EmailCampaignBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});

  const sendEmail = useSendEmail();

  const addRecipient = () => {
    if (newEmail && !recipients.includes(newEmail)) {
      setRecipients([...recipients, newEmail]);
      setNewEmail('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSend = () => {
    if (!selectedTemplate || recipients.length === 0) return;

    sendEmail.mutate({
      to: recipients,
      template: selectedTemplate,
      variables,
      subject: subject || undefined,
    });
  };

  const isReady = selectedTemplate && recipients.length > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Campaign Builder
        </CardTitle>
        <CardDescription>
          Send targeted email campaigns to your prospects and leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipients */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Add email address..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
            />
            <Button type="button" variant="outline" onClick={addRecipient}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {recipients.map((email) => (
                <Badge key={email} variant="secondary" className="pr-1">
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Template</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {emailTemplates.map((template) => (
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

        {/* Custom Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Subject Line <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            placeholder="Override default subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Template Variables */}
        {selectedTemplate && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Personalization Variables</label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Property name"
                value={variables.property || ''}
                onChange={(e) => setVariables({ ...variables, property: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={variables.location || ''}
                onChange={(e) => setVariables({ ...variables, location: e.target.value })}
              />
              <Input
                placeholder="Price"
                value={variables.price || ''}
                onChange={(e) => setVariables({ ...variables, price: e.target.value })}
              />
              <Input
                placeholder="Agent name"
                value={variables.agent_name || ''}
                onChange={(e) => setVariables({ ...variables, agent_name: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSend} 
            disabled={!isReady || sendEmail.isPending}
          >
            {sendEmail.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
