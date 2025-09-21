import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';
import { DashboardThemeProvider } from '@/components/theme/DashboardThemeProvider';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

const DashboardViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { dashboards, loadFromFileStorage } = useDashboardStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        // Always try to load fresh data from file storage
        await loadFromFileStorage();

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    loadDashboard();
  }, [id, isAuthenticated, user, navigate]);

  // Separate effect to handle dashboard finding after dashboards are loaded
  useEffect(() => {
    if (!dashboards || dashboards.length === 0 || !id || !user) {
      return;
    }

    try {
      // Find the requested dashboard
      const foundDashboard = dashboards.find(d => d.id === id);

      if (!foundDashboard) {
        setError('Dashboard not found or you do not have access to it.');
        setLoading(false);
        return;
      }

      // Check if user has access to this dashboard
      const hasAccess = user.role === 'admin' ||
                       foundDashboard.isPublic ||
                       foundDashboard.users?.some(u => u.id === user.id);

      if (!hasAccess) {
        setError('You do not have permission to view this dashboard.');
        setLoading(false);
        return;
      }

      setDashboard(foundDashboard);
      setLoading(false);
    } catch (err) {
      console.error('Failed to process dashboard:', err);
      setError('Failed to process dashboard. Please try again.');
      setLoading(false);
    }
  }, [dashboards, id, user]);

  const handleGoBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user-dashboards');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Dashboard not found.</p>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardThemeProvider theme={dashboard.theme as any} className="min-h-screen">
      <div className="min-h-screen bg-background">
        <DashboardBuilder dashboard={dashboard} />
      </div>
    </DashboardThemeProvider>
  );
};

export default DashboardViewer;
