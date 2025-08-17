import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ExternalLink, 
  Users, 
  Calendar, 
  DollarSign, 
  Rocket,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface GeneratedProject {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
    company: string;
  };
  phases: Array<{
    id: string;
    name: string;
    duration: number;
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  payments: Array<{
    name: string;
    amount: number;
    dueDate: Date;
  }>;
  dashboardUrl: string;
  totalBudget: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

interface GenerationSummaryProps {
  project: GeneratedProject;
  onStartNew: () => void;
}

export function GenerationSummary({ project, onStartNew }: GenerationSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: project.currency || 'USD'
    }).format(amount);
  };

  const totalPaymentAmount = project.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalDuration = project.phases.reduce((sum, phase) => sum + phase.duration, 0);
  const clientLiaison = project.teamMembers.find(member => member.role === 'project_lead');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Project Generated Successfully!</h1>
            <p className="text-muted-foreground">
              Complete project setup has been created and is ready for client and team access.
            </p>
          </div>

          {/* Project Overview */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {project.client.company} • {project.client.name}
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{project.phases.length}</div>
                  <div className="text-sm text-muted-foreground">Phases Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{project.teamMembers.length}</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalDuration}</div>
                  <div className="text-sm text-muted-foreground">Weeks Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(project.totalBudget)}</div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">View Client Dashboard</h3>
                      <p className="text-sm text-muted-foreground">See the generated client dashboard</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Team Workspace</h3>
                      <p className="text-sm text-muted-foreground">Access team collaboration tools</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Project Phases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Phases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.phases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{phase.name}</div>
                          <div className="text-sm text-muted-foreground">{phase.duration} weeks</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {member.role.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {clientLiaison && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Primary Contact: {clientLiaison.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{payment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Due: {format(payment.dueDate, "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Scheduled</span>
                      <span className="font-bold">{formatCurrency(totalPaymentAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div className="text-sm text-muted-foreground">Project kickoff</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{format(project.startDate, "MMM d, yyyy")}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">End Date</div>
                      <div className="text-sm text-muted-foreground">Expected completion</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{format(project.endDate, "MMM d, yyyy")}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        All systems configured and ready
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button size="lg" className="w-full sm:w-auto">
              <ExternalLink className="h-5 w-5 mr-2" />
              Open Client Dashboard
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Users className="h-5 w-5 mr-2" />
              Access Team Workspace
            </Button>
            <Button variant="outline" size="lg" onClick={onStartNew} className="w-full sm:w-auto">
              <RefreshCw className="h-5 w-5 mr-2" />
              Create Another Project
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Project ID: {project.id}</p>
            <p className="mt-1">
              Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}