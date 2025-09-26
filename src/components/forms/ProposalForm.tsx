import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Send, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import statesCities from "@/data/statesCities";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import proposalStorageService, { ProposalSubmission } from "@/services/proposalStorageService";

interface ProposalFormData {
  preparedBy: string;
  email: string;
  customerName: string;
  customerSegment: string;
  requirementType: string;
  state: string;
  cities: string[];
  otherCity: string;
  vehicleCondition: string;
  vehiclesWithin: { bls: number; als: number; pt: number };
  vehiclesBeyond: { bls: number; als: number; pt: number };
  driversIncluded: boolean;
  driverCount: number;
  driverSkill: string;
  paramedicsIncluded: boolean;
  paramedicCount: number;
  paramedicSkill: string;
  indicativeStartMonth: string;
  sla: string;
  specialRequirements: string;
  billingPattern: string;
  minCharge: string;
  expectedUsage: string;
  expectedRevenue: string;
  otherRevenue: string;
  discount: string;
  contractDuration: string;
  dieselIncluded: boolean;
  maintenanceIncluded: boolean;
  otherInclusion: string;
  termsOfPayment: string;
  riskFactors: string;
}

interface ProposalFormProps {
  onBack?: () => void;
}

// Form Content Component
interface ProposalFormContentProps {
  formData: ProposalFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string | number | boolean) => void;
  onCityChange: (city: string, checked: boolean) => void;
  onVehicleChange: (location: 'vehiclesWithin' | 'vehiclesBeyond', type: 'bls' | 'als' | 'pt', value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isSubmitting: boolean;
}

