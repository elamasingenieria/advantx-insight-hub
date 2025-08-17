import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BookOpen,
  CreditCard,
  Bell,
  Settings,
  Shield,
  RefreshCw
} from 'lucide-react';

// Mock data - in real app this would come from Supabase
const mockProject = {
  id: '1',
  name: 'E-commerce Automation Platform',
  overallProgress: 73,
  status: 'active' as const,
  phases: [
    {
      id: '1',
      name: 'Discovery & Planning',
      progress: 100,
      status: 'completed' as const,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-01'),
    },
    {
      id: '2', 
      name: 'UI/UX Design',
      progress: 100,
      status: 'completed' as const,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
    },
    {
      id: '3',
      name: 'Backend Development',
      progress: 85,
      status: 'in_progress' as const,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-03-15'),
    },
    {
      id: '4',
      name: 'Frontend Integration',
      progress: 45,
      status: 'in_progress' as const,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-30'),
    },
    {
      id: '5',
      name: 'Testing & Deployment',
      progress: 0,
      status: 'not_started' as const,
      endDate: new Date('2024-04-15'),
    },
  ]
};

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
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">2 in progress</div>
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
            <div className="text-2xl font-bold text-success">$2,500</div>
            <div className="text-xs text-muted-foreground">+15% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mar 15</div>
            <div className="text-xs text-muted-foreground">Backend completion</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Support Access</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Premium</div>
            <div className="text-xs text-muted-foreground">AI Classroom access</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Project Progress */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressTracker project={mockProject} />
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Key milestones and deliverables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Backend API Completion</p>
                    <p className="text-sm text-muted-foreground">E-commerce Platform</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">Mar 15</p>
                    <p className="text-sm text-muted-foreground">5 days</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">User Testing Phase</p>
                    <p className="text-sm text-muted-foreground">Mobile App</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">Mar 22</p>
                    <p className="text-sm text-muted-foreground">12 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - ROI & Quick Actions */}
        <div className="space-y-6">
          <ROISummaryCard 
            monthlySavings={2500}
            annualSavings={30000}
            roiPercentage={425}
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
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Team Dashboard</h2>
      <p>Team member dashboard with task management and project overview.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardDescription>Manage users, roles, and permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage user accounts across the platform. Control access levels and user permissions.
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
                  <CardDescription>Create new client projects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up new projects with custom dashboards, phases, team assignments, and payment schedules.
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
                  <CardDescription>AI-powered project setup</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the advanced project generator to create comprehensive project structures with automation.
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