import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import storageService from '../services/storageService';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ChartTile {
  id: string;
  title: string;
  type: 'chart' | 'dashboard' | 'text' | 'textbox' | 'line' | 'shape' | 'image' | 'kpi';
  embedType?: 'chart' | 'dashboard';
  embedId?: string;
  srcUrl?: string;
  content?: {
    text?: string;
    html?: string;
    imageUrl?: string;
    shapeType?: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line';
    orientation?: 'horizontal' | 'vertical' | 'diagonal';
    kpiValue?: number;
    kpiLabel?: string;
    kpiTarget?: number;
    kpiFormat?: 'number' | 'percentage' | 'currency';
  };
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  uiConfig: {
    showLegend?: boolean;
    showTitle: boolean;
    backgroundColor: string;
    borderRadius: number;
    theme: string;
    titleSize?: string;
    titleColor?: string;
    showBorder?: boolean;
    borderColor?: string;
    padding?: number;
    opacity?: number;
    shadow?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    textColor?: string;
    shapeColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
  };
  demoMode?: boolean;
  clientName?: string;
  dashboardUuid?: string;
}

export interface DashboardSheet {
  id: string;
  name: string;
  tiles: ChartTile[];
}

export interface DashboardUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'viewer' | 'editor';
  createdAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  theme: string;
  sheets: DashboardSheet[];
  createdAt: string;
  lastModified: string;
  users: DashboardUser[]; // Dashboard-specific users
  isPublic: boolean; // Whether dashboard is publicly accessible
}

interface DashboardStore {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  currentSheetId: string | null;
  themes: string[];

  // Global date range filter
  globalDateRange: { from: Date; to: Date } | null;
  
  // Actions
  createDashboard: (name: string, theme: string) => Dashboard;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  
  // Sheet actions
  addSheet: (dashboardId: string, name?: string) => DashboardSheet;
  updateSheet: (dashboardId: string, sheetId: string, updates: Partial<DashboardSheet>) => void;
  deleteSheet: (dashboardId: string, sheetId: string) => void;
  duplicateSheet: (dashboardId: string, sheetId: string) => void;
  setCurrentSheet: (sheetId: string) => void;
  
  // Tile actions
  addTile: (dashboardId: string, sheetId: string, tile: Omit<ChartTile, 'id'>) => void;
  updateTile: (dashboardId: string, sheetId: string, tileId: string, updates: Partial<ChartTile>) => void;
  deleteTile: (dashboardId: string, sheetId: string, tileId: string) => void;
  updateTileLayout: (dashboardId: string, sheetId: string, layouts: any[]) => void;

  // Dashboard user management
  addDashboardUser: (dashboardId: string, user: Omit<DashboardUser, 'id' | 'createdAt'>) => void;
  removeDashboardUser: (dashboardId: string, userId: string) => void;
  updateDashboardUser: (dashboardId: string, userId: string, updates: Partial<DashboardUser>) => void;
  getDashboardsForUser: (email: string, password: string) => Dashboard[];
  setDashboardPublic: (dashboardId: string, isPublic: boolean) => void;

  // Demo data
  initializeDemoData: () => void;

  // Global date range filter
  setGlobalDateRange: (dateRange: { from: Date; to: Date } | null) => void;

  // Backup and restore
  exportData: () => string;
  importData: (jsonData: string) => number;
  clearAllData: () => void;

  // Migration functions
  migrateDashboards: () => void;
}

const THEMES = [
  'cobalt-blue',
  'light',
  'dark',
  'gradient',
  'muted'
];

// Data validation functions
const validateDashboard = (dashboard: any): dashboard is Dashboard => {
  return (
    dashboard &&
    typeof dashboard.id === 'string' &&
    typeof dashboard.name === 'string' &&
    typeof dashboard.theme === 'string' &&
    Array.isArray(dashboard.sheets) &&
    typeof dashboard.createdAt === 'string' &&
    typeof dashboard.lastModified === 'string'
  );
};

