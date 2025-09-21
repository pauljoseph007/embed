import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Play, Loader2 } from 'lucide-react';
import { dashboardTester, TestResult } from '@/utils/testDashboardFeatures';

const TestDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{ passed: number; failed: number; total: number } | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const testResults = await dashboardTester.runAllTests();
      setResults(testResults);
      
      const passed = testResults.filter(r => r.passed).length;
      const failed = testResults.filter(r => !r.passed).length;
      setSummary({ passed, failed, total: testResults.length });
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Feature Testing
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing of all dashboard builder features
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              {summary && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    ✓ {summary.passed} Passed
                  </span>
                  <span className="text-red-600 font-medium">
                    ✗ {summary.failed} Failed
                  </span>
                  <span className="text-muted-foreground">
                    Total: {summary.total}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.passed)}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {result.details && (
                        <span className="text-xs text-muted-foreground">
                          {typeof result.details === 'object' 
                            ? JSON.stringify(result.details) 
                            : result.details}
                        </span>
                      )}
                      {getStatusBadge(result.passed)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Details */}
        {results.some(r => !r.passed) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Failed Tests Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results
                  .filter(r => !r.passed)
                  .map((result, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{result.testName}:</strong> {result.error}
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Coverage Info */}
        <Card>
          <CardHeader>
            <CardTitle>Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Authentication Tests</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Admin login/logout</li>
                  <li>• Session management</li>
                  <li>• Role-based access</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dashboard Management</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Dashboard creation</li>
                  <li>• Sheet management</li>
                  <li>• Tile operations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">User Management</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Add/remove users</li>
                  <li>• Role assignment</li>
                  <li>• Access control</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Persistence</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Export functionality</li>
                  <li>• Import validation</li>
                  <li>• Data integrity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestDashboard;
