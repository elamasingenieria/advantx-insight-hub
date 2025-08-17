import { useState, useEffect } from 'react';
import { useTasks, type CreateTaskData, type UpdateTaskData } from '@/hooks/useTasks';
import { usePhases } from '@/hooks/usePhases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Calendar as CalendarIcon,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface TaskManagerProps {
  projectId: string;
  projectName: string;
}

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: Circle, color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-blue-500' },
  { value: 'review', label: 'In Review', icon: RefreshCw, color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'bg-red-500' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export function TaskManager({ projectId, projectName }: TaskManagerProps) {
  const { phases } = usePhases(projectId);
  const { tasks, loading, taskStats, createTask, updateTask, deleteTask, refetch } = useTasks({ projectId });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // Create task form state
  const [createForm, setCreateForm] = useState({
    phase_id: '',
    title: '',
    description: '',
    priority: 'medium' as const,
    assignee_id: '',
    due_date: undefined as Date | undefined,
    estimated_hours: '',
  });

  // Edit task form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignee_id: '',
    due_date: undefined as Date | undefined,
    estimated_hours: '',
    actual_hours: '',
  });

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('role', ['team_member', 'admin'])
          .order('full_name');

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleCreateTask = async () => {
    if (!createForm.phase_id || !createForm.title.trim()) return;

    const taskData: CreateTaskData = {
      phase_id: createForm.phase_id,
      title: createForm.title.trim(),
      description: createForm.description.trim() || undefined,
      priority: createForm.priority,
      assignee_id: createForm.assignee_id || undefined,
      due_date: createForm.due_date?.toISOString().split('T')[0],
      estimated_hours: createForm.estimated_hours ? parseInt(createForm.estimated_hours) : undefined,
    };

    const success = await createTask(taskData);
    if (success) {
      setCreateForm({
        phase_id: '',
        title: '',
        description: '',
        priority: 'medium',
        assignee_id: '',
        due_date: undefined,
        estimated_hours: '',
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editForm.title.trim()) return;

    const updates: UpdateTaskData = {
      title: editForm.title.trim(),
      description: editForm.description.trim() || undefined,
      status: editForm.status,
      priority: editForm.priority,
      assignee_id: editForm.assignee_id || undefined,
      due_date: editForm.due_date?.toISOString().split('T')[0],
      estimated_hours: editForm.estimated_hours ? parseInt(editForm.estimated_hours) : undefined,
      actual_hours: editForm.actual_hours ? parseInt(editForm.actual_hours) : undefined,
    };

    const success = await updateTask(editingTask, updates);
    if (success) {
      setEditingTask(null);
    }
  };

  const openEditModal = (task: any) => {
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      estimated_hours: task.estimated_hours?.toString() || '',
      actual_hours: task.actual_hours?.toString() || '',
    });
    setEditingTask(task.id);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTask(taskId, { status: status as any });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee_id === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getPriorityConfig = (priority: string) => {
    return priorityOptions.find(opt => opt.value === priority) || priorityOptions[1];
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Manage tasks for {projectName}
              </CardDescription>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button disabled={phases.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your project phase.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="task-phase">Phase *</Label>
                    <Select
                      value={createForm.phase_id}
                      onValueChange={(value) => setCreateForm(prev => ({ ...prev, phase_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phase..." />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Design homepage wireframes"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what needs to be done..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={createForm.priority}
                        onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Assignee</Label>
                      <Select
                        value={createForm.assignee_id}
                        onValueChange={(value) => setCreateForm(prev => ({ ...prev, assignee_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {createForm.due_date ? format(createForm.due_date, "MMM d, yyyy") : "No due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={createForm.due_date}
                            onSelect={(date) => setCreateForm(prev => ({ ...prev, due_date: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="task-hours">Estimated Hours</Label>
                      <Input
                        id="task-hours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={createForm.estimated_hours}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask} 
                    disabled={!createForm.phase_id || !createForm.title.trim()}
                  >
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {phases.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Phases Available</h3>
              <p className="text-muted-foreground">
                Create project phases first before adding tasks.
              </p>
            </div>
          ) : (
            <>
              {/* Task Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statusOptions.map((status) => {
                  const count = taskStats[status.value as keyof typeof taskStats] || 0;
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={status.value}>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className={`w-8 h-8 rounded-full ${status.color} flex items-center justify-center`}>
                            <StatusIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">{status.label}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task Kanban Board */}
              <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="kanban" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statusOptions.map((status) => {
                      const statusTasks = getTasksByStatus(status.value);
                      
                      return (
                        <div key={status.value} className="space-y-3">
                          <div className="flex items-center gap-2 font-semibold">
                            <div className={`w-3 h-3 rounded-full ${status.color}`} />
                            {status.label} ({statusTasks.length})
                          </div>
                          
                          <div className="space-y-2 min-h-[200px]">
                            {statusTasks.map((task) => {
                              const priorityConfig = getPriorityConfig(task.priority);
                              const isOverdue = task.due_date && 
                                new Date(task.due_date) < new Date() && 
                                task.status !== 'completed';
                              
                              return (
                                <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreVertical className="w-3 h-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {statusOptions.map((statusOption) => (
                                            <DropdownMenuItem
                                              key={statusOption.value}
                                              onClick={() => handleStatusChange(task.id, statusOption.value)}
                                              disabled={task.status === statusOption.value}
                                            >
                                              Move to {statusOption.label}
                                            </DropdownMenuItem>
                                          ))}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={() => openEditModal(task)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Task
                                          </DropdownMenuItem>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <DropdownMenuItem 
                                                className="text-destructive"
                                                onSelect={(e) => e.preventDefault()}
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Task
                                              </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => handleDeleteTask(task.id)}
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Badge className={priorityConfig.color} variant="secondary">
                                        {priorityConfig.label}
                                      </Badge>
                                      {isOverdue && (
                                        <Badge variant="destructive">Overdue</Badge>
                                      )}
                                    </div>
                                    
                                    {task.assignee && (
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarImage src={task.assignee.avatar_url} />
                                          <AvatarFallback className="text-xs">
                                            {task.assignee.full_name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground truncate">
                                          {task.assignee.full_name}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {task.due_date && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(task.due_date).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                      <p className="text-muted-foreground">
                        {tasks.length === 0 
                          ? "Create your first task to get started." 
                          : "Try adjusting your filters or search term."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTasks.map((task) => {
                        const statusConfig = getStatusConfig(task.status);
                        const priorityConfig = getPriorityConfig(task.priority);
                        const StatusIcon = statusConfig.icon;
                        const isOverdue = task.due_date && 
                          new Date(task.due_date) < new Date() && 
                          task.status !== 'completed';
                        
                        return (
                          <Card key={task.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`w-6 h-6 rounded-full ${statusConfig.color} flex items-center justify-center`}>
                                    <StatusIcon className="w-3 h-3 text-white" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className="font-medium">{task.title}</h4>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Badge className={priorityConfig.color} variant="secondary">
                                      {priorityConfig.label}
                                    </Badge>
                                    {isOverdue && (
                                      <Badge variant="destructive">Overdue</Badge>
                                    )}
                                  </div>
                                  
                                  {task.assignee && (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={task.assignee.avatar_url} />
                                        <AvatarFallback className="text-xs">
                                          {task.assignee.full_name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-muted-foreground">
                                        {task.assignee.full_name}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {task.due_date && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <CalendarIcon className="w-4 h-4" />
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {statusOptions.map((statusOption) => (
                                      <DropdownMenuItem
                                        key={statusOption.value}
                                        onClick={() => handleStatusChange(task.id, statusOption.value)}
                                        disabled={task.status === statusOption.value}
                                      >
                                        Move to {statusOption.label}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openEditModal(task)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Task
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          className="text-destructive"
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Task
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-task-title">Task Title *</Label>
              <Input
                id="edit-task-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Design homepage wireframes"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what needs to be done..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: any) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value: any) => setEditForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Assignee</Label>
              <Select
                value={editForm.assignee_id}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, assignee_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.due_date ? format(editForm.due_date, "MMM d, yyyy") : "No due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editForm.due_date}
                      onSelect={(date) => setEditForm(prev => ({ ...prev, due_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="edit-estimated-hours">Estimated Hours</Label>
                <Input
                  id="edit-estimated-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.estimated_hours}
                  onChange={(e) => setEditForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-actual-hours">Actual Hours</Label>
                <Input
                  id="edit-actual-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.actual_hours}
                  onChange={(e) => setEditForm(prev => ({ ...prev, actual_hours: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={!editForm.title.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
