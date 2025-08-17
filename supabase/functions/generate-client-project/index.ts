import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get the user from the request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error("Admin access required");
    }

    const { wizardData } = await req.json();
    
    // Use service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get client ID from wizard data
    const clientId = wizardData.projectInfo.clientId;

    if (!clientId) {
      throw new Error("Client must be selected");
    }

    // Create project with proper field mapping
    const { data: project, error: projectError } = await supabaseService
      .from('projects')
      .insert({
        client_id: clientId,
        name: wizardData.projectInfo.projectName,
        description: wizardData.projectInfo.description,
        start_date: wizardData.projectInfo.startDate,
        end_date: wizardData.projectInfo.endDate,
        total_amount: wizardData.projectInfo.totalBudget,
        status: 'planning',
        progress_percentage: 0,
        monthly_savings: 0,
        annual_roi_percentage: 0,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create phases
    const phaseInserts = wizardData.phases.map((phase, index) => ({
      project_id: project.id,
      name: phase.name,
      description: phase.description,
      order_index: index,
      start_date: wizardData.projectInfo.startDate,
      end_date: wizardData.projectInfo.endDate,
      status: 'not_started',
      progress_percentage: 0,
    }));

    const { data: phases, error: phasesError } = await supabaseService
      .from('phases')
      .insert(phaseInserts)
      .select();

    if (phasesError) throw phasesError;

    // Create tasks for each phase
    for (let i = 0; i < wizardData.phases.length; i++) {
      const phaseData = wizardData.phases[i];
      const phaseId = phases[i].id;
      
      if (phaseData.tasks && phaseData.tasks.length > 0) {
        const taskInserts = phaseData.tasks.map(task => ({
          phase_id: phaseId,
          title: task.title,
          description: task.description,
          estimated_hours: task.estimatedHours,
          priority: task.priority,
          status: 'todo',
        }));

        await supabaseService
          .from('tasks')
          .insert(taskInserts);
      }
    }

    // Create project member assignments
    const memberInserts = wizardData.teamAssignments.map(assignment => ({
      project_id: project.id,
      profile_id: assignment.profileId,
      role: assignment.role,
    }));

    if (memberInserts.length > 0) {
      await supabaseService
        .from('project_members')
        .insert(memberInserts);
    }

    // Create payment schedule
    if (wizardData.paymentSchedule && wizardData.paymentSchedule.length > 0) {
      const paymentInserts = wizardData.paymentSchedule.map(payment => ({
        project_id: project.id,
        name: payment.name,
        amount: payment.amount,
        due_date: payment.dueDate,
        description: payment.description,
        status: 'pending',
      }));

      await supabaseService
        .from('payment_schedules')
        .insert(paymentInserts);
    }

    // Create dashboard configuration
    await supabaseService
      .from('dashboard_configs')
      .insert({
        project_id: project.id,
        widgets: wizardData.dashboardConfig.widgets,
        branding: wizardData.dashboardConfig.branding,
        permissions: wizardData.dashboardConfig.permissions,
        notifications: wizardData.dashboardConfig.notifications,
      });

    // Fetch complete project data for response
    const { data: completeProject } = await supabaseService
      .from('projects')
      .select(`
        *,
        clients(id, name, company),
        phases(id, name, duration: order_index),
        project_members(
          profiles(id, full_name, role)
        ),
        payment_schedules(name, amount, due_date)
      `)
      .eq('id', project.id)
      .single();

    // Format response
    const response = {
      id: completeProject.id,
      name: completeProject.name,
      client: {
        id: completeProject.clients.id,
        name: completeProject.clients.name,
        company: completeProject.clients.company,
      },
      phases: completeProject.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        duration: phase.duration || 1,
      })),
      teamMembers: completeProject.project_members.map(pm => ({
        id: pm.profiles.id,
        name: pm.profiles.full_name,
        role: pm.profiles.role,
      })),
      payments: completeProject.payment_schedules.map(ps => ({
        name: ps.name,
        amount: ps.amount,
        dueDate: new Date(ps.due_date),
      })),
      dashboardUrl: `/dashboard?project=${completeProject.id}`,
      totalBudget: completeProject.total_amount,
      currency: wizardData.projectInfo.currency,
      startDate: new Date(completeProject.start_date),
      endDate: new Date(completeProject.end_date),
      status: completeProject.status,
    };

    console.log(`Project generated successfully: ${project.id}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating project:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});