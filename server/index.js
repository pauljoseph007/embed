import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initializeDefaultData,
  getUsers,
  saveUsers,
  addUser,
  updateUser,
  deleteUser,
  findUser,
  createSession,
  getSession,
  deleteSession,
  getDashboards,
  saveDashboards,
  addDashboard,
  updateDashboard,
  deleteDashboard
} from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:8085',
    'https://portal.sdxpartners.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Initialize data storage on startup
initializeDefaultData();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION || '1.0.0'
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const userResult = await findUser(email, password);

    if (!userResult) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const { user, type, dashboardId } = userResult;

    // Create session
    const session = await createSession(user.id, user.email);

    // Update last login
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    if (type === 'system') {
      await updateUser(user.id, { lastLogin: updatedUser.lastLogin }, 'systemUsers');
    } else if (type === 'admin') {
      await updateUser(user.id, { lastLogin: updatedUser.lastLogin }, 'adminUsers');
    }

    // Get accessible dashboards
    const dashboardData = await getDashboards();
    let accessibleDashboards = [];

    if (user.role === 'admin') {
      accessibleDashboards = dashboardData.dashboards;
    } else if (type === 'dashboard') {
      accessibleDashboards = dashboardData.dashboards.filter(d => d.id === dashboardId);
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        dashboardAccess: accessibleDashboards.map(d => d.id)
      },
      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt
      },
      dashboards: accessibleDashboards
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.get('/api/auth/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getSession(sessionId);

    if (!session) {
      return res.status(401).json({
        error: 'Invalid or expired session'
      });
    }

    // Find user by session
    const userResult = await findUser(session.email, null);
    if (!userResult) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const { user, type, dashboardId } = userResult;

    // Get accessible dashboards
    const dashboardData = await getDashboards();
    let accessibleDashboards = [];

    if (user.role === 'admin') {
      accessibleDashboards = dashboardData.dashboards;
    } else if (type === 'dashboard') {
      accessibleDashboards = dashboardData.dashboards.filter(d => d.id === dashboardId);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        dashboardAccess: accessibleDashboards.map(d => d.id)
      },
      dashboards: accessibleDashboards
    });

  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// User management endpoints
app.post('/api/users', async (req, res) => {
  try {
    console.log('📝 User creation request received:', req.body);
    const { user, type = 'adminUsers' } = req.body;

    if (!user || !user.email || !user.password || !user.name) {
      console.log('❌ User data validation failed:', user);
      return res.status(400).json({
        error: 'User data is incomplete'
      });
    }

    const newUser = {
      id: `${type === 'adminUsers' ? 'admin' : 'user'}-${Date.now()}`,
      ...user,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const createdUser = await addUser(newUser, type);
    console.log('✅ User created successfully:', createdUser);

    res.json({
      success: true,
      user: createdUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { updates, type = 'adminUsers' } = req.body;

    const updatedUser = await updateUser(userId, updates, type);

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'adminUsers' } = req.body;

    await deleteUser(userId, type);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const userData = await getUsers();

    res.json({
      success: true,
      users: userData
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message
    });
  }
});

// Dashboard management endpoints
app.get('/api/dashboards', async (req, res) => {
  try {
    const dashboardData = await getDashboards();

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({
      error: 'Failed to get dashboards',
      message: error.message
    });
  }
});

app.post('/api/dashboards', async (req, res) => {
  try {
    const { dashboard } = req.body;

    if (!dashboard || !dashboard.name) {
      return res.status(400).json({
        error: 'Dashboard data is incomplete'
      });
    }

    const newDashboard = {
      id: `dashboard-${Date.now()}`,
      ...dashboard,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      users: dashboard.users || [],
      isPublic: dashboard.isPublic || false
    };

    const createdDashboard = await addDashboard(newDashboard);

    res.json({
      success: true,
      dashboard: createdDashboard
    });

  } catch (error) {
    console.error('Create dashboard error:', error);
    res.status(500).json({
      error: 'Failed to create dashboard',
      message: error.message
    });
  }
});

app.put('/api/dashboards/:dashboardId', async (req, res) => {
  try {
    const { dashboardId } = req.params;
    const { updates } = req.body;

    const updatedDashboard = await updateDashboard(dashboardId, updates);

    res.json({
      success: true,
      dashboard: updatedDashboard
    });

  } catch (error) {
    console.error('Update dashboard error:', error);
    res.status(500).json({
      error: 'Failed to update dashboard',
      message: error.message
    });
  }
});

app.delete('/api/dashboards/:dashboardId', async (req, res) => {
  try {
    const { dashboardId } = req.params;

    await deleteDashboard(dashboardId);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({
      error: 'Failed to delete dashboard',
      message: error.message
    });
  }
});

app.post('/api/dashboards/sync', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Dashboard data is required'
      });
    }

    const success = await saveDashboards(data);

    if (success) {
      res.json({
        success: true,
        message: 'Dashboard data synced successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to sync dashboard data'
      });
    }

  } catch (error) {
    console.error('Sync dashboard error:', error);
    res.status(500).json({
      error: 'Failed to sync dashboard data',
      message: error.message
    });
  }
});

