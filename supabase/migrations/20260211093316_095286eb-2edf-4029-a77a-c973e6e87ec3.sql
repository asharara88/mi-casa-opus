
-- Rename enum values in-place (no need to drop/recreate policies)
ALTER TYPE public.app_role RENAME VALUE 'Operator' TO 'Manager';
ALTER TYPE public.app_role RENAME VALUE 'LegalOwner' TO 'Owner';
ALTER TYPE public.app_role RENAME VALUE 'Investor' TO 'Agent';
-- 'Broker' stays as-is

-- Update handle_new_user_role trigger (first user = Manager, rest = Broker)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM public.user_roles;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN existing_count = 0 THEN 'Manager'::app_role ELSE 'Broker'::app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
