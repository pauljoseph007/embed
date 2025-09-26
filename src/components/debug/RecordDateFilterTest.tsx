import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, TestTube, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { addDateRangeToUrl } from '@/utils/supersetEmbedding';

const RecordDateFilterTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('https://bi.sdxpartners.com/superset/explore/p/wqPLROma4yz/?standalone=1&height=400');
  const [fromDate, setFromDate] = useState('2025-01-01');
  const [toDate, setToDate] = useState('2025-01-15');
  const [filteredUrl, setFilteredUrl] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const runFilterTest = () => {
    const dateRange = {
      from: new Date(fromDate),
      to: new Date(toDate)
    };

    console.log('🧪 MANUAL FILTER TEST:', { testUrl, dateRange });

    const result = addDateRangeToUrl(testUrl, dateRange);
    setFilteredUrl(result);

    // Parse the URL to analyze what filters were applied
    try {
      const urlObj = new URL(result);
      const results = [];

      // Check extra_filters
      const extraFilters = urlObj.searchParams.get('extra_filters');
      if (extraFilters) {
        results.push({
          method: 'extra_filters',
          status: 'applied',
          value: JSON.parse(extraFilters),
          description: 'Primary filtering method for charts'
        });
      }

      // Check time_range parameters
      const timeRange = urlObj.searchParams.get('time_range');
      if (timeRange) {
        results.push({
          method: 'time_range',
          status: 'applied',
          value: timeRange,
          description: 'Legacy time range parameter'
        });
      }

      // Check force parameter
      const force = urlObj.searchParams.get('force');
      if (force) {
        results.push({
          method: 'force_refresh',
          status: 'applied',
          value: force,
          description: 'Cache busting parameter'
        });
      }

      // Check debug parameter
      const debug = urlObj.searchParams.get('debug_filter');
      if (debug) {
        results.push({
          method: 'debug_tracking',
          status: 'applied',
          value: debug,
          description: 'Debug tracking parameter'
        });
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error parsing filtered URL:', error);
    }
  };

  const testDirectSuperset = () => {
    if (filteredUrl) {
      window.open(filteredUrl, '_blank');
    }
  };

  const copyFilteredUrl = () => {
    navigator.clipboard.writeText(filteredUrl);
  };

  useEffect(() => {
    runFilterTest();
  }, [testUrl, fromDate, toDate]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            RECORDDATE Filter Testing Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="testUrl">Superset Chart URL</Label>
              <Input
                id="testUrl"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter Superset chart URL"
              />
            </div>
            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runFilterTest} variant="default">
              <TestTube className="h-4 w-4 mr-2" />
              Test Filter
            </Button>
            <Button onClick={testDirectSuperset} variant="outline" disabled={!filteredUrl}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Superset
            </Button>
            <Button onClick={copyFilteredUrl} variant="outline" disabled={!filteredUrl}>
              Copy Filtered URL
            </Button>
          </div>

          <Separator />

          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filter Application Results</h3>
            
            {testResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{result.method}</Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.description}
                      </p>
                      <div className="bg-muted p-2 rounded text-xs font-mono">
                        {typeof result.value === 'object' 
                          ? JSON.stringify(result.value, null, 2)
                          : result.value
                        }
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No filters were applied. Check the URL format and date range.
                </AlertDescription>
              </Alert>
            )}

            {/* Filtered URL Display */}
            {filteredUrl && (
              <div className="space-y-2">
                <Label>Generated Filtered URL:</Label>
                <div className="bg-muted p-3 rounded text-xs font-mono break-all">
                  {filteredUrl}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Troubleshooting Guide */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Troubleshooting Guide</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">✅ What Should Work</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• extra_filters parameter should be present</p>
                  <p>• time_range parameters should be set</p>
                  <p>• force parameter should bypass cache</p>
                  <p>• Chart should show filtered data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">❌ Common Issues</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• RECORDDATE column doesn't exist</p>
                  <p>• Chart doesn't support filtering</p>
                  <p>• Date format not recognized</p>
                  <p>• Superset cache not cleared</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>IMPORTANT:</strong> RECORDDATE exists in datasets but NOT in chart columns.
                The new solution modifies the chart's form_data to force inclusion of RECORDDATE as a filter.
                This should work even when RECORDDATE isn't selected as a chart dimension.
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How It Works:</strong> The filtering now adds RECORDDATE as an "adhoc_filter" in the
                chart's form_data, which forces Superset to include it in the SQL query even if it's not
                visible in the chart. This should filter the underlying data correctly.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordDateFilterTest;
