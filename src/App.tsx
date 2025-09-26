import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoading } from "@/components/common/LoadingStates";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const AdminBuilder = lazy(() => import("./pages/AdminBuilder"));
const UserDashboards = lazy(() => import("./pages/UserDashboards"));
const DashboardViewer = lazy(() => import("./pages/DashboardViewer"));
const TestDashboard = lazy(() => import("./pages/TestDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const ProposalFormPage = lazy(() => import("./pages/ProposalFormPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthTester = lazy(() => import("./components/debug/AuthTester").then(module => ({ default: module.AuthTester })));
const FilteringDiagnostics = lazy(() => import("./components/debug/FilteringDiagnostics").then(module => ({ default: module.FilteringDiagnostics })));


// Use the standardized loading component
const PageLoader = () => <PageLoading />;

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="cobalt-blue" storageKey="sdx-portal-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user-dashboards"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <UserDashboards />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/:id"
                    element={
                      <ProtectedRoute>
                        <DashboardViewer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/auth-test"
                    element={<AuthTester />}
                  />
                  <Route
                    path="/debug/filtering"
                    element={<FilteringDiagnostics />}
                  />

                  <Route path="/proposal-form" element={<ProposalFormPage />} />
                  <Route path="/test" element={<TestDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
