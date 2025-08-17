import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  total_amount?: number;
  monthly_savings?: number;
  annual_roi_percentage?: number;
  progress_percentage: number;
  drive_root_folder_id?: string;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    company: string;
    contact_email: string;
    phone?: string;
  };
  phases?: Phase[];
}

export interface Phase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  start_date?: string;
  end_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface UseProjectsOptions {
  clientId?: string;
  status?: Project['status'];
  includePhases?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('projects')
        .select(`
          *,
          client:clients!inner(id, name, company, contact_email, phone, profile_id)
          ${options.includePhases ? ', phases(*)' : ''}
        `)
        .order('created_at', { ascending: false });

      // Filter by client if user is a client
      if (profile?.role === 'client') {
        // Get projects where the client's profile_id matches
        query = query.eq('client.profile_id', profile.id);
      } else if (options.clientId) {
        // Admin/team member filtering by specific client
        query = query.eq('client_id', options.clientId);
      }

      // Filter by status if specified
      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      const errorMessage = error.message || 'Failed to load projects';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchProjects();
    }
  }, [profile, options.clientId, options.status, options.includePhases]);

  const refetch = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch,
  };
}

export function useProject(projectId: string, includePhases = true) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('projects')
        .select(`
          *,
          client:clients!inner(id, name, company, contact_email, phone, profile_id)
          ${includePhases ? ', phases(*)' : ''}
        `)
        .eq('id', projectId);

      // Filter by client access if user is a client
      if (profile?.role === 'client') {
        query = query.eq('client.profile_id', profile.id);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      const errorMessage = error.message || 'Failed to load project';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && projectId) {
      fetchProject();
    }
  }, [profile, projectId, includePhases]);

  const refetch = () => {
    fetchProject();
  };

  return {
    project,
    loading,
    error,
    refetch,
  };
}

export function useProjectStats() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSavings: 0,
    averageROI: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      let projectsQuery = supabase
        .from('projects')
        .select('status, monthly_savings, annual_roi_percentage');

      // Filter by client if user is a client
      if (profile?.role === 'client') {
        projectsQuery = projectsQuery
          .select('status, monthly_savings, annual_roi_percentage, client:clients!inner(profile_id)')
          .eq('client.profile_id', profile.id);
      }

      const { data: projects, error } = await projectsQuery;

      if (error) throw error;

      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      const totalSavings = projects?.reduce((sum, p) => sum + (p.monthly_savings || 0), 0) || 0;
      const avgROI = projects?.length 
        ? projects.reduce((sum, p) => sum + (p.annual_roi_percentage || 0), 0) / projects.length 
        : 0;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalSavings,
        averageROI: Math.round(avgROI),
      });
    } catch (error: any) {
      console.error('Error fetching project stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load project statistics',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  return { stats, loading, refetch: fetchStats };
}
