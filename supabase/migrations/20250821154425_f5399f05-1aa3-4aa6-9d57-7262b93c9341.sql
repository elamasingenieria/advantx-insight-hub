-- Create missing clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  company varchar NOT NULL,
  contact_email varchar NOT NULL,
  phone varchar,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Users can view their own client data"
ON public.clients
FOR SELECT
USING (profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Team members can manage all clients"
ON public.clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'team_member')
));

-- Add foreign key constraints that are missing
ALTER TABLE public.projects 
ADD CONSTRAINT projects_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.dashboard_configs
ADD CONSTRAINT dashboard_configs_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.payment_schedules
ADD CONSTRAINT payment_schedules_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.phases
ADD CONSTRAINT phases_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_phase_id_fkey
FOREIGN KEY (phase_id) REFERENCES public.phases(id) ON DELETE CASCADE;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add missing columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create trigger for clients table
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_projects_profile_id ON public.projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_project_id ON public.dashboard_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_project_id ON public.payment_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON public.phases(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON public.tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);