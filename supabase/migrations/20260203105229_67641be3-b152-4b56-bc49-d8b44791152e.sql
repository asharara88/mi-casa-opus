-- ============================================
-- SMART CONTRACTS & TOKENIZATION INFRASTRUCTURE
-- ============================================

-- Property Token Status
CREATE TYPE public.token_status AS ENUM ('Draft', 'Minted', 'Active', 'Frozen', 'Burned');

-- Payment Escrow Status  
CREATE TYPE public.escrow_status AS ENUM ('Created', 'Funded', 'PartiallyFunded', 'Released', 'Refunded', 'Disputed');

-- Contract Execution Status
CREATE TYPE public.contract_execution_status AS ENUM ('Draft', 'Pending', 'Executed', 'Voided', 'Expired');

-- ============================================
-- PROPERTY TOKENS (Real Estate Tokenization)
-- ============================================
CREATE TABLE public.property_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id TEXT NOT NULL UNIQUE,
  property_id TEXT NOT NULL,
  listing_id UUID REFERENCES public.listings(id),
  deal_id UUID REFERENCES public.deals(id),
  
  -- Token Details
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  total_supply NUMERIC NOT NULL DEFAULT 1000000,
  decimals INTEGER NOT NULL DEFAULT 18,
  
  -- Valuation
  property_valuation NUMERIC NOT NULL,
  token_price NUMERIC GENERATED ALWAYS AS (property_valuation / total_supply) STORED,
  currency TEXT NOT NULL DEFAULT 'AED',
  
  -- Blockchain Reference (for demo: simulated)
  chain_network TEXT DEFAULT 'polygon-amoy',
  contract_address TEXT,
  deployment_tx_hash TEXT,
  
  -- Status & Compliance
  status token_status NOT NULL DEFAULT 'Draft',
  kyc_required BOOLEAN NOT NULL DEFAULT true,
  accredited_only BOOLEAN NOT NULL DEFAULT true,
  minimum_investment NUMERIC DEFAULT 10000,
  
  -- Metadata
  property_type TEXT,
  location TEXT,
  legal_structure TEXT DEFAULT 'SPV',
  regulatory_jurisdiction TEXT DEFAULT 'ADGM',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  minted_at TIMESTAMPTZ,
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.property_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_tokens
CREATE POLICY "Users can view all property tokens"
  ON public.property_tokens FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tokens"
  ON public.property_tokens FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Token creators can update their tokens"
  ON public.property_tokens FOR UPDATE
  USING (auth.uid() = created_by OR created_by IS NULL);

-- ============================================
-- TOKEN OWNERSHIP (Fractional Ownership Ledger)
-- ============================================
CREATE TABLE public.token_ownership (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.property_tokens(id) ON DELETE CASCADE,
  
  -- Owner Identity
  owner_type TEXT NOT NULL DEFAULT 'individual', -- individual, corporate, trust
  owner_name TEXT NOT NULL,
  owner_email TEXT,
  owner_wallet_address TEXT,
  kyc_verified BOOLEAN NOT NULL DEFAULT false,
  kyc_document_id UUID,
  
  -- Holdings
  token_balance NUMERIC NOT NULL DEFAULT 0,
  ownership_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN token_balance > 0 THEN token_balance * 100 
    ELSE 0 END
  ) STORED,
  
  -- Investment
  invested_amount NUMERIC NOT NULL DEFAULT 0,
  average_cost_basis NUMERIC,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  frozen_reason TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(token_id, owner_email)
);

ALTER TABLE public.token_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view token ownership"
  ON public.token_ownership FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage ownership"
  ON public.token_ownership FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- PAYMENT ESCROW (Payment Tokenization)
