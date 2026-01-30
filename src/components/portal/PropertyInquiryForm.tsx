/**
 * Customer-Facing Property Inquiry Form
 * 
 * Integrates with BOS via webhook to create prospects automatically.
 * Designed for the Mi Casa Properties public portal.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, CheckCircle } from 'lucide-react';

// Validation schema matching BOS prospect requirements
const inquiryFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(9, 'Please enter a valid phone number'),
  buyer_type: z.enum(['EndUser', 'Investor', 'Broker']).optional(),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  timeframe: z.enum(['0-3', '3-6', '6-12', '12+']).optional(),
  property_interest: z.enum(['OffPlan', 'Secondary', 'Both']).optional(),
  preferred_locations: z.string().optional(),
  bedrooms: z.string().optional(),
  message: z.string().optional(),
  consent_marketing: z.boolean().default(false),
  consent_data: z.boolean().refine((val) => val === true, {
    message: 'You must agree to data processing to submit this form',
  }),
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

interface PropertyInquiryFormProps {
  /** Optional listing ID if form is shown on a specific property */
  listingId?: string;
  /** Optional listing title for context */
  listingTitle?: string;
  /** Source tracking for attribution */
  source?: 'Website' | 'Portal' | 'SocialMedia' | 'Ads';
  /** Campaign ID for marketing attribution */
  campaignId?: string;
  /** Callback after successful submission */
  onSuccess?: () => void;
  /** Compact mode for sidebars/modals */
  compact?: boolean;
}

export function PropertyInquiryForm({
  listingId,
  listingTitle,
  source = 'Website',
  campaignId,
  onSuccess,
  compact = false,
}: PropertyInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      buyer_type: undefined,
      budget_min: '',
      budget_max: '',
      timeframe: undefined,
      property_interest: undefined,
      preferred_locations: '',
      bedrooms: '',
      message: listingTitle ? `I'm interested in: ${listingTitle}` : '',
      consent_marketing: false,
      consent_data: false,
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);

    try {
      // Create prospect in BOS database
      const { data: prospect, error } = await supabase.from('prospects').insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        source: source,
        buyer_type: data.buyer_type || null,
        budget_min: data.budget_min ? parseFloat(data.budget_min) : null,
        budget_max: data.budget_max ? parseFloat(data.budget_max) : null,
        timeframe: data.timeframe || null,
        notes: [
          data.message,
          data.property_interest ? `Property Interest: ${data.property_interest}` : null,
          data.preferred_locations ? `Preferred Locations: ${data.preferred_locations}` : null,
          data.bedrooms ? `Bedrooms: ${data.bedrooms}` : null,
          listingId ? `Listing: ${listingId}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        outreach_status: 'not_contacted',
        prospect_status: 'NEW',
        campaign_id: campaignId || null,
        // Mark intent signals based on form submission
        price_list_requested: data.property_interest === 'OffPlan',
      }).select().single();

      if (error) throw error;

      // Log the consent
      if (prospect) {
        await supabase.from('communication_logs').insert({
          entity_type: 'prospect',
          entity_id: prospect.id,
          channel: 'email',
          direction: 'inbound',
          content: `Form submission from ${source}. Marketing consent: ${data.consent_marketing}`,
          status: 'delivered',
          template_used: 'portal_inquiry_form',
        });
      }

      setIsSubmitted(true);
      toast.success('Thank you! Our team will contact you shortly.');
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={compact ? '' : 'max-w-lg mx-auto'}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              We've received your inquiry. A property consultant will contact you within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'border-0 shadow-none' : 'max-w-lg mx-auto'}>
      {!compact && (
        <CardHeader>
          <CardTitle>Property Inquiry</CardTitle>
          <CardDescription>
            {listingTitle
              ? `Interested in ${listingTitle}? Fill out the form below.`
              : "Tell us what you're looking for and we'll help you find your perfect property."}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-0' : ''}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+971 50 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EndUser">Home Buyer</SelectItem>
                        <SelectItem value="Investor">Investor</SelectItem>
                        <SelectItem value="Broker">Real Estate Agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="property_interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OffPlan">Off-Plan (New)</SelectItem>
                        <SelectItem value="Secondary">Ready Property</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget From (AED)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget To (AED)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2,000,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When do you plan to buy?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0-3">Within 3 months</SelectItem>
                        <SelectItem value="3-6">3-6 months</SelectItem>
                        <SelectItem value="6-12">6-12 months</SelectItem>
                        <SelectItem value="12+">More than a year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4+">4+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferred_locations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Areas</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Downtown, Marina, JVC" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter areas or communities you're interested in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about what you're looking for..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Consent Checkboxes */}
            <div className="space-y-3 pt-2">
              <FormField
                control={form.control}
                name="consent_data"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the processing of my personal data *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consent_marketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I'd like to receive property updates and marketing communications
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Inquiry
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default PropertyInquiryForm;
