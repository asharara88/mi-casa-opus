-- ============================================
-- OFF-PLAN vs SECONDARY MARKET PIPELINE IMPLEMENTATION
-- ============================================

-- 1. Create pipeline enum
CREATE TYPE public.deal_pipeline AS ENUM ('OffPlan', 'Secondary');

-- 2. Create extended deal type enum (more specific than current)
-- Note: We keep existing deal_type for backward compatibility
-- Adding more specific categorization

-- 3. Add Off-Plan specific states
CREATE TYPE public.offplan_deal_state AS ENUM (
  'LeadQualified',
  'EOISubmitted', 
  'EOIPaid',
  'SPASigned',
  'PaymentPlan',
  'Construction',
  'Handover',
  'ClosedWon',
  'ClosedLost'
);

-- 4. Add Secondary Market specific states  
CREATE TYPE public.secondary_deal_state AS ENUM (
  'RequirementsCaptured',
  'ViewingScheduled',
  'ViewingCompleted',
  'OfferSubmitted',
  'OfferAccepted',
  'MOUSigned',
  'NOCObtained',
  'TransferBooked',
  'TransferComplete',
  'ClosedWon',
  'ClosedLost'
);

-- 5. Create dead deal reasons for Off-Plan
CREATE TYPE public.offplan_dead_reason AS ENUM (
  'BudgetMismatch',
  'KYCFailed',
  'ClientWithdrew',
  'PaymentDefault',
  'ProjectCancelled',
  'Other'
);

-- 6. Create dead deal reasons for Secondary
CREATE TYPE public.secondary_dead_reason AS ENUM (
  'NoSuitableProperty',
  'BudgetMismatch',
  'MortgageRejected',
  'ClientWithdrew',
  'SellerWithdrew',
  'NOCRejected',
  'LegalIssue',
  'Other'
);

-- 7. Add new columns to deals table
ALTER TABLE public.deals
ADD COLUMN pipeline public.deal_pipeline DEFAULT 'Secondary',
ADD COLUMN offplan_state public.offplan_deal_state,
ADD COLUMN secondary_state public.secondary_deal_state,
ADD COLUMN developer_id text,
ADD COLUMN developer_project_id text,
ADD COLUMN developer_project_name text,
ADD COLUMN noc_status text DEFAULT 'not_required',
ADD COLUMN noc_reference text,
ADD COLUMN noc_obtained_at timestamp with time zone,
ADD COLUMN mortgage_status text DEFAULT 'not_applicable',
ADD COLUMN mortgage_provider text,
ADD COLUMN mortgage_pre_approval_at timestamp with time zone,
ADD COLUMN eoi_amount numeric,
ADD COLUMN eoi_paid_at timestamp with time zone,
ADD COLUMN payment_plan_type text,
ADD COLUMN construction_milestone text,
ADD COLUMN handover_date timestamp with time zone,
ADD COLUMN transfer_number text,
ADD COLUMN transfer_date timestamp with time zone,
ADD COLUMN offplan_dead_reason public.offplan_dead_reason,
ADD COLUMN secondary_dead_reason public.secondary_dead_reason;

-- 8. Create indexes for performance
CREATE INDEX idx_deals_pipeline ON public.deals(pipeline);
CREATE INDEX idx_deals_offplan_state ON public.deals(offplan_state) WHERE pipeline = 'OffPlan';
CREATE INDEX idx_deals_secondary_state ON public.deals(secondary_state) WHERE pipeline = 'Secondary';
CREATE INDEX idx_deals_developer ON public.deals(developer_id) WHERE pipeline = 'OffPlan';

-- 9. Create developers table for Off-Plan
CREATE TABLE public.developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id text UNIQUE NOT NULL,
  name text NOT NULL,
  legal_name text,
  rera_number text,
  contact_email text,
  contact_phone text,
  address text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on developers
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

-- Developers RLS policies
CREATE POLICY "Authenticated users can view developers"
ON public.developers FOR SELECT
USING (true);

CREATE POLICY "Operators can manage developers"
ON public.developers FOR ALL
USING (has_role(auth.uid(), 'Operator'))
WITH CHECK (has_role(auth.uid(), 'Operator'));

-- 10. Create developer_projects table
CREATE TABLE public.developer_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text UNIQUE NOT NULL,
  developer_id uuid REFERENCES public.developers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  location text,
  community text,
  project_type text, -- Residential, Commercial, Mixed
  status text DEFAULT 'Active', -- Active, SoldOut, OnHold, Cancelled
  launch_date date,
  expected_handover date,
  total_units integer,
  available_units integer,
  price_from numeric,
  price_to numeric,
  commission_percent numeric DEFAULT 3.0,
  payment_plan_details jsonb DEFAULT '[]'::jsonb,
  amenities jsonb DEFAULT '[]'::jsonb,
  brochure_url text,
  floor_plans_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on developer_projects
ALTER TABLE public.developer_projects ENABLE ROW LEVEL SECURITY;

-- Developer projects RLS policies
CREATE POLICY "Authenticated users can view developer projects"
ON public.developer_projects FOR SELECT
USING (true);

CREATE POLICY "Operators can manage developer projects"
ON public.developer_projects FOR ALL
USING (has_role(auth.uid(), 'Operator'))
WITH CHECK (has_role(auth.uid(), 'Operator'));

-- 11. Create pipeline_kpis view for tracking
CREATE VIEW public.pipeline_kpis AS
SELECT 
  pipeline,
  COUNT(*) as total_deals,
  COUNT(*) FILTER (WHERE deal_state NOT IN ('ClosedWon', 'ClosedLost')) as active_deals,
  COUNT(*) FILTER (WHERE deal_state = 'ClosedWon') as won_deals,
  COUNT(*) FILTER (WHERE deal_state = 'ClosedLost') as lost_deals,
  ROUND(
    COUNT(*) FILTER (WHERE deal_state = 'ClosedWon')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE deal_state IN ('ClosedWon', 'ClosedLost')), 0) * 100, 
    2
  ) as win_rate,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) FILTER (WHERE deal_state = 'ClosedWon') as avg_days_to_close
FROM public.deals
WHERE pipeline IS NOT NULL
GROUP BY pipeline;

-- 12. Add trigger to update updated_at
CREATE TRIGGER update_developers_updated_at
BEFORE UPDATE ON public.developers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_developer_projects_updated_at
BEFORE UPDATE ON public.developer_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();