-- Phase 1: Extend prospects table with MiCasa algorithm fields

-- Add buyer type and budget fields
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS buyer_type TEXT CHECK (buyer_type IS NULL OR buyer_type IN ('EndUser', 'Investor', 'Broker'));
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS budget_min NUMERIC;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS budget_max NUMERIC;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS timeframe TEXT CHECK (timeframe IS NULL OR timeframe IN ('0-3', '3-6', '6-12', '12+'));

-- Add language and country
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS country TEXT;

-- Add prospect status tracking
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS prospect_status TEXT DEFAULT 'NEW' CHECK (prospect_status IN ('NEW', 'INCOMPLETE', 'VERIFIED', 'DISQUALIFIED'));
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS disqualification_reason TEXT CHECK (disqualification_reason IS NULL OR disqualification_reason IN ('SPAM', 'DUPLICATE', 'BROKER', 'BELOW_BUDGET', 'INELIGIBLE'));
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS disqualified_at TIMESTAMPTZ;

-- Link to lead (1:1 relationship)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS linked_lead_id UUID REFERENCES leads(id);

-- Intent signals for scoring
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS is_cash_buyer BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS mortgage_preapproval BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS price_list_requested BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS whatsapp_started BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS brochure_downloaded BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS repeat_visit_7d BOOLEAN DEFAULT false;

-- Scoring fields (deterministic, calculated by rules engine)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS fit_score INTEGER DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS intent_score INTEGER DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;

-- Enforce 1 Prospect → 1 Lead constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_linked_lead ON prospects(linked_lead_id) WHERE linked_lead_id IS NOT NULL;

-- Enforce 1 Lead → max 1 active Deal constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_deals_active_lead ON deals(linked_lead_id) WHERE linked_lead_id IS NOT NULL AND deal_state NOT IN ('ClosedWon', 'ClosedLost');