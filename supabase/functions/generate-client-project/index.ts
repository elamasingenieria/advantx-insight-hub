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

    // Verify admin role using the security definer function
    const { data: userRole, error: roleError } = await supabaseClient
      .rpc('get_current_user_role');

    if (roleError) {
      console.error('Role check error:', roleError);
      throw new Error("Unable to verify user permissions");
    }

    if (!userRole || !['admin', 'team_member'].includes(userRole)) {
      throw new Error("Admin or team member access required");
    }

    console.log(`User role verified: ${userRole}`);

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

    console.log(`Starting project creation for client: ${clientId}`);

    // Step 1: Create project with proper field mapping
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

    if (projectError) {
      console.error('Failed to create project:', projectError);
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    console.log(`Project created successfully: ${project.id}`);

    // Step 2: Create phases
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

    if (phasesError) {
      console.error('Failed to create phases:', phasesError);
      // Rollback: Delete the created project
      await supabaseService.from('projects').delete().eq('id', project.id);
      throw new Error(`Failed to create phases: ${phasesError.message}`);
    }

    console.log(`Created ${phases.length} phases for project ${project.id}`);

    // Step 3: Create tasks for each phase
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

        const { error: tasksError } = await supabaseService
          .from('tasks')
          .insert(taskInserts);

        if (tasksError) {
          console.error(`Failed to create tasks for phase ${phaseId}:`, tasksError);
          // Continue with other phases, but log the error
        }
      }
    }

    console.log(`Created tasks for ${wizardData.phases.length} phases`);

    // Step 4: Create project member assignments
    if (wizardData.teamAssignments && wizardData.teamAssignments.length > 0) {
      const memberInserts = wizardData.teamAssignments.map(assignment => ({
        project_id: project.id,
        profile_id: assignment.profileId,
        role: assignment.role || 'member',
      }));

      const { error: membersError } = await supabaseService
        .from('project_members')
        .insert(memberInserts);

      if (membersError) {
        console.error('Error inserting project members:', membersError);
        // Rollback: Delete project and phases
        await supabaseService.from('phases').delete().eq('project_id', project.id);
        await supabaseService.from('projects').delete().eq('id', project.id);
        throw new Error(`Failed to assign team members: ${membersError.message}`);
      }

      console.log(`Assigned ${wizardData.teamAssignments.length} team members`);
    } else {
      console.log('No team assignments to create');
    }

    // Step 5: Create payment schedule
    if (wizardData.paymentSchedule && wizardData.paymentSchedule.length > 0) {
      const paymentInserts = wizardData.paymentSchedule.map(payment => ({
        project_id: project.id,
        name: payment.name || 'Payment',
        amount: payment.amount || 0,
        due_date: payment.due_date,
        description: payment.description || '',
        status: payment.status || 'pending',
      }));

      const { error: paymentsError } = await supabaseService
        .from('payment_schedules')
        .insert(paymentInserts);

      if (paymentsError) {
        console.error('Error inserting payment schedule:', paymentsError);
        // Rollback: Delete project, phases, and project members
        await supabaseService.from('project_members').delete().eq('project_id', project.id);
        await supabaseService.from('phases').delete().eq('project_id', project.id);
        await supabaseService.from('projects').delete().eq('id', project.id);
        throw new Error(`Failed to create payment schedule: ${paymentsError.message}`);
      }

      console.log(`Created ${wizardData.paymentSchedule.length} payment schedule items`);
    } else {
      console.log('No payment schedule to create');
    }

    // Step 6: Create dashboard configuration
    const { error: dashboardError } = await supabaseService
      .from('dashboard_configs')
      .insert({
        project_id: project.id,
        widgets: wizardData.dashboardConfig?.widgets || ['progress', 'tasks', 'payments', 'team'],
        branding: wizardData.dashboardConfig?.branding || {
          primaryColor: '#3b82f6',
          welcomeMessage: 'Welcome to your project dashboard'
        },
        permissions: wizardData.dashboardConfig?.permissions || {
          viewTasks: true,
          viewPayments: true,
          viewTeam: true,
          viewTimeline: true
        },
        notifications: wizardData.dashboardConfig?.notifications || {
          emailUpdates: true,
          deadlineReminders: true,
          paymentReminders: true
        }
      });

    if (dashboardError) {
      console.error('Error creating dashboard config:', dashboardError);
      // Rollback: Delete all created resources
      await supabaseService.from('payment_schedules').delete().eq('project_id', project.id);
      await supabaseService.from('project_members').delete().eq('project_id', project.id);
      await supabaseService.from('phases').delete().eq('project_id', project.id);
      await supabaseService.from('projects').delete().eq('id', project.id);
      throw new Error(`Failed to create dashboard configuration: ${dashboardError.message}`);
    }

    console.log(`Dashboard configuration created for project ${project.id}`);

    // Step 7: Fetch complete project data for response

    
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