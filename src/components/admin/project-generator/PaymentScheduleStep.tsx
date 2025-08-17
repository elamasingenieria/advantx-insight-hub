import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Trash2, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, addWeeks } from 'date-fns';

interface PaymentMilestone {
  name: string;
  amount: number;
  dueDate: Date;
  phaseId: string;
  description: string;
}

interface Phase {
  id: string;
  name: string;
  isPaymentMilestone: boolean;
  start_date: Date | null;
  end_date: Date | null;
}

interface PaymentScheduleStepProps {
  data: PaymentMilestone[];
  phases: Phase[];
  totalBudget: number;
  currency: string;
  onUpdate: (data: PaymentMilestone[]) => void;
}

const paymentTemplates = [
  {
    name: 'Standard (25% - 50% - 25%)',
    description: 'Common payment schedule for most projects',
    schedule: [
      { name: 'Project Kickoff', percentage: 25, description: 'Initial payment upon project start' },
      { name: 'Mid-Project Milestone', percentage: 50, description: 'Payment at 50% project completion' },
      { name: 'Project Completion', percentage: 25, description: 'Final payment upon delivery' }
    ]
  },
  {
    name: 'Conservative (50% - 30% - 20%)',
    description: 'Higher upfront payment for cash flow',
    schedule: [
      { name: 'Project Start', percentage: 50, description: 'Large upfront payment' },
      { name: 'Development Complete', percentage: 30, description: 'Payment after main development' },
      { name: 'Final Delivery', percentage: 20, description: 'Final payment after testing and launch' }
    ]
  },
  {
    name: 'Milestone-Based',
    description: 'Equal payments for each major milestone',
    schedule: [
      { name: 'Design Approval', percentage: 20, description: 'Payment after design phase completion' },
      { name: 'Development Phase 1', percentage: 25, description: 'First development milestone' },
      { name: 'Development Phase 2', percentage: 25, description: 'Second development milestone' },
      { name: 'Testing Complete', percentage: 15, description: 'Payment after QA completion' },
      { name: 'Final Launch', percentage: 15, description: 'Final payment after successful launch' }
    ]
  }
];

export function PaymentScheduleStep({ data, phases, totalBudget, currency, onUpdate }: PaymentScheduleStepProps) {
  const [payments, setPayments] = useState<PaymentMilestone[]>(data);

  useEffect(() => {
    setPayments(data);
  }, [data]);

  const applyTemplate = (templateIndex: number) => {
    const template = paymentTemplates[templateIndex];
    const milestonePhases = phases.filter(phase => phase.isPaymentMilestone);
    
    let startDate = new Date();
    
    const newPayments: PaymentMilestone[] = template.schedule.map((item, index) => {
      const amount = Math.round((totalBudget * item.percentage) / 100);
      
      // Calculate due date based on phase progression
      let dueDate = startDate;
      if (index < milestonePhases.length) {
        const phase = milestonePhases[index];
        // Use phase end_date if available, otherwise space evenly
        if (phase.end_date) {
          dueDate = new Date(phase.end_date);
        } else {
          // Fallback: space payments 2 weeks apart
          dueDate = addWeeks(startDate, (index + 1) * 2);
        }
      } else {
        // If more payments than milestone phases, space them evenly
        dueDate = addWeeks(startDate, (index + 1) * 2);
      }

      return {
        name: item.name,
        amount,
        dueDate,
        phaseId: index < milestonePhases.length ? milestonePhases[index].id : '',
        description: item.description
      };
    });

    setPayments(newPayments);
    onUpdate(newPayments);
  };

  const addPayment = () => {
    const newPayment: PaymentMilestone = {
      name: '',
      amount: 0,
      dueDate: new Date(),
      phaseId: '',
      description: ''
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    onUpdate(updatedPayments);
  };

  const updatePayment = (index: number, updates: Partial<PaymentMilestone>) => {
    const updatedPayments = payments.map((payment, i) =>
      i === index ? { ...payment, ...updates } : payment
    );
    setPayments(updatedPayments);
    onUpdate(updatedPayments);
  };

  const removePayment = (index: number) => {
    const updatedPayments = payments.filter((_, i) => i !== index);
    setPayments(updatedPayments);
    onUpdate(updatedPayments);
  };

  const totalScheduledAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBudget = totalBudget - totalScheduledAmount;
  const milestonePhases = phases.filter(phase => phase.isPaymentMilestone);

  const getPhaseById = (phaseId: string) => {
    return phases.find(phase => phase.id === phaseId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Payment Schedule Setup</h3>
          <p className="text-sm text-muted-foreground">
            Create payment milestones tied to project phases
          </p>
        </div>
        <Button onClick={addPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{formatCurrency(totalBudget)}</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{formatCurrency(totalScheduledAmount)}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded-full ${remainingBudget < 0 ? 'bg-destructive' : remainingBudget > 0 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <div>
                <div className={`text-xl font-bold ${remainingBudget < 0 ? 'text-destructive' : remainingBudget > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingBudget)}
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{payments.length}</div>
                <div className="text-sm text-muted-foreground">Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {remainingBudget < 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Over Budget</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Scheduled payments exceed total budget by {formatCurrency(Math.abs(remainingBudget))}. Please adjust payment amounts.
            </p>
          </CardContent>
        </Card>
      )}

      {remainingBudget > 1000 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Unallocated Budget</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              {formatCurrency(remainingBudget)} is not yet allocated to payment milestones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Templates</CardTitle>
          <CardDescription>
            Quick-start templates for common payment schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent" onClick={() => applyTemplate(index)}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">{template.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {template.schedule.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {item.percentage}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Schedule</CardTitle>
            <CardDescription>
              Configure payment amounts, dates, and associated phases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {payments.map((payment, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Payment {index + 1}</Badge>
                    <span className="text-lg font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Name</Label>
                    <Input
                      value={payment.name}
                      onChange={(e) => updatePayment(index, { name: e.target.value })}
                      placeholder="e.g., Project Kickoff Payment"
                    />
                  </div>
                  <div>
                    <Label>Amount ({currency})</Label>
                    <Input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => updatePayment(index, { amount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {payment.dueDate ? format(payment.dueDate, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={payment.dueDate}
                          onSelect={(date) => date && updatePayment(index, { dueDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Associated Phase (Optional)</Label>
                    <Select
                      value={payment.phaseId}
                      onValueChange={(value) => updatePayment(index, { phaseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phase..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific phase</SelectItem>
                        {milestonePhases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {payment.phaseId && getPhaseById(payment.phaseId) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Linked to payment milestone phase
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Payment Description</Label>
                  <Textarea
                    value={payment.description}
                    onChange={(e) => updatePayment(index, { description: e.target.value })}
                    placeholder="Description of what triggers this payment..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {payments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payment Schedule</h3>
            <p className="text-muted-foreground mb-4">
              Add payment milestones or use a template to get started.
            </p>
            <Button onClick={addPayment}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}