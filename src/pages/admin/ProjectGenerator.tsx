import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, ArrowRight, CheckCircle, Rocket, AlertTriangle } from 'lucide-react';
import { StepIndicator } from '@/components/admin/project-generator/StepIndicator';
import { ProjectInfoStep } from '@/components/admin/project-generator/ProjectInfoStep';
import { PhasesTimelineStep } from '@/components/admin/project-generator/PhasesTimelineStep';
import { TeamAssignmentStep } from '@/components/admin/project-generator/TeamAssignmentStep';
import { PaymentScheduleStep } from '@/components/admin/project-generator/PaymentScheduleStep';
import { DashboardConfigStep } from '@/components/admin/project-generator/DashboardConfigStep';
import { GenerationSummary } from '@/components/admin/project-generator/GenerationSummary';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectWizardData {
  projectInfo: {
    clientId?: string;
    projectName: string;
    description: string;
    projectType: string;
    projectSize: string;
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    currency: string;
  };
  phases: Array<{
    id: string;
    name: string;
    description: string;
    start_date: Date | null;
    end_date: Date | null;
    order_index: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    progress_percentage: number;
    isPaymentMilestone: boolean;
    tasks: Array<{
      title: string;
      description: string;
      estimatedHours: number;
      priority: 'low' | 'medium' | 'high';
    }>;
  }>;
  teamAssignments: Array<{
    profileId: string;
    role: string;
    allocation: number;
    isClientLiaison: boolean;
  }>;
  paymentSchedule: Array<{
    id?: string;
    name: string;
    amount: number;
    due_date: Date;
    description: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    phaseId?: string;
  }>;
  dashboardConfig: {
    widgets: string[];
    branding: {
      primaryColor: string;
      logo?: string;
      welcomeMessage: string;
    };
    permissions: {
      viewTasks: boolean;
      viewPayments: boolean;
      viewTeam: boolean;
      viewTimeline: boolean;
    };
    notifications: {
      emailUpdates: boolean;
      deadlineReminders: boolean;
      paymentReminders: boolean;
    };
  };
}

const steps = [
  { id: 1, title: 'Project Info', description: 'Client and project details' },
  { id: 2, title: 'Phases & Timeline', description: 'Project structure and schedule' },
  { id: 3, title: 'Team Assignment', description: 'Assign team members and roles' },
  { id: 4, title: 'Payment Schedule', description: 'Setup billing milestones' },
  { id: 5, title: 'Dashboard Config', description: 'Customize client dashboard' },
];

