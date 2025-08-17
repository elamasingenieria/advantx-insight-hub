import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Edit, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  name: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface Phase {
  id: string;
  name: string;
}

interface PaymentFormData {
  name: string;
  description: string;
  amount: number;
  due_date?: Date;
}

interface PaymentManagerProps {
  projectId: string;
  payments: Payment[];
  phases: Phase[];
  onPaymentsChange: () => void;
}

const defaultPaymentData: PaymentFormData = {
  name: '',
  description: '',
  amount: 0,
};

export function PaymentManager({ projectId, payments, phases, onPaymentsChange }: PaymentManagerProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>(defaultPaymentData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormUpdate = (updates: Partial<PaymentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(defaultPaymentData);
    setEditingPayment(null);
  };

  const addPayment = async () => {
    if (!formData.name.trim() || !formData.amount || !formData.due_date) {
      toast({
        title: 'Validation Error',
        description: 'Name, amount, and due date are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('payment_schedules')
        .insert([{
          project_id: projectId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          amount: formData.amount,
          due_date: formData.due_date.toISOString().split('T')[0],
          status: 'pending',
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment milestone added successfully',
      });

      resetForm();
      setIsAddDialogOpen(false);
      onPaymentsChange();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePayment = async () => {
    if (!editingPayment || !formData.name.trim() || !formData.amount || !formData.due_date) {
      toast({
        title: 'Validation Error',
        description: 'Name, amount, and due date are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('payment_schedules')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          amount: formData.amount,
          due_date: formData.due_date.toISOString().split('T')[0],
        })
        .eq('id', editingPayment.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment updated successfully',
      });

      resetForm();
      setIsEditDialogOpen(false);
      onPaymentsChange();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payment_schedules')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });

      onPaymentsChange();
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payment',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      name: payment.name,
      description: payment.description || '',
      amount: payment.amount,
      due_date: new Date(payment.due_date),
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500 hover:bg-green-600';
      case 'overdue':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      {payments.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span>Total Payment Amount</span>
            <span className="font-semibold text-lg">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="h-8 w-8 mx-auto mb-2" />
          <p>No payment milestones added yet. Add your first payment to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{payment.name}</span>
                        <Badge variant="secondary" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                    {payment.description && (
                      <p className="text-sm text-muted-foreground mb-2">{payment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-green-600">
                        ${payment.amount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        Due: {new Date(payment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(payment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePayment(payment.id)}
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

      {/* Add Payment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => resetForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Milestone
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Milestone</DialogTitle>
            <DialogDescription>
              Create a new payment milestone for this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="payment-name">Payment Name *</Label>
              <Input
                id="payment-name"
                value={formData.name}
                onChange={(e) => handleFormUpdate({ name: e.target.value })}
                placeholder="Initial Payment"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="payment-amount">Amount *</Label>
              <Input
                id="payment-amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleFormUpdate({ amount: parseFloat(e.target.value) || 0 })}
                placeholder="25000"
                min="0"
                step="100"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => handleFormUpdate({ due_date: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="payment-description">Description</Label>
              <Textarea
                id="payment-description"
                value={formData.description}
                onChange={(e) => handleFormUpdate({ description: e.target.value })}
                placeholder="Payment milestone details..."
                rows={2}
                disabled={isSubmitting}
              />
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
            <Button onClick={addPayment} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update the payment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-payment-name">Payment Name *</Label>
              <Input
                id="edit-payment-name"
                value={formData.name}
                onChange={(e) => handleFormUpdate({ name: e.target.value })}
                placeholder="Initial Payment"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="edit-payment-amount">Amount *</Label>
              <Input
                id="edit-payment-amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleFormUpdate({ amount: parseFloat(e.target.value) || 0 })}
                placeholder="25000"
                min="0"
                step="100"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => handleFormUpdate({ due_date: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="edit-payment-description">Description</Label>
              <Textarea
                id="edit-payment-description"
                value={formData.description}
                onChange={(e) => handleFormUpdate({ description: e.target.value })}
                placeholder="Payment milestone details..."
                rows={2}
                disabled={isSubmitting}
              />
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
            <Button onClick={updatePayment} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}