const validateChartTile = (tile: any): tile is ChartTile => {
  if (!tile || typeof tile.id !== 'string' || typeof tile.title !== 'string' || typeof tile.type !== 'string') {
    return false;
  }

  // Validate layout
  if (!tile.layout ||
      typeof tile.layout.x !== 'number' ||
      typeof tile.layout.y !== 'number' ||
      typeof tile.layout.w !== 'number' ||
      typeof tile.layout.h !== 'number') {
    return false;
  }

  // Validate uiConfig
  if (!tile.uiConfig || typeof tile.uiConfig.showTitle !== 'boolean') {
    return false;
  }

  // Type-specific validation
  if (tile.type === 'chart' || tile.type === 'dashboard') {
    // Chart/dashboard tiles need embedType, embedId, srcUrl
    return typeof tile.embedType === 'string' &&
           typeof tile.embedId === 'string' &&
           typeof tile.srcUrl === 'string' &&
           typeof tile.uiConfig.showLegend === 'boolean';
  } else if (tile.type === 'text' || tile.type === 'textbox') {
    // Text and textbox tiles need content.text
    return tile.content && typeof tile.content.text === 'string';
  } else if (tile.type === 'line') {
    // Line tiles need content.orientation
    return tile.content && typeof tile.content.orientation === 'string';
  } else if (tile.type === 'shape') {
    // Shape tiles need content.shapeType
    return tile.content && typeof tile.content.shapeType === 'string';
  } else if (tile.type === 'image') {
    // Image tiles need content.imageUrl
    return tile.content && typeof tile.content.imageUrl === 'string';
  } else if (tile.type === 'kpi') {
    // KPI tiles need content.kpiValue and kpiLabel
    return tile.content &&
           typeof tile.content.kpiValue === 'number' &&
           typeof tile.content.kpiLabel === 'string';
  }

  return false;
};

