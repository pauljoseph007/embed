// Production storage implementation using Vercel KV (Redis)
// This replaces the file-based storage for production deployment

import { kv } from '@vercel/kv';
import fileStorage from './fileStorage.js';

// Storage keys
const KEYS = {
  USERS: 'users',
  DASHBOARDS: 'dashboards',
  SESSIONS: 'sessions'
};

class KVStorage {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.fallbackStorage = fileStorage; // Fallback to file storage in development
  }

  // Check if KV is available
  isKVAvailable() {
    return this.isProduction && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  }

  // Get users data
  async getUsers() {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.getUsers();
      }

      const users = await kv.get(KEYS.USERS);
      return users || {
        systemUsers: [],
        adminUsers: [
          {
            id: 'admin-1',
            email: 'admin@sdxpartners.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString()
          }
        ]
      };
    } catch (error) {
      console.error('Error getting users from KV:', error);
      return this.fallbackStorage.getUsers();
    }
  }

  // Save users data
  async saveUsers(users) {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.saveUsers(users);
      }

      await kv.set(KEYS.USERS, users);
      return { success: true };
    } catch (error) {
      console.error('Error saving users to KV:', error);
      return this.fallbackStorage.saveUsers(users);
    }
  }

  // Get dashboards data
  async getDashboards() {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.getDashboards();
      }

      const dashboards = await kv.get(KEYS.DASHBOARDS);
      return dashboards || [];
    } catch (error) {
      console.error('Error getting dashboards from KV:', error);
      return this.fallbackStorage.getDashboards();
    }
  }

  // Save dashboards data
  async saveDashboards(dashboards) {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.saveDashboards(dashboards);
      }

      await kv.set(KEYS.DASHBOARDS, dashboards);
      return { success: true };
    } catch (error) {
      console.error('Error saving dashboards to KV:', error);
      return this.fallbackStorage.saveDashboards(dashboards);
    }
  }

  // Session management
  async getSession(sessionId) {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.getSession(sessionId);
      }

      const session = await kv.get(`${KEYS.SESSIONS}:${sessionId}`);
      return session;
    } catch (error) {
      console.error('Error getting session from KV:', error);
      return this.fallbackStorage.getSession(sessionId);
    }
  }

  async saveSession(sessionId, sessionData) {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.saveSession(sessionId, sessionData);
      }

      // Set session with 24 hour expiration
      await kv.set(`${KEYS.SESSIONS}:${sessionId}`, sessionData, { ex: 86400 });
      return { success: true };
    } catch (error) {
      console.error('Error saving session to KV:', error);
      return this.fallbackStorage.saveSession(sessionId, sessionData);
    }
  }

  async deleteSession(sessionId) {
    try {
      if (!this.isKVAvailable()) {
        return this.fallbackStorage.deleteSession(sessionId);
      }

      await kv.del(`${KEYS.SESSIONS}:${sessionId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting session from KV:', error);
      return this.fallbackStorage.deleteSession(sessionId);
    }
  }

  // User management methods
  async addUser(user, userType = 'adminUsers') {
    const users = await this.getUsers();
    
    if (!users[userType]) {
      users[userType] = [];
    }
    
    users[userType].push({
      ...user,
      id: user.id || `user-${Date.now()}`,
      createdAt: user.createdAt || new Date().toISOString()
    });
    
    return this.saveUsers(users);
  }

  async updateUser(userId, userData, userType = 'adminUsers') {
    const users = await this.getUsers();
    
    if (users[userType]) {
      const userIndex = users[userType].findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userType][userIndex] = { ...users[userType][userIndex], ...userData };
        return this.saveUsers(users);
      }
    }
    
    return { success: false, error: 'User not found' };
  }

  async deleteUser(userId, userType = 'adminUsers') {
    const users = await this.getUsers();
    
    if (users[userType]) {
      users[userType] = users[userType].filter(u => u.id !== userId);
      return this.saveUsers(users);
    }
    
    return { success: false, error: 'User not found' };
  }

  // Dashboard management methods
  async addDashboard(dashboard) {
    const dashboards = await this.getDashboards();
    
    dashboards.push({
      ...dashboard,
      id: dashboard.id || `dashboard-${Date.now()}`,
      createdAt: dashboard.createdAt || new Date().toISOString()
    });
    
    return this.saveDashboards(dashboards);
  }

  async updateDashboard(dashboardId, dashboardData) {
    const dashboards = await this.getDashboards();
    
    const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
    if (dashboardIndex !== -1) {
      dashboards[dashboardIndex] = { ...dashboards[dashboardIndex], ...dashboardData };
      return this.saveDashboards(dashboards);
    }
    
    return { success: false, error: 'Dashboard not found' };
  }

  async deleteDashboard(dashboardId) {
    const dashboards = await this.getDashboards();
    
    const filteredDashboards = dashboards.filter(d => d.id !== dashboardId);
    return this.saveDashboards(filteredDashboards);
  }

  // Initialize storage with default data
  async initialize() {
    try {
      console.log('🔄 Initializing storage...');
      
      // Ensure default admin user exists
      const users = await this.getUsers();
      if (!users.adminUsers || users.adminUsers.length === 0) {
        await this.addUser({
          email: 'admin@sdxpartners.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin'
        }, 'adminUsers');
      }
      
      console.log('✅ Storage initialized successfully');
      console.log(`📊 Storage type: ${this.isKVAvailable() ? 'Vercel KV (Redis)' : 'File-based (Development)'}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new KVStorage();
