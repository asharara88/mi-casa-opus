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
import { Loader2 } from 'lucide-react';
import type { ProspectInsert } from '@/hooks/useProspects';

const SOURCES = [
  'Property Finder',
  'Bayut',
  'Dubizzle',
  'Website',
  'Referral',
  'Social Media',
  'Event',
  'Cold Call',
  'Other',
] as const;

const CONFIDENCE_LEVELS = ['High', 'Medium', 'Low'] as const;

const addProspectSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  first_name: z.string().trim().max(50).optional(),
  last_name: z.string().trim().max(50).optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255)
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(100).optional(),
  source: z.string().max(100).optional(),
  crm_confidence_level: z.enum(CONFIDENCE_LEVELS).optional(),
  notes: z.string().trim().max(1000).optional(),
});

type AddProspectFormData = z.infer<typeof addProspectSchema>;

interface AddProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProspectInsert) => Promise<void>;
  isLoading?: boolean;
}

export function AddProspectModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddProspectModalProps) {
  const form = useForm<AddProspectFormData>({
    resolver: zodResolver(addProspectSchema),
    defaultValues: {
      full_name: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      city: '',
      source: '',
      crm_confidence_level: undefined,
      notes: '',
    },
  });

  // Auto-update full_name when first/last name changes
  const watchFirstName = form.watch('first_name');
  const watchLastName = form.watch('last_name');

  const handleFirstLastNameChange = () => {
    const firstName = form.getValues('first_name') || '';
    const lastName = form.getValues('last_name') || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      form.setValue('full_name', fullName);
    }
  };

  const handleSubmit = async (data: AddProspectFormData) => {
    const prospectData: ProspectInsert = {
      full_name: data.full_name,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      email: data.email || null,
      phone: data.phone || null,
      city: data.city || null,
      source: data.source || null,
      crm_confidence_level: data.crm_confidence_level || null,
      notes: data.notes || null,
      outreach_status: 'not_contacted',
      crm_stage: 'Prospect',
    };

    await onSubmit(prospectData);
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
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Enter the prospect's contact information for outreach.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* First Name */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        {...field} 
                        onBlur={() => {
                          field.onBlur();
                          handleFirstLastNameChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        {...field} 
                        onBlur={() => {
                          field.onBlur();
                          handleFirstLastNameChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Full Name - Required */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
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

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
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

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Dubai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confidence Level */}
            <FormField
              control={form.control}
              name="crm_confidence_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidence Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select confidence (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
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
                Add Prospect
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
