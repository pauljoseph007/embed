import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use production storage in production, file storage in development
const isProduction = process.env.NODE_ENV === 'production';

// Initialize storage based on environment
let storageInstance;
if (isProduction) {
  try {
    const { default: kvStorage } = await import('./storage/kvStorage.js');
    storageInstance = kvStorage;
    console.log('📊 Using Vercel KV (Redis) storage for production');
  } catch (error) {
    console.warn('⚠️ KV storage not available, falling back to file storage:', error.message);
    const { default: fileStorage } = await import('./storage/fileStorage.js');
    storageInstance = fileStorage;
  }
} else {
  const { default: fileStorage } = await import('./storage/fileStorage.js');
  storageInstance = fileStorage;
  console.log('📁 Using file-based storage for development');
}

// Data directory path (for file storage fallback)
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic file operations
export async function readDataFile(filename) {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

export async function writeDataFile(filename, data) {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// User management functions
export async function getUsers() {
  try {
    return await storageInstance.getUsers();
  } catch (error) {
    console.error('Error getting users:', error);
    return { systemUsers: [], adminUsers: [], sessions: {} };
  }
}

export async function saveUsers(userData) {
  try {
    return await storageInstance.saveUsers(userData);
  } catch (error) {
    console.error('Error saving users:', error);
    return { success: false, error: error.message };
  }
}

export async function addUser(user, type = 'systemUsers') {
  const userData = await getUsers();
  if (!userData[type]) {
    userData[type] = [];
  }
  
  // Check if user already exists
  const existingUser = userData[type].find(u => u.email === user.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  userData[type].push(user);
  await saveUsers(userData);
  return user;
}

export async function updateUser(userId, updates, type = 'systemUsers') {
  const userData = await getUsers();
  if (!userData[type]) {
    userData[type] = [];
  }
  
  const userIndex = userData[type].findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  userData[type][userIndex] = { ...userData[type][userIndex], ...updates };
  await saveUsers(userData);
  return userData[type][userIndex];
}

export async function deleteUser(userId, type = 'systemUsers') {
  const userData = await getUsers();
  if (!userData[type]) {
    userData[type] = [];
  }
  
  const userIndex = userData[type].findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  userData[type].splice(userIndex, 1);
  await saveUsers(userData);
  return true;
}

export async function findUser(email, password) {
  const userData = await getUsers();

  // If password is null, we're doing a session check - find by email only
  if (password === null) {
    // Check system users first
    let user = userData.systemUsers?.find(u => u.email === email);
    if (user) return { user, type: 'system' };

    // Check admin users
    user = userData.adminUsers?.find(u => u.email === email);
    if (user) return { user, type: 'admin' };

    // Check dashboard users
    const dashboardData = await getDashboards();
    for (const dashboard of dashboardData.dashboards || []) {
      user = dashboard.users?.find(u => u.email === email);
      if (user) return { user, type: 'dashboard', dashboardId: dashboard.id };
    }

    return null;
  }

  // Normal login - check email and password
  // Check system users first
  let user = userData.systemUsers?.find(u => u.email === email && u.password === password);
  if (user) return { user, type: 'system' };

  // Check admin users
  user = userData.adminUsers?.find(u => u.email === email && u.password === password);
  if (user) return { user, type: 'admin' };

  // Check dashboard users
  const dashboardData = await getDashboards();
  for (const dashboard of dashboardData.dashboards || []) {
    user = dashboard.users?.find(u => u.email === email && u.password === password);
    if (user) return { user, type: 'dashboard', dashboardId: dashboard.id };
  }

  return null;
}

// Session management
export async function createSession(userId, email) {
  const userData = await getUsers();
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const sessionData = {
    userId,
    email,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  userData.sessions[sessionId] = sessionData;
  await saveUsers(userData);
  return { sessionId, ...sessionData };
}

export async function getSession(sessionId) {
  const userData = await getUsers();
  const session = userData.sessions?.[sessionId];
  
  if (!session) return null;
  
  // Check if session is expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  if (now > expiresAt) {
    // Remove expired session
    delete userData.sessions[sessionId];
    await saveUsers(userData);
    return null;
  }
  
  return session;
}

export async function deleteSession(sessionId) {
  const userData = await getUsers();
  if (userData.sessions?.[sessionId]) {
    delete userData.sessions[sessionId];
    await saveUsers(userData);
  }
  return true;
}

// Dashboard management functions
export async function getDashboards() {
  const data = await readDataFile('dashboards.json');
  return data || {
    dashboards: [],
    currentDashboard: null,
    currentSheetId: null,
    globalDateRange: null
  };
}

export async function saveDashboards(dashboardData) {
  return await writeDataFile('dashboards.json', dashboardData);
}

export async function addDashboard(dashboard) {
  const dashboardData = await getDashboards();
  dashboardData.dashboards.push(dashboard);
  await saveDashboards(dashboardData);
  return dashboard;
}

export async function updateDashboard(dashboardId, updates) {
  const dashboardData = await getDashboards();
  const dashboardIndex = dashboardData.dashboards.findIndex(d => d.id === dashboardId);
  
  if (dashboardIndex === -1) {
    throw new Error('Dashboard not found');
  }
  
  dashboardData.dashboards[dashboardIndex] = { 
    ...dashboardData.dashboards[dashboardIndex], 
    ...updates,
    lastModified: new Date().toISOString()
  };
  
  await saveDashboards(dashboardData);
  return dashboardData.dashboards[dashboardIndex];
}

export async function deleteDashboard(dashboardId) {
  const dashboardData = await getDashboards();
  const dashboardIndex = dashboardData.dashboards.findIndex(d => d.id === dashboardId);
  
  if (dashboardIndex === -1) {
    throw new Error('Dashboard not found');
  }
  
  dashboardData.dashboards.splice(dashboardIndex, 1);
  await saveDashboards(dashboardData);
  return true;
}

// Initialize default data if files don't exist
export async function initializeDefaultData() {
  try {
    await ensureDataDir();
    
    // Initialize users.json if it doesn't exist
    const usersPath = path.join(DATA_DIR, 'users.json');
    try {
      await fs.access(usersPath);
    } catch {
      const defaultUsers = {
        systemUsers: [
          {
            id: "admin-1",
            email: "admin@sdxpartners.com",
            password: "admin123",
            name: "Admin User",
            role: "admin",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
            createdAt: "2024-01-01T00:00:00Z",
            lastLogin: "2024-01-01T00:00:00Z"
          }
        ],
        adminUsers: [],
        sessions: {}
      };
      await writeDataFile('users.json', defaultUsers);
    }
    
    // Initialize dashboards.json if it doesn't exist
    const dashboardsPath = path.join(DATA_DIR, 'dashboards.json');
    try {
      await fs.access(dashboardsPath);
    } catch {
      const defaultDashboards = {
        dashboards: [],
        currentDashboard: null,
        currentSheetId: null,
        globalDateRange: null
      };
      await writeDataFile('dashboards.json', defaultDashboards);
    }
    
    console.log('✅ Data storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize data storage:', error);
  }
}
