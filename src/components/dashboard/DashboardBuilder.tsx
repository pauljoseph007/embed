import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Save, Eye, Grid, Trash2, Edit2, ArrowLeft, Home, Users } from 'lucide-react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardStore, Dashboard } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore'; // Add auth store import
import { SheetTabs } from './SheetTabs';
import { ChartTile } from './ChartTile';
import { AddChartPanel } from './AddChartPanel';
import { AddDashboardPanel } from './AddDashboardPanel';
import { AddElementPanel } from './AddElementPanel';
import { CustomizationPanel } from './CustomizationPanel';
import DashboardUserManagement from './DashboardUserManagement';
import { ThemeSelector } from './ThemeSelector';
import { DateRangeFilter } from './DateRangeFilter';
import { DashboardThemeProvider } from '@/components/theme/DashboardThemeProvider';
import { toast } from '@/hooks/use-toast';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBuilderProps {
  dashboard: Dashboard;
}

export const DashboardBuilder = ({ dashboard }: DashboardBuilderProps) => {
  const {
    currentSheetId,
    setCurrentSheet,
    addSheet,
    updateSheet,
    deleteSheet,
    duplicateSheet,
    updateTileLayout,
    deleteTile,
    updateDashboard,
    setCurrentDashboard,
    globalDateRange,
    setGlobalDateRange
  } = useDashboardStore();

  // Add user role checking
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddChart, setShowAddChart] = useState(false);
  const [showAddDashboard, setShowAddDashboard] = useState(false);
  const [showAddElement, setShowAddElement] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const currentSheet = dashboard.sheets.find(s => s.id === currentSheetId) || dashboard.sheets[0];

  useEffect(() => {
    if (!currentSheetId && dashboard.sheets.length > 0) {
      setCurrentSheet(dashboard.sheets[0].id);
    }
  }, [dashboard.sheets, currentSheetId, setCurrentSheet]);

  const handleLayoutChange = (layouts: Layout[]) => {
    if (!currentSheet || isPreviewMode || isDragging || isResizing) return;
    updateTileLayout(dashboard.id, currentSheet.id, layouts);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setShowGrid(true);
  };

  const handleDragStop = (layout: Layout[]) => {
    setIsDragging(false);
    setShowGrid(false);
    if (currentSheet && !isPreviewMode) {
      updateTileLayout(dashboard.id, currentSheet.id, layout);
      toast({
        title: "Chart moved",
        description: "Chart position updated successfully.",
      });
    }
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    setShowGrid(true);
  };

  const handleResizeStop = (layout: Layout[]) => {
    setIsResizing(false);
    setShowGrid(false);
    if (currentSheet && !isPreviewMode) {
      updateTileLayout(dashboard.id, currentSheet.id, layout);
      toast({
        title: "Chart resized",
        description: "Chart size updated successfully.",
      });
    }
  };

  const handleAddSheet = () => {
    const newSheet = addSheet(dashboard.id);
    setCurrentSheet(newSheet.id);
    toast({
      title: "Sheet Added",
      description: `${newSheet.name} has been created.`
    });
  };

  const handleSave = () => {
    updateDashboard(dashboard.id, { lastModified: new Date().toISOString() });
    toast({
      title: "Dashboard Saved",
      description: "All changes have been saved successfully."
    });
  };

  const handleBackToAdmin = () => {
    setCurrentDashboard(null);
  };

  const handleDeleteTile = (tileId: string) => {
    if (!currentSheet) return;
    deleteTile(dashboard.id, currentSheet.id, tileId);
    setSelectedTileId(null);
    toast({
      title: "Chart Removed",
      description: "The chart has been removed from the dashboard."
    });
  };

  const gridLayouts = currentSheet?.tiles.map(tile => ({
    i: tile.id,
    x: tile.layout.x,
    y: tile.layout.y,
    w: tile.layout.w,
    h: tile.layout.h,
    minW: 4,
    minH: 3,
    maxW: 24,
    maxH: 20
  })) || [];

  return (
    <DashboardThemeProvider theme={dashboard.theme as any} className="min-h-screen">
      <div className="flex min-h-screen bg-background">
        {/* Main Canvas Area - Full Screen */}
        <div className="flex-1 flex flex-col">
        {/* Compact Toolbar */}
        <div className="bg-card border-b border-border px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToAdmin}
                className="gap-2 h-8"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="h-5 w-px bg-border" />
              <h1 className="text-lg font-semibold text-foreground truncate max-w-xs">
                {dashboard.name}
              </h1>
              <ThemeSelector
                currentTheme={dashboard.theme}
                onThemeChange={(theme) => updateDashboard(dashboard.id, { theme })}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Show Grid and Preview buttons for all users */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  disabled={isPreviewMode}
                  className={`h-8 ${showGrid ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <Grid className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="h-8"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{isPreviewMode ? 'Edit' : 'Preview'}</span>
                </Button>
              )}

              {/* Hide all editing controls for non-admin users */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddChart(true)}
                  disabled={isPreviewMode}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Add Chart</span>
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDashboard(true)}
                  disabled={isPreviewMode}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Add Dashboard</span>
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddElement(true)}
                  disabled={isPreviewMode}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Add Element</span>
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserManagement(true)}
                  className="h-8"
                >
                  <Users className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Manage Users</span>
                </Button>
              )}

              {isAdmin && (
                <Button size="sm" onClick={handleSave} className="h-8">
                  <Save className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sheet Tabs */}
        <SheetTabs
          sheets={dashboard.sheets}
          currentSheetId={currentSheetId || ''}
          onSheetChange={setCurrentSheet}
          onAddSheet={isAdmin ? handleAddSheet : undefined} // Hide add sheet for non-admin
          onDeleteSheet={isAdmin ? (sheetId) => deleteSheet(dashboard.id, sheetId) : undefined} // Hide delete sheet for non-admin
          onRenameSheet={isAdmin ? (sheetId, name) => updateSheet(dashboard.id, sheetId, { name }) : undefined} // Hide rename sheet for non-admin
          onDuplicateSheet={isAdmin ? (sheetId) => duplicateSheet(dashboard.id, sheetId) : undefined} // Hide duplicate sheet for non-admin
          disabled={!isAdmin || isPreviewMode} // Disable for non-admin users
        />

        {/* Sheet-Specific Date Range Filter - Enhanced with RECORDDATE support */}
        <div className="px-4 py-2 bg-card/50 border-b border-border/50">
          <div className="flex items-center justify-center gap-2">
            <div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-md">
              🗓️ Sheet-Specific RECORDDATE Filter
            </div>
            <DateRangeFilter
              useGlobalState={true}
              sheetId={currentSheet?.id}
              className="justify-center"
            />
          </div>
        </div>

        {/* Full-Screen Canvas */}
        <div className="flex-1 relative">
          {currentSheet ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSheet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {currentSheet.tiles.length === 0 ? (
                  <div className="min-h-full flex items-center justify-center bg-gradient-subtle">
                    <div className="text-center">
                      <Grid className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        Empty Canvas
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-md">
                        Start building your Power BI-style dashboard by adding charts and visualizations
                      </p>
                      {isAdmin && (
                        <Button onClick={() => setShowAddChart(true)} size="lg">
                          <Plus className="h-5 w-5 mr-2" />
                          Add Your First Chart
                        </Button>
                      )}
                      {!isAdmin && (
                        <p className="text-muted-foreground">
                          This dashboard is in view-only mode. Contact your administrator to add content.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-4 overflow-x-auto overflow-y-auto" style={{ minHeight: 'calc(100vh - 200px)', minWidth: 'fit-content' }}>
                    <div style={{ minWidth: '1200px' }}>
                      <ResponsiveGridLayout
                        className={`layout ${showGrid ? 'show-grid' : ''}`}
                        layouts={{ lg: gridLayouts }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
                        rowHeight={40}
                        isDraggable={isAdmin && !isPreviewMode} // Disable dragging for non-admin users
                        isResizable={isAdmin && !isPreviewMode} // Disable resizing for non-admin users
                        onLayoutChange={handleLayoutChange}
                        onDragStart={handleDragStart}
                        onDragStop={handleDragStop}
                        onResizeStart={handleResizeStart}
                        onResizeStop={handleResizeStop}
                        margin={[12, 12]}
                        containerPadding={[16, 16]}
                        useCSSTransforms={true}
                        preventCollision={false}
                        compactType="vertical"
                        autoSize={false}
                        width={1200} // Set a fixed width to enable horizontal scrolling
                      >
                        {currentSheet.tiles.map((tile) => (
                          <div key={tile.id} className="chart-container-wrapper">
                            <ChartTile
                              tile={tile}
                              isPreviewMode={!isAdmin || isPreviewMode} // Force preview mode for non-admin users
                              isSelected={isAdmin && selectedTileId === tile.id} // Disable selection for non-admin users
                              onSelect={isAdmin ? () => setSelectedTileId(tile.id) : undefined} // Disable selection for non-admin users
                              onDelete={isAdmin ? () => handleDeleteTile(tile.id) : undefined} // Disable deletion for non-admin users
                              theme={dashboard.theme}
                            />
                          </div>
                        ))}
                      </ResponsiveGridLayout>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Sheet Selected
                </h3>
                <p className="text-muted-foreground">
                  Select a sheet or create a new one to start building
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Chart Panel - Admin Only */}
      <AnimatePresence>
        {isAdmin && showAddChart && currentSheet && (
          <AddChartPanel
            isOpen={showAddChart}
            onClose={() => setShowAddChart(false)}
            onAddChart={() => {
              // Chart addition is handled within AddChartPanel
              setShowAddChart(false);
            }}
            dashboardId={dashboard.id}
            sheetId={currentSheet.id}
          />
        )}
      </AnimatePresence>

      {/* Add Dashboard Panel - Admin Only */}
      <AnimatePresence>
        {isAdmin && showAddDashboard && currentSheet && (
          <AddDashboardPanel
            isOpen={showAddDashboard}
            onClose={() => setShowAddDashboard(false)}
            dashboardId={dashboard.id}
            sheetId={currentSheet.id}
          />
        )}
      </AnimatePresence>

      {/* Add Element Panel - Admin Only */}
      <AnimatePresence>
        {isAdmin && showAddElement && currentSheet && (
          <AddElementPanel
            isOpen={showAddElement}
            onClose={() => setShowAddElement(false)}
            dashboardId={dashboard.id}
            sheetId={currentSheet.id}
          />
        )}
      </AnimatePresence>

      {/* User Management Panel - Admin Only */}
      <AnimatePresence>
        {isAdmin && showUserManagement && (
          <DashboardUserManagement
            isOpen={showUserManagement}
            onClose={() => setShowUserManagement(false)}
            dashboard={dashboard}
          />
        )}
      </AnimatePresence>

      {/* Customization Panel - Admin Only */}
      <AnimatePresence>
        {isAdmin && selectedTileId && !isPreviewMode && (
          <CustomizationPanel
            tileId={selectedTileId}
            dashboardId={dashboard.id}
            sheetId={currentSheetId || ''}
            onClose={() => setSelectedTileId(null)}
          />
        )}
      </AnimatePresence>
      </div>
    </DashboardThemeProvider>
  );
};