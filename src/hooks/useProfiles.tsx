import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  company?: string;
  role: 'client' | 'team_member' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // Include project info if needed
  projects?: {
    id: string;
    name: string;
    status: string;
  }[];
}

interface UseProfilesOptions {
  role?: Profile['role'];
  includeProjects?: boolean;
}

export function useProfiles(options: UseProfilesOptions = {}) {
  const { profile: currentProfile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only admins can fetch all profiles
      if (currentProfile?.role !== 'admin') {
        setProfiles([]);
        return;
      }

      let query = supabase
        .from('profiles')
        .select(`
          *
          ${options.includeProjects ? ', projects(id, name, status)' : ''}
        `)
        .order('created_at', { ascending: false });

      // Filter by role if specified
      if (options.role) {
        query = query.eq('role', options.role);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      const errorMessage = error.message || 'Failed to load profiles';
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

  const updateProfile = async (profileId: string, updateData: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      // Refresh profiles list
      await fetchProfiles();

      toast({
        title: "Profile Updated",
        description: "Profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
      });
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      // Refresh profiles list
      await fetchProfiles();

      toast({
        title: "Profile Deleted",
        description: "Profile has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete profile.",
      });
    }
  };

  useEffect(() => {
    if (currentProfile) {
      fetchProfiles();
    }
  }, [currentProfile, options.role, options.includeProjects]);

  const refetch = () => {
    fetchProfiles();
  };

  return {
    profiles,
    loading,
    error,
    updateProfile,
    deleteProfile,
    refetch,
  };
}

export function useProfile(profileId: string) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      const errorMessage = error.message || 'Failed to load profile';
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
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const refetch = () => {
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    refetch,
  };
}
