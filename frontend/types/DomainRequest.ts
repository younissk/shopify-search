export interface DomainRequest {
  id: string;
  created_at: string;
  updated_at: string;
  requester_name?: string | null;
  requester_email?: string | null;
  action: 'add' | 'remove';
  domain: string;
  reason?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  auth_user_id?: string | null;
}

export interface CreateDomainRequestInput {
  requester_name?: string;
  requester_email?: string;
  action: 'add' | 'remove';
  domain: string;
  reason?: string;
  notes?: string;
}

export interface UpdateDomainRequestInput {
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface DomainRequestResult {
  data: DomainRequest | null;
  error: string | null;
}

export interface DomainRequestListResult {
  data: DomainRequest[] | null;
  error: string | null;
  total: number;
  hasMore: boolean;
}
