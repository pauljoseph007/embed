import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Settings, Eye, Save, Users, Grid, BarChart3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDashboardStore } from "@/store/dashboardStore";
import { DashboardBuilder } from "@/components/dashboard/DashboardBuilder";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const AdminBuilder = () => {
  const { 
    dashboards, 
    currentDashboard, 
    setCurrentDashboard, 
    createDashboard, 
    deleteDashboard,
    themes,
    initializeDemoData
  } = useDashboardStore();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('cobalt-blue');

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
  }, [initializeDemoData]);

  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a dashboard name.",
        variant: "destructive"
      });
      return;
    }

    const newDashboard = createDashboard(newDashboardName, selectedTheme);
    setNewDashboardName('');
    setSelectedTheme('cobalt-blue');
    setShowCreateDialog(false);
    
    toast({
      title: "Dashboard Created",
      description: `${newDashboard.name} has been created successfully.`
    });
  };

  const handleDeleteDashboard = (dashboardId: string) => {
    deleteDashboard(dashboardId);
    toast({
      title: "Dashboard Deleted",
      description: "The dashboard has been removed."
    });
  };

  const handleEditDashboard = (dashboard: any) => {
    setCurrentDashboard(dashboard);
  };

  // If a dashboard is being edited, show the builder
  if (currentDashboard) {
    return <DashboardBuilder dashboard={currentDashboard} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Builder</h1>
                <p className="text-sm text-muted-foreground">SDX Partners Intelligence Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Dashboard
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Dashboard</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="dashboard-name">Dashboard Name</Label>
                      <Input
                        id="dashboard-name"
                        value={newDashboardName}
                        onChange={(e) => setNewDashboardName(e.target.value)}
                        placeholder="Enter dashboard name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="theme-select">Theme</Label>
                      <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme} value={theme}>
                              {theme.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateDashboard}>
                        Create Dashboard
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Dashboard Management
              </h2>
              <p className="text-muted-foreground mt-1">
                Create and manage your business intelligence dashboards
              </p>
            </div>
          </div>

          {dashboards.length === 0 ? (
            <div className="text-center py-20">
              <Grid className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Dashboards Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first dashboard to start building BI reports
              </p>
              <Button onClick={() => setShowCreateDialog(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-chart transition-shadow cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{dashboard.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDashboard(dashboard);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDashboard(dashboard.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Sheets:</span>
                          <span>{dashboard.sheets.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Charts:</span>
                          <span>
                            {dashboard.sheets.reduce((total, sheet) => total + sheet.tiles.length, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Theme:</span>
                          <span className="capitalize">
                            {dashboard.theme.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Modified:</span>
                          <span>{new Date(dashboard.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditDashboard(dashboard)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditDashboard(dashboard)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBuilder;