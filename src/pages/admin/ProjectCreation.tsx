import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectCreationForm } from '@/components/admin/project-creation/ProjectCreationForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectFormData {
  name: string;
  description: string;
  client_id: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: Date;
  end_date?: Date;
  total_amount?: number;
  monthly_savings?: number;
  annual_roi_percentage?: number;
  drive_root_folder_id?: string;
  // Dashboard configuration
  selectedWidgets: string[];
  primaryColor: string;
  welcomeMessage: string;
  permissions: {
    viewTeam: boolean;
    viewTasks: boolean;
    viewPayments: boolean;
    viewTimeline: boolean;
  };
}

const defaultFormData: ProjectFormData = {
  name: '',
  description: '',
  client_id: '',
  status: 'planning',
  selectedWidgets: ['progress', 'tasks', 'payments', 'team'],
  primaryColor: '#3b82f6',
  welcomeMessage: 'Welcome to your project dashboard',
  permissions: {
    viewTeam: true,
    viewTasks: true,
    viewPayments: true,
    viewTimeline: true,
  },
};

export default function ProjectCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [isCreating, setIsCreating] = useState(false);

  const handleFormUpdate = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const createProject = async () => {
    try {
      setIsCreating(true);

      // 1. Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: formData.name,
          description: formData.description || null,
          client_id: formData.client_id,
          status: formData.status,
          start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
          end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
          total_amount: formData.total_amount || null,
          monthly_savings: formData.monthly_savings || 0,
          annual_roi_percentage: formData.annual_roi_percentage || 0,
          drive_root_folder_id: formData.drive_root_folder_id || null,
          progress_percentage: 0,
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // 2. Create dashboard configuration
      const { error: dashboardError } = await supabase
        .from('dashboard_configs')
        .insert([{
          project_id: project.id,
          widgets: formData.selectedWidgets,
          branding: {
            primaryColor: formData.primaryColor,
            welcomeMessage: formData.welcomeMessage,
          },
          permissions: formData.permissions,
        }]);

      if (dashboardError) throw dashboardError;

      toast({
        title: 'Success',
        description: `Project "${project.name}" has been created successfully!`,
      });

      // Navigate to project setup page
      navigate(`/admin/projects/${project.id}/setup`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.client_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
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
                <CardTitle className="text-2xl">Create New Project</CardTitle>
                <CardDescription>
                  Set up the basic project information and dashboard configuration. 
                  You'll be able to add phases and payment schedules after the project is created.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Project Creation Form */}
          <ProjectCreationForm
            data={formData}
            onUpdate={handleFormUpdate}
          />

          {/* Create Project Button */}
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Ready to Create Project?</h3>
                    <p className="text-sm text-muted-foreground">
                      The project will be created and you'll be able to add phases and payments next.
                    </p>
                  </div>
                  <Button
                    onClick={createProject}
                    disabled={!isFormValid || isCreating}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
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