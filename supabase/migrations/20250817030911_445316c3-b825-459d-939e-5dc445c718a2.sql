-- Create the generate-client-project edge function database migrations
-- This adds tables needed for the project generator functionality

-- First create project templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  project_type VARCHAR NOT NULL,
  template_data JSONB NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for project templates
CREATE POLICY "Admin users can manage templates" ON public.project_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add payment schedules table
CREATE TABLE IF NOT EXISTS public.payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for payment schedules
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for payment schedules
CREATE POLICY "Team members can manage payment schedules" ON public.payment_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = ANY(ARRAY['team_member'::user_role, 'admin'::user_role])
    )
  );

CREATE POLICY "Clients can view their project payment schedules" ON public.payment_schedules
  FOR SELECT USING (
    project_id IN (
      SELECT pr.id FROM public.projects pr
      JOIN public.clients c ON pr.client_id = c.id
      JOIN public.profiles p ON c.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add dashboard configurations table
CREATE TABLE IF NOT EXISTS public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  widgets TEXT[] DEFAULT ARRAY['progress', 'tasks', 'payments', 'team'],
  branding JSONB DEFAULT '{"primaryColor": "#3b82f6", "welcomeMessage": "Welcome to your project dashboard"}',
  permissions JSONB DEFAULT '{"viewTasks": true, "viewPayments": true, "viewTeam": true, "viewTimeline": true}',
  notifications JSONB DEFAULT '{"emailUpdates": true, "deadlineReminders": true, "paymentReminders": true}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for dashboard configs
ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard configs
CREATE POLICY "Team members can manage dashboard configs" ON public.dashboard_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = ANY(ARRAY['team_member'::user_role, 'admin'::user_role])
    )
  );

CREATE POLICY "Clients can view their project dashboard config" ON public.dashboard_configs
  FOR SELECT USING (
    project_id IN (
      SELECT pr.id FROM public.projects pr
      JOIN public.clients c ON pr.client_id = c.id
      JOIN public.profiles p ON c.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );