-- Add ownership tracking columns to prospects table
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS assigned_broker_id uuid REFERENCES public.broker_profiles(id),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create index for performance on the new columns
CREATE INDEX IF NOT EXISTS idx_prospects_assigned_broker ON public.prospects(assigned_broker_id);
CREATE INDEX IF NOT EXISTS idx_prospects_created_by ON public.prospects(created_by);

-- Drop existing overly permissive broker policies
DROP POLICY IF EXISTS "Brokers can view prospects" ON public.prospects;
DROP POLICY IF EXISTS "Brokers can update prospects" ON public.prospects;

-- Create restrictive SELECT policy: Brokers can only see prospects they created or are assigned to
CREATE POLICY "Brokers can view own or assigned prospects"
ON public.prospects
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'Broker'::app_role) AND (
    created_by = auth.uid() OR
    assigned_broker_id IN (
      SELECT id FROM public.broker_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Create restrictive UPDATE policy: Brokers can only update prospects they created or are assigned to
CREATE POLICY "Brokers can update own or assigned prospects"
ON public.prospects
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'Broker'::app_role) AND (
    created_by = auth.uid() OR
    assigned_broker_id IN (
      SELECT id FROM public.broker_profiles WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'Broker'::app_role) AND (
    created_by = auth.uid() OR
    assigned_broker_id IN (
      SELECT id FROM public.broker_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Create INSERT policy: Brokers can create prospects (with created_by set to their user id)
CREATE POLICY "Brokers can create prospects"
ON public.prospects
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'Broker'::app_role) AND
  created_by = auth.uid()
);

-- Create DELETE policy: Brokers can only delete prospects they created
CREATE POLICY "Brokers can delete own prospects"
ON public.prospects
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'Broker'::app_role) AND
  created_by = auth.uid()
);