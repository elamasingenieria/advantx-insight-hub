import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectInfoData {
  clientId?: string;
  newClient?: {
    name: string;
    company: string;
    email: string;
    phone?: string;
  };
  projectName: string;
  description: string;
  projectType: string;
  projectSize: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  currency: string;
}

interface ProjectInfoStepProps {
  data: ProjectInfoData;
  onUpdate: (data: Partial<ProjectInfoData>) => void;
}

const projectTypes = [
  'Web Development',
  'Mobile App',
  'AI Integration',
  'Custom Software',
  'E-commerce',
  'Data Analytics',
  'API Development',
  'System Integration'
];

const projectSizes = [
  { value: 'small', label: 'Small (1-3 months)', defaultBudget: 25000 },
  { value: 'medium', label: 'Medium (3-6 months)', defaultBudget: 75000 },
  { value: 'large', label: 'Large (6+ months)', defaultBudget: 150000 }
];

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export function ProjectInfoStep({ data, onUpdate }: ProjectInfoStepProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSizeChange = (size: string) => {
    const sizeConfig = projectSizes.find(s => s.value === size);
    onUpdate({
      projectSize: size,
      totalBudget: sizeConfig?.defaultBudget || data.totalBudget
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Information</CardTitle>
            <CardDescription>
              Select an existing client or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewClientForm ? (
              <>
                <div>
                  <Label htmlFor="client-select">Select Client</Label>
                  <Select
                    value={data.clientId || ''}
                    onValueChange={(value) => onUpdate({ clientId: value, newClient: undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.company}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewClientForm(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Client
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">New Client Details</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewClientForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Client Name *</Label>
                    <Input
                      id="client-name"
                      value={data.newClient?.name || ''}
                      onChange={(e) => onUpdate({
                        newClient: { ...data.newClient, name: e.target.value }
                      })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-company">Company *</Label>
                    <Input
                      id="client-company"
                      value={data.newClient?.company || ''}
                      onChange={(e) => onUpdate({
                        newClient: { ...data.newClient, company: e.target.value }
                      })}
                      placeholder="ACME Corp"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-email">Email *</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={data.newClient?.email || ''}
                      onChange={(e) => onUpdate({
                        newClient: { ...data.newClient, email: e.target.value }
                      })}
                      placeholder="john@acme.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      value={data.newClient?.phone || ''}
                      onChange={(e) => onUpdate({
                        newClient: { ...data.newClient, phone: e.target.value }
                      })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Details</CardTitle>
            <CardDescription>
              Define the scope and characteristics of the project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={data.projectName}
                onChange={(e) => onUpdate({ projectName: e.target.value })}
                placeholder="E-commerce Platform Redesign"
              />
            </div>

            <div>
              <Label htmlFor="project-type">Project Type *</Label>
              <Select
                value={data.projectType}
                onValueChange={(value) => onUpdate({ projectType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type..." />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project-size">Project Size *</Label>
              <Select
                value={data.projectSize}
                onValueChange={handleProjectSizeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project size..." />
                </SelectTrigger>
                <SelectContent>
                  {projectSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Detailed description of the project goals, requirements, and expected outcomes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline & Budget</CardTitle>
          <CardDescription>
            Set the project timeline and budget constraints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.startDate ? format(data.startDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.startDate}
                    onSelect={(date) => date && onUpdate({ startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.endDate ? format(data.endDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.endDate}
                    onSelect={(date) => date && onUpdate({ endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="budget">Total Budget *</Label>
              <Input
                id="budget"
                type="number"
                value={data.totalBudget}
                onChange={(e) => onUpdate({ totalBudget: parseFloat(e.target.value) || 0 })}
                placeholder="75000"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={data.currency}
                onValueChange={(value) => onUpdate({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}