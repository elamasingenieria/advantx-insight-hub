-- First, drop all existing problematic policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Team members can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- Create a security definer function to get current user role (avoids recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role_val, 'client'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create clean, non-recursive RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and team members can view all profiles" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() IN ('admin'::user_role, 'team_member'::user_role)
);

CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (public.get_current_user_role() = 'admin'::user_role);

-- Fix clients table policies for proper access
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;
DROP POLICY IF EXISTS "Team members can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Team members can view all clients" ON public.clients;

CREATE POLICY "Authenticated users can view all clients" ON public.clients
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and team members can manage clients" ON public.clients
FOR ALL USING (public.get_current_user_role() IN ('admin'::user_role, 'team_member'::user_role));

-- Ensure project access is properly configured
DROP POLICY IF EXISTS "Clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Team members can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Team members can view all projects" ON public.projects;

CREATE POLICY "Users can view accessible projects" ON public.projects
FOR SELECT USING (
  -- Users can see projects where they are the client
  client_id IN (
    SELECT c.id FROM clients c 
    JOIN profiles p ON c.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR
  -- Users can see projects they are members of
  id IN (
    SELECT pm.project_id FROM project_members pm 
    JOIN profiles p ON pm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR
  -- Admins and team members can see all projects
  public.get_current_user_role() IN ('admin'::user_role, 'team_member'::user_role)
);

CREATE POLICY "Admins and team members can manage projects" ON public.projects
FOR ALL USING (public.get_current_user_role() IN ('admin'::user_role, 'team_member'::user_role));