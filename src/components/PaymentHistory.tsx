import { useState } from 'react';
import { usePayments, PaymentSchedule } from '@/hooks/usePayments';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface PaymentHistoryProps {
  projectId?: string;
  trigger?: React.ReactNode;
}

export function PaymentHistory({ projectId, trigger }: PaymentHistoryProps) {
  const { profile } = useAuth();
  const { payments, loading, paymentStats } = usePayments({ projectId });
  const [statusFilter, setStatusFilter] = useState<PaymentSchedule['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: PaymentSchedule['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PaymentSchedule['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string, status: PaymentSchedule['status']) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const defaultTrigger = (
    <Button className="w-full justify-start" variant="outline">
      <CreditCard className="w-4 h-4 mr-2" />
      Payment History
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </DialogTitle>
          <DialogDescription>
            View and track all payment schedules and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Payment Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{paymentStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Payments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(paymentStats.paidAmount)}</div>
                <div className="text-sm text-muted-foreground">Paid Amount</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(paymentStats.pendingAmount)}</div>
                <div className="text-sm text-muted-foreground">Pending Amount</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{paymentStats.overdue}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="list" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="list" className="flex-1 overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Payment Schedule ({filteredPayments.length})</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : filteredPayments.length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' ? 'No payments match your filters' : 'No payment history found'}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div className="font-medium">{payment.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.project?.client?.company}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{payment.project?.name}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                              </TableCell>
                              <TableCell>
                                <div className={`${isOverdue(payment.due_date, payment.status) ? 'text-red-600 font-medium' : ''}`}>
                                  {formatDate(payment.due_date)}
                                </div>
                                {isOverdue(payment.due_date, payment.status) && (
                                  <div className="text-xs text-red-600">Overdue</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(payment.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(payment.status)}
                                    <span className="capitalize">{payment.status}</span>
                                  </div>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground max-w-xs truncate">
                                  {payment.description || 'No description'}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Paid</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{paymentStats.paid}</div>
                          <div className="text-sm text-green-600">{formatCurrency(paymentStats.paidAmount)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Pending</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{paymentStats.pending}</div>
                          <div className="text-sm text-blue-600">{formatCurrency(paymentStats.pendingAmount)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">Overdue</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{paymentStats.overdue}</div>
                          <div className="text-sm text-red-600">{formatCurrency(paymentStats.overdueAmount)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">Cancelled</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{paymentStats.cancelled}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {formatCurrency(paymentStats.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Contract Value</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="text-xl font-bold text-green-600">
                            {paymentStats.total > 0 ? Math.round((paymentStats.paid / paymentStats.total) * 100) : 0}%
                          </div>
                          <div className="text-xs text-green-600">Completion Rate</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="text-xl font-bold text-blue-600">
                            {paymentStats.totalAmount > 0 ? Math.round((paymentStats.paidAmount / paymentStats.totalAmount) * 100) : 0}%
                          </div>
                          <div className="text-xs text-blue-600">Amount Collected</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
