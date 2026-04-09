import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone,
  User,
  Loader2,
  RefreshCw,
  Eye,
  Calendar,
  FileText,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useFollowUpComposer, 
  formatFollowUpType,
  type FollowUpType, 
  type FollowUpChannel,
  type FollowUpEntity 
} from '@/hooks/useFollowUpComposer';

const FOLLOW_UP_TYPES: { value: FollowUpType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'viewing_followup', label: 'Viewing Follow-up', icon: <Eye className="w-4 h-4" />, description: 'After property viewing' },
  { value: 'general_checkin', label: 'Check-in', icon: <MessageSquare className="w-4 h-4" />, description: 'General re-engagement' },
  { value: 'document_reminder', label: 'Document Reminder', icon: <FileText className="w-4 h-4" />, description: 'Pending documents' },
  { value: 'offer_followup', label: 'Offer Follow-up', icon: <Zap className="w-4 h-4" />, description: 'After offer submitted' },
  { value: 'hot_lead_reengagement', label: 'Hot Lead', icon: <Clock className="w-4 h-4" />, description: 'Re-engage cold lead' },
  { value: 'deal_milestone', label: 'Milestone', icon: <Calendar className="w-4 h-4" />, description: 'Deal stage update' },
];

interface FollowUpComposerProps {
  isOpen: boolean;
  entity: FollowUpEntity | null;
  channel: FollowUpChannel;
  followUpType: FollowUpType;
  generatedMessage: { message: string; subject?: string; urgency?: string; tone?: string } | null;
  editedMessage: string;
  editedSubject: string;
  isGenerating: boolean;
  isSending: boolean;
  onClose: () => void;
  onChannelChange: (channel: FollowUpChannel) => void;
  onFollowUpTypeChange: (type: FollowUpType) => void;
  onMessageChange: (message: string) => void;
  onSubjectChange: (subject: string) => void;
  onGenerate: (notes?: string) => void;
  onSend: () => void;
}

export function FollowUpComposer({
  isOpen,
  entity,
  channel,
  followUpType,
  generatedMessage,
  editedMessage,
  editedSubject,
  isGenerating,
  isSending,
  onClose,
  onChannelChange,
  onFollowUpTypeChange,
  onMessageChange,
  onSubjectChange,
  onGenerate,
  onSend,
}: FollowUpComposerProps) {
  const [agentNotes, setAgentNotes] = useState('');

  if (!entity) return null;

  const canSend = channel === 'email' 
    ? !!entity.email && !!editedMessage && !!editedSubject
    : !!entity.phone && !!editedMessage;

  const characterCount = editedMessage.length;
  const characterLimit = channel === 'sms' ? 160 : channel === 'whatsapp' ? 300 : 2000;
  const isOverLimit = characterCount > characterLimit;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Follow-Up Composer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entity Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{entity.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {entity.type.toUpperCase()}
                    </Badge>
                    <span>{entity.id}</span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  {entity.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {entity.phone}
                    </div>
                  )}
                  {entity.email && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {entity.email}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Type Selection */}
          <div className="space-y-2">
            <Label>Follow-up Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {FOLLOW_UP_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onFollowUpTypeChange(type.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    followUpType === type.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selection */}
          <Tabs value={channel} onValueChange={(v) => onChannelChange(v as FollowUpChannel)}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="whatsapp" disabled={!entity.phone}>
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="sms" disabled={!entity.phone}>
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="email" disabled={!entity.email}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value={channel} className="mt-4 space-y-4">
              {/* Agent Notes */}
              <div className="space-y-2">
                <Label htmlFor="agent-notes" className="text-muted-foreground">
                  Additional context for AI (optional)
                </Label>
                <Textarea
                  id="agent-notes"
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="e.g., Client mentioned they're traveling next week, interested in Marina views..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => onGenerate(agentNotes)}
                disabled={isGenerating}
                className="w-full"
                variant={generatedMessage ? 'outline' : 'default'}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : generatedMessage ? (
                  <RefreshCw className="w-4 h-4 mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {generatedMessage ? 'Regenerate' : 'Generate'} {formatFollowUpType(followUpType)}
              </Button>

              {/* Generated Message */}
              {generatedMessage && (
                <div className="space-y-4 animate-fade-in">
                  {/* Metadata badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {generatedMessage.urgency && (
                      <Badge variant={
                        generatedMessage.urgency === 'high' ? 'destructive' :
                        generatedMessage.urgency === 'medium' ? 'default' : 'secondary'
                      }>
                        {generatedMessage.urgency} urgency
                      </Badge>
                    )}
                    {generatedMessage.tone && (
                      <Badge variant="outline">{generatedMessage.tone}</Badge>
                    )}
                  </div>

                  {/* Subject (Email only) */}
                  {channel === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={editedSubject}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        placeholder="Email subject..."
                      />
                    </div>
                  )}

                  {/* Message Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Message</Label>
                      <span className={cn(
                        "text-xs",
                        isOverLimit ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {characterCount}/{characterLimit}
                      </span>
                    </div>
                    <Textarea
                      id="message"
                      value={editedMessage}
                      onChange={(e) => onMessageChange(e.target.value)}
                      rows={channel === 'email' ? 8 : 4}
                      className={cn(isOverLimit && "border-destructive")}
                    />
                    {isOverLimit && (
                      <p className="text-xs text-destructive">
                        Message exceeds recommended length for {channel}
                      </p>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={onSend}
                    disabled={!canSend || isSending || isOverLimit}
                    className="w-full"
                    size="lg"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send via {channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'Email'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Wrapper component that uses the hook
export function FollowUpComposerWithState() {
  const composer = useFollowUpComposer();

  return (
    <FollowUpComposer
      isOpen={composer.isOpen}
      entity={composer.entity}
      channel={composer.channel}
      followUpType={composer.followUpType}
      generatedMessage={composer.generatedMessage}
      editedMessage={composer.editedMessage}
      editedSubject={composer.editedSubject}
      isGenerating={composer.isGenerating}
      isSending={composer.isSending}
      onClose={composer.handleClose}
      onChannelChange={composer.setChannel}
      onFollowUpTypeChange={composer.setFollowUpType}
      onMessageChange={composer.setEditedMessage}
      onSubjectChange={composer.setEditedSubject}
      onGenerate={composer.handleGenerate}
      onSend={composer.handleSend}
    />
  );
}
