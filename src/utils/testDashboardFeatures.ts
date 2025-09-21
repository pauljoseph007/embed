// Dashboard feature testing utilities
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export class DashboardFeatureTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    console.log('🧪 Starting Dashboard Feature Tests...');
    
    // Test authentication
    await this.testAuthentication();
    
    // Test dashboard creation
    await this.testDashboardCreation();
    
    // Test sheet management
    await this.testSheetManagement();
    
    // Test tile management
    await this.testTileManagement();
    
    // Test user management
    await this.testUserManagement();
    
    // Test data persistence
    await this.testDataPersistence();
    
    console.log('✅ Dashboard Feature Tests Complete');
    console.table(this.results);
    
    return this.results;
  }

  private async testAuthentication(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      
      // Test admin login
      const adminResult = await authStore.loginToDashboard('admin@sdxpartners.com', 'admin123');
      
      if (adminResult.success && adminResult.user?.role === 'admin') {
        this.addResult('Admin Authentication', true, { user: adminResult.user.name });
      } else {
        this.addResult('Admin Authentication', false, 'Admin login failed');
      }
      
      // Test logout
      authStore.logout();
      if (!authStore.isAuthenticated) {
        this.addResult('Logout', true);
      } else {
        this.addResult('Logout', false, 'User still authenticated after logout');
      }
      
    } catch (error) {
      this.addResult('Authentication', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testDashboardCreation(): Promise<void> {
    try {
      const dashboardStore = useDashboardStore.getState();
      const initialCount = dashboardStore.dashboards.length;
      
      // Create test dashboard
      const testDashboard = dashboardStore.createDashboard('Test Dashboard', 'cobalt-blue');
      
      if (testDashboard && dashboardStore.dashboards.length === initialCount + 1) {
        this.addResult('Dashboard Creation', true, { 
          id: testDashboard.id, 
          name: testDashboard.name 
        });
      } else {
        this.addResult('Dashboard Creation', false, 'Dashboard not created properly');
      }
      
    } catch (error) {
      this.addResult('Dashboard Creation', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testSheetManagement(): Promise<void> {
    try {
      const dashboardStore = useDashboardStore.getState();
      const testDashboard = dashboardStore.dashboards.find(d => d.name === 'Test Dashboard');
      
      if (!testDashboard) {
        this.addResult('Sheet Management', false, 'Test dashboard not found');
        return;
      }
      
      const initialSheetCount = testDashboard.sheets.length;
      
      // Add new sheet
      const newSheet = dashboardStore.addSheet(testDashboard.id, 'Test Sheet');
      const updatedDashboard = dashboardStore.dashboards.find(d => d.id === testDashboard.id);
      
      if (newSheet && updatedDashboard && updatedDashboard.sheets.length === initialSheetCount + 1) {
        this.addResult('Sheet Creation', true, { sheetId: newSheet.id, name: newSheet.name });
        
        // Test sheet deletion
        dashboardStore.deleteSheet(testDashboard.id, newSheet.id);
        const finalDashboard = dashboardStore.dashboards.find(d => d.id === testDashboard.id);
        
        if (finalDashboard && finalDashboard.sheets.length === initialSheetCount) {
          this.addResult('Sheet Deletion', true);
        } else {
          this.addResult('Sheet Deletion', false, 'Sheet not deleted properly');
        }
      } else {
        this.addResult('Sheet Creation', false, 'Sheet not created properly');
      }
      
    } catch (error) {
      this.addResult('Sheet Management', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testTileManagement(): Promise<void> {
    try {
      const dashboardStore = useDashboardStore.getState();
      const testDashboard = dashboardStore.dashboards.find(d => d.name === 'Test Dashboard');
      
      if (!testDashboard || testDashboard.sheets.length === 0) {
        this.addResult('Tile Management', false, 'Test dashboard or sheet not found');
        return;
      }
      
      const sheet = testDashboard.sheets[0];
      const initialTileCount = sheet.tiles.length;
      
      // Add test tile
      const testTile = {
        title: 'Test Chart',
        type: 'chart' as const,
        embedType: 'chart' as const,
        embedId: 'test-chart',
        srcUrl: 'https://example.com/chart',
        layout: { x: 0, y: 0, w: 6, h: 4 },
        uiConfig: {
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 8,
          theme: 'cobalt-blue'
        },
        demoMode: true
      };
      
      dashboardStore.addTile(testDashboard.id, sheet.id, testTile);
      const updatedDashboard = dashboardStore.dashboards.find(d => d.id === testDashboard.id);
      const updatedSheet = updatedDashboard?.sheets.find(s => s.id === sheet.id);
      
      if (updatedSheet && updatedSheet.tiles.length === initialTileCount + 1) {
        this.addResult('Tile Creation', true, { tileCount: updatedSheet.tiles.length });
        
        // Test tile deletion
        const addedTile = updatedSheet.tiles[updatedSheet.tiles.length - 1];
        dashboardStore.deleteTile(testDashboard.id, sheet.id, addedTile.id);
        
        const finalDashboard = dashboardStore.dashboards.find(d => d.id === testDashboard.id);
        const finalSheet = finalDashboard?.sheets.find(s => s.id === sheet.id);
        
        if (finalSheet && finalSheet.tiles.length === initialTileCount) {
          this.addResult('Tile Deletion', true);
        } else {
          this.addResult('Tile Deletion', false, 'Tile not deleted properly');
        }
      } else {
        this.addResult('Tile Creation', false, 'Tile not created properly');
      }
      
    } catch (error) {
      this.addResult('Tile Management', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testUserManagement(): Promise<void> {
    try {
      const dashboardStore = useDashboardStore.getState();
      const testDashboard = dashboardStore.dashboards.find(d => d.name === 'Test Dashboard');
      
      if (!testDashboard) {
        this.addResult('User Management', false, 'Test dashboard not found');
        return;
      }
      
      const initialUserCount = testDashboard.users.length;
      
      // Add test user
      const testUser = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        role: 'viewer' as const
      };
      
      dashboardStore.addDashboardUser(testDashboard.id, testUser);
      const updatedDashboard = dashboardStore.dashboards.find(d => d.id === testDashboard.id);
      
      if (updatedDashboard && updatedDashboard.users.length === initialUserCount + 1) {
        this.addResult('User Addition', true, { userCount: updatedDashboard.users.length });

        // Test dashboard user authentication
        try {
          const { useAuthStore } = await import('../store/authStore');
          const authStore = useAuthStore.getState();

          const loginResult = await authStore.loginToDashboard(testUser.email, testUser.password);
          if (loginResult.success && loginResult.user) {
            this.addResult('Dashboard User Authentication', true, {
              userEmail: loginResult.user.email,
              dashboardAccess: loginResult.dashboards?.length || 0
            });

            // Logout to clean up
            authStore.logout();
          } else {
            this.addResult('Dashboard User Authentication', false, 'Login failed for dashboard user');
          }
        } catch (authError) {
          this.addResult('Dashboard User Authentication', false, `Auth error: ${authError}`);
        }

        // Test user removal
        const addedUser = updatedDashboard.users[updatedDashboard.users.length - 1];
        dashboardStore.removeDashboardUser(testDashboard.id, addedUser.id);
        
        const finalDashboard = dashboardStore.dashboards.find(d => d.id === testDashboard.id);
        if (finalDashboard && finalDashboard.users.length === initialUserCount) {
          this.addResult('User Removal', true);
        } else {
          this.addResult('User Removal', false, 'User not removed properly');
        }
      } else {
        this.addResult('User Addition', false, 'User not added properly');
      }
      
    } catch (error) {
      this.addResult('User Management', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testDataPersistence(): Promise<void> {
    try {
      const dashboardStore = useDashboardStore.getState();
      
      // Test export
      const exportData = dashboardStore.exportData();
      if (exportData && exportData.length > 0) {
        this.addResult('Data Export', true, { dataSize: exportData.length });
        
        // Test import
        const importResult = dashboardStore.importData(exportData);
        if (importResult >= 0) {
          this.addResult('Data Import', true, { importedCount: importResult });
        } else {
          this.addResult('Data Import', false, 'Import failed');
        }
      } else {
        this.addResult('Data Export', false, 'Export failed or empty');
      }
      
    } catch (error) {
      this.addResult('Data Persistence', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private addResult(testName: string, passed: boolean, details?: any): void {
    this.results.push({
      testName,
      passed,
      error: passed ? undefined : (typeof details === 'string' ? details : 'Test failed'),
      details: passed ? details : undefined
    });
  }
}

// Export singleton instance
export const dashboardTester = new DashboardFeatureTester();
