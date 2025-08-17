import { useState } from 'react';
import { usePhases, type CreatePhaseData, type UpdatePhaseData } from '@/hooks/usePhases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Plus,
  Calendar as CalendarIcon,
  MoreVertical,
  Edit,
  Trash2,
  GripVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pause,
} from 'lucide-react';
import { format } from 'date-fns';

interface PhaseManagerProps {
  projectId: string;
  projectName: string;
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started', icon: Pause, color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'bg-red-500' },
];

export function PhaseManager({ projectId, projectName }: PhaseManagerProps) {
  const { phases, loading, createPhase, updatePhase, deletePhase, reorderPhases } = usePhases(projectId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  
  // Create phase form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  // Edit phase form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'not_started' as const,
    progress_percentage: 0,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  const handleCreatePhase = async () => {
    if (!createForm.name.trim()) return;

    const phaseData: CreatePhaseData = {
      project_id: projectId,
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
      start_date: createForm.start_date?.toISOString().split('T')[0],
      end_date: createForm.end_date?.toISOString().split('T')[0],
      order_index: phases.length + 1,
    };

    const success = await createPhase(phaseData);
    if (success) {
      setCreateForm({
        name: '',
        description: '',
        start_date: undefined,
        end_date: undefined,
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleEditPhase = async () => {
    if (!editingPhase || !editForm.name.trim()) return;

    const updates: UpdatePhaseData = {
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      status: editForm.status,
      progress_percentage: editForm.progress_percentage,
      start_date: editForm.start_date?.toISOString().split('T')[0],
      end_date: editForm.end_date?.toISOString().split('T')[0],
    };

    const success = await updatePhase(editingPhase, updates);
    if (success) {
      setEditingPhase(null);
    }
  };

  const openEditModal = (phase: any) => {
    setEditForm({
      name: phase.name,
      description: phase.description || '',
      status: phase.status,
      progress_percentage: phase.progress_percentage,
      start_date: phase.start_date ? new Date(phase.start_date) : undefined,
      end_date: phase.end_date ? new Date(phase.end_date) : undefined,
    });
    setEditingPhase(phase.id);
  };

  const handleDeletePhase = async (phaseId: string) => {
    await deletePhase(phaseId);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(phases);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for each phase
    const reorderedPhases = items.map((phase, index) => ({
      ...phase,
      order_index: index + 1,
    }));

    reorderPhases(reorderedPhases);
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
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
              <CardTitle>Project Phases</CardTitle>
              <CardDescription>
                Manage phases for {projectName}
              </CardDescription>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Phase</DialogTitle>
                  <DialogDescription>
                    Add a new phase to your project timeline.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="phase-name">Phase Name *</Label>
                    <Input
                      id="phase-name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Discovery & Planning"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phase-description">Description</Label>
                    <Textarea
                      id="phase-description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what will be accomplished in this phase..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {createForm.start_date ? format(createForm.start_date, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={createForm.start_date}
                            onSelect={(date) => setCreateForm(prev => ({ ...prev, start_date: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {createForm.end_date ? format(createForm.end_date, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={createForm.end_date}
                            onSelect={(date) => setCreateForm(prev => ({ ...prev, end_date: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePhase} disabled={!createForm.name.trim()}>
                    Create Phase
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
              <h3 className="text-lg font-semibold mb-2">No Phases Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first phase to start organizing your project timeline.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Phase
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="phases">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {phases.map((phase, index) => {
                      const statusConfig = getStatusConfig(phase.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <Draggable key={phase.id} draggableId={phase.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground cursor-grab"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <h4 className="font-semibold">{phase.name}</h4>
                                        <Badge className={`${statusConfig.color} text-white`}>
                                          <StatusIcon className="w-3 h-3 mr-1" />
                                          {statusConfig.label}
                                        </Badge>
                                      </div>
                                      
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditModal(phase)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Phase
                                          </DropdownMenuItem>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <DropdownMenuItem 
                                                className="text-destructive"
                                                onSelect={(e) => e.preventDefault()}
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Phase
                                              </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Phase</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Are you sure you want to delete "{phase.name}"? This will also delete all tasks within this phase. This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => handleDeletePhase(phase.id)}
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
                                    
                                    {phase.description && (
                                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 max-w-md">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                          <span>Progress</span>
                                          <span className="font-medium">{phase.progress_percentage}%</span>
                                        </div>
                                        <Progress value={phase.progress_percentage} className="h-2" />
                                      </div>
                                      
                                      {(phase.start_date || phase.end_date) && (
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                          {phase.start_date && (
                                            <span>Start: {new Date(phase.start_date).toLocaleDateString()}</span>
                                          )}
                                          {phase.end_date && (
                                            <span>End: {new Date(phase.end_date).toLocaleDateString()}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Edit Phase Modal */}
      <Dialog open={editingPhase !== null} onOpenChange={(open) => !open && setEditingPhase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Phase</DialogTitle>
            <DialogDescription>
              Update phase details and progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-phase-name">Phase Name *</Label>
              <Input
                id="edit-phase-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Discovery & Planning"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phase-description">Description</Label>
              <Textarea
                id="edit-phase-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what will be accomplished in this phase..."
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
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.progress_percentage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.start_date ? format(editForm.start_date, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editForm.start_date}
                      onSelect={(date) => setEditForm(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.end_date ? format(editForm.end_date, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editForm.end_date}
                      onSelect={(date) => setEditForm(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingPhase(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditPhase} disabled={!editForm.name.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
