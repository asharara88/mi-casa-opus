
-- =============================================
-- UNIFIED CRM FOUNDATION
-- =============================================

-- Enums
CREATE TYPE public.lifecycle_stage AS ENUM ('Lead', 'Prospect', 'Customer', 'Past_Customer', 'Disqualified');
CREATE TYPE public.contact_type AS ENUM ('Person', 'Company');
CREATE TYPE public.opportunity_stage_type AS ENUM ('active', 'won', 'lost');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'whatsapp', 'sms', 'meeting', 'note', 'viewing', 'system');
CREATE TYPE public.activity_direction_v2 AS ENUM ('inbound', 'outbound', 'internal');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.financing_type AS ENUM ('cash', 'mortgage', 'mixed', 'unknown');

-- =============================================
-- CONTACTS
-- =============================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type public.contact_type NOT NULL DEFAULT 'Person',
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  alt_phone TEXT,
  whatsapp TEXT,
  lifecycle_stage public.lifecycle_stage NOT NULL DEFAULT 'Lead',
  source TEXT,
  owner_user_id UUID,
  tags TEXT[] DEFAULT '{}',
  nationality TEXT,
  preferred_language TEXT DEFAULT 'en',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  consents JSONB DEFAULT '[]'::jsonb,
  last_contacted_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_email ON public.contacts(LOWER(email));
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_owner ON public.contacts(owner_user_id);
CREATE INDEX idx_contacts_lifecycle ON public.contacts(lifecycle_stage);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);

-- =============================================
-- PIPELINE STAGES
-- =============================================
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0,
  stage_type public.opportunity_stage_type NOT NULL DEFAULT 'active',
  color TEXT NOT NULL DEFAULT '#6B7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- OPPORTUNITIES (Unified pipeline)
-- =============================================
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  source TEXT,
  owner_user_id UUID,
  value NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'AED',
  probability INTEGER,
  expected_close_date DATE,
  -- Requirements
  property_type TEXT,
  listing_type TEXT,
  bedrooms_min INTEGER,
  bedrooms_max INTEGER,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  preferred_locations TEXT[] DEFAULT '{}',
  unit_count INTEGER DEFAULT 1,
  financing public.financing_type DEFAULT 'unknown',
  mortgage_pre_approved BOOLEAN DEFAULT false,
  timeframe TEXT,
  key_requirements TEXT,
  urgency TEXT DEFAULT 'normal',
  -- Links
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  -- Lifecycle
  stage_changed_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  lost_reason TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunities_contact ON public.opportunities(contact_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage_id);
CREATE INDEX idx_opportunities_owner ON public.opportunities(owner_user_id);
CREATE INDEX idx_opportunities_listing ON public.opportunities(listing_id);

-- =============================================
-- ACTIVITIES (Unified timeline)
-- =============================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  direction public.activity_direction_v2 NOT NULL DEFAULT 'outbound',
  subject TEXT,
  body TEXT,
  channel TEXT,
  external_id TEXT,
  status TEXT DEFAULT 'completed',
  duration_seconds INTEGER,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activities_contact ON public.activities(contact_id, occurred_at DESC);
CREATE INDEX idx_activities_opportunity ON public.activities(opportunity_id, occurred_at DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);

-- =============================================
-- TASKS
-- =============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  assigned_to UUID,
  due_at TIMESTAMPTZ,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to, status, due_at);
CREATE INDEX idx_tasks_contact ON public.tasks(contact_id);
CREATE INDEX idx_tasks_opportunity ON public.tasks(opportunity_id);

-- =============================================
-- updated_at triggers
-- =============================================
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stage change tracking
CREATE OR REPLACE FUNCTION public.track_opportunity_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    NEW.stage_changed_at = now();
    IF EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = NEW.stage_id AND stage_type IN ('won','lost')) THEN
      NEW.closed_at = COALESCE(NEW.closed_at, now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_opportunity_stage_change BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.track_opportunity_stage_change();

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Pipeline stages: all authenticated read, managers manage
CREATE POLICY "stages_read_authenticated" ON public.pipeline_stages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "stages_manage_managers" ON public.pipeline_stages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'Manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'Manager'::app_role));

-- Contacts
CREATE POLICY "contacts_select" ON public.contacts FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR has_role(auth.uid(), 'Owner'::app_role)
  OR owner_user_id = auth.uid()
  OR created_by = auth.uid()
  OR has_role(auth.uid(), 'Broker'::app_role)
);
CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR owner_user_id = auth.uid()
  OR created_by = auth.uid()
);
CREATE POLICY "contacts_delete_managers" ON public.contacts FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'Manager'::app_role));

-- Opportunities
CREATE POLICY "opps_select" ON public.opportunities FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR has_role(auth.uid(), 'Owner'::app_role)
  OR owner_user_id = auth.uid()
  OR created_by = auth.uid()
  OR has_role(auth.uid(), 'Broker'::app_role)
);
CREATE POLICY "opps_insert" ON public.opportunities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "opps_update" ON public.opportunities FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR owner_user_id = auth.uid()
  OR created_by = auth.uid()
);
CREATE POLICY "opps_delete_managers" ON public.opportunities FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'Manager'::app_role));

-- Activities
CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR has_role(auth.uid(), 'Owner'::app_role)
  OR has_role(auth.uid(), 'Broker'::app_role)
  OR created_by = auth.uid()
);
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "activities_update_owner" ON public.activities FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'Manager'::app_role));
CREATE POLICY "activities_delete_managers" ON public.activities FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'Manager'::app_role));

-- Tasks
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR has_role(auth.uid(), 'Owner'::app_role)
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role)
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (
  has_role(auth.uid(), 'Manager'::app_role) OR created_by = auth.uid()
);

-- =============================================
-- SEED: default pipeline stages
-- =============================================
INSERT INTO public.pipeline_stages (name, sort_order, probability, stage_type, color) VALUES
  ('Enquiry', 10, 10, 'active', '#3B82F6'),
  ('Qualified', 20, 25, 'active', '#8B5CF6'),
  ('Viewing', 30, 45, 'active', '#06B6D4'),
  ('Offer', 40, 65, 'active', '#F59E0B'),
  ('Negotiation', 50, 80, 'active', '#EAB308'),
  ('Won', 60, 100, 'won', '#10B981'),
  ('Lost', 70, 0, 'lost', '#EF4444');
