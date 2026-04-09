
-- ============================================
-- BOS DATABASE SCHEMA - PRODUCTION GRADE
-- ============================================

-- 1. ROLE ENUM & USER ROLES TABLE (Critical for RLS)
CREATE TYPE public.app_role AS ENUM ('Operator', 'LegalOwner', 'Broker', 'Investor');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. BROKERAGE CONTEXT
CREATE TABLE public.brokerage_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brokerage_id TEXT NOT NULL UNIQUE,
    legal_name TEXT NOT NULL,
    trade_name TEXT NOT NULL,
    license_context JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brokerage_context ENABLE ROW LEVEL SECURITY;

-- 4. BROKER PROFILES
CREATE TYPE public.broker_status AS ENUM ('Pending', 'Active', 'Suspended', 'Terminated');

CREATE TABLE public.broker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    personal_license_no TEXT,
    license_validity DATE,
    broker_status broker_status NOT NULL DEFAULT 'Pending',
    ica_document_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.broker_profiles ENABLE ROW LEVEL SECURITY;

-- 5. LISTINGS
CREATE TYPE public.listing_status AS ENUM ('Draft', 'Active', 'Reserved', 'Sold', 'Withdrawn');
CREATE TYPE public.listing_type AS ENUM ('Sale', 'Lease', 'OffPlan');

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id TEXT NOT NULL UNIQUE,
    property_id TEXT,
    listing_type listing_type NOT NULL,
    asking_terms JSONB DEFAULT '{}'::jsonb,
    status listing_status NOT NULL DEFAULT 'Draft',
    owner_party_id UUID,
    mandate_agreement_id UUID,
    listing_attributes JSONB DEFAULT '{}'::jsonb,
    approved_faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. LEADS
CREATE TYPE public.lead_state AS ENUM ('New', 'Contacted', 'Qualified', 'Disqualified', 'Converted');
CREATE TYPE public.lead_source AS ENUM ('Website', 'Referral', 'Portal', 'WalkIn', 'SocialMedia', 'Event', 'Other');

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT NOT NULL UNIQUE,
    source lead_source NOT NULL DEFAULT 'Other',
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    lead_state lead_state NOT NULL DEFAULT 'New',
    assigned_broker_id UUID REFERENCES public.broker_profiles(id),
    consents JSONB DEFAULT '[]'::jsonb,
    qualification_data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 7. DEALS
CREATE TYPE public.deal_state AS ENUM (
    'Created', 
    'Qualified', 
    'Viewing', 
    'Offer', 
    'Reservation', 
    'SPA', 
    'ClosedWon', 
    'ClosedLost'
);
CREATE TYPE public.deal_type AS ENUM ('Sale', 'Lease', 'OffPlan');
CREATE TYPE public.deal_side AS ENUM ('Buy', 'Sell', 'Lease', 'Let');

CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id TEXT NOT NULL UNIQUE,
    deal_type deal_type NOT NULL,
    deal_state deal_state NOT NULL DEFAULT 'Created',
    linked_lead_id UUID REFERENCES public.leads(id),
    listing_id UUID REFERENCES public.listings(id),
    property_id TEXT,
    side deal_side NOT NULL,
    deal_economics JSONB DEFAULT '{}'::jsonb,
    registry_actions JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 8. DEAL PARTIES
CREATE TYPE public.party_role AS ENUM ('Buyer', 'Seller', 'Lessor', 'Lessee', 'Representative', 'Developer');

CREATE TABLE public.deal_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
    party_role party_role NOT NULL,
    party_name TEXT NOT NULL,
    party_email TEXT,
    party_phone TEXT,
    identity_document_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_parties ENABLE ROW LEVEL SECURITY;

-- 9. DEAL BROKERS (assigned brokers with timestamps)
CREATE TABLE public.deal_brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
    broker_id UUID REFERENCES public.broker_profiles(id) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    role TEXT DEFAULT 'Primary',
    commission_split_percent NUMERIC(5,2) DEFAULT 100.00
);