const ProposalFormContent: React.FC<ProposalFormContentProps> = ({
  formData,
  onSubmit,
  onChange,
  onSelectChange,
  onCityChange,
  onVehicleChange,
  onKeyDown,
  isSubmitting
}) => {
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Proposal Submission Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} onKeyDown={onKeyDown} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preparedBy">Prepared By *</Label>
                <Input
                  id="preparedBy"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={onChange}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={onChange}
                  required
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerSegment">Customer Segment *</Label>
                <Select value={formData.customerSegment} onValueChange={(value) => onSelectChange('customerSegment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Private Company">Private Company</SelectItem>
                    <SelectItem value="Event Organiser">Event Organiser</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requirementType">Requirement Type *</Label>
                <Select value={formData.requirementType} onValueChange={(value) => onSelectChange('requirementType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                    <SelectItem value="Medu ERS">Medu ERS</SelectItem>
                    <SelectItem value="Medu Clinic">Medu Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => {
                    onSelectChange('state', value);
                    // Clear cities when state changes
                    formData.cities = [];
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statesCities).map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cities</Label>
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  {formData.state && statesCities[formData.state as keyof typeof statesCities] ? (
                    <div className="space-y-2">
                      {statesCities[formData.state as keyof typeof statesCities].map((city) => (
                        <div key={city} className="flex items-center space-x-2">
                          <Checkbox
                            id={`city-${city}`}
                            checked={formData.cities.includes(city)}
                            onCheckedChange={(checked) => onCityChange(city, checked as boolean)}
                          />
                          <Label htmlFor={`city-${city}`} className="text-sm">{city}</Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="city-other"
                          checked={formData.cities.includes("Other")}
                          onCheckedChange={(checked) => onCityChange("Other", checked as boolean)}
                        />
                        <Label htmlFor="city-other" className="text-sm">Other</Label>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Please select a state first</p>
                  )}
                </div>
                {formData.cities.includes("Other") && (
                  <Input
                    placeholder="Enter other city"
                    value={formData.otherCity}
                    onChange={(e) => onSelectChange('otherCity', e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Vehicles Required */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Vehicles Required</h3>
            <div className="space-y-2">
              <Label htmlFor="vehicleCondition">Vehicle Condition</Label>
              <Select value={formData.vehicleCondition} onValueChange={(value) => onSelectChange('vehicleCondition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Within City */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Within City Limits</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="bls-within">BLS</Label>
                    <Input
                      id="bls-within"
                      type="number"
                      min="0"
                      value={formData.vehiclesWithin.bls}
                      onChange={(e) => onVehicleChange('vehiclesWithin', 'bls', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="als-within">ALS</Label>
                    <Input
                      id="als-within"
                      type="number"
                      min="0"
                      value={formData.vehiclesWithin.als}
                      onChange={(e) => onVehicleChange('vehiclesWithin', 'als', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pt-within">PT</Label>
                    <Input
                      id="pt-within"
                      type="number"
                      min="0"
                      value={formData.vehiclesWithin.pt}
                      onChange={(e) => onVehicleChange('vehiclesWithin', 'pt', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Beyond City */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Beyond City Limits</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="bls-beyond">BLS</Label>
                    <Input
                      id="bls-beyond"
                      type="number"
                      min="0"
                      value={formData.vehiclesBeyond.bls}
                      onChange={(e) => onVehicleChange('vehiclesBeyond', 'bls', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="als-beyond">ALS</Label>
                    <Input
                      id="als-beyond"
                      type="number"
                      min="0"
                      value={formData.vehiclesBeyond.als}
                      onChange={(e) => onVehicleChange('vehiclesBeyond', 'als', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pt-beyond">PT</Label>
                    <Input
                      id="pt-beyond"
                      type="number"
                      min="0"
                      value={formData.vehiclesBeyond.pt}
                      onChange={(e) => onVehicleChange('vehiclesBeyond', 'pt', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staffing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Staffing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drivers */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="driversIncluded"
                    checked={formData.driversIncluded}
                    onCheckedChange={(checked) => onSelectChange('driversIncluded', checked as boolean)}
                  />
                  <Label htmlFor="driversIncluded" className="font-medium">Driver Included</Label>
                </div>
                {formData.driversIncluded && (
                  <div className="space-y-3 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="driverCount">Driver Count</Label>
                      <Input
                        id="driverCount"
                        type="number"
                        min="0"
                        value={formData.driverCount}
                        onChange={(e) => onSelectChange('driverCount', Number(e.target.value))}
                        placeholder="Enter count"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Driver Skill Level</Label>
                      <RadioGroup
                        value={formData.driverSkill}
                        onValueChange={(value) => onSelectChange('driverSkill', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Skilled" id="driver-skilled" />
                          <Label htmlFor="driver-skilled">Skilled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Semi-skilled" id="driver-semi-skilled" />
                          <Label htmlFor="driver-semi-skilled">Semi-skilled</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              {/* Paramedics */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paramedicsIncluded"
                    checked={formData.paramedicsIncluded}
                    onCheckedChange={(checked) => onSelectChange('paramedicsIncluded', checked as boolean)}
                  />
                  <Label htmlFor="paramedicsIncluded" className="font-medium">Paramedic Included</Label>
                </div>
                {formData.paramedicsIncluded && (
                  <div className="space-y-3 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="paramedicCount">Paramedic Count</Label>
                      <Input
                        id="paramedicCount"
                        type="number"
                        min="0"
                        value={formData.paramedicCount}
                        onChange={(e) => onSelectChange('paramedicCount', Number(e.target.value))}
                        placeholder="Enter count"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Paramedic Skill Level</Label>
                      <RadioGroup
                        value={formData.paramedicSkill}
                        onValueChange={(value) => onSelectChange('paramedicSkill', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Skilled" id="paramedic-skilled" />
                          <Label htmlFor="paramedic-skilled">Skilled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Semi-skilled" id="paramedic-semi-skilled" />
                          <Label htmlFor="paramedic-semi-skilled">Semi-skilled</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Financials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="indicativeStartMonth">Indicative Start Month</Label>
                <Input
                  id="indicativeStartMonth"
                  type="month"
                  value={formData.indicativeStartMonth}
                  onChange={onChange}
                  name="indicativeStartMonth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA (Response Time in minutes)</Label>
                <Input
                  id="sla"
                  type="number"
                  min="0"
                  value={formData.sla}
                  onChange={onChange}
                  name="sla"
                  placeholder="Enter response time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={onChange}
                rows={3}
                placeholder="Enter any special requirements"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingPattern">Billing Pattern</Label>
                <Select value={formData.billingPattern} onValueChange={(value) => onSelectChange('billingPattern', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Per Km">Per Km</SelectItem>
                    <SelectItem value="Per Trip">Per Trip</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Per Activity">Per Activity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minCharge">Minimum Charge (₹)</Label>
                <Input
                  id="minCharge"
                  type="number"
                  min="0"
                  value={formData.minCharge}
                  onChange={onChange}
                  name="minCharge"
                  placeholder="Enter minimum charge"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedUsage">Expected Usage (KM/month)</Label>
                <Input
                  id="expectedUsage"
                  type="number"
                  min="0"
                  value={formData.expectedUsage}
                  onChange={onChange}
                  name="expectedUsage"
                  placeholder="Enter expected usage"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedRevenue">Expected Monthly Revenue (₹)</Label>
                <Input
                  id="expectedRevenue"
                  type="number"
                  min="0"
                  value={formData.expectedRevenue}
                  onChange={onChange}
                  name="expectedRevenue"
                  placeholder="Enter expected revenue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={onChange}
                  name="discount"
                  placeholder="Enter discount percentage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractDuration">Contract Duration (months)</Label>
                <Input
                  id="contractDuration"
                  type="number"
                  min="0"
                  value={formData.contractDuration}
                  onChange={onChange}
                  name="contractDuration"
                  placeholder="Enter contract duration"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherRevenue">Other Revenue Opportunities</Label>
              <Textarea
                id="otherRevenue"
                name="otherRevenue"
                value={formData.otherRevenue}
                onChange={onChange}
                rows={3}
                placeholder="Describe other revenue opportunities"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dieselIncluded"
                  checked={formData.dieselIncluded}
                  onCheckedChange={(checked) => onSelectChange('dieselIncluded', checked as boolean)}
                />
                <Label htmlFor="dieselIncluded">Diesel Included</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenanceIncluded"
                  checked={formData.maintenanceIncluded}
                  onCheckedChange={(checked) => onSelectChange('maintenanceIncluded', checked as boolean)}
                />
                <Label htmlFor="maintenanceIncluded">Maintenance Included</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherInclusion">Other Inclusion</Label>
                <Input
                  id="otherInclusion"
                  name="otherInclusion"
                  value={formData.otherInclusion}
                  onChange={onChange}
                  placeholder="Enter other inclusions"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="termsOfPayment">Terms of Payment</Label>
                <Textarea
                  id="termsOfPayment"
                  name="termsOfPayment"
                  value={formData.termsOfPayment}
                  onChange={onChange}
                  rows={3}
                  placeholder="Enter payment terms and conditions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskFactors">Risk Factors</Label>
                <Textarea
                  id="riskFactors"
                  name="riskFactors"
                  value={formData.riskFactors}
                  onChange={onChange}
                  rows={3}
                  placeholder="Identify potential risk factors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={isSubmitting} className="px-8">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Summary Component
interface ProposalSummaryProps {
  formData: ProposalFormData;
  submittedProposal: ProposalSubmission | null;
  onExportPDF: () => void;
  onSubmitAnother: () => void;
}

const ProposalSummary: React.FC<ProposalSummaryProps> = ({ formData, submittedProposal, onExportPDF, onSubmitAnother }) => {
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <CardTitle className="text-2xl text-green-600">Proposal Submitted Successfully</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div id="proposal-summary" className="bg-muted/50 p-6 rounded-lg space-y-6">
          {/* Submission Details */}
          {submittedProposal && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-800">Submission Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Reference ID:</strong> {submittedProposal.id}</div>
                <div><strong>Submission Date:</strong> {submittedProposal.submissionDate}</div>
                <div><strong>Status:</strong> <span className="capitalize text-green-600 font-medium">{submittedProposal.status}</span></div>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Prepared By:</strong> {formData.preparedBy || "-"}</div>
              <div><strong>Email:</strong> {formData.email || "-"}</div>
              <div><strong>Customer Name:</strong> {formData.customerName || "-"}</div>
              <div><strong>Segment:</strong> {formData.customerSegment || "-"}</div>
              <div className="md:col-span-2"><strong>Requirement Type:</strong> {formData.requirementType || "-"}</div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>State:</strong> {formData.state || "-"}</div>
              <div><strong>Cities:</strong> {formData.cities.length > 0 ? formData.cities.join(", ") : "-"}</div>
              {formData.otherCity && (
                <div className="md:col-span-2"><strong>Other City:</strong> {formData.otherCity}</div>
              )}
            </div>
          </div>

          {/* Vehicles */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Vehicles</h3>
            <div className="text-sm space-y-3">
              <div><strong>Vehicle Condition:</strong> {formData.vehicleCondition || "-"}</div>
              <div>
                <h4 className="font-medium">Within City Limits</h4>
                <div className="grid grid-cols-3 gap-2 ml-4">
                  <div><strong>BLS:</strong> {formData.vehiclesWithin.bls || 0}</div>
                  <div><strong>ALS:</strong> {formData.vehiclesWithin.als || 0}</div>
                  <div><strong>PT:</strong> {formData.vehiclesWithin.pt || 0}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Beyond City Limits</h4>
                <div className="grid grid-cols-3 gap-2 ml-4">
                  <div><strong>BLS:</strong> {formData.vehiclesBeyond.bls || 0}</div>
                  <div><strong>ALS:</strong> {formData.vehiclesBeyond.als || 0}</div>
                  <div><strong>PT:</strong> {formData.vehiclesBeyond.pt || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staffing */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Staffing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>Drivers:</strong>{" "}
                {formData.driversIncluded ? `${formData.driverCount || 0} (${formData.driverSkill || "N/A"})` : "Not included"}
              </div>
              <div>
                <strong>Paramedics:</strong>{" "}
                {formData.paramedicsIncluded ? `${formData.paramedicCount || 0} (${formData.paramedicSkill || "N/A"})` : "Not included"}
              </div>
            </div>
          </div>

          {/* Service & Financials */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Service & Financials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Indicative Start Month:</strong> {formData.indicativeStartMonth ? new Date(formData.indicativeStartMonth + "-01").toLocaleString(undefined, { month: "long", year: "numeric" }) : "-"}</div>
              <div><strong>SLA (mins):</strong> {formData.sla || "-"}</div>
              <div><strong>Billing Pattern:</strong> {formData.billingPattern || "-"}</div>
              <div><strong>Minimum Charge (₹):</strong> {formData.minCharge || "-"}</div>
              <div><strong>Expected Usage (KM/month):</strong> {formData.expectedUsage || "-"}</div>
              <div><strong>Expected Monthly Revenue (₹):</strong> {formData.expectedRevenue || "-"}</div>
              <div><strong>Discount (%):</strong> {formData.discount || "-"}</div>
              <div><strong>Contract Duration (months):</strong> {formData.contractDuration || "-"}</div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div><strong>Special Requirements:</strong> <div className="whitespace-pre-wrap">{formData.specialRequirements || "-"}</div></div>
              <div><strong>Other Revenue Opportunities:</strong> <div className="whitespace-pre-wrap">{formData.otherRevenue || "-"}</div></div>
              <div className="grid grid-cols-3 gap-3">
                <div><strong>Diesel Included:</strong> {formData.dieselIncluded ? "Yes" : "No"}</div>
                <div><strong>Maintenance Included:</strong> {formData.maintenanceIncluded ? "Yes" : "No"}</div>
                <div><strong>Other Inclusion:</strong> {formData.otherInclusion || "-"}</div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Terms</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Terms of Payment:</strong> <div className="whitespace-pre-wrap">{formData.termsOfPayment || "-"}</div></div>
              <div><strong>Risk Factors:</strong> <div className="whitespace-pre-wrap">{formData.riskFactors || "-"}</div></div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onSubmitAnother} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Submit Another
          </Button>
          <Button onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProposalForm: React.FC<ProposalFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<ProposalFormData>({
    preparedBy: "",
    email: "",
    customerName: "",
    customerSegment: "",
    requirementType: "",
    state: "",
    cities: [],
    otherCity: "",
    vehicleCondition: "",
    vehiclesWithin: { bls: 0, als: 0, pt: 0 },
    vehiclesBeyond: { bls: 0, als: 0, pt: 0 },
    driversIncluded: false,
    driverCount: 0,
    driverSkill: "",
    paramedicsIncluded: false,
    paramedicCount: 0,
    paramedicSkill: "",
    indicativeStartMonth: "",
    sla: "",
    specialRequirements: "",
    billingPattern: "",
    minCharge: "",
    expectedUsage: "",
    expectedRevenue: "",
    otherRevenue: "",
    discount: "",
    contractDuration: "",
    dieselIncluded: false,
    maintenanceIncluded: false,
    otherInclusion: "",
    termsOfPayment: "",
    riskFactors: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submittedProposal, setSubmittedProposal] = useState<ProposalSubmission | null>(null);

  useEffect(() => {
    // Load submission URL from admin settings
    const savedSettings = localStorage.getItem('proposal-form-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setSubmissionUrl(settings.submissionUrl || "");
      } catch (error) {
        console.error('Failed to load proposal form settings:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCityChange = (city: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cities: checked 
        ? [...prev.cities, city]
        : prev.cities.filter(c => c !== city)
    }));
  };

  const handleVehicleChange = (location: 'vehiclesWithin' | 'vehiclesBeyond', type: 'bls' | 'als' | 'pt', value: string) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        [type]: Number(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Save to local storage first
      const savedProposal = proposalStorageService.saveProposal(formData);
      setSubmittedProposal(savedProposal);

      // If submission URL is configured, also send to external endpoint
      if (submissionUrl) {
        try {
          await fetch(submissionUrl, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
              ...formData,
              submissionId: savedProposal.id,
              timestamp: savedProposal.timestamp
            }),
            headers: { "Content-Type": "application/json" },
          });
        } catch (externalError) {
          console.warn("External submission failed, but data is saved locally:", externalError);
        }
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast({
        title: "Proposal Submitted",
        description: `Your proposal has been submitted successfully! Reference ID: ${savedProposal.id.slice(0, 8)}`,
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Submission Failed",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    const input = document.getElementById("proposal-summary");
    if (!input) {
      toast({
        title: "Export Error",
        description: "Cannot find summary area to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Add header with branding
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // Primary blue color
      pdf.text("SDX Partners Intelligence Portal", margin, 20);

      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Business Proposal Submission", margin, 30);

      // Add reference ID and date
      if (submittedProposal) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Reference ID: ${submittedProposal.id}`, margin, 40);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pdfWidth - 60, 40);
      }

      // Add line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, 45, pdfWidth - margin, 45);

      // Calculate image dimensions
      const imgWidth = pdfWidth - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 55; // Start after header
      const availableHeight = pdfHeight - margin - position;

      if (imgHeight <= availableHeight) {
        // Single page
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      } else {
        // Multiple pages
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        let heightLeft = imgHeight - availableHeight;

        while (heightLeft > 0) {
          pdf.addPage();
          position = margin - heightLeft;
          pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - margin * 2);
        }
      }

      // Add footer to last page
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 30, pdfHeight - 10);
        pdf.text("SDX Partners Intelligence Portal", margin, pdfHeight - 10);
      }

      const referenceId = submittedProposal?.id.slice(0, 8) || 'export';
      const customerName = (formData.customerName || "proposal").replace(/\s+/g, "_");
      const fileName = `SDX_Proposal_${customerName}_${referenceId}.pdf`;

      pdf.save(fileName);

      toast({
        title: "PDF Exported",
        description: `Proposal exported as ${fileName}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Proposal Form</h1>
                  <p className="text-sm text-muted-foreground">SDX Partners Intelligence Portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {submitted ? (
            <ProposalSummary
              formData={formData}
              submittedProposal={submittedProposal}
              onExportPDF={handleExportPDF}
              onSubmitAnother={() => {
                setSubmitted(false);
                setSubmittedProposal(null);
                setFormData({
                  preparedBy: "",
                  email: "",
                  customerName: "",
                  customerSegment: "",
                  requirementType: "",
                  state: "",
                  cities: [],
                  otherCity: "",
                  vehicleCondition: "",
                  vehiclesWithin: { bls: 0, als: 0, pt: 0 },
                  vehiclesBeyond: { bls: 0, als: 0, pt: 0 },
                  driversIncluded: false,
                  driverCount: 0,
                  driverSkill: "",
                  paramedicsIncluded: false,
                  paramedicCount: 0,
                  paramedicSkill: "",
                  indicativeStartMonth: "",
                  sla: "",
                  specialRequirements: "",
                  billingPattern: "",
                  minCharge: "",
                  expectedUsage: "",
                  expectedRevenue: "",
                  otherRevenue: "",
                  discount: "",
                  contractDuration: "",
                  dieselIncluded: false,
                  maintenanceIncluded: false,
                  otherInclusion: "",
                  termsOfPayment: "",
                  riskFactors: "",
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <ProposalFormContent
              formData={formData}
              onSubmit={handleSubmit}
              onChange={handleChange}
              onSelectChange={handleSelectChange}
              onCityChange={handleCityChange}
              onVehicleChange={handleVehicleChange}
              onKeyDown={handleKeyDown}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </main>
    </div>
  );
};
