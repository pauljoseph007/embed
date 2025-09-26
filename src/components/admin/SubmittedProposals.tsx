import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  Filter,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import proposalStorageService, { ProposalSubmission } from "@/services/proposalStorageService";

export const SubmittedProposals = () => {
  const [proposals, setProposals] = useState<ProposalSubmission[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedProposal, setSelectedProposal] = useState<ProposalSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
    thisMonth: 0
  });

  // Load proposals on component mount
  useEffect(() => {
    loadProposals();
    loadStats();
    
    // Listen for real-time updates
    const handleProposalSubmitted = () => {
      loadProposals();
      loadStats();
    };
    
    const handleProposalUpdated = () => {
      loadProposals();
      loadStats();
    };

    window.addEventListener('proposalSubmitted', handleProposalSubmitted);
    window.addEventListener('proposalUpdated', handleProposalUpdated);
    window.addEventListener('proposalDeleted', handleProposalSubmitted);

    return () => {
      window.removeEventListener('proposalSubmitted', handleProposalSubmitted);
      window.removeEventListener('proposalUpdated', handleProposalUpdated);
      window.removeEventListener('proposalDeleted', handleProposalSubmitted);
    };
  }, []);

  // Apply filters when search query or filters change
  useEffect(() => {
    applyFilters();
  }, [proposals, searchQuery, statusFilter, dateFilter]);

  const loadProposals = () => {
    setIsLoading(true);
    try {
      const allProposals = proposalStorageService.getAllProposals();
      setProposals(allProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = () => {
    const proposalStats = proposalStorageService.getProposalStats();
    setStats(proposalStats);
  };

  const applyFilters = () => {
    let filtered = [...proposals];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = proposalStorageService.searchProposals(searchQuery);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(p => new Date(p.timestamp) >= startDate);
    }

    setFilteredProposals(filtered);
  };

  const updateProposalStatus = (id: string, status: ProposalSubmission['status']) => {
    const success = proposalStorageService.updateProposalStatus(id, status);
    if (success) {
      toast({
        title: "Status Updated",
        description: `Proposal status updated to ${status}`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update proposal status",
        variant: "destructive"
      });
    }
  };

  const deleteProposal = (id: string) => {
    const success = proposalStorageService.deleteProposal(id);
    if (success) {
      toast({
        title: "Proposal Deleted",
        description: "Proposal has been deleted successfully",
      });
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete proposal",
        variant: "destructive"
      });
    }
  };

  const exportProposal = (proposal: ProposalSubmission) => {
    const dataStr = JSON.stringify(proposal, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal_${proposal.formData.customerName.replace(/\s+/g, '_')}_${proposal.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Proposal data exported successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Submitted Proposals</h2>
        <Button variant="outline" size="sm" onClick={loadProposals}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-muted-foreground">Submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.reviewed}</div>
            <div className="text-sm text-muted-foreground">Reviewed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by customer, prepared by, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-filter">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proposals ({filteredProposals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading proposals...
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No proposals found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{proposal.formData.customerName}</h3>
                        <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div><strong>Prepared by:</strong> {proposal.formData.preparedBy}</div>
                        <div><strong>Type:</strong> {proposal.formData.requirementType}</div>
                        <div><strong>Submitted:</strong> {new Date(proposal.timestamp).toLocaleDateString()}</div>
                        <div><strong>ID:</strong> {proposal.id.slice(0, 8)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProposal(proposal)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Proposal Details - {proposal.formData.customerName}</DialogTitle>
                          </DialogHeader>
                          {selectedProposal && (
                            <ProposalDetailsView proposal={selectedProposal} onStatusUpdate={updateProposalStatus} />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => exportProposal(proposal)}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteProposal(proposal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Proposal Details View Component
interface ProposalDetailsViewProps {
  proposal: ProposalSubmission;
  onStatusUpdate: (id: string, status: ProposalSubmission['status']) => void;
}

const ProposalDetailsView: React.FC<ProposalDetailsViewProps> = ({ proposal, onStatusUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Status Update */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Label>Update Status:</Label>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={proposal.status === 'reviewed' ? 'default' : 'outline'}
            onClick={() => onStatusUpdate(proposal.id, 'reviewed')}
          >
            Mark as Reviewed
          </Button>
          <Button 
            size="sm" 
            variant={proposal.status === 'approved' ? 'default' : 'outline'}
            onClick={() => onStatusUpdate(proposal.id, 'approved')}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant={proposal.status === 'rejected' ? 'default' : 'outline'}
            onClick={() => onStatusUpdate(proposal.id, 'rejected')}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject
          </Button>
        </div>
      </div>

      {/* Proposal Content - Similar to ProposalSummary but read-only */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Submission Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Reference ID:</strong> {proposal.id}</div>
            <div><strong>Submission Date:</strong> {proposal.submissionDate}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Prepared By:</strong> {proposal.formData.preparedBy}</div>
            <div><strong>Email:</strong> {proposal.formData.email}</div>
            <div><strong>Customer Name:</strong> {proposal.formData.customerName}</div>
            <div><strong>Segment:</strong> {proposal.formData.customerSegment}</div>
            <div><strong>Requirement Type:</strong> {proposal.formData.requirementType}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>State:</strong> {proposal.formData.state || "-"}</div>
            <div><strong>Cities:</strong> {proposal.formData.cities.join(", ") || "-"}</div>
          </div>
        </div>

        {/* Add more sections as needed */}
      </div>
    </div>
  );
};