ALTER TABLE public.deal_brokers ENABLE ROW LEVEL SECURITY;

-- 10. DOCUMENT TEMPLATES (immutable after publish)
CREATE TYPE public.doc_type AS ENUM (
    'MOU', 'SPA', 'Reservation', 'Mandate', 'ICA', 'NDA', 
    'POA', 'CommissionInvoice', 'Receipt', 'Other'
);
CREATE TYPE public.template_status AS ENUM ('Draft', 'Published', 'Deprecated');

CREATE TABLE public.document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id TEXT NOT NULL UNIQUE,
    doc_type doc_type NOT NULL,
    name TEXT NOT NULL,
    template_version TEXT NOT NULL,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    required_signers_schema JSONB DEFAULT '[]'::jsonb,
    data_binding_schema JSONB DEFAULT '{}'::jsonb,
    template_content TEXT,
    status template_status NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- 11. DOCUMENT INSTANCES
CREATE TYPE public.document_status AS ENUM ('Draft', 'Pending', 'Executed', 'Voided');

CREATE TABLE public.document_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT NOT NULL UNIQUE,
    template_id UUID REFERENCES public.document_templates(id) NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    data_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_snapshot_hash TEXT,
    rendered_artifact_url TEXT,
    rendered_artifact_hash TEXT,
    status document_status NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    executed_at TIMESTAMPTZ
);

ALTER TABLE public.document_instances ENABLE ROW LEVEL SECURITY;

-- 12. SIGNATURE ENVELOPES
CREATE TYPE public.signature_status AS ENUM ('Pending', 'Signed', 'Declined', 'Expired');

CREATE TABLE public.signature_envelopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    envelope_id TEXT NOT NULL UNIQUE,
    document_id UUID REFERENCES public.document_instances(id) NOT NULL,
    signers JSONB NOT NULL DEFAULT '[]'::jsonb,
    authority_checks JSONB DEFAULT '[]'::jsonb,
    execution_evidence JSONB DEFAULT '{}'::jsonb,
    status signature_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.signature_envelopes ENABLE ROW LEVEL SECURITY;

-- 13. EVIDENCE OBJECTS
CREATE TYPE public.evidence_type AS ENUM (
    'DARI', 'TAMM', 'PaymentProof', 'Identity', 'TruthPack', 
    'Photo', 'Email', 'Contract', 'Other'
);
CREATE TYPE public.immutability_class AS ENUM ('External', 'Internal', 'System');

CREATE TABLE public.evidence_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id TEXT NOT NULL UNIQUE,
    evidence_type evidence_type NOT NULL,
    source TEXT,
    entity_type TEXT,
    entity_id UUID,
    file_url TEXT,
    file_hash TEXT,
    captured_by UUID REFERENCES auth.users(id),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    immutability_class immutability_class NOT NULL DEFAULT 'Internal',
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.evidence_objects ENABLE ROW LEVEL SECURITY;

-- 14. COMMISSION RECORDS
CREATE TYPE public.commission_status AS ENUM ('Expected', 'Earned', 'Received', 'Paid', 'Voided');

CREATE TABLE public.commission_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_id TEXT NOT NULL UNIQUE,
    deal_id UUID REFERENCES public.deals(id) NOT NULL,
    broker_id UUID REFERENCES public.broker_profiles(id) NOT NULL,
    status commission_status NOT NULL DEFAULT 'Expected',
    gross_amount NUMERIC(15,2),
    net_amount NUMERIC(15,2),
    split_percent NUMERIC(5,2),
    calculation_trace JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_records ENABLE ROW LEVEL SECURITY;

