import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { PhaseManager } from '@/components/admin/project-setup/PhaseManager';
import { PaymentManager } from '@/components/admin/project-setup/PaymentManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  client_id: string;
  clients?: {
    name: string;
    company: string;
    contact_email: string;
  };
}

export default function ProjectSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchPhases();
      fetchPayments();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name,
            company,
            contact_email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project details',
        variant: 'destructive',
      });
      navigate('/admin/project-generator');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhases = async () => {
    try {
      const { data, error } = await supabase
        .from('phases')
        .select('*')
        .eq('project_id', id)
        .order('order_index');

      if (error) throw error;
      setPhases(data || []);
    } catch (error: any) {
      console.error('Error fetching phases:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('project_id', id)
        .order('due_date');

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  };

  const completeSetup = () => {
    toast({
      title: 'Setup Complete',
      description: 'Project setup has been completed successfully!',
    });
    navigate(`/dashboard`); // Navigate to project dashboard when implemented
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/project-generator')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/project-generator')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project Generator
            </Button>
            
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    <CardDescription className="mt-2">
                      Complete the project setup by adding phases and payment schedules
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Client</div>
                    <div className="text-muted-foreground">
                      {project.clients?.company} ({project.clients?.name})
                    </div>
                  </div>
                  {project.start_date && (
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div className="text-muted-foreground">
                        {new Date(project.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {project.total_amount && (
                    <div>
                      <div className="font-medium">Budget</div>
                      <div className="text-muted-foreground">
                        ${project.total_amount.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                {project.description && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Setup Sections */}
          <div className="space-y-6">
            {/* Phase Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Phases ({phases.length})
                </CardTitle>
                <CardDescription>
                  Define the phases of your project to organize work and track progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhaseManager
                  projectId={id!}
                  phases={phases}
                  onPhasesChange={fetchPhases}
                />
              </CardContent>
            </Card>

            {/* Payment Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Schedule ({payments.length})
                </CardTitle>
                <CardDescription>
                  Set up payment milestones and due dates for the project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentManager
                  projectId={id!}
                  payments={payments}
                  phases={phases}
                  onPaymentsChange={fetchPayments}
                />
              </CardContent>
            </Card>

            {/* Complete Setup */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Setup Complete
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your project has been created successfully. You can now access the project dashboard.
                    </p>
                  </div>
                  <Button onClick={completeSetup} size="lg">
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}