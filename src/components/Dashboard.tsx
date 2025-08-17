import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROISummaryCard } from '@/components/ROISummaryCard';
import { ProgressTracker } from '@/components/ProgressTracker';
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
  Settings
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
  const { profile, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const getDashboardContent = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'client':
        return <ClientDashboard />;
      case 'team_member':
        return <TeamDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <ClientDashboard />;
    }
  };

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
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p>Administrator dashboard with full system management capabilities.</p>
    </div>
  );
}