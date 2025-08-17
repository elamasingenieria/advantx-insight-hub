import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useProjectStats } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ROISummaryCard } from '@/components/ROISummaryCard';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Link } from 'react-router-dom';
import { syncMissingProfiles } from '@/utils/profileSync';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  User, 
  Building, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Users, 
  FolderOpen,
  CheckCircle,
  BookOpen,
  CreditCard,
  Bell,
  Settings,
  Shield,
  RefreshCw
} from 'lucide-react';



export function Dashboard() {
  const { profile, signOut, loading, user, session, createMissingProfile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Debug logging
  console.log('Dashboard render - user:', user?.id);
  console.log('Dashboard render - session:', session?.user?.id);
  console.log('Dashboard render - profile:', profile);
  console.log('Dashboard render - loading:', loading);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Show loading state if still loading
  if (loading) {
    console.log('Dashboard showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCreateProfile = async () => {
    setIsCreatingProfile(true);
    try {
      await createMissingProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Show error state if no profile
  if (!profile && user) {
    console.log('Dashboard - no profile found for authenticated user');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Your account is authenticated, but we need to set up your profile to access the dashboard.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={handleCreateProfile}
              disabled={isCreatingProfile}
              className="w-full"
            >
              {isCreatingProfile && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              {isCreatingProfile ? 'Setting up profile...' : 'Set up Profile'}
            </Button>
            <Button 
              variant="outline"
            onClick={signOut}
              className="w-full"
          >
            Sign Out
            </Button>
          </div>
          <div className="mt-6 p-4 bg-card rounded-lg border text-left">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
            <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
            <p className="text-sm text-muted-foreground">Profile Status: Missing</p>
          </div>
        </div>
      </div>
    );
  }

  const getDashboardContent = () => {
    console.log('Getting dashboard content for role:', profile.role);
    
    switch (profile.role) {
      case 'client':
        return <ClientDashboard />;
      case 'team_member':
        return <TeamDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        console.log('Unknown role, defaulting to client dashboard');
        return <ClientDashboard />;
    }
  };

  console.log('About to render dashboard with profile:', profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AdvantX Hub</h1>
                <p className="text-sm text-muted-foreground">{formatTime(currentTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {profile && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <Badge variant="outline" className="text-xs">
                      {profile.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  {profile.role === 'admin' && (
                    <Link to="/admin/users">
                      <Button variant="ghost" size="icon" title="User Management">
                        <Shield className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="icon">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={signOut}
                    className="ml-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
}

function ClientDashboard() {
  const { projects, loading: projectsLoading } = useProjects({ status: 'active', includePhases: true });
  const { stats, loading: statsLoading } = useProjectStats();
  
  const activeProject = projects.length > 0 ? projects[0] : null;
  const upcomingDeadlines = projects
    .flatMap(project => 
      project.phases?.filter(phase => 
        phase.status === 'in_progress' && phase.end_date
      ).map(phase => ({
        title: phase.name,
        project: project.name,
        dueDate: phase.end_date,
        daysUntil: Math.ceil((new Date(phase.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      })) || []
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  if (projectsLoading || statsLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Welcome to Your Project Hub</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome to Your Project Hub</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your project progress, see your ROI, and access all project resources in one place.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="text-xs text-muted-foreground">{stats.activeProjects} active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${stats.totalSavings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Current month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.averageROI}%</div>
            <div className="text-xs text-muted-foreground">Across all projects</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <div className="text-xs text-muted-foreground">Projects finished</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Project Progress */}
        <div className="lg:col-span-2 space-y-6">
          {activeProject ? (
            <ProgressTracker project={activeProject} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Projects</CardTitle>
                <CardDescription>You don't have any active projects at the moment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Your projects will appear here once they are created and assigned to you.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Key milestones and deliverables</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">{deadline.project}</p>
                  </div>
                  <div className="text-right">
                        <p className={`font-medium ${deadline.daysUntil <= 7 ? 'text-warning' : 'text-primary'}`}>
                          {new Date(deadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deadline.daysUntil > 0 ? `${deadline.daysUntil} days` : 'Overdue'}
                        </p>
                      </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - ROI & Quick Actions */}
        <div className="space-y-6">
          <ROISummaryCard 
            monthlySavings={stats.totalSavings}
            annualSavings={stats.totalSavings * 12}
            roiPercentage={stats.averageROI}
            showDetailedView={false}
          />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                View Project Files
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                AI Learning Center
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment History
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TeamDashboard() {
  const { profile } = useAuth();
  const { tasks, loading: tasksLoading, taskStats } = useTasks({ assigneeId: profile?.id });
  const { projects, loading: projectsLoading } = useProjects();
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  // Get projects where user has assigned tasks
  const myProjects = projects.filter(project => 
    tasks.some(task => task.phase_id && project.phases?.some(phase => phase.id === task.phase_id))
  );

  // Get upcoming task deadlines (next 7 days)
  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = tasks
      .filter(task => 
        task.due_date && 
        new Date(task.due_date) >= now && 
        new Date(task.due_date) <= nextWeek &&
        task.status !== 'completed'
      )
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
    
    setUpcomingDeadlines(upcoming);
  }, [tasks]);

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Team Dashboard</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your tasks and track project progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{taskStats.todo}</div>
            <div className="text-sm text-muted-foreground">To Do</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Your assigned tasks across all projects</CardDescription>
              </div>
              <Badge variant="outline">{tasks.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.slice(0, 10).map((task) => {
                  const isOverdue = task.due_date && 
                    new Date(task.due_date) < new Date() && 
                    task.status !== 'completed';
                  
                  const statusColors = {
                    todo: 'bg-gray-100 text-gray-800',
                    in_progress: 'bg-blue-100 text-blue-800',
                    review: 'bg-purple-100 text-purple-800',
                    completed: 'bg-green-100 text-green-800',
                    blocked: 'bg-red-100 text-red-800'
                  };

                  const priorityColors = {
                    low: 'border-l-green-500',
                    medium: 'border-l-yellow-500',
                    high: 'border-l-orange-500',
                    urgent: 'border-l-red-500'
                  };

                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 border rounded-lg border-l-4 ${priorityColors[task.priority]} hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            <Badge className={statusColors[task.status]}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {task.priority}
                            </Badge>
                            {task.due_date && (
                              <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tasks.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      View All Tasks ({tasks.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects you're contributing to</CardDescription>
            </CardHeader>
            <CardContent>
              {myProjects.length === 0 ? (
                <div className="text-center py-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active projects</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProjects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{project.name}</h4>
                        <p className="text-xs text-muted-foreground">{project.client?.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{project.progress_percentage}%</div>
                        <Progress value={project.progress_percentage} className="h-1 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(task.due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          daysUntilDue <= 1 ? 'bg-red-500' : 
                          daysUntilDue <= 3 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {daysUntilDue === 0 ? 'Due today' :
                             daysUntilDue === 1 ? 'Due tomorrow' :
                             `Due in ${daysUntilDue} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Your progress summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasks Completed</span>
                  <span className="font-semibold">{taskStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-semibold">{taskStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold">
                    {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Overall Progress</span>
                    <span>{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncProfiles = async () => {
    setIsSyncing(true);
    try {
      const result = await syncMissingProfiles();
      
      if (result.success) {
        toast({
          title: "Profile Sync Complete",
          description: `Successfully synced ${result.syncedCount || 0} missing profiles.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: result.error || "Failed to sync profiles.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access all administrative functions and manage the AdvantX platform.
        </p>
        <Button
          onClick={handleSyncProfiles}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing Profiles...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Missing Profiles
            </>
          )}
        </Button>
      </div>

      {/* Admin Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Management */}
        <Link to="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users and roles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage user accounts across the platform.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Project List */}
        <Link to="/admin/projects">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>View and manage all projects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all projects, track progress, and manage project details.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Project Creator */}
        <Link to="/admin/projects/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle>Project Creator</CardTitle>
                  <CardDescription>Create new projects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up new projects with custom dashboards and configurations.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Project Generator */}
        <Link to="/admin/project-generator">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <CardTitle>Project Generator</CardTitle>
                  <CardDescription>AI-powered setup</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the advanced project generator with automation features.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <div className="text-xs text-muted-foreground">Platform-wide</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <div className="text-xs text-muted-foreground">In progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">--</div>
            <div className="text-xs text-muted-foreground">Current month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
            <div className="text-xs text-muted-foreground">All systems operational</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Administrative Activity</CardTitle>
          <CardDescription>Latest actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">New user registration</p>
                  <p className="text-sm text-muted-foreground">Client account created</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Project milestone completed</p>
                  <p className="text-sm text-muted-foreground">E-commerce Platform - Phase 2</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium">System maintenance scheduled</p>
                  <p className="text-sm text-muted-foreground">Upcoming maintenance window</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}