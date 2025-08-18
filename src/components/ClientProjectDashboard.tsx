import { useProjectDashboard } from '@/hooks/useProjectDashboard';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardWidgets, SidebarWidgets } from '@/components/DashboardWidgets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  FolderOpen, 
  Calendar, 
  User
} from 'lucide-react';

export function ClientProjectDashboard() {
  const { dashboard, loading: projectLoading, error: projectError, hasProject } = useProjectDashboard();
  const { dashboardConfig, loading: configLoading, error: configError, hasConfig } = useDashboard();

  const loading = projectLoading || configLoading;
  const error = projectError || configError;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Loading Your Project...</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Error Loading Project</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!hasProject || !dashboard) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Welcome to AdvantX Hub</h2>
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No Project Assigned</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have an assigned project yet. Please contact your project manager.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://calendly.com/advant_x/seguimiento', '_blank')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { project, phases, paymentSchedules } = dashboard;
  
  // Use dashboard config from the dedicated hook, fallback to project dashboard config
  const config = dashboardConfig || dashboard.dashboardConfig;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          {config.branding.welcomeMessage}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
          <Badge variant="outline" className="capitalize">
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Configurable Dashboard Widgets */}
      <DashboardWidgets 
        config={config}
        project={project}
        phases={phases}
        paymentSchedules={paymentSchedules}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Additional widgets or content can be added here based on config */}
          {config.widgets.includes('tasks') && config.permissions.viewTasks && (
            <div className="mb-6">
              {/* Tasks widget is handled in DashboardWidgets component */}
            </div>
          )}
        </div>

        {/* Configurable Sidebar */}
        <SidebarWidgets config={config} phases={phases} />
      </div>
    </div>
  );
}
