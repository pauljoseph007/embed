import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const UserProfile = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
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
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50"
            >
              {/* User Info */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`mt-1 text-xs ${getRoleColor(user.role)}`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Menu Items */}
              <div className="p-2">
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto p-3"
                  >
                    <User className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Profile</span>
                      <span className="text-xs text-muted-foreground">
                        Manage your account
                      </span>
                    </div>
                  </Button>
                </Link>

                <Link to="/settings" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto p-3"
                  >
                    <Settings className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Settings</span>
                      <span className="text-xs text-muted-foreground">
                        Preferences and configuration
                      </span>
                    </div>
                  </Button>
                </Link>
              </div>

              <Separator />

              {/* Logout */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto p-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Sign out</span>
                    <span className="text-xs opacity-70">
                      Sign out of your account
                    </span>
                  </div>
                </Button>
              </div>

              {/* Footer */}
              <div className="p-3 bg-muted/50 rounded-b-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
