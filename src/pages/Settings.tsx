import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, ArrowLeft, Palette, Bell, Shield, Database, Save, Users, Plus, Trash2, UserPlus, Edit, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/theme/ThemeProvider';
import { SupersetConfig } from '@/components/settings/SupersetConfig';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import storageService from '@/services/storageService';

const Settings = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      dashboard: true,
      system: true
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      analyticsEnabled: true
    },
    display: {
      theme: theme,
      compactMode: false,
      showGrid: true,
      autoRefresh: true
    }
  });

  // Admin user creation state
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin' as const
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load users from file storage on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Load system and admin users
      const usersResponse = await storageService.getUsers();
      let allUsers = [];

      if (usersResponse.success && usersResponse.users) {
        allUsers = [
          ...(usersResponse.users.systemUsers || []),
          ...(usersResponse.users.adminUsers || [])
        ];
      }

      // Load dashboard users
      const dashboardsResponse = await storageService.getDashboards();
      if (dashboardsResponse.success && dashboardsResponse.dashboards) {
        const dashboardUsers = [];
        dashboardsResponse.dashboards.forEach(dashboard => {
          if (dashboard.users && dashboard.users.length > 0) {
            dashboard.users.forEach(user => {
              // Add dashboard info to user and avoid duplicates
              const existingUser = dashboardUsers.find(u => u.email === user.email);
              if (!existingUser) {
                dashboardUsers.push({
                  ...user,
                  dashboardId: dashboard.id,
                  dashboardName: dashboard.name,
                  userType: 'dashboard'
                });
              }
            });
          }
        });
        allUsers = [...allUsers, ...dashboardUsers];
      }

      setAdminUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to access settings.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('user-settings', JSON.stringify(settings));

    // Apply theme change
    if (settings.display.theme !== theme) {
      setTheme(settings.display.theme as any);
    }

    toast({
      title: "Settings Saved",
      description: "Your preferences have been successfully updated."
    });
  };

  const handleCreateAdminUser = async () => {
    if (!newAdminUser.email || !newAdminUser.password || !newAdminUser.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all user details.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create new admin user
      const newAdmin = {
        email: newAdminUser.email,
        password: newAdminUser.password,
        name: newAdminUser.name,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      };

      await storageService.createUser(newAdmin, 'adminUsers');

      // Reload users list
      await loadUsers();

      // Reset form
      setNewAdminUser({ email: '', password: '', name: '', role: 'admin' });
      setShowCreateAdminDialog(false);

      toast({
        title: "Admin User Created",
        description: `Admin user ${newAdminUser.name} has been created successfully.`
      });

    } catch (error: any) {
      console.error('Failed to create admin user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setIsLoading(true);

      const updates = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      };

      // Add password if it was changed
      if (editingUser.password && editingUser.password.trim()) {
        updates.password = editingUser.password;
      }

      const userType = editingUser.role === 'admin' ? 'adminUsers' : 'systemUsers';
      await storageService.updateUser(editingUser.id, updates, userType);

      // Reload users list
      await loadUsers();

      setEditingUser(null);

      toast({
        title: "User Updated",
        description: `User ${editingUser.name} has been updated successfully.`
      });

    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userType: string = 'adminUsers', dashboardId?: string) => {
    try {
      setIsLoading(true);

      if (userType === 'dashboard' && dashboardId) {
        // For dashboard users, we need to remove them from the specific dashboard
        const dashboardsResponse = await storageService.getDashboards();
        if (dashboardsResponse.success && dashboardsResponse.dashboards) {
          const dashboard = dashboardsResponse.dashboards.find(d => d.id === dashboardId);
          if (dashboard && dashboard.users) {
            const updatedUsers = dashboard.users.filter(u => u.id !== userId);
            await storageService.updateDashboard(dashboardId, { users: updatedUsers });
          }
        }
      } else {
        // For system/admin users, use the regular delete method
        await storageService.deleteUser(userId, userType);
      }

      // Reload users list
      await loadUsers();

      toast({
        title: "User Deleted",
        description: "User has been deleted successfully."
      });

    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdminUser = (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own admin account.",
        variant: "destructive"
      });
      return;
    }

    const updatedAdminUsers = adminUsers.filter((u: any) => u.id !== userId);
    setAdminUsers(updatedAdminUsers);
    localStorage.setItem('admin-users', JSON.stringify(updatedAdminUsers));

    toast({
      title: "Admin User Deleted",
      description: "The admin user has been successfully removed."
    });
  };

  const themes = [
    { value: 'cobalt-blue', label: 'Cobalt Blue (Default)' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'muted', label: 'Muted' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={user.role === 'admin' ? '/admin' : '/user-dashboards'}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <SettingsIcon className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your preferences and configuration</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            {user.role === 'admin' && <TabsTrigger value="users">User Management</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="superset">Superset</TabsTrigger>}
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Display & Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={settings.display.theme}
                        onValueChange={(value) => setSettings(prev => ({
                          ...prev,
                          display: { ...prev.display, theme: value }
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map(theme => (
                            <SelectItem key={theme.value} value={theme.value}>
                              {theme.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Compact Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Reduce spacing and padding
                          </p>
                        </div>
                        <Switch
                          checked={settings.display.compactMode}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, compactMode: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Grid</Label>
                          <p className="text-sm text-muted-foreground">
                            Display grid lines in dashboard builder
                          </p>
                        </div>
                        <Switch
                          checked={settings.display.showGrid}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, showGrid: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Refresh</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically refresh dashboard data
                          </p>
                        </div>
                        <Switch
                          checked={settings.display.autoRefresh}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, autoRefresh: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dashboard Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications about dashboard changes
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.dashboard}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, dashboard: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Important system updates and maintenance
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.system}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, system: checked }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to other users
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.profileVisible}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisible: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Activity Tracking</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow tracking of your dashboard activity
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.activityVisible}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, activityVisible: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Help improve the platform with usage analytics
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.analyticsEnabled}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, analyticsEnabled: checked }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* User Management (Admin Only) */}
          {user.role === 'admin' && (
            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Admin User Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and manage admin users who can access the dashboard builder and settings.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Create New Admin User */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Admin Users</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage users with administrative privileges
                        </p>
                      </div>
                      <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Admin User
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Admin User</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="admin-name">Full Name</Label>
                              <Input
                                id="admin-name"
                                placeholder="Enter full name"
                                value={newAdminUser.name}
                                onChange={(e) => setNewAdminUser(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="admin-email">Email Address</Label>
                              <Input
                                id="admin-email"
                                type="email"
                                placeholder="Enter email address"
                                value={newAdminUser.email}
                                onChange={(e) => setNewAdminUser(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="admin-password">Password</Label>
                              <Input
                                id="admin-password"
                                type="password"
                                placeholder="Enter password"
                                value={newAdminUser.password}
                                onChange={(e) => setNewAdminUser(prev => ({ ...prev, password: e.target.value }))}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateAdminUser}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Admin
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Admin Users List */}
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                        </div>
                      ) : (
                        adminUsers.map((adminUser: any) => (
                          <div key={adminUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{adminUser.name}</p>
                                <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Role: {adminUser.role} | Created: {new Date(adminUser.createdAt || Date.now()).toLocaleDateString()}
                                  {adminUser.userType === 'dashboard' && (
                                    <span className="ml-2 text-blue-600">
                                      • Dashboard: {adminUser.dashboardName}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                adminUser.role === 'admin'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {adminUser.role}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(adminUser)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {adminUser.id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(adminUser.id, adminUser.userType === 'dashboard' ? 'dashboard' : (adminUser.role === 'admin' ? 'adminUsers' : 'systemUsers'), adminUser.dashboardId)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {adminUsers.length === 0 && !isLoading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No admin users found.</p>
                        <p className="text-sm">Create your first admin user above.</p>
                      </div>
                    )}

                    {/* Edit User Dialog */}
                    <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Full Name</Label>
                              <Input
                                id="edit-name"
                                placeholder="Enter full name"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-email">Email Address</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                placeholder="Enter email address"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                              <div className="relative">
                                <Input
                                  id="edit-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter new password"
                                  value={editingUser.password || ''}
                                  onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="edit-role">Role</Label>
                              <Select
                                value={editingUser.role}
                                onValueChange={(value) => setEditingUser(prev => ({ ...prev, role: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingUser(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateUser} disabled={isLoading}>
                                {isLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                  <Edit className="h-4 w-4 mr-2" />
                                )}
                                Update User
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {/* Superset Configuration (Admin Only) */}
          {user.role === 'admin' && (
            <TabsContent value="superset">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SupersetConfig />
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
