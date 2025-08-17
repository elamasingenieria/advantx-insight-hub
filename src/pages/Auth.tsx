import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, TrendingUp, Shield, Users } from 'lucide-react';

export default function Auth() {
  const { user, loading, signIn } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [isLoading, setIsLoading] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Navigation is handled in the render logic below

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) return;

    setIsLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setIsLoading(false);

    if (!error) {
      // Navigation handled by auth state change
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              AdvantX Hub
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your transparent project management platform focused on ROI and client success
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Features Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  ROI-Focused Transparency
                </CardTitle>
                <CardDescription>
                  See exactly how much value you're getting from your projects with real-time ROI tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Secure & Professional
                </CardTitle>
                <CardDescription>
                  Enterprise-grade security with role-based access controls for teams and clients
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-info" />
                  Collaborative Workspace
                </CardTitle>
                <CardDescription>
                  Seamless collaboration between teams and clients with real-time updates
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Auth Forms */}
          <Card className="border-0 shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle>Welcome to AdvantX Hub</CardTitle>
              <CardDescription>
                Sign in with your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Contact your administrator if you need an account
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}