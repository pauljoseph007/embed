import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Users, Mail, Key, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  useDashboardStore,
  type Dashboard,
  type DashboardUser,
} from '@/store/dashboardStore';
import axios from '@/lib/axios.ts';

interface DashboardUserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: Dashboard;
}

const DashboardUserManagement: React.FC<DashboardUserManagementProps> = ({
  isOpen,
  onClose,
  dashboard,
}) => {
  const { addDashboardUser, removeDashboardUser, updateDashboardUser } =
    useDashboardStore();

  const [userList, setUserList] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'viewer' as 'viewer' | 'editor',
  });

  // Ensure dashboard and users array exist to prevent console errors
  if (!dashboard) {
    console.error('DashboardUserManagement: dashboard prop is required');
    return null;
  }

  const getUserList = async () => {
    const res = await axios.get('/api/user/getAllUser');
    setUserList(res?.data?.data);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getUserList();
  }, []);

  // Initialize users array if it doesn't exist (for backward compatibility)
  const dashboardUsers = dashboard.users || [];

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all user details.',
        variant: 'destructive',
      });
      return;
    }

    // Check if user already exists
    const existingUser = dashboardUsers.find((u) => u.email === newUser.email);
    if (existingUser) {
      toast({
        title: 'User Already Exists',
        description:
          'A user with this email already has access to this dashboard.',
        variant: 'destructive',
      });
      return;
    }
    await axios.post('/api/user/addUser', newUser)?.then(async (res) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({
        title: 'User Added',
        description: `${newUser.name} has been granted access to this dashboard.`,
      });
      addDashboardUser(dashboard.id, newUser);
      setNewUser({ email: '', password: '', name: '', role: 'viewer' });
      getUserList();
    });
  };

  const handleRemoveUser = async (id: string) => {
    await axios.post('/api/user/deleteUser', { id })?.then(async (res) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      removeDashboardUser(dashboard.id, id);
      toast({
        title: 'User Removed',
        description: 'User access has been revoked.',
      });
      getUserList();
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-border'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Users className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h2 className='text-xl font-semibold'>User Management</h2>
                <p className='text-sm text-muted-foreground'>
                  Manage access to "{dashboard.name}"
                </p>
              </div>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
            <div className='space-y-6'>
              {/* Add New User */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <Plus className='h-5 w-5' />
                    Add New User
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='user-name'>Full Name</Label>
                      <Input
                        id='user-name'
                        placeholder='John Doe'
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='user-email'>Email Address</Label>
                      <Input
                        id='user-email'
                        type='email'
                        placeholder='john@company.com'
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='user-password'>Password</Label>
                      <Input
                        id='user-password'
                        type='password'
                        placeholder='Enter password'
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='user-role'>Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: 'viewer' | 'editor') =>
                          setNewUser((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='viewer'>Viewer</SelectItem>
                          <SelectItem value='editor'>Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddUser} className='w-full'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add User
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Users */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <UserCheck className='h-5 w-5' />
                    Dashboard Users ({dashboardUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userList.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <Users className='h-12 w-12 mx-auto mb-3 opacity-50' />
                      <p>No users have been added to this dashboard yet.</p>
                      <p className='text-sm'>
                        Add users above to grant them access.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {userList.map((user) => (
                        <div
                          key={user.id}
                          className='flex items-center justify-between p-3 border border-border rounded-lg'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-full'>
                              <Mail className='h-4 w-4 text-primary' />
                            </div>
                            <div>
                              <p className='font-medium'>{user.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant={
                                user.role === 'editor' ? 'default' : 'secondary'
                              }
                            >
                              {user.role}
                            </Badge>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleRemoveUser(user.id)}
                              className='text-destructive hover:text-destructive'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardUserManagement;
