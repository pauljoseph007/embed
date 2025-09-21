// File-based storage implementation for development
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DASHBOARDS_FILE = path.join(DATA_DIR, 'dashboards.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class FileStorage {
  // Get users data
  getUsers() {
    try {
      if (!fs.existsSync(USERS_FILE)) {
        const defaultUsers = {
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
        this.saveUsers(defaultUsers);
        return defaultUsers;
      }
      
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return { systemUsers: [], adminUsers: [] };
    }
  }

  // Save users data
  saveUsers(users) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error saving users file:', error);
      return { success: false, error: error.message };
    }
  }

  // Get dashboards data
  getDashboards() {
    try {
      if (!fs.existsSync(DASHBOARDS_FILE)) {
        const defaultDashboards = [];
        this.saveDashboards(defaultDashboards);
        return defaultDashboards;
      }
      
      const data = fs.readFileSync(DASHBOARDS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading dashboards file:', error);
      return [];
    }
  }

  // Save dashboards data
  saveDashboards(dashboards) {
    try {
      fs.writeFileSync(DASHBOARDS_FILE, JSON.stringify(dashboards, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error saving dashboards file:', error);
      return { success: false, error: error.message };
    }
  }

  // Session management (in-memory for file storage)
  constructor() {
    this.sessions = new Map();
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  saveSession(sessionId, sessionData) {
    this.sessions.set(sessionId, sessionData);
    return { success: true };
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
    return { success: true };
  }

  // User management methods
  addUser(user, userType = 'adminUsers') {
    const users = this.getUsers();
    
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

  updateUser(userId, userData, userType = 'adminUsers') {
    const users = this.getUsers();
    
    if (users[userType]) {
      const userIndex = users[userType].findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userType][userIndex] = { ...users[userType][userIndex], ...userData };
        return this.saveUsers(users);
      }
    }
    
    return { success: false, error: 'User not found' };
  }

  deleteUser(userId, userType = 'adminUsers') {
    const users = this.getUsers();
    
    if (users[userType]) {
      users[userType] = users[userType].filter(u => u.id !== userId);
      return this.saveUsers(users);
    }
    
    return { success: false, error: 'User not found' };
  }

  // Dashboard management methods
  addDashboard(dashboard) {
    const dashboards = this.getDashboards();
    
    dashboards.push({
      ...dashboard,
      id: dashboard.id || `dashboard-${Date.now()}`,
      createdAt: dashboard.createdAt || new Date().toISOString()
    });
    
    return this.saveDashboards(dashboards);
  }

  updateDashboard(dashboardId, dashboardData) {
    const dashboards = this.getDashboards();
    
    const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
    if (dashboardIndex !== -1) {
      dashboards[dashboardIndex] = { ...dashboards[dashboardIndex], ...dashboardData };
      return this.saveDashboards(dashboards);
    }
    
    return { success: false, error: 'Dashboard not found' };
  }

  deleteDashboard(dashboardId) {
    const dashboards = this.getDashboards();
    
    const filteredDashboards = dashboards.filter(d => d.id !== dashboardId);
    return this.saveDashboards(filteredDashboards);
  }

  // Initialize storage
  initialize() {
    try {
      console.log('🔄 Initializing file storage...');
      
      // Ensure default admin user exists
      const users = this.getUsers();
      if (!users.adminUsers || users.adminUsers.length === 0) {
        this.addUser({
          email: 'admin@sdxpartners.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin'
        }, 'adminUsers');
      }
      
      console.log('✅ File storage initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ File storage initialization failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FileStorage();
