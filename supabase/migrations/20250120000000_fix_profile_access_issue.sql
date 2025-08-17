-- Fix profile access issue causing users to recreate profiles every login
-- The problem is recursive RLS policies that prevent profile fetching

-- 1. Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Team members can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and team members can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- 2. Drop problematic functions that cause recursion
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. Create simple, non-recursive policies
-- Users can ALWAYS view their own profile (no role checking needed)
CREATE POLICY "Users can always view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can ALWAYS update their own profile
CREATE POLICY "Users can always update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can ALWAYS insert their own profile (needed for profile creation)
CREATE POLICY "Users can always insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create a security definer function to safely check if user is admin
-- This bypasses RLS when checking admin status
CREATE OR REPLACE FUNCTION public.check_user_role(check_user_id UUID DEFAULT auth.uid())
RETURNS user_role 
LANGUAGE sql 
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = check_user_id LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_role(UUID) TO authenticated;

-- 5. Create admin/team member policies using the safe function
-- Team members can view all profiles (but only if they are actually team members)
CREATE POLICY "Team members can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.check_user_role() IN ('admin'::user_role, 'team_member'::user_role)
  );

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.check_user_role() = 'admin'::user_role);

-- 6. Ensure all existing users have profiles by running the sync function
SELECT public.sync_missing_profiles();

-- 7. Add a simple function to troubleshoot profile issues
CREATE OR REPLACE FUNCTION public.debug_user_profile(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  user_exists BOOLEAN,
  profile_exists BOOLEAN,
  user_email TEXT,
  profile_email TEXT,
  profile_role user_role,
  auth_uid UUID
) 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT 
    EXISTS(SELECT 1 FROM auth.users WHERE id = check_user_id) as user_exists,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = check_user_id) as profile_exists,
    (SELECT email FROM auth.users WHERE id = check_user_id) as user_email,
    (SELECT email FROM public.profiles WHERE user_id = check_user_id) as profile_email,
    (SELECT role FROM public.profiles WHERE user_id = check_user_id) as profile_role,
    auth.uid() as auth_uid;
$$;

-- Grant execute to authenticated users for debugging
GRANT EXECUTE ON FUNCTION public.debug_user_profile(UUID) TO authenticated;
