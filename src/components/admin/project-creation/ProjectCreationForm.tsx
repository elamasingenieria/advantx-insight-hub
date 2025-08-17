import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Settings, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { ClientSelector } from '../project-generator/ClientSelector';
import type { ProjectFormData } from '@/pages/admin/ProjectCreation';

interface ProjectCreationFormProps {
  data: ProjectFormData;
  onUpdate: (updates: Partial<ProjectFormData>) => void;
}

const projectStatuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const availableWidgets = [
  { id: 'progress', name: 'Progress Tracker', description: 'Overall project progress' },
  { id: 'tasks', name: 'Task Management', description: 'View and manage tasks' },
  { id: 'payments', name: 'Payment Schedule', description: 'Payment milestones and status' },
  { id: 'team', name: 'Team Members', description: 'Project team information' },
  { id: 'timeline', name: 'Timeline', description: 'Project phases and timeline' },
  { id: 'analytics', name: 'Analytics', description: 'Project metrics and insights' },
];

const colorPresets = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

export function ProjectCreationForm({ data, onUpdate }: ProjectCreationFormProps) {
  const handleClientSelect = (clientId: string) => {
    onUpdate({ client_id: clientId });
  };

  const handleWidgetToggle = (widgetId: string) => {
    const updatedWidgets = data.selectedWidgets.includes(widgetId)
      ? data.selectedWidgets.filter(id => id !== widgetId)
      : [...data.selectedWidgets, widgetId];
    onUpdate({ selectedWidgets: updatedWidgets });
  };

  const handlePermissionToggle = (permission: keyof ProjectFormData['permissions']) => {
    onUpdate({
      permissions: {
        ...data.permissions,
        [permission]: !data.permissions[permission],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <ClientSelector
        selectedClientId={data.client_id}
        onClientSelect={handleClientSelect}
      />

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Information</CardTitle>
          <CardDescription>
            Define the basic project details and specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={data.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="E-commerce Platform Redesign"
              />
            </div>

            <div>
              <Label htmlFor="status">Project Status</Label>
              <Select
                value={data.status}
                onValueChange={(value) => onUpdate({ status: value as ProjectFormData['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="total-amount">Total Budget</Label>
              <Input
                id="total-amount"
                type="number"
                value={data.total_amount || ''}
                onChange={(e) => onUpdate({ total_amount: parseFloat(e.target.value) || undefined })}
                placeholder="75000"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.start_date ? format(data.start_date, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.start_date}
                    onSelect={(date) => onUpdate({ start_date: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.end_date ? format(data.end_date, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.end_date}
                    onSelect={(date) => onUpdate({ end_date: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="monthly-savings">Monthly Savings</Label>
              <Input
                id="monthly-savings"
                type="number"
                value={data.monthly_savings || ''}
                onChange={(e) => onUpdate({ monthly_savings: parseFloat(e.target.value) || undefined })}
                placeholder="5000"
                min="0"
                step="100"
              />
            </div>

            <div>
              <Label htmlFor="roi">Annual ROI %</Label>
              <Input
                id="roi"
                type="number"
                value={data.annual_roi_percentage || ''}
                onChange={(e) => onUpdate({ annual_roi_percentage: parseFloat(e.target.value) || undefined })}
                placeholder="25"
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div>
              <Label htmlFor="drive-folder">Google Drive Folder ID</Label>
              <Input
                id="drive-folder"
                value={data.drive_root_folder_id || ''}
                onChange={(e) => onUpdate({ drive_root_folder_id: e.target.value })}
                placeholder="1A2B3C4D5E6F7G8H9I0J"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Detailed description of the project goals, requirements, and expected outcomes..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Configuration
          </CardTitle>
          <CardDescription>
            Configure the client dashboard widgets, branding, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="widgets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="widgets">Widgets</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="widgets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={widget.id}
                      checked={data.selectedWidgets.includes(widget.id)}
                      onCheckedChange={() => handleWidgetToggle(widget.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={widget.id} className="text-sm font-medium cursor-pointer">
                        {widget.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{widget.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <div>
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Input
                  id="welcome-message"
                  value={data.welcomeMessage}
                  onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
                  placeholder="Welcome to your project dashboard"
                />
              </div>

              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onUpdate({ primaryColor: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        data.primaryColor === color.value ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Palette className="h-4 w-4" />
                  <Input
                    type="color"
                    value={data.primaryColor}
                    onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                    className="w-20 h-8"
                  />
                  <span className="text-sm text-muted-foreground">{data.primaryColor}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-3">
                {Object.entries(data.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={() => handlePermissionToggle(key as keyof ProjectFormData['permissions'])}
                    />
                    <Label htmlFor={key} className="cursor-pointer">
                      {key === 'viewTeam' && 'View Team Members'}
                      {key === 'viewTasks' && 'View Tasks'}
                      {key === 'viewPayments' && 'View Payment Schedule'}
                      {key === 'viewTimeline' && 'View Project Timeline'}
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}