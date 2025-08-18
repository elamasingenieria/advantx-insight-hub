import { useState } from 'react';
import { useDashboard, useAllDashboardConfigs, type DashboardConfig } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Edit, 
  Plus, 
  Palette, 
  Eye, 
  Bell,
  CheckSquare,
  CreditCard,
  Users,
  Calendar
} from 'lucide-react';

interface DashboardConfigManagerProps {
  projectId?: string;
}

export function DashboardConfigManager({ projectId }: DashboardConfigManagerProps) {
  const { configs, loading, refetch } = useAllDashboardConfigs();
  const { 
    dashboardConfig, 
    updateDashboardConfig, 
    createDashboardConfig, 
    loading: configLoading 
  } = useDashboard({ projectId });
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DashboardConfig | null>(null);

  const availableWidgets = [
    { key: 'progress', label: 'Progress Overview', icon: CheckSquare },
    { key: 'tasks', label: 'Tasks & Phases', icon: CheckSquare },
    { key: 'payments', label: 'Payment Schedule', icon: CreditCard },
    { key: 'team', label: 'Team Activity', icon: Users },
    { key: 'savings', label: 'Monthly Savings', icon: Calendar },
  ];

  const handleEditConfig = (config: DashboardConfig) => {
    setEditingConfig(config);
    setIsEditDialogOpen(true);
  };

  const handleSaveConfig = async (updatedConfig: Partial<DashboardConfig>) => {
    if (editingConfig) {
      await updateDashboardConfig(updatedConfig);
      setIsEditDialogOpen(false);
      setEditingConfig(null);
      refetch();
    }
  };

  const handleCreateConfig = async (projectId: string) => {
    await createDashboardConfig(projectId);
    refetch();
  };

  if (loading || configLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Configurations</h2>
          <p className="text-muted-foreground">
            Manage dashboard layouts and permissions for client projects
          </p>
        </div>
        
        {projectId && !dashboardConfig && (
          <Button onClick={() => handleCreateConfig(projectId)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Configuration
          </Button>
        )}
      </div>

      {/* Current Project Configuration */}
      {projectId && dashboardConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Current Project Configuration
            </CardTitle>
            <CardDescription>
              Configuration for project ID: {projectId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Active Widgets</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dashboardConfig.widgets.map((widget) => (
                    <Badge key={widget} variant="secondary">
                      {availableWidgets.find(w => w.key === widget)?.label || widget}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: dashboardConfig.branding.primaryColor }}
                  />
                  <span className="text-sm">{dashboardConfig.branding.primaryColor}</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => handleEditConfig(dashboardConfig)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Configurations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Dashboard Configurations</CardTitle>
          <CardDescription>
            Overview of all project dashboard configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No dashboard configurations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Project: {(config as any).project?.name || config.project_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(config as any).project?.profile?.full_name} • {(config as any).project?.profile?.email}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditConfig(config)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium">Widgets</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.widgets.map((widget) => (
                          <Badge key={widget} variant="outline" className="text-xs">
                            {widget}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium">Permissions</Label>
                      <div className="flex gap-2 mt-1">
                        {config.permissions.viewTasks && (
                          <Badge variant="outline" className="text-xs">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Tasks
                          </Badge>
                        )}
                        {config.permissions.viewPayments && (
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="w-3 h-3 mr-1" />
                            Payments
                          </Badge>
                        )}
                        {config.permissions.viewTeam && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Team
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Configuration Dialog */}
      <ConfigEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        config={editingConfig}
        onSave={handleSaveConfig}
        availableWidgets={availableWidgets}
      />
    </div>
  );
}

interface ConfigEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardConfig | null;
  onSave: (config: Partial<DashboardConfig>) => void;
  availableWidgets: Array<{ key: string; label: string; icon: any }>;
}

function ConfigEditDialog({ isOpen, onClose, config, onSave, availableWidgets }: ConfigEditDialogProps) {
  const [formData, setFormData] = useState<Partial<DashboardConfig>>({});

  // Update form data when config changes
  useState(() => {
    if (config) {
      setFormData({
        widgets: [...config.widgets],
        branding: { ...config.branding },
        permissions: { ...config.permissions },
        notifications: { ...config.notifications },
      });
    }
  }, [config]);

  const handleWidgetToggle = (widgetKey: string) => {
    setFormData(prev => ({
      ...prev,
      widgets: prev.widgets?.includes(widgetKey)
        ? prev.widgets.filter(w => w !== widgetKey)
        : [...(prev.widgets || []), widgetKey]
    }));
  };

  const handlePermissionToggle = (permission: keyof DashboardConfig['permissions']) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions?.[permission]
      }
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Dashboard Configuration</DialogTitle>
          <DialogDescription>
            Customize the dashboard layout and permissions for this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widgets Section */}
          <div>
            <Label className="text-base font-medium">Dashboard Widgets</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select which widgets to display on the client dashboard
            </p>
            <div className="grid grid-cols-2 gap-3">
              {availableWidgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <div 
                    key={widget.key}
                    className="flex items-center space-x-2 p-3 border rounded-lg"
                  >
                    <input
                      type="checkbox"
                      id={widget.key}
                      checked={formData.widgets?.includes(widget.key) || false}
                      onChange={() => handleWidgetToggle(widget.key)}
                      className="rounded"
                    />
                    <Icon className="w-4 h-4" />
                    <label htmlFor={widget.key} className="text-sm font-medium cursor-pointer">
                      {widget.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Branding Section */}
          <div>
            <Label className="text-base font-medium">Branding</Label>
            <div className="space-y-3 mt-3">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.branding?.primaryColor || '#3b82f6'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    branding: {
                      ...prev.branding,
                      primaryColor: e.target.value
                    }
                  }))}
                  className="w-20 h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={formData.branding?.welcomeMessage || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    branding: {
                      ...prev.branding,
                      welcomeMessage: e.target.value
                    }
                  }))}
                  placeholder="Welcome to your project dashboard"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissions Section */}
          <div>
            <Label className="text-base font-medium">Permissions</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Control what sections the client can view
            </p>
            <div className="space-y-3">
              {Object.entries(config.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Switch
                    id={key}
                    checked={formData.permissions?.[key as keyof typeof config.permissions] ?? value}
                    onCheckedChange={() => handlePermissionToggle(key as keyof typeof config.permissions)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div>
            <Label className="text-base font-medium">Notifications</Label>
            <div className="space-y-3 mt-3">
              {Object.entries(config.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`notif-${key}`} className="text-sm">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Switch
                    id={`notif-${key}`}
                    checked={formData.notifications?.[key as keyof typeof config.notifications] ?? value}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [key]: checked
                      }
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
