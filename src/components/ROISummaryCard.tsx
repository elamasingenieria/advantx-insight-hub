import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';

interface ROISummaryCardProps {
  monthlySavings: number;
  annualSavings: number;
  roiPercentage: number;
  projectCost?: number;
  timeframe?: string;
}

export function ROISummaryCard({ 
  monthlySavings, 
  annualSavings, 
  roiPercentage, 
  projectCost = 5000,
  timeframe = "annual"
}: ROISummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
            {roiPercentage}% ROI
          </Badge>
        </div>
        <CardDescription>
          Your investment is generating incredible returns
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
            <p className="text-lg font-bold text-success">{formatCurrency(monthlySavings)}</p>
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
            <p className="text-lg font-bold text-primary">{formatCurrency(annualSavings)}</p>
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
              {Math.round(annualSavings / projectCost)}x
            </p>
            <p className="text-xs text-muted-foreground">return</p>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
          <p className="text-center text-sm font-medium text-success">
            💰 You save <span className="font-bold">{formatCurrency(Math.round(annualSavings / projectCost))}</span> for every $1 invested
          </p>
        </div>
      </CardContent>
    </Card>
  );
}