-- 15. EVENT LOG ENTRIES (APPEND-ONLY - Critical audit trail)
CREATE TABLE public.event_log_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_user_id UUID REFERENCES auth.users(id),
    actor_role app_role,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    rule_set_version TEXT DEFAULT '1.0.0',
    decision TEXT CHECK (decision IN ('ALLOWED', 'BLOCKED')),
    block_reasons JSONB DEFAULT '[]'::jsonb,
    prev_event_hash TEXT,
    event_hash TEXT
);

ALTER TABLE public.event_log_entries ENABLE ROW LEVEL SECURITY;

-- 16. AI INSIGHTS (Advisory only - non-authoritative)
CREATE TABLE public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    insight_type TEXT NOT NULL,
    score NUMERIC(5,2),
    rationale JSONB DEFAULT '[]'::jsonb,
    next_best_action TEXT,
    is_authoritative BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- 17. APPROVALS
CREATE TYPE public.approval_type AS ENUM ('EconomicsOverride', 'PayoutBatch', 'ComplianceWaiver', 'TemplatePublish');
CREATE TYPE public.approval_status AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_type approval_type NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    before_state JSONB,
    after_state JSONB,
    status approval_status NOT NULL DEFAULT 'Pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT
);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- 18. PAYOUT BATCHES
CREATE TYPE public.payout_status AS ENUM ('Draft', 'PendingApproval', 'Approved', 'Executed', 'Voided');

CREATE TABLE public.payout_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL UNIQUE,
    status payout_status NOT NULL DEFAULT 'Draft',
    total_amount NUMERIC(15,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    payment_evidence_id UUID REFERENCES public.evidence_objects(id)
);

ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- 19. PAYOUT LINES
CREATE TABLE public.payout_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.payout_batches(id) ON DELETE CASCADE NOT NULL,
    commission_id UUID REFERENCES public.commission_records(id) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed'))
);

ALTER TABLE public.payout_lines ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- User roles: users can see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Operators can manage all roles
CREATE POLICY "Operators can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Profiles: users can see and update their own
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Operators can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Brokerage context: read by all authenticated, write by operators
CREATE POLICY "Authenticated users can view brokerage"
ON public.brokerage_context FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operators can manage brokerage"
ON public.brokerage_context FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Broker profiles: brokers see own, operators see all
CREATE POLICY "Brokers can view own profile"
ON public.broker_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'Operator') OR public.has_role(auth.uid(), 'LegalOwner'));

CREATE POLICY "Operators can manage broker profiles"
ON public.broker_profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Listings: read by all authenticated, write by operators
CREATE POLICY "Authenticated users can view listings"
ON public.listings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operators can manage listings"
ON public.listings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Leads: brokers see assigned, operators see all
CREATE POLICY "Brokers can view assigned leads"
ON public.leads FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    EXISTS (
        SELECT 1 FROM public.broker_profiles bp 
        WHERE bp.user_id = auth.uid() AND bp.id = leads.assigned_broker_id
    )
);

CREATE POLICY "Operators can manage leads"
ON public.leads FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

CREATE POLICY "Brokers can update assigned leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.broker_profiles bp 
        WHERE bp.user_id = auth.uid() AND bp.id = leads.assigned_broker_id
    )
);

-- Deals: brokers see assigned, operators see all
CREATE POLICY "Users can view deals based on role"
ON public.deals FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    EXISTS (
        SELECT 1 FROM public.deal_brokers db
        JOIN public.broker_profiles bp ON db.broker_id = bp.id
        WHERE db.deal_id = deals.id AND bp.user_id = auth.uid()
    )
);

