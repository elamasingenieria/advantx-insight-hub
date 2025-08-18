import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ProjectDashboard {
  project: {
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
    profile_id: string;
  };
  dashboardConfig: {
    id: string;
    widgets: string[];
    branding: {
      primaryColor: string;
      welcomeMessage: string;
    };
    permissions: {
      viewTeam: boolean;
      viewTasks: boolean;
      viewPayments: boolean;
      viewTimeline: boolean;
    };
    notifications: {
      emailUpdates: boolean;
      paymentReminders: boolean;
      deadlineReminders: boolean;
    };
  };
  phases: Array<{
    id: string;
    name: string;
    description?: string;
    progress_percentage: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
    start_date?: string;
    end_date?: string;
    order_index: number;
  }>;
  paymentSchedules: Array<{
    id: string;
    name: string;
    amount: number;
    due_date: string;
    description?: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  }>;
}

export function useProjectDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDashboard = async () => {
    if (!profile?.id) {
      console.log('No profile ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching project dashboard for profile:', profile.id);

      // 1. Buscar el proyecto asignado al profile
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          phases(*),
          payment_schedules:payment_schedules(*),
          dashboard_config:dashboard_configs(*)
        `)
        .eq('profile_id', profile.id)
        .single();

      if (projectError) {
        if (projectError.code === 'PGRST116') {
          // No project found
          console.log('No project assigned to this profile');
          setDashboard(null);
          return;
        }
        throw projectError;
      }

      console.log('Project data fetched:', projectData);

      // 2. Construir el objeto dashboard
      const dashboardData: ProjectDashboard = {
        project: {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          total_amount: projectData.total_amount,
          monthly_savings: projectData.monthly_savings,
          annual_roi_percentage: projectData.annual_roi_percentage,
          progress_percentage: projectData.progress_percentage,
          profile_id: projectData.profile_id,
        },
        dashboardConfig: projectData.dashboard_config?.[0] || {
          id: '',
          widgets: ['progress', 'tasks', 'payments', 'team'],
          branding: {
            primaryColor: '#3b82f6',
            welcomeMessage: `Welcome to your ${projectData.name} project dashboard`
          },
          permissions: {
            viewTeam: true,
            viewTasks: true,
            viewPayments: true,
            viewTimeline: true
          },
          notifications: {
            emailUpdates: true,
            paymentReminders: true,
            deadlineReminders: true
          }
        },
        phases: projectData.phases || [],
        paymentSchedules: projectData.payment_schedules || []
      };

      setDashboard(dashboardData);
      console.log('Dashboard data set:', dashboardData);

    } catch (error: any) {
      console.error('Error fetching project dashboard:', error);
      const errorMessage = error.message || 'Failed to load project dashboard';
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
      fetchProjectDashboard();
    }
  }, [profile]);

  const refetch = () => {
    fetchProjectDashboard();
  };

  return {
    dashboard,
    loading,
    error,
    refetch,
    hasProject: !!dashboard,
  };
}
