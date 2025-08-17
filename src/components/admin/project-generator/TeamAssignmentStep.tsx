import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Users, UserCheck, AlertTriangle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  company?: string;
}

interface TeamAssignment {
  profileId: string;
  role: string;
  allocation: number;
  isClientLiaison: boolean;
}

interface Phase {
  id: string;
  name: string;
  tasks: Array<{
    title: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface TeamAssignmentStepProps {
  data: TeamAssignment[];
  phases: Phase[];
  onUpdate: (data: TeamAssignment[]) => void;
}

const teamRoles = [
  { value: 'project_lead', label: 'Project Lead', description: 'Oversees project delivery and client communication' },
  { value: 'senior_developer', label: 'Senior Developer', description: 'Lead technical development and architecture' },
  { value: 'frontend_developer', label: 'Frontend Developer', description: 'UI/UX implementation and client-side development' },
  { value: 'backend_developer', label: 'Backend Developer', description: 'Server-side development and API creation' },
  { value: 'designer', label: 'UI/UX Designer', description: 'Design and user experience creation' },
  { value: 'qa_engineer', label: 'QA Engineer', description: 'Quality assurance and testing' },
  { value: 'devops', label: 'DevOps Engineer', description: 'Infrastructure and deployment management' },
  { value: 'business_analyst', label: 'Business Analyst', description: 'Requirements analysis and documentation' }
];

export function TeamAssignmentStep({ data, phases, onUpdate }: TeamAssignmentStepProps) {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<TeamAssignment[]>(Array.isArray(data) ? data : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    setAssignments(Array.isArray(data) ? data : []);
  }, [data]);

  const fetchTeamMembers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['team_member', 'admin'])
        .order('full_name');

      if (error) throw error;
      setTeamMembers(profiles || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAssignment = (profileId: string) => {
    const newAssignment: TeamAssignment = {
      profileId,
      role: 'senior_developer',
      allocation: 50,
      isClientLiaison: false
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    onUpdate(updatedAssignments);
  };

  const updateAssignment = (profileId: string, updates: Partial<TeamAssignment>) => {
    const updatedAssignments = assignments.map(assignment =>
      assignment.profileId === profileId
        ? { ...assignment, ...updates }
        : assignment
    );
    setAssignments(updatedAssignments);
    onUpdate(updatedAssignments);
  };

  const removeAssignment = (profileId: string) => {
    const updatedAssignments = assignments.filter(assignment => assignment.profileId !== profileId);
    setAssignments(updatedAssignments);
    onUpdate(updatedAssignments);
  };

  const setClientLiaison = (profileId: string) => {
    const updatedAssignments = assignments.map(assignment => ({
      ...assignment,
      isClientLiaison: assignment.profileId === profileId
    }));
    setAssignments(updatedAssignments);
    onUpdate(updatedAssignments);
  };

  const assignedMemberIds = assignments.map(a => a.profileId);
  const availableMembers = teamMembers.filter(member => !assignedMemberIds.includes(member.id));
  const totalAllocation = assignments.reduce((sum, assignment) => sum + assignment.allocation, 0);
  const clientLiaison = assignments.find(a => a.isClientLiaison);

  const getCapacityColor = (allocation: number) => {
    if (allocation > 80) return 'text-destructive';
    if (allocation > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTeamMember = (profileId: string) => {
    return teamMembers.find(member => member.id === profileId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Team Assignment & Roles</h3>
          <p className="text-sm text-muted-foreground">
            Assign team members, set allocations, and designate client liaison
          </p>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{availableMembers.length}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded-full ${totalAllocation > 100 ? 'bg-destructive' : 'bg-green-500'}`} />
              <div>
                <div className={`text-2xl font-bold ${getCapacityColor(totalAllocation)}`}>
                  {Math.round(totalAllocation)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Allocation</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{clientLiaison ? '1' : '0'}</div>
                <div className="text-sm text-muted-foreground">Client Liaison</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {totalAllocation > 100 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Team Over-allocated</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total team allocation is {Math.round(totalAllocation)}%. Consider reducing individual allocations or adding more team members.
            </p>
          </CardContent>
        </Card>
      )}

      {!clientLiaison && assignments.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">No Client Liaison Designated</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Please designate one team member as the primary client liaison for communication.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assigned Team Members */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Team Members</CardTitle>
            <CardDescription>
              Configure roles, allocations, and responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.map((assignment) => {
              const member = getTeamMember(assignment.profileId);
              if (!member) return null;

              return (
                <div key={assignment.profileId} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.full_name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.isClientLiaison && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Client Liaison
                        </Badge>
                      )}
                      <Badge variant="outline" className={getCapacityColor(assignment.allocation)}>
                        {assignment.allocation}% allocation
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssignment(assignment.profileId)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label>Project Role</Label>
                      <Select
                        value={assignment.role}
                        onValueChange={(value) => updateAssignment(assignment.profileId, { role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teamRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-muted-foreground">{role.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Allocation ({assignment.allocation}%)</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[assignment.allocation]}
                          onValueChange={([value]) => updateAssignment(assignment.profileId, { allocation: value })}
                          min={10}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>10%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={assignment.isClientLiaison}
                      onCheckedChange={() => setClientLiaison(assignment.profileId)}
                    />
                    <Label>Designate as primary client liaison</Label>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Available Team Members */}
      {availableMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Team Members</CardTitle>
            <CardDescription>
              Add team members to the project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMembers.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.full_name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        {member.company && (
                          <div className="text-xs text-muted-foreground">{member.company}</div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAssignment(member.id)}
                    >
                      Add to Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 && availableMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Team Members Available</h3>
            <p className="text-muted-foreground">
              No team members are available for assignment. Make sure there are users with 'team_member' or 'admin' roles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}