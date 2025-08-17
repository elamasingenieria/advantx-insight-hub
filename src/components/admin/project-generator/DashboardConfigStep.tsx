import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Layout, 
  Palette, 
  Settings, 
  Eye, 
  Bell, 
  Users, 
  Calendar, 
  DollarSign,
  BarChart3,
  CheckSquare,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';

interface DashboardConfig {
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
}

interface DashboardConfigStepProps {
  data: DashboardConfig;
  onUpdate: (data: Partial<DashboardConfig>) => void;
}

const availableWidgets = [
  {
    id: 'progress',
    name: 'Project Progress',
    description: 'Overall project completion status and timeline',
    icon: BarChart3,
    category: 'overview'
  },
  {
    id: 'tasks',
    name: 'Task Overview',
    description: 'Current tasks, upcoming deadlines, and task status',
    icon: CheckSquare,
    category: 'project'
  },
  {
    id: 'payments',
    name: 'Payment Tracker',
    description: 'Payment schedule, invoices, and payment status',
    icon: DollarSign,
    category: 'financial'
  },
  {
    id: 'team',
    name: 'Team Members',
    description: 'Team contacts, roles, and availability',
    icon: Users,
    category: 'team'
  },
  {
    id: 'timeline',
    name: 'Project Timeline',
    description: 'Phase timeline, milestones, and key dates',
    icon: Calendar,
    category: 'project'
  },
  {
    id: 'messages',
    name: 'Messages & Updates',
    description: 'Communication hub and project updates',
    icon: MessageSquare,
    category: 'communication'
  },
  {
    id: 'deadlines',
    name: 'Upcoming Deadlines',
    description: 'Next deadlines and important dates',
    icon: Clock,
    category: 'overview'
  },
  {
    id: 'roi',
    name: 'ROI Summary',
    description: 'Return on investment metrics and projections',
    icon: Star,
    category: 'financial'
  }
];

const colorPresets = [
  { name: 'Blue', value: '#3b82f6', description: 'Professional and trustworthy' },
  { name: 'Green', value: '#10b981', description: 'Growth and success focused' },
  { name: 'Purple', value: '#8b5cf6', description: 'Creative and innovative' },
  { name: 'Red', value: '#ef4444', description: 'Bold and energetic' },
  { name: 'Orange', value: '#f97316', description: 'Warm and approachable' },
  { name: 'Pink', value: '#ec4899', description: 'Modern and friendly' },
  { name: 'Indigo', value: '#6366f1', description: 'Sophisticated and calm' },
  { name: 'Teal', value: '#14b8a6', description: 'Fresh and balanced' }
];