// Guest token endpoint
app.post('/api/get-guest-token', async (req, res) => {
  try {
    const { embedId, embedType, dashboardId, chartId } = req.body;

    if (!embedId && !dashboardId && !chartId) {
      return res.status(400).json({
        error: 'Missing required parameters: embedId, dashboardId, or chartId'
      });
    }

    const supersetUrl = process.env.NEXT_PUBLIC_SUPERSET_URL;
    const adminToken = process.env.SUPERSET_ADMIN_TOKEN;

    if (!supersetUrl || !adminToken) {
      console.error('Missing Superset configuration:', {
        hasUrl: !!supersetUrl,
        hasToken: !!adminToken
      });
      return res.status(500).json({
        error: 'Superset configuration missing'
      });
    }

    // Determine resource type and ID
    let resourceType = embedType || 'dashboard';
    let resourceId = embedId || dashboardId || chartId;

    // Superset only supports guest tokens for dashboards, not individual charts
    // Force all requests to use dashboard type for guest token compatibility
    if (!embedType) {
      resourceType = 'dashboard'; // Always use dashboard for guest tokens
    } else if (embedType === 'chart') {
      // Log warning but continue with dashboard type
      console.warn('Chart embedding requested, but Superset guest tokens only support dashboards. Converting to dashboard type.');
      resourceType = 'dashboard';
    }

    console.log('Requesting guest token for:', {
      resourceType,
      resourceId,
      supersetUrl
    });

    // Prepare guest token request
    const guestTokenRequest = {
      user: {
        username: 'guest_user',
        first_name: 'Guest',
        last_name: 'User'
      },
      resources: [{
        type: resourceType,
        id: resourceId
      }],
      rls: [] // Row Level Security rules - empty for now
    };

    // Request guest token from Superset
    const response = await fetch(`${supersetUrl}/api/v1/security/guest_token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(guestTokenRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Superset guest token request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return res.status(response.status).json({
        error: `Superset API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const tokenData = await response.json();
    
    console.log('Guest token obtained successfully:', {
      hasToken: !!tokenData.token,
      expiresAt: tokenData.expires_at
    });

    res.json({
      token: tokenData.token,
      expires_at: tokenData.expires_at,
      resource_type: resourceType,
      resource_id: resourceId
    });

  } catch (error) {
    console.error('Error in guest token endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Test Superset connection endpoint
app.get('/api/test-superset-connection', async (req, res) => {
  try {
    const supersetUrl = process.env.NEXT_PUBLIC_SUPERSET_URL;
    const adminToken = process.env.SUPERSET_ADMIN_TOKEN;

    if (!supersetUrl || !adminToken) {
      return res.status(500).json({
        error: 'Superset configuration missing'
      });
    }

    // Test basic connectivity
    const response = await fetch(`${supersetUrl}/api/v1/security/csrf_token/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'connected',
        superset_url: supersetUrl,
        csrf_token: !!data.result
      });
    } else {
      res.status(response.status).json({
        error: `Connection failed: ${response.status} ${response.statusText}`
      });
    }
  } catch (error) {
    console.error('Superset connection test failed:', error);
    res.status(500).json({
      error: 'Connection test failed',
      message: error.message
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Superset URL: ${process.env.NEXT_PUBLIC_SUPERSET_URL}`);
  console.log(`🔑 Admin token configured: ${!!process.env.SUPERSET_ADMIN_TOKEN}`);
});

export default app;
