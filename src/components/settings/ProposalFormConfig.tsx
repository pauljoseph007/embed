import React, { useState, useEffect } from "react";
import { FileText, Save, TestTube, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { SubmittedProposals } from "@/components/admin/SubmittedProposals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProposalFormSettings {
  submissionUrl: string;
  testData: {
    preparedBy: string;
    email: string;
    customerName: string;
  };
}

export const ProposalFormConfig = () => {
  const [settings, setSettings] = useState<ProposalFormSettings>({
    submissionUrl: '',
    testData: {
      preparedBy: 'Test User',
      email: 'test@example.com',
      customerName: 'Test Customer'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('proposal-form-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to load proposal form settings:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate settings
      if (!settings.submissionUrl) {
        throw new Error('Submission URL is required');
      }

      // Validate URL format
      try {
        new URL(settings.submissionUrl);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      // Save to localStorage
      localStorage.setItem('proposal-form-settings', JSON.stringify(settings));

      toast({
        title: "Settings saved",
        description: "Proposal form configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.submissionUrl) {
      toast({
        title: "Test failed",
        description: "Please enter a submission URL first",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult('idle');

    try {
      const testPayload = {
        ...settings.testData,
        customerSegment: "Test",
        requirementType: "Test",
        state: "Test State",
        cities: ["Test City"],
        vehicleCondition: "Test",
        vehiclesWithin: { bls: 1, als: 1, pt: 1 },
        vehiclesBeyond: { bls: 0, als: 0, pt: 0 },
        driversIncluded: true,
        driverCount: 1,
        driverSkill: "Test",
        paramedicsIncluded: false,
        paramedicCount: 0,
        paramedicSkill: "",
        indicativeStartMonth: "Test Month",
        sla: "Test SLA",
        specialRequirements: "Test requirements",
        billingPattern: "Test",
        minCharge: "Test",
        expectedUsage: "Test",
        expectedRevenue: "Test",
        otherRevenue: "Test",
        discount: "Test",
        contractDuration: "Test",
        dieselIncluded: false,
        maintenanceIncluded: false,
        otherInclusion: "Test",
        termsOfPayment: "Test",
        riskFactors: "Test",
        _test: true // Flag to indicate this is a test submission
      };

      await fetch(settings.submissionUrl, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(testPayload),
        headers: { "Content-Type": "application/json" },
      });

      setTestResult('success');
      toast({
        title: "Test successful",
        description: "Test data was sent successfully to the configured endpoint.",
      });
    } catch (error) {
      setTestResult('error');
      toast({
        title: "Test failed",
        description: "Failed to send test data. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Proposal Form Management</h2>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="submissions">Submitted Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Form Submission Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="submissionUrl">Submission URL *</Label>
            <Input
              id="submissionUrl"
              placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              value={settings.submissionUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, submissionUrl: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter the Google Apps Script URL or other endpoint where form submissions should be sent.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleTest} 
              disabled={isTesting || !settings.submissionUrl}
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            {testResult === 'success' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Test successful</span>
              </div>
            )}

            {testResult === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Test failed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Data Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="testPreparedBy">Test Prepared By</Label>
              <Input
                id="testPreparedBy"
                value={settings.testData.preparedBy}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  testData: { ...prev.testData, preparedBy: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="testEmail">Test Email</Label>
              <Input
                id="testEmail"
                type="email"
                value={settings.testData.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  testData: { ...prev.testData, email: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="testCustomerName">Test Customer Name</Label>
              <Input
                id="testCustomerName"
                value={settings.testData.customerName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  testData: { ...prev.testData, customerName: e.target.value }
                }))}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This test data will be used when testing the form submission endpoint.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Google Sheets Integration:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Create a new Google Sheet for storing proposal submissions</li>
                <li>Go to Extensions → Apps Script in your Google Sheet</li>
                <li>Replace the default code with a script to handle POST requests</li>
                <li>Deploy the script as a web app with "Anyone" access</li>
                <li>Copy the deployment URL and paste it in the Submission URL field above</li>
                <li>Use the "Test Connection" button to verify the setup</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Alternative Endpoints:</h4>
              <p className="text-muted-foreground">
                You can also use other webhook services like Zapier, Make.com, or custom API endpoints 
                that accept JSON POST requests.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <SubmittedProposals />
        </TabsContent>
      </Tabs>
    </div>
  );
};
