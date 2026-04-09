
CREATE TABLE public.crm_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  company TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_location TEXT,
  property_type TEXT,
  bedrooms_min INTEGER,
  bedrooms_max INTEGER,
  key_requirements TEXT,
  source TEXT DEFAULT 'direct',
  urgency TEXT DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_enquiry_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id UUID NOT NULL REFERENCES public.crm_enquiries(id) ON DELETE CASCADE,
  follow_up_type TEXT NOT NULL,
  body TEXT NOT NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_enquiry_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enquiries" ON public.crm_enquiries FOR SELECT USING (true);
CREATE POLICY "Public insert enquiries" ON public.crm_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update enquiries" ON public.crm_enquiries FOR UPDATE USING (true);

CREATE POLICY "Public read followups" ON public.crm_enquiry_followups FOR SELECT USING (true);
CREATE POLICY "Public insert followups" ON public.crm_enquiry_followups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update followups" ON public.crm_enquiry_followups FOR UPDATE USING (true);