// Storage utilities
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      dashboards: [],
      currentDashboard: null,
      currentSheetId: null,
      themes: THEMES,
      globalDateRange: null, // Initialize global date range filter
      
      createDashboard: (name: string, theme: string) => {
        try {
          const timestamp = Date.now();
          const newDashboard: Dashboard = {
            id: `dashboard-${timestamp}`,
            name: name.trim(),
            theme,
            sheets: [{
              id: `sheet-${timestamp}`,
              name: 'Sheet 1',
              tiles: []
            }],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            users: [],
            isPublic: false
          };

          if (!validateDashboard(newDashboard)) {
            throw new Error('Invalid dashboard data');
          }

          set(state => ({
            ...state,
            dashboards: [...state.dashboards, newDashboard]
          }));

          // Sync to file storage
          setTimeout(() => {
            get().syncToFileStorage();
          }, 100);

          return newDashboard;
        } catch (error) {
          console.error('Failed to create dashboard:', error);
          throw error;
        }
      },
      
      updateDashboard: (id: string, updates: Partial<Dashboard>) => {
        try {
          set(state => {
            const updatedDashboards = state.dashboards.map(d => {
              if (d.id === id) {
                const updated = { ...d, ...updates, lastModified: new Date().toISOString() };
                if (!validateDashboard(updated)) {
                  throw new Error('Invalid dashboard update data');
                }
                return updated;
              }
              return d;
            });

            const updatedCurrentDashboard = state.currentDashboard?.id === id
              ? { ...state.currentDashboard, ...updates, lastModified: new Date().toISOString() }
              : state.currentDashboard;

            return {
              dashboards: updatedDashboards,
              currentDashboard: updatedCurrentDashboard
            };
          });

          // Sync to file storage
          setTimeout(() => {
            get().syncToFileStorage();
          }, 100);
        } catch (error) {
          console.error('Failed to update dashboard:', error);
          throw error;
        }
      },
      
      deleteDashboard: (id: string) => {
        try {
          set(state => {
            const updatedDashboards = state.dashboards.filter(d => d.id !== id);
            const updatedCurrentDashboard = state.currentDashboard?.id === id ? null : state.currentDashboard;

            return {
              dashboards: updatedDashboards,
              currentDashboard: updatedCurrentDashboard
            };
          });
        } catch (error) {
          console.error('Failed to delete dashboard:', error);
          throw error;
        }
      },
      
      setCurrentDashboard: (dashboard: Dashboard | null) => {
        set({
          currentDashboard: dashboard,
          currentSheetId: dashboard?.sheets[0]?.id || null
        });
      },
      
      addSheet: (dashboardId: string, name?: string) => {
        const timestamp = Date.now();
        const dashboards = get().dashboards;
        const dashboard = dashboards.find(d => d.id === dashboardId);
        const sheetCount = dashboard?.sheets.length || 0;
        
        const newSheet: DashboardSheet = {
          id: `sheet-${timestamp}`,
          name: name || `Sheet ${sheetCount + 1}`,
          tiles: []
        };
        
        get().updateDashboard(dashboardId, {
          sheets: [...(dashboard?.sheets || []), newSheet]
        });
        
        return newSheet;
      },
      
      updateSheet: (dashboardId: string, sheetId: string, updates: Partial<DashboardSheet>) => {
        const dashboard = get().dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;
        
        const updatedSheets = dashboard.sheets.map(sheet =>
          sheet.id === sheetId ? { ...sheet, ...updates } : sheet
        );
        
        get().updateDashboard(dashboardId, { sheets: updatedSheets });
      },
      
      deleteSheet: (dashboardId: string, sheetId: string) => {
        const dashboard = get().dashboards.find(d => d.id === dashboardId);
        if (!dashboard || dashboard.sheets.length <= 1) return;

        const updatedSheets = dashboard.sheets.filter(sheet => sheet.id !== sheetId);
        get().updateDashboard(dashboardId, { sheets: updatedSheets });

        if (get().currentSheetId === sheetId) {
          set({ currentSheetId: updatedSheets[0]?.id || null });
        }
      },

      duplicateSheet: (dashboardId: string, sheetId: string) => {
        const dashboard = get().dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;

        const sourceSheet = dashboard.sheets.find(s => s.id === sheetId);
        if (!sourceSheet) return;

        const timestamp = Date.now();
        const duplicatedSheet: DashboardSheet = {
          id: `sheet-${timestamp}`,
          name: `${sourceSheet.name} Copy`,
          tiles: sourceSheet.tiles.map(tile => ({
            ...tile,
            id: `tile-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            layout: {
              ...tile.layout,
              // Offset the position slightly to avoid overlap
              x: Math.min(tile.layout.x + 2, 20),
              y: Math.min(tile.layout.y + 1, 20)
            }
          }))
        };

        const updatedSheets = [...dashboard.sheets, duplicatedSheet];
        get().updateDashboard(dashboardId, { sheets: updatedSheets });

        // Switch to the new duplicated sheet
        set({ currentSheetId: duplicatedSheet.id });
      },
      
      setCurrentSheet: (sheetId: string) => {
        set({ currentSheetId: sheetId });
      },
      
      addTile: (dashboardId: string, sheetId: string, tile: Omit<ChartTile, 'id'>) => {
        try {
          const newTile: ChartTile = {
            ...tile,
            id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          };

          if (!validateChartTile(newTile)) {
            throw new Error('Invalid tile data');
          }

          const dashboard = get().dashboards.find(d => d.id === dashboardId);
          if (!dashboard) {
            throw new Error('Dashboard not found');
          }

          const updatedSheets = dashboard.sheets.map(sheet =>
            sheet.id === sheetId
              ? { ...sheet, tiles: [...sheet.tiles, newTile] }
              : sheet
          );

          get().updateDashboard(dashboardId, { sheets: updatedSheets });
          return newTile;
        } catch (error) {
          console.error('Failed to add tile:', error);
          throw error;
        }
      },
      
      updateTile: (dashboardId: string, sheetId: string, tileId: string, updates: Partial<ChartTile>) => {
        const dashboard = get().dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;
        
        const updatedSheets = dashboard.sheets.map(sheet =>
          sheet.id === sheetId 
            ? {
                ...sheet,
                tiles: sheet.tiles.map(tile =>
                  tile.id === tileId ? { ...tile, ...updates } : tile
                )
              }
            : sheet
        );
        
        get().updateDashboard(dashboardId, { sheets: updatedSheets });
      },
      
      deleteTile: (dashboardId: string, sheetId: string, tileId: string) => {
        const dashboard = get().dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;
        
        const updatedSheets = dashboard.sheets.map(sheet =>
          sheet.id === sheetId 
            ? { ...sheet, tiles: sheet.tiles.filter(tile => tile.id !== tileId) }
            : sheet
        );
        
        get().updateDashboard(dashboardId, { sheets: updatedSheets });
      },
      
      updateTileLayout: (dashboardId: string, sheetId: string, layouts: any[]) => {
        const dashboard = get().dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;
        
        const updatedSheets = dashboard.sheets.map(sheet => {
          if (sheet.id !== sheetId) return sheet;
          
          const updatedTiles = sheet.tiles.map(tile => {
            const layout = layouts.find(l => l.i === tile.id);
            return layout 
              ? { ...tile, layout: { x: layout.x, y: layout.y, w: layout.w, h: layout.h } }
              : tile;
          });
          
          return { ...sheet, tiles: updatedTiles };
        });
        
        get().updateDashboard(dashboardId, { sheets: updatedSheets });
      },

      // Dashboard user management
      addDashboardUser: (dashboardId: string, user: Omit<DashboardUser, 'id' | 'createdAt'>) => {
        set(state => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return state;

          // Ensure users array exists (for backward compatibility)
          if (!dashboard.users) {
            dashboard.users = [];
          }

          const newUser: DashboardUser = {
            ...user,
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
          };

          console.log('Adding dashboard user:', newUser);

          const updatedDashboard = {
            ...dashboard,
            users: [...dashboard.users, newUser],
            lastModified: new Date().toISOString()
          };

          return {
            ...state,
            dashboards: state.dashboards.map(d =>
              d.id === dashboardId ? updatedDashboard : d
            ),
            currentDashboard: state.currentDashboard?.id === dashboardId ? updatedDashboard : state.currentDashboard
          };
        });
      },

      removeDashboardUser: (dashboardId: string, userId: string) => {
        set(state => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return state;

          // Ensure users array exists (for backward compatibility)
          if (!dashboard.users) {
            dashboard.users = [];
          }

          const updatedDashboard = {
            ...dashboard,
            users: dashboard.users.filter(u => u.id !== userId),
            lastModified: new Date().toISOString()
          };

          return {
            ...state,
            dashboards: state.dashboards.map(d =>
              d.id === dashboardId ? updatedDashboard : d
            ),
            currentDashboard: state.currentDashboard?.id === dashboardId ? updatedDashboard : state.currentDashboard
          };
        });
      },

      updateDashboardUser: (dashboardId: string, userId: string, updates: Partial<DashboardUser>) => {
        set(state => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return state;

          // Ensure users array exists (for backward compatibility)
          if (!dashboard.users) {
            dashboard.users = [];
          }

          const updatedDashboard = {
            ...dashboard,
            users: dashboard.users.map(u =>
              u.id === userId ? { ...u, ...updates } : u
            ),
            lastModified: new Date().toISOString()
          };

          return {
            ...state,
            dashboards: state.dashboards.map(d =>
              d.id === dashboardId ? updatedDashboard : d
            ),
            currentDashboard: state.currentDashboard?.id === dashboardId ? updatedDashboard : state.currentDashboard
          };
        });
      },

      getDashboardsForUser: (email: string, password: string) => {
        const state = get();
        console.log('getDashboardsForUser called with:', email);
        console.log('Available dashboards:', state.dashboards.length);

        // Debug: Log all dashboard users
        state.dashboards.forEach(dashboard => {
          console.log(`Dashboard "${dashboard.name}" has ${dashboard.users.length} users:`);
          dashboard.users.forEach(user => {
            console.log(`  - ${user.email} (${user.name})`);
          });
        });

        const accessibleDashboards = state.dashboards.filter(dashboard => {
          // Check if dashboard is public
          if (dashboard.isPublic) {
            console.log(`Dashboard "${dashboard.name}" is public`);
            return true;
          }

          // Check if user has access to this dashboard
          const hasAccess = dashboard.users.some(user => {
            const emailMatch = user.email.toLowerCase().trim() === email.toLowerCase().trim();
            const passwordMatch = user.password.trim() === password.trim();
            console.log(`Checking user ${user.email} in dashboard ${dashboard.name}: email=${emailMatch}, password=${passwordMatch}`);
            return emailMatch && passwordMatch;
          });

          if (hasAccess) {
            console.log(`User ${email} has access to dashboard "${dashboard.name}"`);
          }

          return hasAccess;
        });

        console.log('Accessible dashboards:', accessibleDashboards.length);
        return accessibleDashboards;
      },

      setDashboardPublic: (dashboardId: string, isPublic: boolean) => {
        set(state => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return state;

          const updatedDashboard = {
            ...dashboard,
            isPublic,
            lastModified: new Date().toISOString()
          };

          return {
            ...state,
            dashboards: state.dashboards.map(d =>
              d.id === dashboardId ? updatedDashboard : d
            ),
            currentDashboard: state.currentDashboard?.id === dashboardId ? updatedDashboard : state.currentDashboard
          };
        });
      },

      initializeDemoData: () => {
        const existingDemo = get().dashboards.find(d => d.name === 'Demo Dashboard');
        if (existingDemo) return;

        const demoDashboard = get().createDashboard('Demo Dashboard', 'cobalt-blue');

        // Add demo dashboard users
        get().addDashboardUser(demoDashboard.id, {
          email: 'demo@sdxpartners.com',
          password: 'demo123',
          name: 'Demo User',
          role: 'viewer'
        });

        get().addDashboardUser(demoDashboard.id, {
          email: 'test@sdxpartners.com',
          password: 'test123',
          name: 'Test User',
          role: 'viewer'
        });
        
        // Add demo tiles
        const demoTiles: Omit<ChartTile, 'id'>[] = [
          {
            title: 'Sales Performance',
            type: 'chart', // Fix: Add required type field
            embedType: 'chart',
            embedId: 'demo-sales',
            srcUrl: 'https://superset.example.com/explore/p/demo-sales/',
            layout: { x: 0, y: 0, w: 6, h: 4 },
            uiConfig: {
              showLegend: true,
              showTitle: true,
              backgroundColor: 'transparent',
              borderRadius: 12,
              theme: 'cobalt-blue'
            },
            demoMode: true
          },
          {
            title: 'Revenue Trends',
            type: 'chart', // Fix: Add required type field
            embedType: 'chart',
            embedId: 'demo-revenue',
            srcUrl: 'https://superset.example.com/explore/p/demo-revenue/',
            layout: { x: 6, y: 0, w: 6, h: 4 },
            uiConfig: {
              showLegend: true,
              showTitle: true,
              backgroundColor: 'transparent',
              borderRadius: 12,
              theme: 'cobalt-blue'
            },
            demoMode: true
          },
          {
            title: 'Customer Analytics',
            type: 'chart', // Fix: Add required type field
            embedType: 'chart',
            embedId: 'demo-customers',
            srcUrl: 'https://superset.example.com/explore/p/demo-customers/',
            layout: { x: 0, y: 4, w: 8, h: 3 },
            uiConfig: {
              showLegend: false,
              showTitle: true,
              backgroundColor: 'card',
              borderRadius: 8,
              theme: 'cobalt-blue'
            },
            demoMode: true
          },
          {
            title: 'Key Metrics',
            type: 'dashboard', // Fix: Add required type field
            embedType: 'dashboard',
            embedId: 'demo-metrics',
            srcUrl: 'https://superset.example.com/dashboard/demo-metrics/',
            layout: { x: 8, y: 4, w: 4, h: 3 },
            uiConfig: {
              showLegend: false,
              showTitle: true,
              backgroundColor: 'transparent',
              borderRadius: 12,
              theme: 'cobalt-blue'
            },
            demoMode: true
          }
        ];
        
        demoTiles.forEach(tile => {
          get().addTile(demoDashboard.id, demoDashboard.sheets[0].id, tile);
        });
        
        // Add a second sheet
        const sheet2 = get().addSheet(demoDashboard.id, 'Analytics');
        get().addTile(demoDashboard.id, sheet2.id, {
          title: 'Marketing ROI',
          type: 'chart', // Fix: Add required type field
          embedType: 'chart',
          embedId: 'demo-marketing',
          srcUrl: 'https://superset.example.com/explore/p/demo-marketing/',
          layout: { x: 0, y: 0, w: 12, h: 6 },
          uiConfig: {
            showLegend: true,
            showTitle: true,
            backgroundColor: 'transparent',
            borderRadius: 12,
            theme: 'cobalt-blue'
          },
          demoMode: true
        });
      },

      // Global date range filter
      setGlobalDateRange: (dateRange: { from: Date; to: Date } | null) => {
        console.log('Setting global date range:', dateRange);
        set({ globalDateRange: dateRange });
      },

      // Backup and restore functionality
      exportData: () => {
        try {
          const state = get();
          const exportData = {
            dashboards: state.dashboards,
            version: 1,
            exportedAt: new Date().toISOString()
          };
          return JSON.stringify(exportData, null, 2);
        } catch (error) {
          console.error('Failed to export data:', error);
          throw error;
        }
      },

      importData: (jsonData: string) => {
        try {
          const importData = JSON.parse(jsonData);

          if (!importData.dashboards || !Array.isArray(importData.dashboards)) {
            throw new Error('Invalid import data format');
          }

          // Validate all dashboards
          const validDashboards = importData.dashboards.filter(validateDashboard);

          if (validDashboards.length !== importData.dashboards.length) {
            console.warn('Some dashboards were invalid and skipped during import');
          }

          set({
            dashboards: validDashboards,
            currentDashboard: null,
            currentSheetId: null
          });



          return validDashboards.length;
        } catch (error) {
          console.error('Failed to import data:', error);
          throw error;
        }
      },

      clearAllData: () => {
        try {
          set({
            dashboards: [],
            currentDashboard: null,
            currentSheetId: null
          });
          localStorage.removeItem('dashboard-store');
        } catch (error) {
          console.error('Failed to clear data:', error);
          throw error;
        }
      },

      // File-based storage sync methods
      syncToFileStorage: async () => {
        try {
          const state = get();
          const dashboardData = {
            dashboards: state.dashboards,
            currentDashboard: state.currentDashboard,
            currentSheetId: state.currentSheetId,
            globalDateRange: state.globalDateRange
          };

          // For now, we'll use a special endpoint to sync all dashboard data
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/dashboards/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: dashboardData }),
          });

          if (response.ok) {
            console.log('✅ Dashboard data synced to file storage');
          } else {
            console.error('❌ Failed to sync dashboard data to file storage');
          }
        } catch (error) {
          console.error('❌ Failed to sync dashboard data to file storage:', error);
        }
      },

      loadFromFileStorage: async () => {
        try {
          const response = await storageService.getDashboards();
          if (response.success && response.data) {
            set({
              dashboards: response.data.dashboards || [],
              currentDashboard: response.data.currentDashboard || null,
              currentSheetId: response.data.currentSheetId || null,
              globalDateRange: response.data.globalDateRange || null
            });
            console.log('✅ Dashboard data loaded from file storage');
            return true;
          }
        } catch (error) {
          console.error('❌ Failed to load dashboard data from file storage:', error);
        }
        return false;
      },

      // Migration functions
      migrateDashboards: () => {
        set(state => {
          const migratedDashboards = state.dashboards.map(dashboard => {
            // Ensure users array exists
            if (!dashboard.users) {
              console.log(`Migrating dashboard ${dashboard.name} - adding users array`);
              return {
                ...dashboard,
                users: []
              };
            }
            return dashboard;
          });

          return {
            ...state,
            dashboards: migratedDashboards
          };
        });
      }
    }),
    {
      name: 'dashboard-store',
      version: 1,
      partialize: (state) => ({
        dashboards: state.dashboards,
        currentDashboard: state.currentDashboard,
        currentSheetId: state.currentSheetId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Rehydrating dashboard store with', state.dashboards?.length || 0, 'dashboards');

          // Run migration first
          state.migrateDashboards();

          // Try to load from file storage first
          setTimeout(async () => {
            try {
              const loaded = await useDashboardStore.getState().loadFromFileStorage();
              if (!loaded) {
                // Fallback to localStorage data if file storage fails
                const validDashboards = state.dashboards?.filter(validateDashboard) || [];
                if (validDashboards.length !== (state.dashboards?.length || 0)) {
                  console.warn('Some dashboards were invalid and removed during rehydration');
                  useDashboardStore.setState({ dashboards: validDashboards });
                }

                // Initialize demo data if no dashboards exist
                if (validDashboards.length === 0) {
                  console.log('No dashboards found, initializing demo data');
                  useDashboardStore.getState().initializeDemoData();
                }
              }
            } catch (error) {
              console.error('Failed to load from file storage, using localStorage data:', error);

              // Validate data on rehydration
              const validDashboards = state.dashboards?.filter(validateDashboard) || [];
              if (validDashboards.length !== (state.dashboards?.length || 0)) {
                console.warn('Some dashboards were invalid and removed during rehydration');
                useDashboardStore.setState({ dashboards: validDashboards });
              }

              // Initialize demo data if no dashboards exist
              if (validDashboards.length === 0) {
                console.log('No dashboards found, initializing demo data');
                useDashboardStore.getState().initializeDemoData();
              }
            }
          }, 500);
        }
      }
    }
  )
);

// Initialize demo data on first load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const store = useDashboardStore.getState();
    if (store.dashboards.length === 0) {
      console.log('Initializing demo data on first load');
      store.initializeDemoData();
    }
  }, 500);
}