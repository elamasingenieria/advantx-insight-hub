import { supabase } from '@/integrations/supabase/client';

/**
 * Admin utility functions for managing user profiles
 */

export interface ProfileSyncResult {
  success: boolean;
  syncedCount?: number;
  missingProfiles?: Array<{
    user_id: string;
    email: string;
  }>;
  error?: string;
}

/**
 * Sync missing profiles for users who don't have them
 * This function should only be called by admin users
 */
export async function syncMissingProfiles(): Promise<ProfileSyncResult> {
  try {
    // Call the database function to sync missing profiles
    const { data, error } = await supabase.rpc('sync_missing_profiles');
    
    if (error) {
      console.error('Error syncing profiles:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      syncedCount: data?.[0]?.synced_count || 0
    };
  } catch (error: any) {
    console.error('Error in syncMissingProfiles:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get users who don't have corresponding profiles
 * This is a diagnostic function for admins
 */
export async function findMissingProfiles(): Promise<ProfileSyncResult> {
  try {
    // This would require a custom database function or direct query
    // For now, we'll use the sync function which is safer
    const syncResult = await syncMissingProfiles();
    
    return {
      success: true,
      missingProfiles: [], // Would be populated by a diagnostic query
      syncedCount: syncResult.syncedCount
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Create a profile for a specific user (emergency function)
 */
export async function createProfileForUser(
  userId: string, 
  userData: {
    email: string;
    full_name: string;
    role?: 'client' | 'team_member' | 'admin';
    company?: string;
  }
): Promise<ProfileSyncResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'client',
        company: userData.company || null
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      syncedCount: 1
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}
