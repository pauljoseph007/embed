import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, TestTube, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { guestTokenManager } from '@/utils/supersetEmbedding';
import { toast } from '@/hooks/use-toast';

interface SupersetSettings {
  baseUrl: string;
  apiKey: string;
  enableGuestTokens: boolean;
  defaultUser: {
    username: string;
    firstName: string;
    lastName: string;
  };
  rowLevelSecurity: string[];
}

export const SupersetConfig = () => {
  const [settings, setSettings] = useState<SupersetSettings>({
    baseUrl: '',
    apiKey: '',
    enableGuestTokens: true,
    defaultUser: {
      username: 'guest_user',
      firstName: 'Guest',
      lastName: 'User'
    },
    rowLevelSecurity: []
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('superset-config');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        if (parsed.baseUrl) {
          guestTokenManager.setBaseUrl(parsed.baseUrl);
        }
      } catch (error) {
        console.error('Failed to load Superset settings:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate settings
      if (settings.enableGuestTokens && !settings.baseUrl) {
        throw new Error('Base URL is required when guest tokens are enabled');
      }

      if (settings.enableGuestTokens && !settings.apiKey) {
        throw new Error('API Key is required when guest tokens are enabled');
      }

      // Save to localStorage
      localStorage.setItem('superset-config', JSON.stringify(settings));
      
      // Update token manager
      if (settings.baseUrl) {
        guestTokenManager.setBaseUrl(settings.baseUrl);
      }

      toast({
        title: "Settings saved",
        description: "Superset configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      if (!settings.baseUrl) {
        throw new Error('Base URL is required');
      }

      // Test basic connectivity
      const response = await fetch(`${settings.baseUrl}/api/v1/security/csrf_token/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setConnectionStatus('success');
        toast({
          title: "Connection successful",
          description: "Successfully connected to Superset instance.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to Superset",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearTokens = () => {
    guestTokenManager.clearTokens();
    toast({
      title: "Tokens cleared",
      description: "All cached guest tokens have been cleared.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Superset Configuration</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="baseUrl">Superset Base URL</Label>
            <Input
              id="baseUrl"
              placeholder="https://your-superset-instance.com"
              value={settings.baseUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Your Superset API key"
                value={settings.apiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Guest Tokens</Label>
              <p className="text-sm text-muted-foreground">
                Use secure guest tokens for embedding (recommended for production)
              </p>
            </div>
            <Switch
              checked={settings.enableGuestTokens}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableGuestTokens: checked }))}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTestingConnection || !settings.baseUrl}
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>

            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {connectionStatus !== 'idle' && (
            <Alert className={connectionStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {connectionStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                {connectionStatus === 'success' 
                  ? 'Connection to Superset instance successful'
                  : 'Failed to connect to Superset instance'
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="username">Default Username</Label>
              <Input
                id="username"
                value={settings.defaultUser.username}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  defaultUser: { ...prev.defaultUser, username: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={settings.defaultUser.firstName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  defaultUser: { ...prev.defaultUser, firstName: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={settings.defaultUser.lastName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  defaultUser: { ...prev.defaultUser, lastName: e.target.value }
                }))}
              />
            </div>
          </div>

          <div>
            <Button
              onClick={handleClearTokens}
              variant="outline"
              size="sm"
            >
              Clear Cached Tokens
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              Clear all cached guest tokens to force refresh
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
