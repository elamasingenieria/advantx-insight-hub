-- Fix search path security issues for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role_val, 'client'::user_role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, company)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'company', NULL)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    company = COALESCE(EXCLUDED.company, profiles.company),
    updated_at = now();
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(synced_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  sync_count INTEGER := 0;
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    COALESCE((au.raw_user_meta_data->>'role')::user_role, 'client'::user_role)
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  WHERE p.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;
  
  GET DIAGNOSTICS sync_count = ROW_COUNT;
  RETURN QUERY SELECT sync_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_projects()
RETURNS TABLE(project_id uuid, project_name character varying, project_description text, project_status project_status, user_role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
WITH user_profile AS (
    SELECT id FROM profiles 
    WHERE user_id = auth.uid()
)
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.description AS project_description,
    p.status AS project_status,
    COALESCE(pm.role, 'owner') AS user_role
FROM 
    projects p
LEFT JOIN 
    project_members pm ON pm.project_id = p.id 
    AND pm.profile_id = (SELECT id FROM user_profile)
WHERE 
    p.profile_id = (SELECT id FROM user_profile)
    OR pm.profile_id IS NOT NULL;
$function$;