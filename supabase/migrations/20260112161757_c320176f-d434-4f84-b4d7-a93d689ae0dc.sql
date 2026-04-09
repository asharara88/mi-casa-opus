-- Create compliance-related ENUMs
CREATE TYPE compliance_status AS ENUM ('APPROVED', 'BLOCKED', 'ESCALATED');
CREATE TYPE compliance_rule_severity AS ENUM ('BLOCK', 'ESCALATE');
CREATE TYPE compliance_context_type AS ENUM ('listing', 'transaction', 'marketing');
CREATE TYPE aml_risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE madhmoun_status AS ENUM ('DRAFT', 'PENDING', 'VERIFIED', 'REJECTED');

-- Table: compliance_modules
CREATE TABLE public.compliance_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'AbuDhabi',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: compliance_rules
CREATE TABLE public.compliance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id TEXT NOT NULL UNIQUE,
  module_id UUID NOT NULL REFERENCES public.compliance_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  severity compliance_rule_severity NOT NULL DEFAULT 'BLOCK',
  applies_to compliance_context_type[] NOT NULL DEFAULT '{}',
  requirements JSONB NOT NULL DEFAULT '[]',
  action_on_fail JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: compliance_results
CREATE TABLE public.compliance_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  context_type compliance_context_type NOT NULL,
  status compliance_status NOT NULL DEFAULT 'BLOCKED',
  failed_modules TEXT[] NOT NULL DEFAULT '{}',
  failed_rules TEXT[] NOT NULL DEFAULT '{}',
  required_actions TEXT[] NOT NULL DEFAULT '{}',
  escalation_reason TEXT,
  modules_detail JSONB NOT NULL DEFAULT '[]',
  payload_snapshot JSONB NOT NULL DEFAULT '{}',
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  evaluated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: compliance_overrides
CREATE TABLE public.compliance_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compliance_result_id UUID NOT NULL REFERENCES public.compliance_results(id) ON DELETE CASCADE,
  overrider_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  authorization_document_url TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add compliance columns to listings table
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS madhmoun_listing_id TEXT,
  ADD COLUMN IF NOT EXISTS madhmoun_status madhmoun_status DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS compliance_status compliance_status DEFAULT 'BLOCKED';

-- Add compliance columns to deals table
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS compliance_status compliance_status DEFAULT 'BLOCKED',
  ADD COLUMN IF NOT EXISTS aml_risk_level aml_risk_level,
  ADD COLUMN IF NOT EXISTS aml_flags JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX idx_compliance_results_entity ON public.compliance_results(entity_type, entity_id);
CREATE INDEX idx_compliance_results_status ON public.compliance_results(status);
CREATE INDEX idx_compliance_rules_module ON public.compliance_rules(module_id);
CREATE INDEX idx_compliance_rules_applies_to ON public.compliance_rules USING GIN(applies_to);

-- Enable RLS on all new tables
ALTER TABLE public.compliance_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_modules (read by all, manage by Operators)
CREATE POLICY "Authenticated users can view compliance modules"
  ON public.compliance_modules FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage compliance modules"
  ON public.compliance_modules FOR ALL
  USING (has_role(auth.uid(), 'Operator'::app_role));

-- RLS Policies for compliance_rules (read by all, manage by Operators)
CREATE POLICY "Authenticated users can view compliance rules"
  ON public.compliance_rules FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage compliance rules"
  ON public.compliance_rules FOR ALL
  USING (has_role(auth.uid(), 'Operator'::app_role));

-- RLS Policies for compliance_results
CREATE POLICY "Users can view relevant compliance results"
  ON public.compliance_results FOR SELECT
  USING (
    has_role(auth.uid(), 'Operator'::app_role) OR
    has_role(auth.uid(), 'LegalOwner'::app_role) OR
    evaluated_by = auth.uid()
  );

CREATE POLICY "Operators can manage compliance results"
  ON public.compliance_results FOR ALL
  USING (has_role(auth.uid(), 'Operator'::app_role));

CREATE POLICY "Authenticated users can insert compliance results"
  ON public.compliance_results FOR INSERT
  WITH CHECK (evaluated_by = auth.uid() OR has_role(auth.uid(), 'Operator'::app_role));

-- RLS Policies for compliance_overrides
CREATE POLICY "Operators and LegalOwners can view overrides"
  ON public.compliance_overrides FOR SELECT
  USING (
    has_role(auth.uid(), 'Operator'::app_role) OR
    has_role(auth.uid(), 'LegalOwner'::app_role)
  );

CREATE POLICY "Operators and LegalOwners can create overrides"
  ON public.compliance_overrides FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'Operator'::app_role) OR
    has_role(auth.uid(), 'LegalOwner'::app_role)
  );

-- Add triggers for updated_at
CREATE TRIGGER update_compliance_modules_updated_at
  BEFORE UPDATE ON public.compliance_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at
  BEFORE UPDATE ON public.compliance_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();