export default function ProjectGenerator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [wizardData, setWizardData] = useState<ProjectWizardData>({
    projectInfo: {
      projectName: '',
      description: '',
      projectType: '',
      projectSize: 'medium',
      startDate: new Date(),
      endDate: new Date(),
      totalBudget: 0,
      currency: 'USD',
    },
    phases: [],
    teamAssignments: [],
    paymentSchedule: [],
    dashboardConfig: {
      widgets: ['progress', 'tasks', 'payments', 'team'],
      branding: {
        primaryColor: '#3b82f6',
        welcomeMessage: 'Welcome to your project dashboard',
      },
      permissions: {
        viewTasks: true,
        viewPayments: true,
        viewTeam: true,
        viewTimeline: true,
      },
      notifications: {
        emailUpdates: true,
        deadlineReminders: true,
        paymentReminders: true,
      },
    },
  });

  const updateWizardData = (step: string, data: any) => {
    setWizardData(prev => {
      const currentStepData = prev[step as keyof ProjectWizardData];
      const newData = Array.isArray(data) ? data : (Array.isArray(currentStepData) ? [] : data);
      
      return {
        ...prev,
        [step]: newData
      };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateWizardData = () => {
    const errors = [];
    
    // Basic validation
    if (!wizardData.projectInfo.clientId) errors.push("Client must be selected");
    if (!wizardData.projectInfo.projectName) errors.push("Project name is required");
    if (!wizardData.projectInfo.totalBudget || wizardData.projectInfo.totalBudget <= 0) errors.push("Total budget must be positive");
    if (wizardData.phases.length === 0) errors.push("At least one phase is required");
    
    return errors;
  };

  const generateProject = async () => {
    const validationErrors = validateWizardData();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(". "),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting project generation with data:', wizardData);
      
      const result = await supabase.functions.invoke('generate-client-project', {
        body: { wizardData }
      });

      if (result.error) {
        console.error('Edge function error:', result.error);
        throw new Error(result.error.message || 'Failed to create project');
      }

      console.log('Project generated successfully:', result.data);
      setGeneratedProject(result.data);
      setShowConfirmDialog(false);
      
      toast({
        title: "Project Generated Successfully!",
        description: `Project "${result.data.name}" has been created with all components.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed", 
        description: error instanceof Error ? error.message : "There was an error creating the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProject = () => {
    setShowConfirmDialog(true);
  };

  const handleNavigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectInfoStep
            data={wizardData.projectInfo}
            onUpdate={(data) => updateWizardData('projectInfo', data)}
          />
        );
      case 2:
        return (
          <PhasesTimelineStep
            data={wizardData.phases}
            projectType={wizardData.projectInfo.projectType}
            projectStartDate={wizardData.projectInfo.startDate}
            onUpdate={(data) => updateWizardData('phases', data)}
          />
        );
      case 3:
        return (
          <TeamAssignmentStep
            data={wizardData.teamAssignments}
            phases={wizardData.phases}
            onUpdate={(data) => updateWizardData('teamAssignments', data)}
          />
        );
      case 4:
        return (
          <PaymentScheduleStep
            data={wizardData.paymentSchedule}
            phases={wizardData.phases}
            totalBudget={wizardData.projectInfo.totalBudget}
            currency={wizardData.projectInfo.currency}
            onUpdate={(data) => updateWizardData('paymentSchedule', data)}
          />
        );
      case 5:
        return (
          <DashboardConfigStep
            data={wizardData.dashboardConfig}
            onUpdate={(data) => updateWizardData('dashboardConfig', data)}
          />
        );
      default:
        return null;
    }
  };

  if (generatedProject) {
    return (
      <GenerationSummary
        project={generatedProject}
        onStartNew={() => {
          setGeneratedProject(null);
          setCurrentStep(1);
          setWizardData({
            projectInfo: {
              projectName: '',
              description: '',
              projectType: '',
              projectSize: 'medium',
              startDate: new Date(),
              endDate: new Date(),
              totalBudget: 0,
              currency: 'USD',
            },
            phases: [],
            teamAssignments: [],
            paymentSchedule: [],
            dashboardConfig: {
              widgets: ['progress', 'tasks', 'payments', 'team'],
              branding: {
                primaryColor: '#3b82f6',
                welcomeMessage: 'Welcome to your project dashboard',
              },
              permissions: {
                viewTasks: true,
                viewPayments: true,
                viewTeam: true,
                viewTimeline: true,
              },
              notifications: {
                emailUpdates: true,
                deadlineReminders: true,
                paymentReminders: true,
              },
            },
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Client Project Generator</h1>
          <p className="text-muted-foreground">
            Create a complete project setup with dashboard, tasks, phases, and team assignments
          </p>
          
          <Card className="mt-4 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Step-by-Step Project Creation (Recommended)</h3>
                  <p className="text-sm text-muted-foreground">Create project first, then add phases and payments individually</p>
                </div>
                <Button onClick={() => navigate('/admin/projects/new')} variant="default">
                  Create New Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </div>
              </div>
              <Progress value={(currentStep / steps.length) * 100} className="mt-4" />
            </CardHeader>
          </Card>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <Card className="mt-6">
            <CardContent className="p-6">
              {renderCurrentStep()}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="space-x-2">
              {currentStep === steps.length ? (
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={handleGenerateProject}
                      disabled={isGenerating}
                      className="bg-primary text-primary-foreground"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Generate Project
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Confirm Project Creation
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>You're about to create a complete project setup with:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li><strong>{wizardData.projectInfo.projectName}</strong> for {wizardData.projectInfo.clientId ? 'selected client' : 'no client'}</li>
                          <li>{wizardData.phases.length} project phases</li>
                          <li>{wizardData.teamAssignments.length} team member assignments</li>
                          <li>{wizardData.paymentSchedule.length} payment schedule items</li>
                          <li>Custom dashboard configuration</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          This will create database records and cannot be easily undone.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isGenerating}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={generateProject} disabled={isGenerating}>
                        {isGenerating ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Creating...
                          </div>
                        ) : (
                          'Create Project'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}