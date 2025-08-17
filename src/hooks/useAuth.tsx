import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  company?: string;
  role: 'client' | 'team_member' | 'admin';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createMissingProfile: () => Promise<void>;
  debugProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (!session?.user) {
      console.log('refreshProfile: No session/user, clearing profile');
      setProfile(null);
      return;
    }

    try {
      console.log('refreshProfile: Fetching profile for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        console.log('Error details:', { code: error.code, message: error.message, hint: error.hint });
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116' || error.message?.includes('No rows returned')) {
          console.log('Profile not found, attempting to create one...');
          await createMissingProfile();
          return;
        }
        
        // If it's an RLS error, log it for debugging
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          console.error('RLS Policy Error - this should be fixed with the new migration!');
          // Try to create profile anyway
          await createMissingProfile();
          return;
        }
        
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  const createMissingProfile = async () => {
    if (!session?.user) {
      console.log('createMissingProfile: No session/user available');
      return;
    }

    try {
      const user = session.user;
      const userData = user.user_metadata || {};
      
      console.log('Creating missing profile for user:', user.id);
      console.log('User metadata:', userData);
      
      const profileData = {
        user_id: user.id,
        email: user.email || '',
        full_name: userData.full_name || user.email || 'User',
        role: (userData.role as 'client' | 'team_member' | 'admin') || 'client',
        company: userData.company || null
      };
      
      console.log('Profile data to insert:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating missing profile:', error);
        console.log('Error details:', { code: error.code, message: error.message, hint: error.hint });
        
        // If insert failed due to conflict, the profile already exists - fetch it
        if (error.code === '23505') { // unique violation
          console.log('Profile already exists (unique violation), fetching existing...');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (!fetchError && existingProfile) {
            console.log('Found existing profile:', existingProfile);
            setProfile(existingProfile);
            return;
          } else {
            console.error('Failed to fetch existing profile:', fetchError);
          }
        }
        
        // Show error toast for any other errors
        toast({
          variant: "destructive",
          title: "Profile Setup Error",
          description: `Failed to create profile: ${error.message}`,
        });
        return;
      }

      console.log('Profile created successfully:', data);
      setProfile(data);
      
      toast({
        title: "Profile Created",
        description: "Your profile has been set up successfully.",
      });
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      toast({
        variant: "destructive",
        title: "Profile Setup Error",
        description: "There was an issue setting up your profile. Please contact support.",
      });
    }
  };

  const debugProfile = async () => {
    if (!session?.user) {
      console.log('debugProfile: No session/user available');
      return;
    }

    try {
      console.log('=== DEBUG PROFILE START ===');
      console.log('Current user ID:', session.user.id);
      console.log('Current user email:', session.user.email);
      console.log('Current session:', session);
      
      // Call the debug function we created in the migration
      const { data, error } = await supabase
        .rpc('debug_user_profile', { check_user_id: session.user.id });

      if (error) {
        console.error('Debug function error:', error);
      } else {
        console.log('Debug results:', data);
        if (data && data.length > 0) {
          const result = data[0];
          console.log('User exists in auth.users:', result.user_exists);
          console.log('Profile exists in profiles:', result.profile_exists);
          console.log('User email:', result.user_email);
          console.log('Profile email:', result.profile_email);
          console.log('Profile role:', result.profile_role);
          console.log('Current auth.uid():', result.auth_uid);
        }
      }
      
      // Try direct profile fetch for comparison
      console.log('--- Attempting direct profile fetch ---');
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (directError) {
        console.error('Direct profile fetch error:', directError);
      } else {
        console.log('Direct profile fetch success:', directProfile);
      }
      
      console.log('=== DEBUG PROFILE END ===');
      
    } catch (error) {
      console.error('Error in debugProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            refreshProfile();
          }, 0);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          refreshProfile();
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to AdvantX Hub.",
        });
      }

      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast({
        variant: "destructive", 
        title: "Sign In Failed",
        description: errorMessage,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };


  const signOut = async () => {
    try {
      console.log('useAuth.signOut: Starting sign out process...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      console.log('useAuth.signOut: Supabase sign out successful');
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Signed Out",
        description: "Successfully signed out of AdvantX Hub.",
      });
      
      console.log('useAuth.signOut: Sign out completed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: error.message || "There was an issue signing out.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile,
      createMissingProfile,
      debugProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}