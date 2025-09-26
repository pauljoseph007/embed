import { v4 as uuidv4 } from 'uuid';

export interface ProposalSubmission {
  id: string;
  timestamp: string;
  submissionDate: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  formData: {
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
  };
}

class ProposalStorageService {
  private readonly STORAGE_KEY = 'sdx-proposal-submissions';

  // Generate unique ID for submission
  private generateId(): string {
    return uuidv4();
  }

  // Get all proposals from localStorage
  getAllProposals(): ProposalSubmission[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading proposals from localStorage:', error);
      return [];
    }
  }

  // Save a new proposal submission
  saveProposal(formData: ProposalSubmission['formData']): ProposalSubmission {
    try {
      const now = new Date();
      const submission: ProposalSubmission = {
        id: this.generateId(),
        timestamp: now.toISOString(),
        submissionDate: now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'submitted',
        formData
      };

      const proposals = this.getAllProposals();
      proposals.unshift(submission); // Add to beginning for newest first
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proposals));
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new CustomEvent('proposalSubmitted', { 
        detail: submission 
      }));

      return submission;
    } catch (error) {
      console.error('Error saving proposal to localStorage:', error);
      throw new Error('Failed to save proposal');
    }
  }

  // Get proposal by ID
  getProposalById(id: string): ProposalSubmission | null {
    const proposals = this.getAllProposals();
    return proposals.find(p => p.id === id) || null;
  }

  // Update proposal status
  updateProposalStatus(id: string, status: ProposalSubmission['status']): boolean {
    try {
      const proposals = this.getAllProposals();
      const index = proposals.findIndex(p => p.id === id);
      
      if (index === -1) return false;
      
      proposals[index].status = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proposals));
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('proposalUpdated', { 
        detail: proposals[index] 
      }));

      return true;
    } catch (error) {
      console.error('Error updating proposal status:', error);
      return false;
    }
  }

  // Delete proposal
  deleteProposal(id: string): boolean {
    try {
      const proposals = this.getAllProposals();
      const filteredProposals = proposals.filter(p => p.id !== id);
      
      if (filteredProposals.length === proposals.length) return false;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProposals));
      
      // Trigger delete event
      window.dispatchEvent(new CustomEvent('proposalDeleted', { 
        detail: { id } 
      }));

      return true;
    } catch (error) {
      console.error('Error deleting proposal:', error);
      return false;
    }
  }

  // Search proposals
  searchProposals(query: string): ProposalSubmission[] {
    const proposals = this.getAllProposals();
    const lowercaseQuery = query.toLowerCase();
    
    return proposals.filter(proposal => 
      proposal.formData.customerName.toLowerCase().includes(lowercaseQuery) ||
      proposal.formData.preparedBy.toLowerCase().includes(lowercaseQuery) ||
      proposal.formData.email.toLowerCase().includes(lowercaseQuery) ||
      proposal.formData.requirementType.toLowerCase().includes(lowercaseQuery) ||
      proposal.formData.customerSegment.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Filter proposals by date range
  filterProposalsByDateRange(startDate: Date, endDate: Date): ProposalSubmission[] {
    const proposals = this.getAllProposals();
    
    return proposals.filter(proposal => {
      const proposalDate = new Date(proposal.timestamp);
      return proposalDate >= startDate && proposalDate <= endDate;
    });
  }

  // Get proposals statistics
  getProposalStats(): {
    total: number;
    submitted: number;
    reviewed: number;
    approved: number;
    rejected: number;
    thisMonth: number;
  } {
    const proposals = this.getAllProposals();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      total: proposals.length,
      submitted: proposals.filter(p => p.status === 'submitted').length,
      reviewed: proposals.filter(p => p.status === 'reviewed').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      thisMonth: proposals.filter(p => new Date(p.timestamp) >= thisMonth).length
    };
  }

  // Export proposals to JSON
  exportProposals(): string {
    const proposals = this.getAllProposals();
    return JSON.stringify(proposals, null, 2);
  }

  // Import proposals from JSON
  importProposals(jsonData: string): boolean {
    try {
      const importedProposals = JSON.parse(jsonData) as ProposalSubmission[];
      
      // Validate structure
      if (!Array.isArray(importedProposals)) {
        throw new Error('Invalid data format');
      }

      const existingProposals = this.getAllProposals();
      const mergedProposals = [...existingProposals, ...importedProposals];
      
      // Remove duplicates by ID
      const uniqueProposals = mergedProposals.filter((proposal, index, self) =>
        index === self.findIndex(p => p.id === proposal.id)
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(uniqueProposals));
      return true;
    } catch (error) {
      console.error('Error importing proposals:', error);
      return false;
    }
  }
}

export const proposalStorageService = new ProposalStorageService();
export default proposalStorageService;
