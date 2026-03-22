-- 1. Fix: Property tokens readable by unauthenticated users
DROP POLICY IF EXISTS "Users can view all property tokens" ON public.property_tokens;
CREATE POLICY "Authenticated users can view property tokens" ON public.property_tokens
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'Manager'::app_role)
    OR has_role(auth.uid(), 'Owner'::app_role)
    OR created_by = auth.uid()
  );

-- 2. Fix: Any authenticated user can modify tokens with NULL created_by
DROP POLICY IF EXISTS "Token creators can update their tokens" ON public.property_tokens;

-- 3. Remove overly permissive public INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create tokens" ON public.property_tokens;