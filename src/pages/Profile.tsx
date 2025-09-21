import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Save, ArrowLeft, Camera, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const updates = {
      name: formData.name,
      avatar: formData.avatar
    };

    // Only allow email updates for admin users
    if (user.role === 'admin') {
      updates.email = formData.email;
    }

    updateUser(updates);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated."
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      avatar: user.avatar || ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="mt-4">{user.name}</CardTitle>
                <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing && user.role === 'admin' ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-muted rounded-md flex items-center justify-between">
                        <span>{user.email}</span>
                        {isEditing && user.role !== 'admin' && (
                          <span className="text-xs text-muted-foreground">
                            Email can only be changed by administrators
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-1"
                    />
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Account Role</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <Badge className={getRoleColor(user.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Account Status</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                {user.dashboardAccess && user.dashboardAccess.length > 0 && (
                  <div>
                    <Label>Dashboard Access</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground">
                        Access to {user.dashboardAccess.length} dashboard(s)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
