import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Phase {
  id: string;
  name: string;
  description: string;
  duration: number;
  dependencies: string[];
  isPaymentMilestone: boolean;
  tasks: Array<{
    title: string;
    description: string;
    estimatedHours: number;
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface PhasesTimelineStepProps {
  data: Phase[];
  projectType: string;
  onUpdate: (data: Phase[]) => void;
}

const phaseTemplates = {
  'Web Development': [
    {
      name: 'Discovery & Planning',
      description: 'Requirements gathering, research, and project planning',
      duration: 2,
      tasks: [
        { title: 'Stakeholder interviews', description: 'Conduct interviews with key stakeholders', estimatedHours: 16, priority: 'high' as const },
        { title: 'Technical requirements analysis', description: 'Define technical specifications', estimatedHours: 24, priority: 'high' as const },
        { title: 'Project scope document', description: 'Create comprehensive scope document', estimatedHours: 12, priority: 'medium' as const },
      ]
    },
    {
      name: 'Design & Prototyping',
      description: 'UI/UX design, wireframing, and prototyping',
      duration: 3,
      tasks: [
        { title: 'Wireframe creation', description: 'Design user interface wireframes', estimatedHours: 32, priority: 'high' as const },
        { title: 'UI/UX design', description: 'Create visual designs and user experience flows', estimatedHours: 48, priority: 'high' as const },
        { title: 'Interactive prototype', description: 'Build clickable prototype for user testing', estimatedHours: 24, priority: 'medium' as const },
      ]
    },
    {
      name: 'Development',
      description: 'Frontend and backend development',
      duration: 8,
      isPaymentMilestone: true,
      tasks: [
        { title: 'Frontend development', description: 'Implement user interface components', estimatedHours: 120, priority: 'high' as const },
        { title: 'Backend development', description: 'Build server-side functionality and APIs', estimatedHours: 100, priority: 'high' as const },
        { title: 'Database setup', description: 'Design and implement database structure', estimatedHours: 40, priority: 'high' as const },
      ]
    },
    {
      name: 'Testing & QA',
      description: 'Quality assurance, testing, and bug fixes',
      duration: 2,
      tasks: [
        { title: 'Automated testing', description: 'Implement unit and integration tests', estimatedHours: 32, priority: 'high' as const },
        { title: 'Manual testing', description: 'Comprehensive manual testing of all features', estimatedHours: 24, priority: 'medium' as const },
        { title: 'Bug fixes', description: 'Fix identified issues and optimize performance', estimatedHours: 40, priority: 'high' as const },
      ]
    },
    {
      name: 'Deployment & Launch',
      description: 'Production deployment and project launch',
      duration: 1,
      isPaymentMilestone: true,
      tasks: [
        { title: 'Production deployment', description: 'Deploy application to production environment', estimatedHours: 16, priority: 'high' as const },
        { title: 'Performance optimization', description: 'Optimize for production performance', estimatedHours: 12, priority: 'medium' as const },
        { title: 'Launch support', description: 'Monitor launch and provide immediate support', estimatedHours: 8, priority: 'medium' as const },
      ]
    }
  ],
  'Mobile App': [
    {
      name: 'Discovery & Research',
      description: 'Market research, user personas, and requirements',
      duration: 2,
      tasks: [
        { title: 'Market analysis', description: 'Analyze competitor apps and market trends', estimatedHours: 20, priority: 'high' as const },
        { title: 'User persona development', description: 'Create detailed user personas', estimatedHours: 16, priority: 'medium' as const },
      ]
    },
    {
      name: 'Design & Prototyping',
      description: 'Mobile UI design and interactive prototypes',
      duration: 4,
      isPaymentMilestone: true,
      tasks: [
        { title: 'Mobile wireframes', description: 'Create mobile-optimized wireframes', estimatedHours: 32, priority: 'high' as const },
        { title: 'Visual design', description: 'Design app interface with platform guidelines', estimatedHours: 48, priority: 'high' as const },
      ]
    },
    {
      name: 'Development',
      description: 'Native or cross-platform app development',
      duration: 10,
      tasks: [
        { title: 'App development', description: 'Implement core app functionality', estimatedHours: 160, priority: 'high' as const },
        { title: 'API integration', description: 'Integrate with backend APIs and services', estimatedHours: 40, priority: 'high' as const },
      ]
    },
    {
      name: 'Testing & Store Submission',
      description: 'Testing, optimization, and app store submission',
      duration: 2,
      isPaymentMilestone: true,
      tasks: [
        { title: 'Device testing', description: 'Test on multiple devices and OS versions', estimatedHours: 32, priority: 'high' as const },
        { title: 'App store submission', description: 'Prepare and submit to app stores', estimatedHours: 16, priority: 'medium' as const },
      ]
    }
  ],
  // Add more templates...
};

export function PhasesTimelineStep({ data, projectType, onUpdate }: PhasesTimelineStepProps) {
  const [phases, setPhases] = useState<Phase[]>(data);

  useEffect(() => {
    setPhases(data);
  }, [data]);

  const loadTemplate = () => {
    const template = phaseTemplates[projectType as keyof typeof phaseTemplates];
    if (template) {
      const templatePhases: Phase[] = template.map((phase, index) => ({
        id: `phase-${Date.now()}-${index}`,
        name: phase.name,
        description: phase.description,
        duration: phase.duration,
        dependencies: [],
        isPaymentMilestone: phase.isPaymentMilestone || false,
        tasks: phase.tasks || []
      }));
      setPhases(templatePhases);
      onUpdate(templatePhases);
    }
  };

  const addPhase = () => {
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: '',
      description: '',
      duration: 1,
      dependencies: [],
      isPaymentMilestone: false,
      tasks: []
    };
    const updatedPhases = [...phases, newPhase];
    setPhases(updatedPhases);
    onUpdate(updatedPhases);
  };

  const updatePhase = (id: string, updates: Partial<Phase>) => {
    const updatedPhases = phases.map(phase =>
      phase.id === id ? { ...phase, ...updates } : phase
    );
    setPhases(updatedPhases);
    onUpdate(updatedPhases);
  };

  const removePhase = (id: string) => {
    const updatedPhases = phases.filter(phase => phase.id !== id);
    setPhases(updatedPhases);
    onUpdate(updatedPhases);
  };

  const addTaskToPhase = (phaseId: string) => {
    const newTask = {
      title: '',
      description: '',
      estimatedHours: 8,
      priority: 'medium' as const
    };
    
    const updatedPhases = phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, tasks: [...phase.tasks, newTask] }
        : phase
    );
    setPhases(updatedPhases);
    onUpdate(updatedPhases);
  };

  const updateTask = (phaseId: string, taskIndex: number, updates: any) => {
    const updatedPhases = phases.map(phase =>
      phase.id === phaseId
        ? {
            ...phase,
            tasks: phase.tasks.map((task, index) =>
              index === taskIndex ? { ...task, ...updates } : task
            )
          }
        : phase
    );
    setPhases(updatedPhases);
    onUpdate(updatedPhases);
  };

  const removeTask = (phaseId: string, taskIndex: number) => {
    const updatedPhases = phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, tasks: phase.tasks.filter((_, index) => index !== taskIndex) }
        : phase
    );
    setPhases(updatedPhases);
    onUpdate(updatedPhases);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(phases);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhases(items);
    onUpdate(items);
  };

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
  const milestoneCount = phases.filter(phase => phase.isPaymentMilestone).length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Project Phases & Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Define project phases, tasks, and payment milestones
          </p>
        </div>
        <div className="flex gap-2">
          {projectType && phaseTemplates[projectType as keyof typeof phaseTemplates] && (
            <Button variant="outline" onClick={loadTemplate}>
              Load {projectType} Template
            </Button>
          )}
          <Button onClick={addPhase}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{phases.length}</div>
                <div className="text-sm text-muted-foreground">Total Phases</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalDuration}</div>
                <div className="text-sm text-muted-foreground">Weeks Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{milestoneCount}</div>
                <div className="text-sm text-muted-foreground">Payment Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phases List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="phases">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {phases.map((phase, index) => (
                <Draggable key={phase.id} draggableId={phase.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="mt-1">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Phase {index + 1}</Badge>
                                {phase.isPaymentMilestone && (
                                  <Badge variant="default">Payment Milestone</Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePhase(phase.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Phase Name</Label>
                                <Input
                                  value={phase.name}
                                  onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                                  placeholder="e.g., Discovery & Planning"
                                />
                              </div>
                              <div>
                                <Label>Duration (weeks)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={phase.duration}
                                  onChange={(e) => updatePhase(phase.id, { duration: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={phase.description}
                                onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                                placeholder="Brief description of this phase..."
                                rows={2}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={phase.isPaymentMilestone}
                                onCheckedChange={(checked) => updatePhase(phase.id, { isPaymentMilestone: checked })}
                              />
                              <Label>This phase is a payment milestone</Label>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      {/* Tasks Section */}
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Phase Tasks</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTaskToPhase(phase.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Task
                            </Button>
                          </div>

                          {phase.tasks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                              No tasks added yet. Click "Add Task" to get started.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {phase.tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="p-4 border rounded-lg space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={
                                        task.priority === 'high' ? 'destructive' :
                                        task.priority === 'medium' ? 'default' : 'secondary'
                                      }>
                                        {task.priority} priority
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {task.estimatedHours}h estimated
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTask(phase.id, taskIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Task Title</Label>
                                      <Input
                                        value={task.title}
                                        onChange={(e) => updateTask(phase.id, taskIndex, { title: e.target.value })}
                                        placeholder="Task name..."
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label>Hours</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={task.estimatedHours}
                                          onChange={(e) => updateTask(phase.id, taskIndex, { estimatedHours: parseInt(e.target.value) || 1 })}
                                        />
                                      </div>
                                      <div>
                                        <Label>Priority</Label>
                                        <select
                                          value={task.priority}
                                          onChange={(e) => updateTask(phase.id, taskIndex, { priority: e.target.value })}
                                          className="w-full p-2 border border-input rounded-md bg-background"
                                        >
                                          <option value="low">Low</option>
                                          <option value="medium">Medium</option>
                                          <option value="high">High</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={task.description}
                                      onChange={(e) => updateTask(phase.id, taskIndex, { description: e.target.value })}
                                      placeholder="Task description..."
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {phases.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Phases Added</h3>
            <p className="text-muted-foreground mb-4">
              Add project phases to structure your workflow and timeline.
            </p>
            <Button onClick={addPhase}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Phase
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}