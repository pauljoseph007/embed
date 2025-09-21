import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'viewer';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/'
}) => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const isValid = checkAuth();
      setIsLoading(false);
    };

    initAuth();
  }, [checkAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (requiredRole === 'admin' && user.role !== 'admin') {
      return <Navigate to="/user-dashboards" replace />;
    }
    
    if (requiredRole === 'user' && user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