-- ============================================
CREATE TABLE public.payment_escrow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escrow_id TEXT NOT NULL UNIQUE,
  
  -- References
  deal_id UUID REFERENCES public.deals(id),
  property_token_id UUID REFERENCES public.property_tokens(id),
  document_instance_id UUID REFERENCES public.document_instances(id),
  
  -- Parties
  payer_name TEXT NOT NULL,
  payer_email TEXT,
  payee_name TEXT NOT NULL,
  payee_email TEXT,
  
  -- Amounts
  total_amount NUMERIC NOT NULL,
  funded_amount NUMERIC NOT NULL DEFAULT 0,
  released_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AED',
  
  -- Payment Details
  payment_type TEXT NOT NULL, -- deposit, reservation, installment, commission
  payment_reference TEXT,
  bank_reference TEXT,
  
  -- Status & Conditions
  status escrow_status NOT NULL DEFAULT 'Created',
  release_conditions JSONB DEFAULT '[]'::jsonb,
  conditions_met JSONB DEFAULT '[]'::jsonb,
  
  -- Dates
  due_date DATE,
  funded_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.payment_escrow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view escrow records"
  ON public.payment_escrow FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage escrow"
  ON public.payment_escrow FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- SMART CONTRACTS (Contract Registry)
-- ============================================
CREATE TABLE public.smart_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id TEXT NOT NULL UNIQUE,
  
  -- Contract Details
  contract_type TEXT NOT NULL, -- SPA, MOU, Lease, Assignment, TokenPurchase
  contract_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  
  -- References
  deal_id UUID REFERENCES public.deals(id),
  listing_id UUID REFERENCES public.listings(id),
  property_token_id UUID REFERENCES public.property_tokens(id),
  document_instance_id UUID REFERENCES public.document_instances(id),
  template_id TEXT,
  
  -- Parties
  parties JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Contract Data
  contract_terms JSONB DEFAULT '{}'::jsonb,
  clauses JSONB DEFAULT '[]'::jsonb,
  
  -- Execution
  status contract_execution_status NOT NULL DEFAULT 'Draft',
  execution_method TEXT DEFAULT 'docusign', -- docusign, manual, blockchain
  
  -- Blockchain/Hash Evidence
  content_hash TEXT, -- SHA-256 of contract content
  blockchain_tx_hash TEXT,
  ipfs_cid TEXT,
  
  -- Signature Tracking
  docusign_envelope_id TEXT,
  all_signed BOOLEAN NOT NULL DEFAULT false,
  executed_at TIMESTAMPTZ,
  
  -- Dates
  effective_date DATE,
  expiry_date DATE,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view smart contracts"
  ON public.smart_contracts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage contracts"
  ON public.smart_contracts FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- CONTRACT EVENTS (Immutable Audit Trail)
-- ============================================
CREATE TABLE public.contract_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  
  -- References
  contract_id UUID NOT NULL REFERENCES public.smart_contracts(id) ON DELETE CASCADE,
  escrow_id UUID REFERENCES public.payment_escrow(id),
  
  -- Event Details
  event_type TEXT NOT NULL, -- created, signed, funded, released, voided, milestone
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- Actor
  actor_type TEXT, -- system, user, webhook
  actor_id TEXT,
  actor_name TEXT,
  
  -- Immutability
  event_hash TEXT NOT NULL, -- SHA-256(event_type + event_data + prev_hash + timestamp)
  prev_event_hash TEXT,
  
  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT event_hash_unique UNIQUE(event_hash)
);

ALTER TABLE public.contract_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contract events"
  ON public.contract_events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.contract_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Contract events are immutable - no updates or deletes allowed via RLS
-- (Events should only be appended, never modified)

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_property_tokens_status ON public.property_tokens(status);
CREATE INDEX idx_property_tokens_listing ON public.property_tokens(listing_id);
CREATE INDEX idx_token_ownership_token ON public.token_ownership(token_id);
CREATE INDEX idx_payment_escrow_deal ON public.payment_escrow(deal_id);
CREATE INDEX idx_payment_escrow_status ON public.payment_escrow(status);
CREATE INDEX idx_smart_contracts_deal ON public.smart_contracts(deal_id);
CREATE INDEX idx_smart_contracts_status ON public.smart_contracts(status);
CREATE INDEX idx_contract_events_contract ON public.contract_events(contract_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_property_tokens_updated_at
  BEFORE UPDATE ON public.property_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_token_ownership_updated_at
  BEFORE UPDATE ON public.token_ownership
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_escrow_updated_at
  BEFORE UPDATE ON public.payment_escrow
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_contracts_updated_at
  BEFORE UPDATE ON public.smart_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE REALTIME FOR CONTRACT EVENTS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.contract_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_escrow;