import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DashboardConfig {
  id: string;
  project_id: string;
  widgets: string[];
  branding: {
    primaryColor: string;
    welcomeMessage: string;
  };
  permissions: {
    viewTasks: boolean;
    viewPayments: boolean;
    viewTeam: boolean;
    viewTimeline: boolean;
  };
  notifications: {
    emailUpdates: boolean;
    deadlineReminders: boolean;
    paymentReminders: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface UseDashboardOptions {
  projectId?: string;
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('dashboard_configs')
        .select('*');

      // If projectId is provided, fetch for specific project
      if (options.projectId) {
        query = query.eq('project_id', options.projectId);
      } else if (profile?.role === 'client') {
        // For clients, find their assigned project's dashboard config
        const { data: userProject, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (projectError) {
          if (projectError.code === 'PGRST116') {
            // No project found for client
            console.log('No project assigned to this client profile');
            setDashboardConfig(null);
            return;
          }
          throw projectError;
        }

        if (!userProject) {
          setDashboardConfig(null);
          return;
        }

        query = query.eq('project_id', userProject.id);
      } else {
        // For admin/team members, we might want to get all configs or handle differently
        // For now, let's require a specific projectId for non-clients
        console.log('ProjectId required for non-client users');
        setLoading(false);
        return;
      }

      const { data, error: configError } = await query.single();

      if (configError) {
        if (configError.code === 'PGRST116') {
          // No dashboard config found
          console.log('No dashboard configuration found');
          setDashboardConfig(null);
          return;
        }
        throw configError;
      }

      console.log('Dashboard config fetched:', data);
      setDashboardConfig(data);

    } catch (error: any) {
      console.error('Error fetching dashboard config:', error);
      const errorMessage = error.message || 'Failed to load dashboard configuration';
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

  const updateDashboardConfig = async (updates: Partial<DashboardConfig>) => {
    if (!dashboardConfig) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No dashboard configuration to update',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('dashboard_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', dashboardConfig.id);

      if (error) throw error;

      // Refresh the config
      await fetchDashboardConfig();

      toast({
        title: 'Configuration Updated',
        description: 'Dashboard configuration has been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error updating dashboard config:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Failed to update dashboard configuration.',
      });
    }
  };

  const createDashboardConfig = async (projectId: string, config?: Partial<DashboardConfig>) => {
    try {
      const defaultConfig = {
        project_id: projectId,
        widgets: ['progress', 'tasks', 'payments', 'team'],
        branding: {
          primaryColor: '#3b82f6',
          welcomeMessage: 'Welcome to your project dashboard'
        },
        permissions: {
          viewTasks: true,
          viewPayments: true,
          viewTeam: true,
          viewTimeline: true
        },
        notifications: {
          emailUpdates: true,
          deadlineReminders: true,
          paymentReminders: true
        }
      };

      const { data, error } = await supabase
        .from('dashboard_configs')
        .insert([{ ...defaultConfig, ...config }])
        .select()
        .single();

      if (error) throw error;

      setDashboardConfig(data);
      
      toast({
        title: 'Configuration Created',
        description: 'Dashboard configuration has been created successfully.',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating dashboard config:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message || 'Failed to create dashboard configuration.',
      });
      throw error;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchDashboardConfig();
    }
  }, [profile, options.projectId]);

  const refetch = () => {
    fetchDashboardConfig();
  };

  return {
    dashboardConfig,
    loading,
    error,
    updateDashboardConfig,
    createDashboardConfig,
    refetch,
    hasConfig: !!dashboardConfig,
  };
}

// Hook for admin to get all dashboard configs
export function useAllDashboardConfigs() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<DashboardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllConfigs = async () => {
    // Only allow admins to fetch all configs
    if (profile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: configError } = await supabase
        .from('dashboard_configs')
        .select(`
          *,
          project:projects(id, name, profile:profiles(full_name, email))
        `)
        .order('created_at', { ascending: false });

      if (configError) throw configError;

      console.log('All dashboard configs fetched:', data);
      setConfigs(data || []);

    } catch (error: any) {
      console.error('Error fetching all dashboard configs:', error);
      const errorMessage = error.message || 'Failed to load dashboard configurations';
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
      fetchAllConfigs();
    }
  }, [profile]);

  const refetch = () => {
    fetchAllConfigs();
  };

  return {
    configs,
    loading,
    error,
    refetch,
  };
}
