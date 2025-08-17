-- Fix missing RLS policies for project_members table
CREATE POLICY "Team members can insert project members" ON public.project_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin'::user_role, 'team_member'::user_role)
  )
);

CREATE POLICY "Team members can update project members" ON public.project_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin'::user_role, 'team_member'::user_role)
  )
);

CREATE POLICY "Team members can delete project members" ON public.project_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin'::user_role, 'team_member'::user_role)
  )
);

-- Ensure foreign key constraints exist for data integrity
ALTER TABLE public.project_members 
ADD CONSTRAINT fk_project_members_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.project_members 
ADD CONSTRAINT fk_project_members_profile 
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.payment_schedules 
ADD CONSTRAINT fk_payment_schedules_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.dashboard_configs 
ADD CONSTRAINT fk_dashboard_configs_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;