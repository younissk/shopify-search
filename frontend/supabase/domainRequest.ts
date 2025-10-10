import { supabase } from "./client";
import { 
  DomainRequest, 
  CreateDomainRequestInput, 
  UpdateDomainRequestInput,
  DomainRequestResult,
  DomainRequestListResult 
} from "@/types/DomainRequest";

export const ITEMS_PER_PAGE = 20;

/**
 * Creates a new domain request
 */
export const createDomainRequest = async (
  input: CreateDomainRequestInput
): Promise<DomainRequestResult> => {
  try {
    const { data, error } = await supabase
      .from("domain-requests")
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating domain request:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error creating domain request:", errorMessage);
    return { data: null, error: errorMessage };
  }
};

/**
 * Updates an existing domain request
 */
export const updateDomainRequest = async (
  id: string,
  input: UpdateDomainRequestInput
): Promise<DomainRequestResult> => {
  try {
    const { data, error } = await supabase
      .from("domain-requests")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating domain request:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error updating domain request:", errorMessage);
    return { data: null, error: errorMessage };
  }
};

/**
 * Gets a single domain request by ID
 */
export const getDomainRequest = async (
  id: string
): Promise<DomainRequestResult> => {
  try {
    const { data, error } = await supabase
      .from("domain-requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error fetching domain request:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching domain request:", errorMessage);
    return { data: null, error: errorMessage };
  }
};

/**
 * Gets all domain requests with pagination
 */
export const getDomainRequests = async (
  page: number = 1,
  status?: 'pending' | 'approved' | 'rejected',
  action?: 'add' | 'remove'
): Promise<DomainRequestListResult> => {
  try {
    // Calculate start and end for pagination
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    // Build query
    let query = supabase
      .from("domain-requests")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (action) {
      query = query.eq("action", action);
    }

    // Get total count first
    const { count, error: countError } = await query;

    if (countError) {
      console.error("Supabase count error:", countError);
      return {
        data: null,
        error: countError.message,
        total: 0,
        hasMore: false,
      };
    }

    // Get paginated data
    const { data: requests, error } = await query
      .range(start, end)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return { data: null, error: error.message, total: 0, hasMore: false };
    }

    const total = count || 0;
    const hasMore = total > page * ITEMS_PER_PAGE;

    return { data: requests || [], error: null, total, hasMore };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching domain requests:", errorMessage);
    return { data: null, error: errorMessage, total: 0, hasMore: false };
  }
};

/**
 * Gets domain requests for a specific user
 */
export const getUserDomainRequests = async (
  userId: string,
  page: number = 1
): Promise<DomainRequestListResult> => {
  try {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    // Get total count first
    const { count, error: countError } = await supabase
      .from("domain-requests")
      .select("*", { count: "exact", head: true })
      .eq("auth_user_id", userId);

    if (countError) {
      console.error("Supabase count error:", countError);
      return {
        data: null,
        error: countError.message,
        total: 0,
        hasMore: false,
      };
    }

    // Get paginated data
    const { data: requests, error } = await supabase
      .from("domain-requests")
      .select("*")
      .eq("auth_user_id", userId)
      .range(start, end)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return { data: null, error: error.message, total: 0, hasMore: false };
    }

    const total = count || 0;
    const hasMore = total > page * ITEMS_PER_PAGE;

    return { data: requests || [], error: null, total, hasMore };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching user domain requests:", errorMessage);
    return { data: null, error: errorMessage, total: 0, hasMore: false };
  }
};

/**
 * Deletes a domain request
 */
export const deleteDomainRequest = async (
  id: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from("domain-requests")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting domain request:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error deleting domain request:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Approves a domain request
 */
export const approveDomainRequest = async (
  id: string,
  notes?: string
): Promise<DomainRequestResult> => {
  return updateDomainRequest(id, { 
    status: 'approved', 
    notes: notes || undefined 
  });
};

/**
 * Rejects a domain request
 */
export const rejectDomainRequest = async (
  id: string,
  notes?: string
): Promise<DomainRequestResult> => {
  return updateDomainRequest(id, { 
    status: 'rejected', 
    notes: notes || undefined 
  });
};
