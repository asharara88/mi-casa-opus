import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LeadInsert } from '@/hooks/useLeads';

const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Portal',
  'WalkIn',
  'SocialMedia',
  'Event',
  'Other',
] as const;

const NEXT_ACTIONS = [
  'Call',
  'WhatsApp',
  'Email',
  'Meeting',
  'Viewing',
  'FollowUp',
  'SendOffer',
  'CollectDocs',
  'Other',
] as const;

const addLeadSchema = z.object({
  contact_name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  contact_email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255)
    .optional()
    .or(z.literal('')),
  contact_phone: z.string().trim().max(20).optional(),
  source: z.enum(LEAD_SOURCES, { required_error: 'Source is required' }),
  next_action: z.enum(NEXT_ACTIONS).optional(),
  next_action_due: z.date().optional(),
  notes: z.string().trim().max(1000).optional(),
});

type AddLeadFormData = z.infer<typeof addLeadSchema>;

function generateLeadId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LD-${timestamp}-${random}`;
}

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadInsert) => Promise<void>;
  isLoading?: boolean;
}

export function AddLeadModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddLeadModalProps) {
  const form = useForm<AddLeadFormData>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: {
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      source: undefined,
      next_action: undefined,
      next_action_due: undefined,
      notes: '',
    },
  });

  const watchNextAction = form.watch('next_action');

  const handleSubmit = async (data: AddLeadFormData) => {
    const leadData: LeadInsert = {
      lead_id: generateLeadId(),
      contact_name: data.contact_name,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      source: data.source,
      lead_state: 'New',
      next_action: data.next_action || null,
      next_action_due: data.next_action_due?.toISOString() || null,
      notes: data.notes || null,
    };

    await onSubmit(leadData);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the lead's contact information and details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Contact Name - Required */}
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Phone */}
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+971 50 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source - Required */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Source <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEAD_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source === 'WalkIn' ? 'Walk-In' : source === 'SocialMedia' ? 'Social Media' : source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Action */}
            <FormField
              control={form.control}
              name="next_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Action</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select next action (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NEXT_ACTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action === 'FollowUp' ? 'Follow Up' : action === 'SendOffer' ? 'Send Offer' : action === 'CollectDocs' ? 'Collect Docs' : action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Action Due Date - Only show when next action is selected */}
            {watchNextAction && (
              <FormField
                control={form.control}
                name="next_action_due"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a due date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this lead..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
