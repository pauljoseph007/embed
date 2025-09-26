import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, Copy, ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { useDashboardStore } from '@/store/dashboardStore';
import { addDateRangeToUrl } from '@/utils/supersetEmbedding';

const FilterDebugger = () => {
  const { globalDateRange } = useDashboardStore();
  const [testUrl, setTestUrl] = useState('https://bi.sdxpartners.com/superset/explore/p/vgGL10JMylq/?standalone=1&height=400');
  const [filteredUrl, setFilteredUrl] = useState('');
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (globalDateRange && testUrl) {
      const filtered = addDateRangeToUrl(testUrl, globalDateRange);
      setFilteredUrl(filtered);
      
      try {
        const url = new URL(filtered);
        const params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        setUrlParams(params);

        // Parse the filter parameters for debugging
        const debug = {
          originalUrl: testUrl,
          filteredUrl: filtered,
          dateRange: globalDateRange,
          parameters: params,
          extraFilters: params.extra_filters ? JSON.parse(params.extra_filters) : null,
          nativeFilters: params.native_filters ? JSON.parse(params.native_filters) : null,
          formDataFilters: params.form_data_filters ? JSON.parse(params.form_data_filters) : null,
          timeRange: params.time_range,
          timeRangeStart: params.time_range_start,
          timeRangeEnd: params.time_range_end
        };
        setDebugInfo(debug);
      } catch (error) {
        console.error('Error parsing filtered URL:', error);
      }
    } else {
      setFilteredUrl(testUrl);
      setUrlParams({});
      setDebugInfo(null);
    }
  }, [globalDateRange, testUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const validateSuperset = () => {
    // Check if the URL parameters are correctly formatted for Superset
    const issues = [];
    
    if (!debugInfo) {
      issues.push('No debug information available');
      return issues;
    }

    // Check for RECORDDATE filters
    const hasRecordDateFilter = debugInfo.extraFilters?.some((f: any) => f.col === 'RECORDDATE');
    if (!hasRecordDateFilter) {
      issues.push('Missing RECORDDATE filter in extra_filters');
    }

    // Check date format
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (debugInfo.timeRangeStart && !dateFormat.test(debugInfo.timeRangeStart)) {
      issues.push('Invalid date format for time_range_start');
    }
    if (debugInfo.timeRangeEnd && !dateFormat.test(debugInfo.timeRangeEnd)) {
      issues.push('Invalid date format for time_range_end');
    }

    // Check for required parameters
    if (!debugInfo.parameters.standalone) {
      issues.push('Missing standalone parameter (required for iframe embedding)');
    }

    return issues;
  };

  const issues = validateSuperset();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Global Date Filter Debugger</h1>
            <p className="text-muted-foreground">Debug RECORDDATE filtering issues in Superset charts</p>
          </div>
        </div>

        {/* Live Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Live Date Filter Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangeFilter useGlobalState={true} />
            {globalDateRange && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Active Filter: {globalDateRange.from.toLocaleDateString()} - {globalDateRange.to.toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}
            {!globalDateRange && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No date filter active. Set a date range above to test filtering.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* URL Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Chart URL Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Chart URL:</label>
              <Textarea
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter Superset chart URL or iframe HTML..."
                className="mt-1"
                rows={3}
              />
            </div>

            {filteredUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Filtered URL (with RECORDDATE parameters):</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(filteredUrl)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInNewTab(filteredUrl)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Test in Superset
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={filteredUrl}
                  readOnly
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* URL Parameters Analysis */}
        {Object.keys(urlParams).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>URL Parameters Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(urlParams).map(([key, value]) => (
                  <div key={key} className="border rounded p-3">
                    <div className="font-medium text-sm mb-1">{key}</div>
                    <div className="text-xs text-muted-foreground break-all">
                      {key.includes('filters') ? (
                        <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(value), null, 2)}</pre>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle>Superset Compatibility Validation</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ All validation checks passed! The URL should work correctly with Superset RECORDDATE filtering.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Found {issues.length} potential issue(s) with the filtered URL:
                  </AlertDescription>
                </Alert>
                {issues.map((issue, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">🔍 If filtering is not working:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>1. Copy the filtered URL and test it directly in Superset</li>
                <li>2. Check if your dataset actually contains a RECORDDATE column</li>
                <li>3. Verify the RECORDDATE column is properly configured as a datetime field</li>
                <li>4. Ensure Superset CORS settings allow the portal domain</li>
                <li>5. Check browser network tab for any CORS or parameter errors</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🛠️ Common Superset Configuration Issues:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• RECORDDATE column not recognized as datetime type</li>
                <li>• Chart cache preventing filter updates</li>
                <li>• Superset security settings blocking external filters</li>
                <li>• Dataset permissions not allowing filtered queries</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">✅ Expected Behavior:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Charts should show only data within the selected date range</li>
                <li>• URL should contain multiple RECORDDATE filter parameters</li>
                <li>• Superset should apply filters before rendering the chart</li>
                <li>• Data should be visibly different when filter changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FilterDebugger;