export function DashboardConfigStep({ data, onUpdate }: DashboardConfigStepProps) {
  const [config, setConfig] = useState<DashboardConfig>(data);

  useEffect(() => {
    setConfig(data);
  }, [data]);

  const updateConfig = (section: keyof DashboardConfig, updates: any) => {
    const newConfig = {
      ...config,
      [section]: { ...config[section], ...updates }
    };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const toggleWidget = (widgetId: string) => {
    const widgets = config.widgets.includes(widgetId)
      ? config.widgets.filter(id => id !== widgetId)
      : [...config.widgets, widgetId];
    
    const newConfig = { ...config, widgets };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const getWidgetsByCategory = (category: string) => {
    return availableWidgets.filter(widget => widget.category === category);
  };

  const categories = [
    { id: 'overview', name: 'Overview', description: 'Key metrics and summaries' },
    { id: 'project', name: 'Project', description: 'Project-specific information' },
    { id: 'financial', name: 'Financial', description: 'Budget and payment tracking' },
    { id: 'team', name: 'Team', description: 'Team and communication tools' },
    { id: 'communication', name: 'Communication', description: 'Messages and updates' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Dashboard Configuration & Preview</h3>
        <p className="text-sm text-muted-foreground">
          Customize the client dashboard layout, branding, and permissions
        </p>
      </div>

      <Tabs defaultValue="widgets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="widgets" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Widget Configuration */}
        <TabsContent value="widgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Dashboard Widgets
              </CardTitle>
              <CardDescription>
                Select which components will appear on the client dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map((category) => {
                const categoryWidgets = getWidgetsByCategory(category.id);
                const selectedCount = categoryWidgets.filter(w => config.widgets.includes(w.id)).length;
                
                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge variant="outline">
                        {selectedCount}/{categoryWidgets.length} selected
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryWidgets.map((widget) => {
                        const Icon = widget.icon;
                        const isSelected = config.widgets.includes(widget.id);
                        
                        return (
                          <Card 
                            key={widget.id} 
                            className={`cursor-pointer transition-all ${
                              isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'
                            }`}
                            onClick={() => toggleWidget(widget.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium">{widget.name}</h5>
                                    <Switch checked={isSelected} onChange={() => toggleWidget(widget.id)} />
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{widget.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Configuration */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Customization
              </CardTitle>
              <CardDescription>
                Customize colors, messaging, and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  value={config.branding.welcomeMessage}
                  onChange={(e) => updateConfig('branding', { welcomeMessage: e.target.value })}
                  placeholder="Welcome to your project dashboard! Here you can track progress, view tasks, and stay updated on your project's development."
                  rows={3}
                />
              </div>

              <div>
                <Label>Primary Color</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorPresets.map((preset) => (
                      <Card 
                        key={preset.value}
                        className={`cursor-pointer transition-all ${
                          config.branding.primaryColor === preset.value ? 'ring-2 ring-offset-2' : 'hover:scale-105'
                        }`}
                        style={{ 
                          borderColor: config.branding.primaryColor === preset.value ? preset.value : undefined,
                          ringColor: preset.value 
                        }}
                        onClick={() => updateConfig('branding', { primaryColor: preset.value })}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: preset.value }}
                            />
                            <div>
                              <div className="font-medium text-sm">{preset.name}</div>
                              <div className="text-xs text-muted-foreground">{preset.value}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="custom-color" className="text-sm">Custom Color:</Label>
                    <Input
                      id="custom-color"
                      type="color"
                      value={config.branding.primaryColor}
                      onChange={(e) => updateConfig('branding', { primaryColor: e.target.value })}
                      className="w-16 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">{config.branding.primaryColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Configuration */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Dashboard Permissions
                </CardTitle>
                <CardDescription>
                  Control what clients can view and access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="view-tasks">View Tasks</Label>
                    <p className="text-sm text-muted-foreground">Allow client to see project tasks and progress</p>
                  </div>
                  <Switch
                    id="view-tasks"
                    checked={config.permissions.viewTasks}
                    onCheckedChange={(checked) => updateConfig('permissions', { viewTasks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="view-payments">View Payments</Label>
                    <p className="text-sm text-muted-foreground">Show payment schedule and invoice status</p>
                  </div>
                  <Switch
                    id="view-payments"
                    checked={config.permissions.viewPayments}
                    onCheckedChange={(checked) => updateConfig('permissions', { viewPayments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="view-team">View Team</Label>
                    <p className="text-sm text-muted-foreground">Display team member information and contacts</p>
                  </div>
                  <Switch
                    id="view-team"
                    checked={config.permissions.viewTeam}
                    onCheckedChange={(checked) => updateConfig('permissions', { viewTeam: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="view-timeline">View Timeline</Label>
                    <p className="text-sm text-muted-foreground">Show project timeline and milestones</p>
                  </div>
                  <Switch
                    id="view-timeline"
                    checked={config.permissions.viewTimeline}
                    onCheckedChange={(checked) => updateConfig('permissions', { viewTimeline: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic notifications for clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-updates">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">Send regular project update emails</p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={config.notifications.emailUpdates}
                    onCheckedChange={(checked) => updateConfig('notifications', { emailUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                    <p className="text-sm text-muted-foreground">Notify about upcoming deadlines and milestones</p>
                  </div>
                  <Switch
                    id="deadline-reminders"
                    checked={config.notifications.deadlineReminders}
                    onCheckedChange={(checked) => updateConfig('notifications', { deadlineReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-reminders">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send payment due date reminders</p>
                  </div>
                  <Switch
                    id="payment-reminders"
                    checked={config.notifications.paymentReminders}
                    onCheckedChange={(checked) => updateConfig('notifications', { paymentReminders: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Dashboard Preview
              </CardTitle>
              <CardDescription>
                Preview how the client dashboard will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-background" style={{ borderColor: config.branding.primaryColor }}>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold" style={{ color: config.branding.primaryColor }}>
                          Project Dashboard
                        </h2>
                        <p className="text-muted-foreground mt-1">{config.branding.welcomeMessage}</p>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: config.branding.primaryColor + '20' }}
                      >
                        <Layout className="h-6 w-6" style={{ color: config.branding.primaryColor }} />
                      </div>
                    </div>
                  </div>

                  {/* Widget Preview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.widgets.map((widgetId) => {
                      const widget = availableWidgets.find(w => w.id === widgetId);
                      if (!widget) return null;
                      
                      const Icon = widget.icon;
                      
                      return (
                        <div key={widgetId} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="h-4 w-4" style={{ color: config.branding.primaryColor }} />
                            <span className="font-medium text-sm">{widget.name}</span>
                          </div>
                          <div className="space-y-2">
                            {widget.id === 'progress' && (
                              <div>
                                <Progress value={65} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">65% Complete</p>
                              </div>
                            )}
                            {widget.id !== 'progress' && (
                              <div className="text-xs text-muted-foreground">
                                {widget.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {config.widgets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No widgets selected. Add some widgets to see the dashboard preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}