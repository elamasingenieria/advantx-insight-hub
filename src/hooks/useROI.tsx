import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ROIData {
  projectId: string;
  projectName: string;
  totalBudget: number;
  actualCosts: number;
  monthlySavings: number;
  annualSavings: number;
  currentROI: number;
  projectedROI: number;
  breakEvenMonths: number;
  completionPercentage: number;
  timeToCompletion: number; // in months
  costEfficiency: number; // percentage
}

export interface ROISummary {
  totalInvestment: number;
  totalSavingsToDate: number;
  averageROI: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectedAnnualSavings: number;
}

export function useROI(projectId?: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [roiData, setROIData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateProjectROI = (project: any): ROIData => {
    const totalBudget = project.total_amount || 0;
    const monthlySavings = project.monthly_savings || 0;
    const annualSavings = monthlySavings * 12;
    const completionPercentage = project.progress_percentage || 0;
    
    // Calculate actual costs based on completion and phase progress
    let actualCosts = 0;
    if (project.phases && project.phases.length > 0) {
      actualCosts = project.phases.reduce((total: number, phase: any) => {
        const phaseValue = totalBudget / project.phases.length;
        return total + (phaseValue * (phase.progress_percentage / 100));
      }, 0);
    } else {
      actualCosts = totalBudget * (completionPercentage / 100);
    }

    // Calculate ROI metrics
    const currentROI = actualCosts > 0 ? ((annualSavings - actualCosts) / actualCosts) * 100 : 0;
    const projectedROI = totalBudget > 0 ? ((annualSavings - totalBudget) / totalBudget) * 100 : 0;
    const breakEvenMonths = totalBudget > 0 && monthlySavings > 0 ? totalBudget / monthlySavings : 0;
    
    // Time to completion estimate based on current progress
    const remainingProgress = 100 - completionPercentage;
    const timeToCompletion = remainingProgress > 0 ? (remainingProgress / 100) * 12 : 0; // assuming 12 months total
    
    // Cost efficiency (how much we're under/over budget)
    const costEfficiency = actualCosts > 0 ? ((totalBudget - actualCosts) / totalBudget) * 100 : 100;

    return {
      projectId: project.id,
      projectName: project.name,
      totalBudget,
      actualCosts,
      monthlySavings,
      annualSavings,
      currentROI: Math.round(currentROI),
      projectedROI: Math.round(projectedROI),
      breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
      completionPercentage,
      timeToCompletion: Math.round(timeToCompletion * 10) / 10,
      costEfficiency: Math.round(costEfficiency),
    };
  };

  const fetchROIData = async () => {
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
          phases(*),
          client:clients!inner(id, name, company, profile_id)
        `)
        .eq('id', projectId);

      // Filter by client access if user is a client
      if (profile?.role === 'client') {
        query = query.eq('client.profile_id', profile.id);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      const roiCalculations = calculateProjectROI(data);
      setROIData(roiCalculations);
    } catch (error: any) {
      console.error('Error fetching ROI data:', error);
      const errorMessage = error.message || 'Failed to load ROI data';
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
      fetchROIData();
    }
  }, [profile, projectId]);

  const refetch = () => {
    fetchROIData();
  };

  return {
    roiData,
    loading,
    error,
    refetch,
  };
}

export function useROISummary() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<ROISummary>({
    totalInvestment: 0,
    totalSavingsToDate: 0,
    averageROI: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    projectedAnnualSavings: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchROISummary = async () => {
    try {
      setLoading(true);

      let projectsQuery = supabase
        .from('projects')
        .select(`
          *,
          phases(*),
          client:clients!inner(profile_id)
        `);

      // Filter by client if user is a client
      if (profile?.role === 'client') {
        projectsQuery = projectsQuery.eq('client.profile_id', profile.id);
      }

      const { data: projects, error } = await projectsQuery;

      if (error) throw error;

      if (!projects || projects.length === 0) {
        setSummary({
          totalInvestment: 0,
          totalSavingsToDate: 0,
          averageROI: 0,
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          projectedAnnualSavings: 0,
        });
        return;
      }

      // Calculate summary metrics
      const totalInvestment = projects.reduce((sum, p) => sum + (p.total_amount || 0), 0);
      const projectedAnnualSavings = projects.reduce((sum, p) => sum + ((p.monthly_savings || 0) * 12), 0);
      
      // Calculate total savings to date based on completion percentage
      const totalSavingsToDate = projects.reduce((sum, p) => {
        const annualSavings = (p.monthly_savings || 0) * 12;
        const completionFactor = (p.progress_percentage || 0) / 100;
        return sum + (annualSavings * completionFactor);
      }, 0);

      // Calculate average ROI
      const roiValues = projects.map(p => {
        const investment = p.total_amount || 0;
        const savings = (p.monthly_savings || 0) * 12;
        return investment > 0 ? ((savings - investment) / investment) * 100 : 0;
      });
      const averageROI = roiValues.length > 0 ? roiValues.reduce((sum, roi) => sum + roi, 0) / roiValues.length : 0;

      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;

      setSummary({
        totalInvestment,
        totalSavingsToDate,
        averageROI: Math.round(averageROI),
        totalProjects,
        activeProjects,
        completedProjects,
        projectedAnnualSavings,
      });
    } catch (error: any) {
      console.error('Error fetching ROI summary:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load ROI summary',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchROISummary();
    }
  }, [profile]);

  return { summary, loading, refetch: fetchROISummary };
}

export function useROIComparison() {
  const { profile } = useAuth();
  const [comparisons, setComparisons] = useState<ROIData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchROIComparison = async () => {
    try {
      setLoading(true);

      let projectsQuery = supabase
        .from('projects')
        .select(`
          *,
          phases(*),
          client:clients!inner(profile_id)
        `)
        .order('created_at', { ascending: false });

      // Filter by client if user is a client
      if (profile?.role === 'client') {
        projectsQuery = projectsQuery.eq('client.profile_id', profile.id);
      }

      const { data: projects, error } = await projectsQuery;

      if (error) throw error;

      // Calculate ROI for each project
      const roiComparisons = (projects || []).map(project => {
        const totalBudget = project.total_amount || 0;
        const monthlySavings = project.monthly_savings || 0;
        const annualSavings = monthlySavings * 12;
        const completionPercentage = project.progress_percentage || 0;
        
        let actualCosts = 0;
        if (project.phases && project.phases.length > 0) {
          actualCosts = project.phases.reduce((total: number, phase: any) => {
            const phaseValue = totalBudget / project.phases.length;
            return total + (phaseValue * (phase.progress_percentage / 100));
          }, 0);
        } else {
          actualCosts = totalBudget * (completionPercentage / 100);
        }

        const currentROI = actualCosts > 0 ? ((annualSavings - actualCosts) / actualCosts) * 100 : 0;
        const projectedROI = totalBudget > 0 ? ((annualSavings - totalBudget) / totalBudget) * 100 : 0;
        const breakEvenMonths = totalBudget > 0 && monthlySavings > 0 ? totalBudget / monthlySavings : 0;
        const remainingProgress = 100 - completionPercentage;
        const timeToCompletion = remainingProgress > 0 ? (remainingProgress / 100) * 12 : 0;
        const costEfficiency = actualCosts > 0 ? ((totalBudget - actualCosts) / totalBudget) * 100 : 100;

        return {
          projectId: project.id,
          projectName: project.name,
          totalBudget,
          actualCosts,
          monthlySavings,
          annualSavings,
          currentROI: Math.round(currentROI),
          projectedROI: Math.round(projectedROI),
          breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
          completionPercentage,
          timeToCompletion: Math.round(timeToCompletion * 10) / 10,
          costEfficiency: Math.round(costEfficiency),
        };
      });

      setComparisons(roiComparisons);
    } catch (error: any) {
      console.error('Error fetching ROI comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchROIComparison();
    }
  }, [profile]);

  return { comparisons, loading, refetch: fetchROIComparison };
}
