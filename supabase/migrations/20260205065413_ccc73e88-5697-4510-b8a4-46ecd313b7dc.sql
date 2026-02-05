-- Add created_by columns first, then fix policies
-- ================================================

-- Add created_by columns
ALTER TABLE public.portal_inquiries ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.portal_publications ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Portal inquiries - fix remaining
DROP POLICY IF EXISTS "Authenticated users can insert portal inquiries" ON public.portal_inquiries;
DROP POLICY IF EXISTS "Authenticated users can update portal inquiries" ON public.portal_inquiries;
DROP POLICY IF EXISTS "Authenticated can insert portal inquiries" ON public.portal_inquiries;
DROP POLICY IF EXISTS "Operators or creators update portal inquiries" ON public.portal_inquiries;

CREATE POLICY "Authenticated can insert portal inquiries" 
ON public.portal_inquiries FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Operators or creators update portal inquiries" 
ON public.portal_inquiries FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

-- Portal publications - fix remaining
DROP POLICY IF EXISTS "Authenticated users can insert portal publications" ON public.portal_publications;
DROP POLICY IF EXISTS "Authenticated users can update portal publications" ON public.portal_publications;
DROP POLICY IF EXISTS "Authenticated users can delete portal publications" ON public.portal_publications;
DROP POLICY IF EXISTS "Ops or creators insert portal publications" ON public.portal_publications;
DROP POLICY IF EXISTS "Ops or creators update portal publications" ON public.portal_publications;
DROP POLICY IF EXISTS "Ops or creators delete portal publications" ON public.portal_publications;

CREATE POLICY "Ops or creators insert portal publications" 
ON public.portal_publications FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Ops or creators update portal publications" 
ON public.portal_publications FOR UPDATE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

CREATE POLICY "Ops or creators delete portal publications" 
ON public.portal_publications FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR created_by = auth.uid()
);

-- Price watches - drop old permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage price watches" ON public.price_watches;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_portal_inquiries_created_by ON public.portal_inquiries(created_by);
CREATE INDEX IF NOT EXISTS idx_portal_publications_created_by ON public.portal_publications(created_by);