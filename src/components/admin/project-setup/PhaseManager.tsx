import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Edit, Trash2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Phase {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  order_index: number;
}

interface PhaseFormData {
  name: string;
  description: string;
  start_date?: Date;
  end_date?: Date;
}

interface PhaseManagerProps {
  projectId: string;
  phases: Phase[];
  onPhasesChange: () => void;
}

const defaultPhaseData: PhaseFormData = {
  name: '',
  description: '',
};

export function PhaseManager({ projectId, phases, onPhasesChange }: PhaseManagerProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [formData, setFormData] = useState<PhaseFormData>(defaultPhaseData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormUpdate = (updates: Partial<PhaseFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(defaultPhaseData);
    setEditingPhase(null);
  };

  const addPhase = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Phase name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('phases')
        .insert([{
          project_id: projectId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
          end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
          order_index: phases.length,
          status: 'not_started' as const,
          progress_percentage: 0,
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Phase added successfully',
      });

      resetForm();
      setIsAddDialogOpen(false);
      onPhasesChange();
    } catch (error: any) {
      console.error('Error adding phase:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add phase',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePhase = async () => {
    if (!editingPhase || !formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Phase name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('phases')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
          end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
        })
        .eq('id', editingPhase.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Phase updated successfully',
      });

      resetForm();
      setIsEditDialogOpen(false);
      onPhasesChange();
    } catch (error: any) {
      console.error('Error updating phase:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update phase',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePhase = async (phaseId: string) => {
    try {
      const { error } = await supabase
        .from('phases')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Phase deleted successfully',
      });

      onPhasesChange();
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete phase',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (phase: Phase) => {
    setEditingPhase(phase);
    setFormData({
      name: phase.name,
      description: phase.description || '',
      start_date: phase.start_date ? new Date(phase.start_date) : undefined,
      end_date: phase.end_date ? new Date(phase.end_date) : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'in_progress':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'on_hold':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {phases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <p>No phases added yet. Add your first phase to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {phases.map((phase, index) => (
            <Card key={phase.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{phase.name}</span>
                        <Badge variant="secondary" className={getStatusColor(phase.status)}>
                          {phase.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {phase.start_date && (
                        <span>Start: {new Date(phase.start_date).toLocaleDateString()}</span>
                      )}
                      {phase.end_date && (
                        <span>End: {new Date(phase.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(phase)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePhase(phase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Phase Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => resetForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription>
              Create a new phase for this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="phase-name">Phase Name *</Label>
              <Input
                id="phase-name"
                value={formData.name}
                onChange={(e) => handleFormUpdate({ name: e.target.value })}
                placeholder="Planning & Research"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="phase-description">Description</Label>
              <Textarea
                id="phase-description"
                value={formData.description}
                onChange={(e) => handleFormUpdate({ description: e.target.value })}
                placeholder="Phase objectives and deliverables..."
                rows={2}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "MMM d") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => handleFormUpdate({ start_date: date })}
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
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, "MMM d") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => handleFormUpdate({ end_date: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={addPhase} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Phase'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Phase Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Phase</DialogTitle>
            <DialogDescription>
              Update the phase details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-phase-name">Phase Name *</Label>
              <Input
                id="edit-phase-name"
                value={formData.name}
                onChange={(e) => handleFormUpdate({ name: e.target.value })}
                placeholder="Planning & Research"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="edit-phase-description">Description</Label>
              <Textarea
                id="edit-phase-description"
                value={formData.description}
                onChange={(e) => handleFormUpdate({ description: e.target.value })}
                placeholder="Phase objectives and deliverables..."
                rows={2}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "MMM d") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => handleFormUpdate({ start_date: date })}
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
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, "MMM d") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => handleFormUpdate({ end_date: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={updatePhase} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Phase'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}