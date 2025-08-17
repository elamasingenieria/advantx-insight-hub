import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Shield, Users, ArrowRight, BarChart3, Clock, Target } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              AdvantX Hub
            </span>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90" 
              onClick={() => navigate('/auth')}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🚀 ROI-Focused Project Management
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Transform Your <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Client Relationships
            </span> with Transparency
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The only platform that shows clients exactly what they're getting. 
            Track ROI, demonstrate value, and build lasting partnerships through radical transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/50 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Real ROI Tracking</CardTitle>
              <CardDescription>
                Show clients exactly how much they're saving with detailed ROI calculations and value demonstrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/50 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Complete Transparency</CardTitle>
              <CardDescription>
                Give clients full visibility into project progress, timelines, and deliverables with real-time updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/50 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-info" />
              </div>
              <CardTitle>Seamless Collaboration</CardTitle>
              <CardDescription>
                Enable smooth communication between teams and clients with role-based access and collaborative tools.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-3xl p-8 shadow-card mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Agencies Choose AdvantX Hub</h2>
            <p className="text-muted-foreground">Real results from real agencies</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <div className="text-3xl font-bold text-success mb-2">425%</div>
              <div className="text-sm text-muted-foreground">Average ROI Shown</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">50%</div>
              <div className="text-sm text-muted-foreground">Faster Project Delivery</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-warning" />
              </div>
              <div className="text-3xl font-bold text-warning mb-2">85%</div>
              <div className="text-sm text-muted-foreground">Client Retention Rate</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-info/20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-info" />
              </div>
              <div className="text-3xl font-bold text-info mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 bg-gradient-primary text-white shadow-primary max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-white">Ready to Transform Your Agency?</CardTitle>
              <CardDescription className="text-white/80">
                Join hundreds of agencies already using AdvantX Hub to build stronger client relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/auth')}
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-white/60 mt-4">
                No credit card required • 14-day free trial
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
