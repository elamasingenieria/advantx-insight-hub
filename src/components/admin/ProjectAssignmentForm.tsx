import { useState } from 'react';
import { useProfiles } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, User, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectData {
  name: string;
  description: string;
  profile_id: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: Date;
  end_date?: Date;
  total_amount?: number;
  monthly_savings?: number;
  annual_roi_percentage?: number;
}

interface ProjectAssignmentFormProps {
  onProjectCreated?: () => void;
}

export function ProjectAssignmentForm({ onProjectCreated }: ProjectAssignmentFormProps) {
  const { profiles, loading: profilesLoading } = useProfiles({ role: 'client' });
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: '',
    profile_id: '',
    status: 'planning',
    start_date: undefined,
    end_date: undefined,
    total_amount: undefined,
    monthly_savings: undefined,
    annual_roi_percentage: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profile_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a client profile to assign the project to.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        profile_id: formData.profile_id,
        status: formData.status,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        total_amount: formData.total_amount || null,
        monthly_savings: formData.monthly_savings || 0,
        annual_roi_percentage: formData.annual_roi_percentage || 0,
        progress_percentage: 0,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      // Create default dashboard configuration for the project
      const { error: dashboardError } = await supabase
        .from('dashboard_configs')
        .insert([{
          project_id: data.id,
          widgets: ['progress', 'tasks', 'payments', 'team'],
          branding: {
            primaryColor: "#3b82f6",
            welcomeMessage: `Welcome to your ${formData.name} project dashboard`
          },
          permissions: {
            viewTeam: true,
            viewTasks: true,
            viewPayments: true,
            viewTimeline: true
          },
          notifications: {
            emailUpdates: true,
            paymentReminders: true,
            deadlineReminders: true
          }
        }]);

      if (dashboardError) {
        console.error('Error creating dashboard config:', dashboardError);
        // Don't fail the whole operation for this
      }

      toast({
        title: "Project Created",
        description: `Project "${formData.name}" has been created and assigned successfully.`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        profile_id: '',
        status: 'planning',
        start_date: undefined,
        end_date: undefined,
        total_amount: undefined,
        monthly_savings: undefined,
        annual_roi_percentage: undefined,
      });

      setIsOpen(false);
      onProjectCreated?.();

    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create project.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProjectData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Assign New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create & Assign New Project</DialogTitle>
          <DialogDescription>
            Create a new project and assign it to a client profile.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Project description and objectives"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Assignment
              </CardTitle>
              <CardDescription>
                Select which client profile this project will be assigned to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="profile_id">Client Profile *</Label>
                <Select 
                  value={formData.profile_id} 
                  onValueChange={(value) => handleInputChange('profile_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profilesLoading ? (
                      <SelectItem value="" disabled>Loading profiles...</SelectItem>
                    ) : (
                      profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{profile.full_name}</span>
                            <span className="text-sm text-muted-foreground">{profile.email}</span>
                            {profile.company && (
                              <span className="text-xs text-muted-foreground">{profile.company}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(formData.start_date, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => handleInputChange('start_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(formData.end_date, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => handleInputChange('end_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount ($)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount || ''}
                    onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_savings">Monthly Savings ($)</Label>
                  <Input
                    id="monthly_savings"
                    type="number"
                    step="0.01"
                    value={formData.monthly_savings || ''}
                    onChange={(e) => handleInputChange('monthly_savings', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_roi_percentage">Annual ROI (%)</Label>
                  <Input
                    id="annual_roi_percentage"
                    type="number"
                    step="1"
                    value={formData.annual_roi_percentage || ''}
                    onChange={(e) => handleInputChange('annual_roi_percentage', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create & Assign Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
