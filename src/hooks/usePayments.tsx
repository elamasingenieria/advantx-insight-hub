import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentSchedule {
  id: string;
  project_id: string;
  name: string;
  amount: number;
  due_date: string;
  description?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Related data
  project?: {
    id: string;
    name: string;
    client?: {
      name: string;
      company: string;
    };
  };
}

interface UsePaymentsOptions {
  projectId?: string;
  status?: PaymentSchedule['status'];
  userId?: string;
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const [payments, setPayments] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('payment_schedules')
        .select(`
          *,
          project:projects (
            id,
            name,
            client:clients (
              name,
              company
            )
          )
        `)
        .order('due_date', { ascending: false });

      // Apply filters
      if (options.projectId) {
        query = query.eq('project_id', options.projectId);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching payments:', fetchError);
        throw fetchError;
      }

      console.log('Fetched payments:', data);
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error in fetchPayments:', err);
      setError(err.message || 'Failed to fetch payments');
      toast({
        variant: "destructive",
        title: "Error fetching payments",
        description: err.message || "There was an issue loading payment data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: PaymentSchedule['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('payment_schedules')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updateError) {
        throw updateError;
      }

      // Refresh payments list
      await fetchPayments();

      toast({
        title: "Payment Updated",
        description: `Payment status updated to ${newStatus}.`,
      });
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Failed to update payment status.",
      });
    }
  };

  const createPayment = async (paymentData: Omit<PaymentSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error: createError } = await supabase
        .from('payment_schedules')
        .insert([paymentData]);

      if (createError) {
        throw createError;
      }

      // Refresh payments list
      await fetchPayments();

      toast({
        title: "Payment Created",
        description: "New payment schedule added successfully.",
      });
    } catch (err: any) {
      console.error('Error creating payment:', err);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: err.message || "Failed to create payment.",
      });
    }
  };

  // Calculate payment statistics
  const paymentStats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    cancelled: payments.filter(p => p.status === 'cancelled').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdueAmount: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
  };

  useEffect(() => {
    fetchPayments();
  }, [options.projectId, options.status, options.userId]);

  return {
    payments,
    loading,
    error,
    paymentStats,
    fetchPayments,
    updatePaymentStatus,
    createPayment,
  };
}
