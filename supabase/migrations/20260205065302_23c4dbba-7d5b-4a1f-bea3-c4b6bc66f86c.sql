-- Phase 1: RLS Security Hardening
-- =================================

-- 1. Create helper function to check if user is a deal participant
CREATE OR REPLACE FUNCTION public.is_deal_participant(_deal_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM deal_brokers db
    JOIN broker_profiles bp ON db.broker_id = bp.id
    WHERE db.deal_id = _deal_id AND bp.user_id = _user_id
  )
$$;

-- 2. Create helper function to check if user owns a smart contract (via deal)
CREATE OR REPLACE FUNCTION public.is_contract_participant(_contract_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM smart_contracts sc
    JOIN deal_brokers db ON sc.deal_id = db.deal_id
    JOIN broker_profiles bp ON db.broker_id = bp.id
    WHERE sc.id = _contract_id AND bp.user_id = _user_id
  )
$$;

-- 3. Create helper function to check if user owns an escrow (via deal)
CREATE OR REPLACE FUNCTION public.is_escrow_participant(_escrow_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM payment_escrow pe
    JOIN deal_brokers db ON pe.deal_id = db.deal_id
    JOIN broker_profiles bp ON db.broker_id = bp.id
    WHERE pe.id = _escrow_id AND bp.user_id = _user_id
  )
$$;

-- 4. Add created_by columns where missing
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.token_ownership ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.smart_contracts ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.payment_escrow ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.viewing_bookings ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 5. Fix property_tokens RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert property tokens" ON public.property_tokens;
DROP POLICY IF EXISTS "Authenticated users can update property tokens" ON public.property_tokens;
DROP POLICY IF EXISTS "Authenticated users can delete property tokens" ON public.property_tokens;

CREATE POLICY "Operators can insert property tokens" 
ON public.property_tokens FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Owners or Operators can update property tokens" 
ON public.property_tokens FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Owners or Operators can delete property tokens" 
ON public.property_tokens FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

-- 6. Fix token_ownership RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage token ownership" ON public.token_ownership;

CREATE POLICY "Operators or owners can insert token ownership" 
ON public.token_ownership FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Operators or owners can update token ownership" 
ON public.token_ownership FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Operators or owners can delete token ownership" 
ON public.token_ownership FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

-- 7. Fix payment_escrow RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage escrow" ON public.payment_escrow;

CREATE POLICY "Deal participants or Operators can insert escrow" 
ON public.payment_escrow FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_deal_participant(deal_id, auth.uid())
  OR created_by = auth.uid()
);

CREATE POLICY "Deal participants or Operators can update escrow" 
ON public.payment_escrow FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_escrow_participant(id, auth.uid())
  OR created_by = auth.uid()
);

CREATE POLICY "Deal participants or Operators can delete escrow" 
ON public.payment_escrow FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_escrow_participant(id, auth.uid())
  OR created_by = auth.uid()
);

-- 8. Fix smart_contracts RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage smart contracts" ON public.smart_contracts;

CREATE POLICY "Deal participants or Operators can insert contracts" 
ON public.smart_contracts FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_deal_participant(deal_id, auth.uid())
  OR created_by = auth.uid()
);

CREATE POLICY "Deal participants or Operators can update contracts" 
ON public.smart_contracts FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_contract_participant(id, auth.uid())
  OR created_by = auth.uid()
);

CREATE POLICY "Deal participants or Operators can delete contracts" 
ON public.smart_contracts FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_contract_participant(id, auth.uid())
  OR created_by = auth.uid()
);

-- 9. Fix contract_events RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert contract events" ON public.contract_events;

CREATE POLICY "Contract participants or Operators can insert events" 
ON public.contract_events FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR public.is_contract_participant(contract_id, auth.uid())
);

-- 10. Fix generated_documents RLS policies  
DROP POLICY IF EXISTS "Authenticated users can insert generated documents" ON public.generated_documents;
DROP POLICY IF EXISTS "Authenticated users can update generated documents" ON public.generated_documents;

CREATE POLICY "Creators or Operators can insert documents" 
ON public.generated_documents FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR generated_by = auth.uid()
);

CREATE POLICY "Creators or Operators can update documents" 
ON public.generated_documents FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR generated_by = auth.uid()
);

-- 11. Fix viewing_bookings RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert viewing bookings" ON public.viewing_bookings;
DROP POLICY IF EXISTS "Authenticated users can update viewing bookings" ON public.viewing_bookings;
DROP POLICY IF EXISTS "Authenticated users can delete viewing bookings" ON public.viewing_bookings;

CREATE POLICY "Creators or Operators can insert viewings" 
ON public.viewing_bookings FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Creators or Operators can update viewings" 
ON public.viewing_bookings FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Creators or Operators can delete viewings" 
ON public.viewing_bookings FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

-- 12. Fix communication_logs RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert communication logs" ON public.communication_logs;
DROP POLICY IF EXISTS "Authenticated users can update communication logs" ON public.communication_logs;

CREATE POLICY "Creators or Operators can insert comm logs" 
ON public.communication_logs FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Creators or Operators can update comm logs" 
ON public.communication_logs FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

-- 13. Add indexes for performance on the new columns
CREATE INDEX IF NOT EXISTS idx_property_tokens_created_by ON public.property_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_token_ownership_created_by ON public.token_ownership(created_by);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_created_by ON public.smart_contracts(created_by);
CREATE INDEX IF NOT EXISTS idx_payment_escrow_created_by ON public.payment_escrow(created_by);
CREATE INDEX IF NOT EXISTS idx_viewing_bookings_created_by ON public.viewing_bookings(created_by);