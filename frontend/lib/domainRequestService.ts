import { 
  createDomainRequest, 
  updateDomainRequest, 
  getDomainRequests,
  approveDomainRequest,
  rejectDomainRequest,
  getUserDomainRequests 
} from "@/supabase/domainRequest";

/**
 * Example usage of domain request functions
 */
export class DomainRequestService {
  /**
   * Submit a request to add a new domain
   */
  static async requestAddDomain(
    domain: string,
    requesterName?: string,
    requesterEmail?: string,
    reason?: string
  ) {
    return await createDomainRequest({
      action: 'add',
      domain,
      requester_name: requesterName,
      requester_email: requesterEmail,
      reason,
    });
  }

  /**
   * Submit a request to remove a domain
   */
  static async requestRemoveDomain(
    domain: string,
    requesterName?: string,
    requesterEmail?: string,
    reason?: string
  ) {
    return await createDomainRequest({
      action: 'remove',
      domain,
      requester_name: requesterName,
      requester_email: requesterEmail,
      reason,
    });
  }

  /**
   * Get all pending requests (for admin review)
   */
  static async getPendingRequests(page: number = 1) {
    return await getDomainRequests(page, 'pending');
  }

  /**
   * Get all approved requests
   */
  static async getApprovedRequests(page: number = 1) {
    return await getDomainRequests(page, 'approved');
  }

  /**
   * Get all rejected requests
   */
  static async getRejectedRequests(page: number = 1) {
    return await getDomainRequests(page, 'rejected');
  }

  /**
   * Get all add requests
   */
  static async getAddRequests(page: number = 1) {
    return await getDomainRequests(page, undefined, 'add');
  }

  /**
   * Get all remove requests
   */
  static async getRemoveRequests(page: number = 1) {
    return await getDomainRequests(page, undefined, 'remove');
  }

  /**
   * Admin: Approve a domain request
   */
  static async approveRequest(requestId: string, adminNotes?: string) {
    return await approveDomainRequest(requestId, adminNotes);
  }

  /**
   * Admin: Reject a domain request
   */
  static async rejectRequest(requestId: string, adminNotes?: string) {
    return await rejectDomainRequest(requestId, adminNotes);
  }

  /**
   * Get requests for a specific user
   */
  static async getUserRequests(userId: string, page: number = 1) {
    return await getUserDomainRequests(userId, page);
  }
}
