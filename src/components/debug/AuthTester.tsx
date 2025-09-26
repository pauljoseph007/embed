import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/apiClient';

export const AuthTester: React.FC = () => {
  const [email, setEmail] = useState('sara@company.com');
  const [password, setPassword] = useState('121212');
  const [testResults, setTestResults] = useState<string[]>([]);
  const { loginToDashboard, user, isAuthenticated } = useAuthStore();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectAPI = async () => {
    addResult('🧪 Testing direct API call...');
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      addResult(`✅ Direct API Success: ${response.user?.name} (${response.user?.role})`);
    } catch (error: any) {
      addResult(`❌ Direct API Failed: ${error.message}`);
    }
  };

  const testAuthStore = async () => {
    addResult('🧪 Testing auth store login...');
    try {
      const result = await loginToDashboard(email, password);
      if (result.success) {
        addResult(`✅ Auth Store Success: ${result.user?.name} (${result.user?.role})`);
      } else {
        addResult(`❌ Auth Store Failed: ${result.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Auth Store Error: ${error.message}`);
    }
  };

  const testNetworkConnectivity = async () => {
    addResult('🧪 Testing network connectivity...');
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (response.ok) {
        addResult('✅ Network connectivity OK');
      } else {
        addResult(`❌ Network error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      addResult(`❌ Network failed: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCredentials = [
    { email: 'sara@company.com', password: '121212', name: 'Sara' },
    { email: 'John@company.com', password: '121212', name: 'John' },
    { email: 'demo@sdxpartners.com', password: 'demo123', name: 'Demo User' },
    { email: 'admin@sdxpartners.com', password: 'admin123', name: 'Admin' }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔐 Authentication Tester</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test authentication functionality to diagnose login issues
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Auth Status */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Current Authentication Status</h3>
          <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          {user && (
            <p>User: {user.name} ({user.email}) - Role: {user.role}</p>
          )}
        </div>

        {/* Test Credentials */}
        <div>
          <h3 className="font-semibold mb-2">Test Credentials</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {testCredentials.map((cred, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                }}
              >
                {cred.name}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={testNetworkConnectivity} variant="outline">
            Test Network
          </Button>
          <Button onClick={testDirectAPI} variant="outline">
            Test Direct API
          </Button>
          <Button onClick={testAuthStore} variant="outline">
            Test Auth Store
          </Button>
          <Button onClick={clearResults} variant="destructive" size="sm">
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        <div>
          <h3 className="font-semibold mb-2">Test Results</h3>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
