import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, Eye, Users, Lock, Globe, ArrowLeft, Sparkles, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore, type Dashboard } from '@/store/dashboardStore';
import { Header } from '@/components/layout/Header';

export default function UserDashboards() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { setCurrentDashboard } = useDashboardStore();
  const [userDashboards, setUserDashboards] = useState<Dashboard[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    // Get dashboards accessible to this user
    const loadDashboards = async () => {
      console.log('Loading dashboards for user:', user.email, user.role);
      const { getUserDashboards } = useAuthStore.getState();
      const dashboards = await getUserDashboards();
      console.log('User dashboards loaded:', dashboards.length);
      setUserDashboards(dashboards);
    };

    loadDashboards();
  }, [isAuthenticated, user, navigate]);

  const handleOpenDashboard = (dashboard: Dashboard) => {
    setCurrentDashboard(dashboard);
    navigate(`/dashboard/${dashboard.id}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-auto">
      <Header />

      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center"
          >
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </motion.div>

          {/* Enhanced Header Section */}
          <div className="text-center space-y-6 relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 -z-10">
              <motion.div
                className="absolute top-10 left-1/4 w-2 h-2 bg-primary/20 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 0
                }}
              />
              <motion.div
                className="absolute top-20 right-1/3 w-1 h-1 bg-primary/30 rounded-full"
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.7, 0.2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 1
                }}
              />
              <motion.div
                className="absolute top-16 right-1/4 w-3 h-3 bg-primary/15 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.4, 0.9, 0.4]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 2
                }}
              />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2
              }}
              className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-lg"
            >
              <BarChart3 className="h-10 w-10 text-white" />
              <motion.div
                className="absolute inset-0 bg-gradient-primary rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent relative"
            >
              My Dashboards
              <motion.div
                className="absolute -top-2 -right-8"
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Sparkles className="h-6 w-6 text-primary/60" />
              </motion.div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Welcome back, <span className="font-semibold text-primary">{user.name}</span>!
              Access your assigned dashboards and analytics with enhanced insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-6 text-sm"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Role: {user.role}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full"
              >
                <Activity className="h-4 w-4" />
                <span className="font-medium">{userDashboards.length} Dashboard{userDashboards.length !== 1 ? 's' : ''}</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Dashboards Grid */}
          {userDashboards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4
                }}
                className="relative w-32 h-32 mx-auto mb-8"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <Lock className="h-16 w-16 text-primary/60" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold mb-4 text-foreground"
              >
                No Dashboards Available
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-muted-foreground max-w-md mx-auto mb-8"
              >
                You don't have access to any dashboards yet. Contact your administrator to request access.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Home
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {userDashboards.map((dashboard, index) => (
                  <motion.div
                    key={dashboard.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:shadow-2xl hover:shadow-primary/10">
                      {/* Animated background gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />

                      {/* Floating particles effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                          className="absolute top-4 right-4 w-1 h-1 bg-primary/30 rounded-full"
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.5
                          }}
                        />
                        <motion.div
                          className="absolute bottom-6 left-6 w-2 h-2 bg-primary/20 rounded-full"
                          animate={{
                            y: [0, -8, 0],
                            opacity: [0.2, 0.6, 0.2]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                        />
                      </div>

                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="p-3 bg-gradient-primary rounded-xl shadow-lg"
                              whileHover={{
                                scale: 1.1,
                                rotate: 5,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <BarChart3 className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                              <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 font-bold">
                                {dashboard.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {dashboard.isPublic ? (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-200">
                                      <Globe className="h-3 w-3 mr-1" />
                                      Public
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Private
                                    </Badge>
                                  )}
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <motion.div
                            className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"
                            whileHover={{ x: 2 }}
                          >
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">Created {formatDate(dashboard.createdAt)}</span>
                          </motion.div>
                          <motion.div
                            className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"
                            whileHover={{ x: 2 }}
                          >
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{dashboard.sheets.length} Sheet{dashboard.sheets.length !== 1 ? 's' : ''}</span>
                          </motion.div>
                        </div>

                        <div className="pt-2">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => handleOpenDashboard(dashboard)}
                              className="w-full bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 text-white border-0 font-semibold py-3 transition-all duration-300"
                              size="lg"
                            >
                              <Eye className="h-5 w-5 mr-2" />
                              Open Dashboard
                              <motion.div
                                className="ml-2"
                                animate={{ x: [0, 4, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                →
                              </motion.div>
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Quick Stats */}
          {userDashboards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold">{userDashboards.length}</h3>
                  <p className="text-muted-foreground">Available Dashboards</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {userDashboards.reduce((total, d) => total + d.sheets.length, 0)}
                  </h3>
                  <p className="text-muted-foreground">Total Sheets</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
