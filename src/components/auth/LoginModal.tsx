import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, LogIn, UserPlus, X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { isLoading, error, clearError, loginToDashboard } = useAuthStore();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      clearError();
      // Reset form when modal opens
      setLoginEmail('');
      setLoginPassword('');
      setShowLoginPassword(false);
    }
  }, [isOpen, clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 Login form submitted:', { email: loginEmail, timestamp: new Date().toISOString() });

    try {
      const result = await loginToDashboard(loginEmail, loginPassword);

      console.log('📋 Login result received:', {
        success: result.success,
        hasUser: !!result.user,
        error: result.error,
        userRole: result.user?.role
      });

      if (result.success && result.user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Login successful, showing success toast');
        }
        toast({
          title: "Welcome back!",
          description: `You have been successfully logged in as ${result.user.role}.`
        });
        onClose();

        // Redirect based on user role
        if (result.user.role === 'admin') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Redirecting admin to /admin');
          }
          window.location.href = '/admin';
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Redirecting user to /user-dashboards');
          }
          window.location.href = '/user-dashboards';
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Login failed:', result.error);
        }
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Login form error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };



  const demoCredentials = [
    { email: 'admin@sdxpartners.com', password: 'admin123', role: 'Admin' },
    { email: 'user@sdxpartners.com', password: 'user123', role: 'User' },
    { email: 'viewer@sdxpartners.com', password: 'viewer123', role: 'Viewer' }
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setLoginEmail(email);
    setLoginPassword(password);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.3
          }}
          className="relative w-full max-w-md mx-auto my-8 z-10"
        >
          <Card className="w-full shadow-2xl border-0 bg-background/95 backdrop-blur-md">
            <CardHeader className="relative pb-2">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  SDX Partners Portal
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Access your intelligence dashboard
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Demo Accounts:</p>
                    <div className="space-y-2">
                      {demoCredentials.map((cred, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => fillDemoCredentials(cred.email, cred.password)}
                          className="w-full text-left text-xs p-2 rounded bg-background hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">{cred.role}</div>
                          <div className="text-muted-foreground">{cred.email}</div>
                        </button>
                      ))}
                    </div>
                  </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
