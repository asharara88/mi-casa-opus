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
import { DealInsert } from '@/hooks/useDeals';

const DEAL_TYPES = ['Sale', 'Lease', 'OffPlan'] as const;
const DEAL_SIDES = ['Buy', 'Sell', 'Lease', 'Let'] as const;
const PIPELINES = ['Secondary', 'OffPlan'] as const;

const addDealSchema = z.object({
  deal_type: z.enum(DEAL_TYPES, { required_error: 'Deal type is required' }),
  side: z.enum(DEAL_SIDES, { required_error: 'Deal side is required' }),
  pipeline: z.enum(PIPELINES, { required_error: 'Pipeline is required' }),
  property_id: z.string().trim().max(100).optional(),
  developer_project_name: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

type AddDealFormData = z.infer<typeof addDealSchema>;

function generateDealId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DL-${timestamp}-${random}`;
}

interface AddDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DealInsert) => Promise<void>;
  isLoading?: boolean;
}

export function AddDealModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddDealModalProps) {
  const form = useForm<AddDealFormData>({
    resolver: zodResolver(addDealSchema),
    defaultValues: {
      deal_type: undefined,
      side: undefined,
      pipeline: 'Secondary',
      property_id: '',
      developer_project_name: '',
      notes: '',
    },
  });

  const watchPipeline = form.watch('pipeline');

  const handleSubmit = async (data: AddDealFormData) => {
    const dealData: DealInsert = {
      deal_id: generateDealId(),
      deal_type: data.deal_type,
      side: data.side,
      pipeline: data.pipeline,
      deal_state: 'Created',
      property_id: data.property_id || null,
      developer_project_name: data.developer_project_name || null,
      notes: data.notes || null,
      // Set initial state based on pipeline
      offplan_state: data.pipeline === 'OffPlan' ? 'LeadQualified' : null,
      secondary_state: data.pipeline === 'Secondary' ? 'RequirementsCaptured' : null,
    };

    await onSubmit(dealData);
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
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription>
            Enter the deal details to create a new transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Pipeline */}
            <FormField
              control={form.control}
              name="pipeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pipeline <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pipeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Secondary">Secondary (Resale)</SelectItem>
                      <SelectItem value="OffPlan">Off-Plan (New Development)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deal Type */}
            <FormField
              control={form.control}
              name="deal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Deal Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sale">Sale</SelectItem>
                      <SelectItem value="Lease">Lease</SelectItem>
                      {watchPipeline === 'OffPlan' && (
                        <SelectItem value="OffPlan">Off-Plan Purchase</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deal Side */}
            <FormField
              control={form.control}
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Side <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Buy">Buyer Side</SelectItem>
                      <SelectItem value="Sell">Seller Side</SelectItem>
                      <SelectItem value="Lease">Tenant Side</SelectItem>
                      <SelectItem value="Let">Landlord Side</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property ID - for Secondary */}
            {watchPipeline === 'Secondary' && (
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PROP-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Developer Project - for OffPlan */}
            {watchPipeline === 'OffPlan' && (
              <FormField
                control={form.control}
                name="developer_project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Developer Project</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marina Heights Tower" {...field} />
                    </FormControl>
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
                      placeholder="Any additional notes about this deal..."
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
                Create Deal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
