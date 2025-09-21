import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/store/dashboardStore';
import { parseSuperset, convertToSDK } from '@/utils/supersetEmbedding';
import { toast } from '@/hooks/use-toast';

interface AddDashboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: string;
  sheetId: string;
}

export const AddDashboardPanel = ({ isOpen, onClose, dashboardId, sheetId }: AddDashboardPanelProps) => {
  const { addTile } = useDashboardStore();
  
  const [dashboardUuid, setDashboardUuid] = useState('');
  const [dashboardName, setDashboardName] = useState('');
  const [clientName, setClientName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleParseDashboard = async () => {
    if (!dashboardUuid.trim()) {
      setError('Please enter a dashboard UUID');
      return;
    }

    if (!dashboardName.trim()) {
      setError('Please enter a dashboard name');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create a dashboard URL from the UUID
      const supersetUrl = import.meta.env.NEXT_PUBLIC_SUPERSET_URL || 'https://bi.sdxpartners.com';
      const dashboardUrl = `${supersetUrl}/superset/dashboard/${dashboardUuid}/`;
      
      console.log('Parsing dashboard URL:', dashboardUrl);
      
      const parsed = parseSuperset(dashboardUrl);

      if (!parsed.isValid) {
        setError('Unable to parse the dashboard UUID. Please check the format.');
        setIsProcessing(false);
        return;
      }

      // Try SDK conversion
      const sdkResult = await convertToSDK(parsed);

      setParseResult({
        ...parsed,
        sdkConfig: sdkResult.sdkConfig,
        fallbackIframe: sdkResult.fallbackIframe,
        usesSDK: sdkResult.success,
        sdkError: sdkResult.error,
        dashboardUrl: dashboardUrl
      });

      const successMessage = sdkResult.success
        ? `Dashboard ${dashboardUuid} detected and ready for embedding (SDK)`
        : `Dashboard ${dashboardUuid} detected, will use iframe fallback`;

      toast({
        title: "Dashboard Parsed",
        description: successMessage,
      });

    } catch (error) {
      setError('Error processing the dashboard UUID. Please try again.');
      console.error('Parse error:', error);
    }

    setIsProcessing(false);
  };

  const handleAddToCanvas = () => {
    if (!parseResult || !dashboardName.trim()) {
      setError('Please provide a dashboard name and valid UUID');
      return;
    }

    if (!sheetId) {
      setError('No active sheet selected. Please select a sheet first.');
      return;
    }

    try {
      // Find available position
      const existingTiles = useDashboardStore.getState().dashboards
        .find(d => d.id === dashboardId)?.sheets
        .find(s => s.id === sheetId)?.tiles || [];

      const maxY = existingTiles.reduce((max, tile) =>
        Math.max(max, tile.layout.y + tile.layout.h), 0
      );

      const newTile = {
        title: dashboardName,
        type: 'dashboard' as const, // Fix: Add required type field
        embedType: 'dashboard' as const,
        embedId: parseResult.embedId,
        srcUrl: parseResult.dashboardUrl,
        layout: {
          x: 0,
          y: maxY,
          w: 20, // Dashboards are typically wider
          h: 14  // And taller
        },
        uiConfig: {
          showLegend: true,
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 12,
          theme: 'cobalt-blue'
        },
        demoMode: false,
        clientName: clientName.trim() || undefined,
        dashboardUuid: dashboardUuid
      };

      addTile(dashboardId, sheetId, newTile);

      const description = clientName 
        ? `Dashboard "${dashboardName}" for client "${clientName}" has been added`
        : `Dashboard "${dashboardName}" has been added`;

      toast({
        title: "Dashboard Added",
        description
      });

      // Reset form
      setDashboardUuid('');
      setDashboardName('');
      setClientName('');
      setParseResult(null);
      setError('');
      onClose();
    } catch (error) {
      console.error('Error adding dashboard:', error);
      setError('Failed to add dashboard. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Add Superset Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Embed a Superset dashboard using its UUID
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dashboard UUID Input */}
          <div className="space-y-2">
            <Label htmlFor="dashboardUuid">Dashboard UUID *</Label>
            <Input
              id="dashboardUuid"
              placeholder="e.g., 6403f728-f56c-46ae-ae28-dba04b838c57"
              value={dashboardUuid}
              onChange={(e) => setDashboardUuid(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter the UUID of the Superset dashboard you want to embed
            </p>
          </div>

          {/* Dashboard Name Input */}
          <div className="space-y-2">
            <Label htmlFor="dashboardName">Dashboard Name *</Label>
            <Input
              id="dashboardName"
              placeholder="e.g., Sales Analytics Dashboard"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
            />
          </div>

          {/* Client Name Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name (Optional)</Label>
            <Input
              id="clientName"
              placeholder="e.g., Acme Corporation"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Associate this dashboard with a specific client
            </p>
          </div>

          {/* Parse Button */}
          <Button 
            onClick={handleParseDashboard}
            disabled={isProcessing || !dashboardUuid.trim() || !dashboardName.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Dashboard...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate Dashboard
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Parse Results */}
          {parseResult && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Dashboard Validated Successfully!</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>UUID:</strong> {parseResult.embedId}</div>
                    <div><strong>URL:</strong> {parseResult.dashboardUrl}</div>
                    <div><strong>Embedding Method:</strong> 
                      <Badge variant={parseResult.usesSDK ? 'default' : 'secondary'} className="ml-2">
                        {parseResult.usesSDK ? 'Superset SDK' : 'Iframe Fallback'}
                      </Badge>
                    </div>
                    {parseResult.sdkError && (
                      <div className="text-yellow-700"><strong>Note:</strong> {parseResult.sdkError}</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <Button onClick={handleAddToCanvas} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Dashboard to Canvas
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to find Dashboard UUID:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Superset dashboard</li>
              <li>Look at the URL: <code>/superset/dashboard/UUID/</code></li>
              <li>Copy the UUID part (the long string with dashes)</li>
              <li>Paste it in the field above</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
