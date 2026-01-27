-- ============================================
-- SECURITY FIX: Auto-assign roles via trigger
-- ============================================

-- Create trigger function to handle new user role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_operators_count INTEGER;
BEGIN
  -- Check if this is the first user (make them Operator)
  SELECT COUNT(*) INTO existing_operators_count FROM public.user_roles;
  
  -- Assign default role: first user becomes Operator, others become Broker
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN existing_operators_count = 0 THEN 'Operator'::app_role
      ELSE 'Broker'::app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_role();

-- ============================================
-- SECURITY FIX: Profiles table - users can view own profile
-- ============================================

-- Add policy for users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Add policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add policy for users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECURITY FIX: Brokers can view prospects they're working
-- ============================================

-- Ensure Brokers can view prospects (if not already existing)
DROP POLICY IF EXISTS "Brokers can view prospects" ON public.prospects;
CREATE POLICY "Brokers can view prospects"
ON public.prospects
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'Broker'::app_role));