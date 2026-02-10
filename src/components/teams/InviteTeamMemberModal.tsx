import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Mail, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface InviteTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteTeamMemberModal({ open, onOpenChange }: InviteTeamMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('Broker');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('Broker');
  };

  const handleInvite = async () => {
    if (!fullName.trim() || !email.trim() || !role) {
      toast.error('Please fill in name, email, and role');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to invite team members');
        return;
      }

      const response = await supabase.functions.invoke('invite-team-member', {
        body: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone.trim() || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send invitation');
      }

      const result = response.data;
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success(`Invitation sent to ${email}`, {
        description: `${fullName} will receive an email to set their password and join as ${role}.`,
      });

      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Invite error:', err);
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to join the team. They'll set their own password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full Name *</Label>
            <Input
              id="invite-name"
              placeholder="e.g. Britt Tamara Wilks Lingam"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder="e.g. britt@micasa.ae"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-phone">Phone (optional)</Label>
            <Input
              id="invite-phone"
              type="tel"
              placeholder="+971 XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Broker">Broker</SelectItem>
                <SelectItem value="Operator">Operator</SelectItem>
                <SelectItem value="LegalOwner">Legal Owner</SelectItem>
                <SelectItem value="Investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="btn-gold" onClick={handleInvite} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
