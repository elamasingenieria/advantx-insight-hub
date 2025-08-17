import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'client' | 'team_member' | 'admin';
  company?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the JWT from the Authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated and get their profile
    const jwt = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if the authenticated user is an admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse the request body
    const { email, password, full_name, role, company }: CreateUserRequest = await req.json();

    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create the user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name,
        role,
        company
      }
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    // Create the profile record
    const { error: profileCreateError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        email: email,
        full_name: full_name,
        role: role,
        company: role === 'client' ? company : null
      });

    if (profileCreateError) {
      // If profile creation fails, we should clean up the user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to create profile: ${profileCreateError.message}`);
    }

    // If role is client, create client record
    if (role === 'client') {
      const { data: profileData, error: getProfileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', newUser.user.id)
        .single();

      if (getProfileError) {
        throw new Error(`Failed to get profile ID: ${getProfileError.message}`);
      }

      const { error: clientCreateError } = await supabaseAdmin
        .from('clients')
        .insert({
          profile_id: profileData.id,
          name: full_name,
          contact_email: email,
          company: company || full_name,
          phone: null
        });

      if (clientCreateError) {
        console.error('Failed to create client record:', clientCreateError);
        // Don't fail the entire operation for client record creation
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user.id, 
          email: newUser.user.email,
          full_name,
          role 
        } 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in admin-create-user function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});