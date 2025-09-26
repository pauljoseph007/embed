import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import storageService from '../services/storageService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  dashboardAccess?: string[]; // Dashboard IDs this user has access to
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  clearError: () => void;
  loginToDashboard: (email: string, password: string) => Promise<{ success: boolean; user?: User; dashboards?: any[] }>;
  getUserDashboards: () => Promise<any[]>;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => boolean;
}

export type AuthStore = AuthState & AuthActions;

// Mock user database for demo purposes
const getDefaultMockUsers = () => [
  {
    id: 'admin-1',
    email: 'admin@sdxpartners.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'user-1',
    email: 'user@sdxpartners.com',
    password: 'user123',
    name: 'John Doe',
    role: 'user' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'viewer-1',
    email: 'viewer@sdxpartners.com',
    password: 'viewer123',
    name: 'Jane Smith',
    role: 'user' as const,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  }
];

// Get all mock users including dynamically created ones
const getAllMockUsers = () => {
  const defaultUsers = getDefaultMockUsers();
  const storedAdminUsers = JSON.parse(localStorage.getItem('mock-users') || '[]');
  const allUsers = [...defaultUsers];
  
  // Add stored admin users if they don't already exist
  storedAdminUsers.forEach((storedUser: any) => {
    if (!allUsers.find(u => u.email === storedUser.email)) {
      allUsers.push(storedUser);
    }
  });
  
  return allUsers;
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await storageService.login(email, password);
          
          if (!response.success || !response.user) {
            set({ error: 'Invalid email or password', isLoading: false });
            return false;
          }

          const user: User = response.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Store session using storage service
          if (response.session) {
            storageService.saveSession({
              sessionId: response.session.sessionId,
              userId: user.id,
              email: user.email,
              loginTime: new Date().toISOString(),
              expiresAt: response.session.expiresAt
            });
          }

          // Load dashboard data from file storage after successful login
          try {
            const { useDashboardStore } = await import('./dashboardStore');
            await useDashboardStore.getState().loadFromFileStorage();
          } catch (error) {
            console.error('Failed to load dashboard data after login:', error);
          }

          return true;
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed. Please try again.', 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await delay(1000);
          
          // Check if user already exists
          const allUsers = getAllMockUsers();
          const existingUser = allUsers.find(u => u.email === email);
          
          if (existingUser) {
            set({ error: 'User with this email already exists', isLoading: false });
            return false;
          }

          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name,
            role: 'user',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };

          // Store new user in localStorage for demo
          const storedUsers = JSON.parse(localStorage.getItem('mock-users') || '[]');
          storedUsers.push({
            ...newUser,
            password
          });
          localStorage.setItem('mock-users', JSON.stringify(storedUsers));

          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });

          // Store session in localStorage
          localStorage.setItem('sdx-auth-session', JSON.stringify({
            userId: newUser.id,
            email: newUser.email,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }));

          return true;
        } catch (error) {
          set({ 
            error: 'Registration failed. Please try again.', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async () => {
        try {
          const session = storageService.getSession();
          if (session?.sessionId) {
            await storageService.logout(session.sessionId);
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
        
        storageService.clearSession();
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      checkAuth: async () => {
        try {
          const session = storageService.getSession();
          if (!session?.sessionId) return false;

          const response = await storageService.checkSession(session.sessionId);
          
          if (!response.success || !response.user) {
            storageService.clearSession();
            set({ user: null, isAuthenticated: false });
            return false;
          }

          const user: User = response.user;
          set({ user, isAuthenticated: true });

          // Load dashboard data from file storage after successful auth check
          try {
            const { useDashboardStore } = await import('./dashboardStore');
            await useDashboardStore.getState().loadFromFileStorage();
          } catch (error) {
            console.error('Failed to load dashboard data after auth check:', error);
          }

          return true;
        } catch (error) {
          console.error('Auth check failed:', error);
          storageService.clearSession();
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },

      loginToDashboard: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔐 Starting login process:', { email, timestamp: new Date().toISOString() });

          const response = await storageService.login(email, password);

          console.log('📡 Login API response:', {
            success: response.success,
            hasUser: !!response.user,
            userRole: response.user?.role,
            userEmail: response.user?.email,
            dashboardCount: response.dashboards?.length || 0
          });

          if (!response.success || !response.user) {
            const errorMsg = response.error || 'Invalid email or password';
            console.error('❌ Login failed:', errorMsg);
            set({ error: errorMsg, isLoading: false });
            return {
              success: false,
              error: errorMsg
            };
          }

          const user: User = response.user;
          console.log('✅ Login successful, setting user state:', {
            userId: user.id,
            userEmail: user.email,
            userRole: user.role
          });

          set({ user, isAuthenticated: true, isLoading: false });

          // Store session using storage service
          if (response.session) {
            console.log('💾 Saving session:', response.session.sessionId);
            storageService.saveSession({
              sessionId: response.session.sessionId,
              userId: user.id,
              email: user.email,
              loginTime: new Date().toISOString(),
              expiresAt: response.session.expiresAt
            });
          }

          // Load dashboard data from file storage after successful login
          try {
            console.log('📊 Loading dashboard data...');
            const { useDashboardStore } = await import('./dashboardStore');
            await useDashboardStore.getState().loadFromFileStorage();
            console.log('📊 Dashboard data loaded successfully');
          } catch (error) {
            console.error('❌ Failed to load dashboard data after login:', error);
          }

          const result = {
            success: true,
            user,
            dashboards: response.dashboards || []
          };

          console.log('🎉 Login process completed successfully:', {
            userRole: user.role,
            dashboardCount: result.dashboards.length
          });

          return result;

        } catch (error: any) {
          console.error('💥 Login error caught:', {
            error: error,
            message: error.message,
            stack: error.stack,
            name: error.name
          });

          const errorMessage = error.message || 'Unknown error occurred';
          set({
            error: errorMessage,
            isLoading: false
          });
          return {
            success: false,
            error: errorMessage
          };
        }
      },

      getUserDashboards: async () => {
        const { user } = get();
        if (!user) return [];

        // Use dynamic import to avoid circular dependency
        const { useDashboardStore } = await import('./dashboardStore');
        const dashboardStore = useDashboardStore.getState();

        if (user.role === 'admin') {
          return dashboardStore.dashboards;
        }

        // For regular users, return only accessible dashboards
        if (user.dashboardAccess) {
          return dashboardStore.dashboards.filter(d =>
            user.dashboardAccess!.includes(d.id) || d.isPublic
          );
        }

        return [];
      }
    }),
    {
      name: 'sdx-auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Auth utilities
export const getAuthToken = (): string | null => {
  try {
    const session = localStorage.getItem('sdx-auth-session');
    if (!session) return null;

    const sessionData = JSON.parse(session);
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);

    if (now > expiresAt) {
      localStorage.removeItem('sdx-auth-session');
      return null;
    }

    return sessionData.userId;
  } catch {
    return null;
  }
};

export const isValidSession = (): boolean => {
  return getAuthToken() !== null;
};

export const hasPermission = (user: User | null, requiredRole: 'viewer' | 'user' | 'admin'): boolean => {
  if (!user) return false;

  const roleHierarchy = { viewer: 1, user: 2, admin: 3 };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};
