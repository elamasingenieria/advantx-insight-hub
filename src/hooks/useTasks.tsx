import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  phase_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateTaskData {
  phase_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

interface UseTasksOptions {
  phaseId?: string;
  projectId?: string;
  assigneeId?: string;
  status?: Task['status'];
}

export function useTasks(options: UseTasksOptions = {}) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      // Filter by phase if specified
      if (options.phaseId) {
        query = query.eq('phase_id', options.phaseId);
      }

      // Filter by project if specified (requires joining with phases)
      if (options.projectId && !options.phaseId) {
        query = query
          .select(`
            *,
            assignee:profiles(id, full_name, email, avatar_url),
            phase:phases!inner(project_id)
          `)
          .eq('phases.project_id', options.projectId);
      }

      // Filter by assignee if specified
      if (options.assigneeId) {
        query = query.eq('assignee_id', options.assigneeId);
      }

      // Filter by status if specified
      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      const errorMessage = error.message || 'Failed to load tasks';
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

  const createTask = async (taskData: CreateTaskData): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          status: 'todo',
          priority: taskData.priority || 'medium',
        }])
        .select(`
          *,
          assignee:profiles(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Task created successfully!',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create task',
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: UpdateTaskData): Promise<boolean> => {
    try {
      // If marking as completed, set completed_at timestamp
      const updateData = { ...updates };
      if (updates.status === 'completed' && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.status !== 'completed') {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select(`
          *,
          assignee:profiles(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...data } : task
        )
      );

      toast({
        title: 'Success',
        description: 'Task updated successfully!',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update task',
      });
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      toast({
        title: 'Success',
        description: 'Task deleted successfully!',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete task',
      });
      return false;
    }
  };

  const assignTask = async (taskId: string, assigneeId: string | null): Promise<boolean> => {
    return updateTask(taskId, { assignee_id: assigneeId });
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<boolean> => {
    return updateTask(taskId, { status });
  };

  const bulkUpdateTasks = async (taskIds: string[], updates: UpdateTaskData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .in('id', taskIds);

      if (error) throw error;

      // Refetch to get updated data
      await fetchTasks();

      toast({
        title: 'Success',
        description: `${taskIds.length} task(s) updated successfully!`,
      });

      return true;
    } catch (error: any) {
      console.error('Error bulk updating tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update tasks',
      });
      return false;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchTasks();
    }
  }, [profile, options.phaseId, options.projectId, options.assigneeId, options.status]);

  const refetch = () => {
    fetchTasks();
  };

  // Computed statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    overdue: tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'completed'
    ).length,
  };

  return {
    tasks,
    loading,
    error,
    taskStats,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    bulkUpdateTasks,
    refetch,
  };
}
