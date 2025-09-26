import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  RefreshCw,
  Calendar,
  Database,
  Filter,
  Link
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { addDateRangeToUrlAlternative } from '@/utils/supersetEmbedding';
import { toast } from '@/hooks/use-toast';

export const FilteringDiagnostics = () => {
  const { getSheetDateRange, currentSheetId, sheetDateRanges } = useDashboardStore();
  const [testUrl, setTestUrl] = useState('https://bi.sdxpartners.com/superset/explore/p/vgGL10JMylq/?standalone=1&height=400');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      sheetInfo: {},
      urlAnalysis: {},
      filteringTest: {},
      recommendations: []
    };

    try {
      // 1. Analyze current sheet state
      results.sheetInfo = {
        currentSheetId,
        hasCurrentSheet: !!currentSheetId,
        currentSheetDateRange: currentSheetId ? getSheetDateRange(currentSheetId) : null,
        allSheetDateRanges: sheetDateRanges,
        totalSheetsWithFilters: Object.keys(sheetDateRanges).filter(id => sheetDateRanges[id]).length
      };

      // 2. Analyze test URL
      if (testUrl) {
        try {
          const urlObj = new URL(testUrl);
          const existingFormData = urlObj.searchParams.get('form_data');
          let parsedFormData = null;
          
          if (existingFormData) {
            try {
              parsedFormData = JSON.parse(decodeURIComponent(existingFormData));
            } catch (e) {
              // Ignore parsing errors
            }
          }

          results.urlAnalysis = {
            isValid: true,
            domain: urlObj.hostname,
            hasFormData: !!existingFormData,
            formDataParseable: !!parsedFormData,
            existingFilters: parsedFormData?.adhoc_filters || [],
            hasRecordDateFilter: parsedFormData?.adhoc_filters?.some((f: any) => 
              f.subject === 'RECORDDATE' || f.subject === 'recorddate' || f.subject === 'RecordDate'
            ) || false,
            parameters: Object.fromEntries(urlObj.searchParams.entries())
          };
        } catch (error) {
          results.urlAnalysis = {
            isValid: false,
            error: error.message
          };
        }
      }

      // 3. Test filtering functionality
      if (testUrl && currentSheetId) {
        const currentDateRange = getSheetDateRange(currentSheetId);
        if (currentDateRange) {
          try {
            const filteredUrl = addDateRangeToUrlAlternative(testUrl, currentDateRange, 'simple');
            const filteredUrlObj = new URL(filteredUrl);
            const filteredFormData = filteredUrlObj.searchParams.get('form_data');
            let parsedFilteredData = null;

            if (filteredFormData) {
              try {
                parsedFilteredData = JSON.parse(decodeURIComponent(filteredFormData));
              } catch (e) {
                // Ignore parsing errors
              }
            }

            results.filteringTest = {
              success: true,
              originalUrl: testUrl,
              filteredUrl,
              dateRange: {
                from: currentDateRange.from.toISOString().split('T')[0],
                to: currentDateRange.to.toISOString().split('T')[0]
              },
              appliedFilters: parsedFilteredData?.adhoc_filters?.filter((f: any) => 
                f.subject === 'RECORDDATE'
              ) || [],
              hasTimeRange: !!filteredUrlObj.searchParams.get('time_range'),
              hasExtraFilters: !!filteredUrlObj.searchParams.get('extra_filters'),
              cacheInvalidation: {
                hasForceParam: !!filteredUrlObj.searchParams.get('force'),
                hasCacheTimeout: !!filteredUrlObj.searchParams.get('cache_timeout'),
                hasRefreshParam: !!filteredUrlObj.searchParams.get('refresh')
              }
            };
          } catch (error) {
            results.filteringTest = {
              success: false,
              error: error.message
            };
          }
        } else {
          results.filteringTest = {
            success: false,
            error: 'No date range set for current sheet'
          };
        }
      }

      // 4. Generate recommendations
      if (!results.sheetInfo.hasCurrentSheet) {
        results.recommendations.push({
          type: 'error',
          message: 'No current sheet selected. Navigate to a dashboard sheet first.'
        });
      }

      if (!results.sheetInfo.currentSheetDateRange) {
        results.recommendations.push({
          type: 'warning',
          message: 'No date filter applied to current sheet. Apply a date filter to test filtering.'
        });
      }

      if (results.urlAnalysis.isValid && !results.urlAnalysis.hasFormData) {
        results.recommendations.push({
          type: 'info',
          message: 'URL has no existing form_data. This is normal for new charts.'
        });
      }

      if (results.filteringTest.success && results.filteringTest.appliedFilters.length === 0) {
        results.recommendations.push({
          type: 'error',
          message: 'Filtering failed - no RECORDDATE filters were applied to the URL.'
        });
      }

      if (results.filteringTest.success && results.filteringTest.appliedFilters.length > 0) {
        results.recommendations.push({
          type: 'success',
          message: `Successfully applied ${results.filteringTest.appliedFilters.length} RECORDDATE filters.`
        });
      }

      if (results.urlAnalysis.isValid && !results.urlAnalysis.domain.includes('sdxpartners.com')) {
        results.recommendations.push({
          type: 'warning',
          message: 'URL is not from sdxpartners.com domain. Ensure this is a valid Superset URL.'
        });
      }

    } catch (error) {
      results.error = error.message;
    }

    setDiagnosticResults(results);
    setIsRunning(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard."
    });
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Bug className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Bug className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">RECORDDATE Filtering Diagnostics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-url">Superset Chart URL</Label>
            <Input
              id="test-url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://bi.sdxpartners.com/superset/explore/p/..."
            />
          </div>
          <Button onClick={runDiagnostics} disabled={isRunning || !testUrl}>
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {diagnosticResults && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sheet-info">Sheet Info</TabsTrigger>
            <TabsTrigger value="url-analysis">URL Analysis</TabsTrigger>
            <TabsTrigger value="filtering-test">Filtering Test</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Diagnostic Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Ran at: {new Date(diagnosticResults.timestamp).toLocaleString()}
                </div>
                
                {diagnosticResults.recommendations.map((rec: any, index: number) => (
                  <Alert key={index}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rec.type)}
                      <AlertDescription>{rec.message}</AlertDescription>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sheet-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sheet Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Current Sheet ID:</span>
                    <Badge variant={diagnosticResults.sheetInfo.hasCurrentSheet ? 'default' : 'destructive'}>
                      {diagnosticResults.sheetInfo.currentSheetId || 'None'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Current Sheet Date Range:</span>
                    <Badge variant={diagnosticResults.sheetInfo.currentSheetDateRange ? 'default' : 'secondary'}>
                      {diagnosticResults.sheetInfo.currentSheetDateRange ? 'Set' : 'Not Set'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Sheets with Filters:</span>
                    <Badge>{diagnosticResults.sheetInfo.totalSheetsWithFilters}</Badge>
                  </div>
                </div>
                
                {diagnosticResults.sheetInfo.currentSheetDateRange && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Current Date Range:</div>
                    <div className="text-sm">
                      From: {new Date(diagnosticResults.sheetInfo.currentSheetDateRange.from).toLocaleDateString()}
                      <br />
                      To: {new Date(diagnosticResults.sheetInfo.currentSheetDateRange.to).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  URL Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnosticResults.urlAnalysis.isValid ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span>Domain:</span>
                        <Badge>{diagnosticResults.urlAnalysis.domain}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Has Form Data:</span>
                        <Badge variant={diagnosticResults.urlAnalysis.hasFormData ? 'default' : 'secondary'}>
                          {diagnosticResults.urlAnalysis.hasFormData ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Has RECORDDATE Filter:</span>
                        <Badge variant={diagnosticResults.urlAnalysis.hasRecordDateFilter ? 'default' : 'destructive'}>
                          {diagnosticResults.urlAnalysis.hasRecordDateFilter ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Existing Filters:</span>
                        <Badge>{diagnosticResults.urlAnalysis.existingFilters.length}</Badge>
                      </div>
                    </div>

                    {diagnosticResults.urlAnalysis.existingFilters.length > 0 && (
                      <div className="space-y-2">
                        <Label>Existing Filters:</Label>
                        <Textarea
                          value={JSON.stringify(diagnosticResults.urlAnalysis.existingFilters, null, 2)}
                          readOnly
                          className="font-mono text-xs"
                          rows={6}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(diagnosticResults.urlAnalysis.existingFilters, null, 2))}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Filters
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Invalid URL: {diagnosticResults.urlAnalysis.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filtering-test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtering Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnosticResults.filteringTest.success ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span>Applied Filters:</span>
                        <Badge variant={diagnosticResults.filteringTest.appliedFilters.length > 0 ? 'default' : 'destructive'}>
                          {diagnosticResults.filteringTest.appliedFilters.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Has Time Range:</span>
                        <Badge variant={diagnosticResults.filteringTest.hasTimeRange ? 'default' : 'secondary'}>
                          {diagnosticResults.filteringTest.hasTimeRange ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Has Extra Filters:</span>
                        <Badge variant={diagnosticResults.filteringTest.hasExtraFilters ? 'default' : 'secondary'}>
                          {diagnosticResults.filteringTest.hasExtraFilters ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cache Invalidation:</span>
                        <Badge variant={diagnosticResults.filteringTest.cacheInvalidation.hasForceParam ? 'default' : 'secondary'}>
                          {diagnosticResults.filteringTest.cacheInvalidation.hasForceParam ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date Range Applied:</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        From: {diagnosticResults.filteringTest.dateRange.from}
                        <br />
                        To: {diagnosticResults.filteringTest.dateRange.to}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Filtered URL:</Label>
                      <Textarea
                        value={diagnosticResults.filteringTest.filteredUrl}
                        readOnly
                        className="font-mono text-xs"
                        rows={4}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(diagnosticResults.filteringTest.filteredUrl)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Filtered URL
                      </Button>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Filtering test failed: {diagnosticResults.filteringTest.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
