import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Clock,
  CheckCircle,
  Calendar,
  DollarSign,
  User,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardConfig } from '@/hooks/useDashboard';

interface Project {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
  monthly_savings?: number;
  annual_roi_percentage?: number;
}

interface Phase {
  id: string;
  name: string;
  description?: string;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  start_date?: string;
  end_date?: string;
  order_index: number;
}

interface PaymentSchedule {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  description?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

interface DashboardWidgetsProps {
  config: DashboardConfig;
  project: Project;
  phases: Phase[];
  paymentSchedules: PaymentSchedule[];
}

export function DashboardWidgets({ config, project, phases, paymentSchedules }: DashboardWidgetsProps) {
  const activePhases = phases.filter(p => p.status === 'in_progress').length;
  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const pendingPayments = paymentSchedules.filter(p => p.status === 'pending').length;
  const totalPaymentAmount = paymentSchedules.reduce((sum, p) => sum + p.amount, 0);

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'not_started': return 'text-gray-600 bg-gray-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderWidget = (widgetType: string) => {
    switch (widgetType) {
      case 'progress':
        return (
          <Card key="progress">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.progress_percentage}%</div>
              <Progress value={project.progress_percentage} className="mt-2" />
            </CardContent>
          </Card>
        );

      case 'tasks':
        if (!config.permissions.viewTasks) return null;
        return (
          <Card key="tasks" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Phases</CardTitle>
              <CardDescription>Track progress across all project phases</CardDescription>
            </CardHeader>
            <CardContent>
              {phases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No phases configured yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {phases
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((phase) => (
                      <div key={phase.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{phase.name}</h4>
                          <Badge className={getPhaseStatusColor(phase.status)}>
                            {phase.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {phase.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {phase.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{phase.progress_percentage}%</span>
                          </div>
                          <Progress value={phase.progress_percentage} />
                          {phase.start_date && phase.end_date && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {format(new Date(phase.start_date), 'MMM dd')} - {format(new Date(phase.end_date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'payments':
        if (!config.permissions.viewPayments) return null;
        return (
          <Card key="payments">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments}</div>
              <div className="text-xs text-muted-foreground">
                ${totalPaymentAmount.toLocaleString()} total
              </div>
            </CardContent>
          </Card>
        );

      case 'team':
        if (!config.permissions.viewTeam) return null;
        return (
          <Card key="team">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Phases</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePhases}</div>
              <div className="text-xs text-muted-foreground">
                {completedPhases} completed
              </div>
            </CardContent>
          </Card>
        );

      case 'savings':
        return (
          <Card key="savings">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${project.monthly_savings?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {project.annual_roi_percentage || 0}% ROI
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {config.widgets.map(widget => renderWidget(widget)).filter(Boolean)}
    </div>
  );
}

interface SidebarWidgetsProps {
  config: DashboardConfig;
  phases: Phase[];
}

export function SidebarWidgets({ config, phases }: SidebarWidgetsProps) {
  // Get upcoming deadlines
  const upcomingDeadlines = phases
    .filter(phase => phase.status === 'in_progress' && phase.end_date)
    .map(phase => ({
      title: phase.name,
      dueDate: phase.end_date!,
      daysUntil: Math.ceil((new Date(phase.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Upcoming Deadlines */}
      {config.permissions.viewTimeline && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    <div className={`w-2 h-2 rounded-full ${deadline.daysUntil <= 3 ? 'bg-red-500' : deadline.daysUntil <= 7 ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.daysUntil <= 0 ? 'Overdue' : `${deadline.daysUntil} days left`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => window.open('https://calendly.com/advant_x/seguimiento', '_blank')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
          
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => window.open('/help', '_self')}
          >
            <User className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
