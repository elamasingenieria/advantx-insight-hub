import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Target, Calendar, Calculator, BarChart3, Clock } from 'lucide-react';
import { useROI, useROISummary } from '@/hooks/useROI';

interface ROISummaryCardProps {
  monthlySavings?: number;
  annualSavings?: number;
  roiPercentage?: number;
  projectCost?: number;
  timeframe?: string;
  projectId?: string;
  showDetailedView?: boolean;
}

export function ROISummaryCard({ 
  monthlySavings, 
  annualSavings, 
  roiPercentage, 
  projectCost = 5000,
  timeframe = "annual",
  projectId,
  showDetailedView = false
}: ROISummaryCardProps) {
  const { roiData, loading: roiLoading } = useROI(projectId);

  // Use real data if projectId is provided, otherwise fallback to props
  const displayData = roiData || {
    monthlySavings: monthlySavings || 0,
    annualSavings: annualSavings || (monthlySavings || 0) * 12,
    currentROI: roiPercentage || 0,
    projectedROI: roiPercentage || 0,
    totalBudget: projectCost || 5000,
    actualCosts: projectCost || 5000,
    breakEvenMonths: 0,
    completionPercentage: 100,
    timeToCompletion: 0,
    costEfficiency: 100,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-emerald-600';
    if (roi >= 200) return 'text-green-600';
    if (roi >= 100) return 'text-blue-600';
    if (roi >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROILabel = (roi: number) => {
    if (roi >= 300) return 'Exceptional';
    if (roi >= 200) return 'Excellent';
    if (roi >= 100) return 'Very Good';
    if (roi >= 50) return 'Good';
    return 'Needs Improvement';
  };

  if (roiLoading) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (showDetailedView) {
    // Enhanced detailed view with analytics
    return (
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-success" />
            Financial Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive ROI analysis and projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Current ROI Display */}
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                <div className={`text-3xl font-bold ${getROIColor(displayData.currentROI)} mb-1`}>
                  {displayData.currentROI}%
                </div>
                <div className="text-sm text-muted-foreground mb-2">Current ROI</div>
                <Badge variant="outline" className="border-success text-success">
                  {getROILabel(displayData.currentROI)}
                </Badge>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total Investment</div>
                  <div className="text-lg font-semibold">{formatCurrency(displayData.totalBudget)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Actual Costs</div>
                  <div className="text-lg font-semibold">{formatCurrency(displayData.actualCosts)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Monthly Savings</div>
                  <div className="text-lg font-semibold text-success">{formatCurrency(displayData.monthlySavings)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Annual Savings</div>
                  <div className="text-lg font-semibold text-success">{formatCurrency(displayData.annualSavings)}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="projections" className="space-y-4 mt-4">
              {/* 5-Year Projection */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-3">5-Year Financial Impact</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Investment</div>
                    <div className="font-semibold">{formatCurrency(displayData.totalBudget)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">5-Year Savings</div>
                    <div className="font-semibold text-success">{formatCurrency(displayData.annualSavings * 5)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Net Benefit</div>
                    <div className="font-semibold text-success">{formatCurrency((displayData.annualSavings * 5) - displayData.totalBudget)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ROI Multiple</div>
                    <div className="font-semibold">{displayData.totalBudget > 0 ? `${((displayData.annualSavings * 5) / displayData.totalBudget).toFixed(1)}x` : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Break Even Analysis */}
              {displayData.breakEvenMonths > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Break Even Point</span>
                  </div>
                  <span className="font-semibold">{displayData.breakEvenMonths} months</span>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="efficiency" className="space-y-4 mt-4">
              {/* Cost Efficiency */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Utilization</span>
                  <span>{Math.round((displayData.actualCosts / displayData.totalBudget) * 100) || 0}%</span>
                </div>
                <Progress 
                  value={Math.min((displayData.actualCosts / displayData.totalBudget) * 100, 100) || 0} 
                  className="h-2" 
                />
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Cost Control</span>
                  <Badge variant={displayData.costEfficiency >= 0 ? "default" : "destructive"}>
                    {displayData.costEfficiency >= 0 ? "On Budget" : "Over Budget"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">ROI Performance</span>
                  <Badge variant={displayData.currentROI >= 100 ? "default" : displayData.currentROI >= 50 ? "secondary" : "destructive"}>
                    {getROILabel(displayData.currentROI)}
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Original simplified view with enhanced data
  return (
    <Card className="border-0 shadow-card bg-gradient-roi relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-success" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-success" />
      </div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            ROI Summary
          </CardTitle>
          <Badge className="bg-success text-success-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            {displayData.currentROI}% ROI
          </Badge>
        </div>
        <CardDescription>
          Your investment is generating {displayData.currentROI >= 100 ? 'incredible' : 'solid'} returns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        {/* Monthly Savings */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Monthly Savings</p>
              <p className="text-xs text-muted-foreground">Consistent value delivery</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-success">{formatCurrency(displayData.monthlySavings)}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        {/* Annual Impact */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Annual Impact</p>
              <p className="text-xs text-muted-foreground">Total yearly value</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{formatCurrency(displayData.annualSavings)}</p>
            <p className="text-xs text-muted-foreground">yearly savings</p>
          </div>
        </div>

        {/* ROI Calculation */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-roi-positive/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-roi-positive/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-roi-positive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Return Multiple</p>
              <p className="text-xs text-muted-foreground">Investment vs savings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-roi-positive">
              {displayData.totalBudget > 0 ? `${Math.round(displayData.annualSavings / displayData.totalBudget)}x` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">return</p>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
          <p className="text-center text-sm font-medium text-success">
            💰 You save <span className="font-bold">{displayData.totalBudget > 0 ? formatCurrency(Math.round(displayData.annualSavings / displayData.totalBudget)) : '$0'}</span> for every $1 invested
          </p>
        </div>
      </CardContent>
    </Card>
  );
}