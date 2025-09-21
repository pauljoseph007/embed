import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const AdminBuilder = lazy(() => import("./pages/AdminBuilder"));
const UserDashboards = lazy(() => import("./pages/UserDashboards"));
const DashboardViewer = lazy(() => import("./pages/DashboardViewer"));
const TestDashboard = lazy(() => import("./pages/TestDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SupersetDebug = lazy(() => import("./components/debug/SupersetDebug"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
  }, [checkAuth]);

  return (
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
              <Route path="/debug" element={<SupersetDebug />} />
              <Route path="/test" element={<TestDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
