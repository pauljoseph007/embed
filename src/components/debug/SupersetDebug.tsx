import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertCircle, TestTube, Loader2 } from 'lucide-react';
import { guestTokenManager } from '@/utils/supersetEmbedding';
import SupersetChart from '@/components/charts/SupersetChart';

const SupersetDebug = () => {
  const [backendStatus, setBackendStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [sdkStatus, setSdkStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [tokenTest, setTokenTest] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any>(null);
  const [testUrl, setTestUrl] = useState('https://bi.sdxpartners.com/superset/dashboard/6403f728-f56c-46ae-ae28-dba04b838c57/');
  const [testDashboardId, setTestDashboardId] = useState('6403f728-f56c-46ae-ae28-dba04b838c57');
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    // Check if Superset SDK is available
    const checkSDK = () => {
      if (typeof window !== 'undefined') {
        const sdk = (window as any).supersetSdk || (window as any).supersetEmbeddedSdk;
        if (sdk) {
          setSdkStatus('available');
          console.log('Superset SDK detected:', {
            supersetSdk: !!(window as any).supersetSdk,
            supersetEmbeddedSdk: !!(window as any).supersetEmbeddedSdk,
            sdk: sdk
          });
        } else {
          setSdkStatus('unavailable');
          console.log('Superset SDK not found on window object');
          console.log('Available superset-related objects:',
            Object.keys(window).filter(k => k.toLowerCase().includes('superset'))
          );
        }
      }
    };

    checkSDK();

    // Recheck after a delay in case SDK loads asynchronously
    const timer = setTimeout(checkSDK, 2000);
    return () => clearTimeout(timer);
  }, []);

  const testBackendConnection = async () => {
    setBackendStatus('testing');
    try {
      const isConnected = await guestTokenManager.testConnection();
      if (isConnected) {
        setBackendStatus('success');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('Backend test failed:', error);
      setBackendStatus('error');
    }
  };

  const testGuestToken = async () => {
    setTokenTest('testing');
    setTestResults(null);

    try {
      // Test with the specified dashboard ID
      const token = await guestTokenManager.getGuestToken('dashboard', testDashboardId);

      if (token) {
        setTokenTest('success');
        setTestResults({
          hasToken: true,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          dashboardId: testDashboardId
        });
      } else {
        setTokenTest('error');
        setTestResults({
          hasToken: false,
          error: 'No token received - check console for details',
          dashboardId: testDashboardId
        });
      }
    } catch (error) {
      console.error('Token test failed:', error);
      setTokenTest('error');
      setTestResults({
        hasToken: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        dashboardId: testDashboardId,
        suggestion: 'Make sure the dashboard exists and is configured for embedding in Superset'
      });
    }
  };

  const testSupersetConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test-superset-connection');
      const data = await response.json();
      console.log('Superset connection test:', data);
    } catch (error) {
      console.error('Superset connection test failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Connected';
      case 'available':
        return 'Available';
      case 'error':
        return 'Failed';
      case 'unavailable':
        return 'Not Available';
      case 'testing':
      case 'checking':
        return 'Testing...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <TestTube className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Superset Integration Debug</h2>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Backend API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(backendStatus)}
              <span className="text-sm">{getStatusText(backendStatus)}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full"
              onClick={testBackendConnection}
              disabled={backendStatus === 'testing'}
            >
              Test Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Superset SDK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(sdkStatus)}
              <span className="text-sm">{getStatusText(sdkStatus)}</span>
            </div>
            <Badge variant={sdkStatus === 'available' ? 'default' : 'secondary'} className="mt-2">
              {sdkStatus === 'available' ? 'Loaded' : 'Missing'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Guest Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(tokenTest)}
              <span className="text-sm">{getStatusText(tokenTest)}</span>
            </div>
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Dashboard ID"
                value={testDashboardId}
                onChange={(e) => setTestDashboardId(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={testGuestToken}
                disabled={tokenTest === 'testing'}
              >
                Test Token
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Token Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Chart Test */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Embedding Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testUrl">Test URL</Label>
            <Input
              id="testUrl"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter Superset dashboard/chart URL"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setShowChart(!showChart)}>
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
            <Button variant="outline" onClick={testSupersetConnection}>
              Test Superset Connection
            </Button>
          </div>

          {showChart && (
            <div className="h-96 border rounded-lg">
              <SupersetChart
                iframeUrl={testUrl}
                title="Test Chart"
                onError={(error) => {
                  console.error('Chart test error:', error);
                }}
                onSuccess={() => {
                  console.log('Chart test success');
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Superset URL:</strong> {import.meta.env.NEXT_PUBLIC_SUPERSET_URL || 'Not configured'}</div>
            <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not configured'}</div>
            <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
            <div><strong>Window SDK:</strong> {typeof window !== 'undefined' && (window as any).supersetSdk ? 'Available' : 'Not Available'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Superset Configuration Required</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>To enable dashboard embedding, configure the following in Superset:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Enable the <code>EMBEDDED_SUPERSET</code> feature flag</li>
                <li>Configure dashboards for embedding in Dashboard → Edit → Advanced → Embedding</li>
                <li>Set allowed domains in the embedding configuration</li>
                <li>Ensure the guest user has proper permissions</li>
                <li>Test with a valid dashboard ID that exists in your Superset instance</li>
              </ol>
              <div className="mt-3 p-2 bg-muted rounded text-xs">
                <strong>Current Status:</strong> Backend API is working, but dashboard embedding may need configuration.
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupersetDebug;
