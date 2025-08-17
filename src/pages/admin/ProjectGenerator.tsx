import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Rocket } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<any>(null);
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
    setWizardData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof ProjectWizardData], ...data }
    }));
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

  const generateProject = async () => {
    setIsGenerating(true);
    try {
      const result = await supabase.functions.invoke('generate-client-project', {
        body: { wizardData }
      });

      if (result.error) {
        throw result.error;
      }

      setGeneratedProject(result.data);
      toast({
        title: "Project Generated Successfully!",
        description: "The complete project setup has been created.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error creating the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
                <Button
                  onClick={generateProject}
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