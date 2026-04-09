-- Fix remaining permissive policies (retry with proper drops)
-- ============================================================

-- Price alerts - drop existing and recreate
DROP POLICY IF EXISTS "Authenticated users can manage price alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Service can insert alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can manage alerts for their watches" ON public.price_alerts;

CREATE POLICY "Users can manage alerts for their watches" 
ON public.price_alerts FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR EXISTS (
    SELECT 1 FROM price_watches pw 
    WHERE pw.id = price_alerts.watch_id AND pw.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR EXISTS (
    SELECT 1 FROM price_watches pw 
    WHERE pw.id = price_alerts.watch_id AND pw.user_id = auth.uid()
  )
);

-- Price snapshots - drop existing and recreate
DROP POLICY IF EXISTS "Authenticated users can manage price snapshots" ON public.price_snapshots;
DROP POLICY IF EXISTS "Service can insert snapshots" ON public.price_snapshots;
DROP POLICY IF EXISTS "Users can manage snapshots for their watches" ON public.price_snapshots;

CREATE POLICY "Users can manage snapshots for their watches" 
ON public.price_snapshots FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR EXISTS (
    SELECT 1 FROM price_watches pw 
    WHERE pw.id = price_snapshots.watch_id AND pw.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR EXISTS (
    SELECT 1 FROM price_watches pw 
    WHERE pw.id = price_snapshots.watch_id AND pw.user_id = auth.uid()
  )
);