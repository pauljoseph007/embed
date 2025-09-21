import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Link, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDashboardStore } from '@/store/dashboardStore';
import { parseSuperset, convertToSDK } from '@/utils/supersetEmbedding';
import { toast } from '@/hooks/use-toast';

interface AddChartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChart: (chartData: any) => void;
  dashboardId: string;
  sheetId: string;
}

export const AddChartPanel = ({
  isOpen,
  onClose,
  onAddChart,
  dashboardId,
  sheetId
}: AddChartPanelProps) => {
  const { addTile } = useDashboardStore();
  const [embedInput, setEmbedInput] = useState('');
  const [chartTitle, setChartTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleParseEmbed = async () => {
    if (!embedInput.trim()) {
      setError('Please enter an iframe code or Superset URL');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const parsed = parseSuperset(embedInput);

      if (!parsed.isValid) {
        setError('Unable to parse the Superset embed code. Please check the format and ensure it contains a valid Superset URL.');
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
        sdkError: sdkResult.error
      });

      // Auto-generate title if not provided
      if (!chartTitle) {
        const autoTitle = `${parsed.embedType === 'chart' ? 'Chart' : 'Dashboard'} ${parsed.embedId}`;
        setChartTitle(autoTitle);
      }

      const successMessage = sdkResult.success
        ? `Detected ${parsed.embedType} with ID: ${parsed.embedId} (SDK ready)`
        : `Detected ${parsed.embedType} with ID: ${parsed.embedId} (iframe fallback)`;

      toast({
        title: "Embed Parsed Successfully",
        description: successMessage
      });

    } catch (error) {
      setError('Error processing the embed code. Please try again.');
      console.error('Parse error:', error);
    }

    setIsProcessing(false);
  };

  const handleAddToCanvas = () => {
    if (!parseResult || !chartTitle.trim()) {
      setError('Please provide a chart title and valid embed code');
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
        title: chartTitle,
        type: parseResult.embedType, // Fix: Add required type field
        embedType: parseResult.embedType,
        embedId: parseResult.embedId,
        srcUrl: parseResult.srcUrl,
        layout: {
          x: 0,
          y: maxY,
          w: parseResult.embedType === 'dashboard' ? 16 : 12,
          h: parseResult.embedType === 'dashboard' ? 12 : 8
        },
        uiConfig: {
          showLegend: true,
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 12,
          theme: 'cobalt-blue'
        },
        demoMode: false
      };

      addTile(dashboardId, sheetId, newTile);

      toast({
        title: "Chart Added",
        description: `${chartTitle} has been added to your dashboard.`
      });

      // Reset form
      setEmbedInput('');
      setChartTitle('');
      setParseResult(null);
      setError('');
      onClose();
    } catch (error) {
      console.error('Error adding chart:', error);
      setError('Failed to add chart. Please try again.');
    }
  };

  const handleAddDemo = () => {
    if (!sheetId) {
      setError('No active sheet selected. Please select a sheet first.');
      return;
    }

    try {
      // Find available position for demo chart
      const existingTiles = useDashboardStore.getState().dashboards
        .find(d => d.id === dashboardId)?.sheets
        .find(s => s.id === sheetId)?.tiles || [];

      const maxY = existingTiles.reduce((max, tile) =>
        Math.max(max, tile.layout.y + tile.layout.h), 0
      );

      const demoTile = {
        title: chartTitle || 'Demo Chart',
        type: 'chart' as const, // Fix: Add required type field
        embedType: 'chart' as const,
        embedId: `demo-${Date.now()}`,
        srcUrl: 'https://superset.example.com/explore/p/demo/',
        layout: {
          x: 0,
          y: maxY,
          w: 12,
          h: 8
        },
        uiConfig: {
          showLegend: true,
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 12,
          theme: 'cobalt-blue'
        },
        demoMode: true
      };

      addTile(dashboardId, sheetId, demoTile);

      toast({
        title: "Demo Chart Added",
        description: "A demo chart has been added to your dashboard."
      });

      setChartTitle('');
      setError('');
      onClose();
    } catch (error) {
      console.error('Error adding demo chart:', error);
      setError('Failed to add demo chart. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Add Chart</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Quick Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Demo chart title"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />
            <Button onClick={handleAddDemo} className="w-full">
              Add Demo Chart
            </Button>
          </CardContent>
        </Card>

        {/* Embed Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Link className="h-4 w-4" />
              Superset Embed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="embed-input">Iframe Code or URL</Label>
              <Textarea
                id="embed-input"
                placeholder="Paste your Superset iframe code or URL here..."
                value={embedInput}
                onChange={(e) => setEmbedInput(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="chart-title">Chart Title</Label>
              <Input
                id="chart-title"
                placeholder="Enter chart title"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleParseEmbed} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Parse Embed Code'}
            </Button>

            {parseResult && (
              <div className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Detected {parseResult.embedType} with ID: {parseResult.embedId}
                    {parseResult.usesSDK ? ' (SDK ready)' : ' (Iframe fallback)'}
                    {parseResult.sdkError && (
                      <div className="text-xs text-muted-foreground mt-1">
                        SDK Error: {parseResult.sdkError}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleAddToCanvas}
                  className="w-full"
                  disabled={!chartTitle.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Canvas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Supported Formats</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>• Iframe embed codes from Superset</p>
            <p>• Chart URLs: /explore/p/&lt;id&gt;, /chart/&lt;id&gt;</p>
            <p>• Dashboard URLs: /dashboard/&lt;id&gt;, /d/&lt;id&gt;</p>
            <p>• URL parameters: ?chart_id=&lt;id&gt;</p>
            <p>• Both HTTP and HTTPS supported</p>
            <p>• Automatic SDK conversion with iframe fallback</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};