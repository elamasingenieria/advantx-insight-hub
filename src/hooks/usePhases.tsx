import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Phase } from '@/hooks/useProjects';

export interface CreatePhaseData {
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  order_index: number;
}

export interface UpdatePhaseData {
  name?: string;
  description?: string;
  progress_percentage?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  start_date?: string;
  end_date?: string;
  order_index?: number;
}

export function usePhases(projectId?: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhases = async () => {
    if (!projectId) {
      setPhases([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      setPhases(data || []);
    } catch (error: any) {
      console.error('Error fetching phases:', error);
      const errorMessage = error.message || 'Failed to load phases';
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

  const createPhase = async (phaseData: CreatePhaseData): Promise<Phase | null> => {
    try {
      const { data, error } = await supabase
        .from('phases')
        .insert([phaseData])
        .select()
        .single();

      if (error) throw error;

      setPhases(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      
      toast({
        title: 'Success',
        description: 'Phase created successfully!',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating phase:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create phase',
      });
      return null;
    }
  };

  const updatePhase = async (phaseId: string, updates: UpdatePhaseData): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('phases')
        .update(updates)
        .eq('id', phaseId)
        .select()
        .single();

      if (error) throw error;

      setPhases(prev => 
        prev.map(phase => 
          phase.id === phaseId ? { ...phase, ...data } : phase
        ).sort((a, b) => a.order_index - b.order_index)
      );

      toast({
        title: 'Success',
        description: 'Phase updated successfully!',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating phase:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update phase',
      });
      return false;
    }
  };

  const deletePhase = async (phaseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phases')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;

      setPhases(prev => prev.filter(phase => phase.id !== phaseId));

      toast({
        title: 'Success',
        description: 'Phase deleted successfully!',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete phase',
      });
      return false;
    }
  };

  const reorderPhases = async (reorderedPhases: Phase[]): Promise<boolean> => {
    try {
      // Update order_index for each phase individually
      for (let i = 0; i < reorderedPhases.length; i++) {
        const phase = reorderedPhases[i];
        const { error } = await supabase
          .from('phases')
          .update({ order_index: i + 1 })
          .eq('id', phase.id);

        if (error) throw error;
      }

      setPhases(reorderedPhases);

      toast({
        title: 'Success',
        description: 'Phase order updated successfully!',
      });

      return true;
    } catch (error: any) {
      console.error('Error reordering phases:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to reorder phases',
      });
      return false;
    }
  };

  const updatePhaseProgress = async (phaseId: string, progress: number): Promise<boolean> => {
    return updatePhase(phaseId, { progress_percentage: Math.max(0, Math.min(100, progress)) });
  };

  useEffect(() => {
    if (profile && projectId) {
      fetchPhases();
    }
  }, [profile, projectId]);

  const refetch = () => {
    fetchPhases();
  };

  return {
    phases,
    loading,
    error,
    createPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    updatePhaseProgress,
    refetch,
  };
}