CREATE POLICY "Operators can manage deals"
ON public.deals FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Deal parties: same access as deals
CREATE POLICY "Users can view deal parties based on deal access"
ON public.deal_parties FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.deals d WHERE d.id = deal_parties.deal_id AND (
            public.has_role(auth.uid(), 'Operator') OR
            public.has_role(auth.uid(), 'LegalOwner') OR
            EXISTS (
                SELECT 1 FROM public.deal_brokers db
                JOIN public.broker_profiles bp ON db.broker_id = bp.id
                WHERE db.deal_id = d.id AND bp.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Operators can manage deal parties"
ON public.deal_parties FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Deal brokers: same access pattern
CREATE POLICY "Users can view deal brokers"
ON public.deal_brokers FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    EXISTS (
        SELECT 1 FROM public.broker_profiles bp 
        WHERE bp.user_id = auth.uid() AND bp.id = deal_brokers.broker_id
    )
);

CREATE POLICY "Operators can manage deal brokers"
ON public.deal_brokers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Document templates: read by all, write by operators
CREATE POLICY "Authenticated users can view templates"
ON public.document_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operators can manage templates"
ON public.document_templates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Document instances: based on entity access
CREATE POLICY "Users can view related documents"
ON public.document_instances FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    (entity_type = 'Deal' AND EXISTS (
        SELECT 1 FROM public.deal_brokers db
        JOIN public.broker_profiles bp ON db.broker_id = bp.id
        WHERE db.deal_id = document_instances.entity_id AND bp.user_id = auth.uid()
    ))
);

CREATE POLICY "Operators can manage documents"
ON public.document_instances FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Signature envelopes: based on document access
CREATE POLICY "Users can view related signatures"
ON public.signature_envelopes FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner')
);

CREATE POLICY "Operators can manage signatures"
ON public.signature_envelopes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Evidence objects: based on entity access
CREATE POLICY "Users can view related evidence"
ON public.evidence_objects FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    captured_by = auth.uid()
);

CREATE POLICY "Authenticated users can create evidence"
ON public.evidence_objects FOR INSERT
TO authenticated
WITH CHECK (captured_by = auth.uid());

CREATE POLICY "Operators can manage evidence"
ON public.evidence_objects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Commission records: brokers see own, operators see all
CREATE POLICY "Brokers can view own commissions"
ON public.commission_records FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    EXISTS (
        SELECT 1 FROM public.broker_profiles bp 
        WHERE bp.user_id = auth.uid() AND bp.id = commission_records.broker_id
    )
);

CREATE POLICY "Operators can manage commissions"
ON public.commission_records FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Event log: read by all authenticated (audit trail), append only
CREATE POLICY "Authenticated users can view event log"
ON public.event_log_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert events"
ON public.event_log_entries FOR INSERT
TO authenticated
WITH CHECK (true);

-- AI insights: read by operators and legal owners
CREATE POLICY "Operators and LegalOwners can view insights"
ON public.ai_insights FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner')
);

CREATE POLICY "Operators can manage insights"
ON public.ai_insights FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Approvals: operators and legal owners
CREATE POLICY "Users can view approvals"
ON public.approvals FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner') OR
    requested_by = auth.uid()
);

CREATE POLICY "Operators and LegalOwners can manage approvals"
ON public.approvals FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner')
);

-- Payout batches: operators only
CREATE POLICY "Operators and LegalOwners can view payouts"
ON public.payout_batches FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner')
);

CREATE POLICY "Operators can manage payouts"
ON public.payout_batches FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- Payout lines: same as batches
CREATE POLICY "Operators and LegalOwners can view payout lines"
ON public.payout_lines FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'Operator') OR
    public.has_role(auth.uid(), 'LegalOwner')
);

CREATE POLICY "Operators can manage payout lines"
ON public.payout_lines FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Operator'));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brokerage_updated_at
    BEFORE UPDATE ON public.brokerage_context
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broker_profiles_updated_at
    BEFORE UPDATE ON public.broker_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON public.commission_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INITIAL BROKERAGE CONTEXT
-- ============================================

INSERT INTO public.brokerage_context (brokerage_id, legal_name, trade_name, license_context)
VALUES (
    'BRK-001',
    'Mi Casa Real Estate LLC',
    'Mi Casa Real Estate',
    '[{"license_no": "ADX-RE-2024-001", "authority": "DARI", "issued": "2024-01-01", "expires": "2025-12-31"}]'::jsonb
);
