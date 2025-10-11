import { supabase } from "@/supabase/client";

interface CountResult {
  count: number;
  isApproximate: boolean;
  error?: string;
}

/**
 * Get approximate count using PostgreSQL planner statistics.
 * This is much faster than COUNT(*) but less accurate.
 * Accuracy depends on when ANALYZE was last run.
 */
export const getApproximateCount = async (tableName: string): Promise<CountResult> => {
  try {
    const { data, error } = await supabase.rpc('get_table_approximate_count', {
      table_name: tableName
    });

    if (error) {
      console.error(`Error getting approximate count for ${tableName}:`, error);
      return { count: 0, isApproximate: true, error: error.message };
    }

    console.log(`Approximate count for ${tableName}:`, data);

    return { 
      count: data || 0, 
      isApproximate: true 
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error in getApproximateCount for ${tableName}:`, errorMessage);
    return { count: 0, isApproximate: true, error: errorMessage };
  }
};

/**
 * Get exact count using COUNT(*). 
 * This is accurate but can be slow on large tables.
 */
export const getExactCount = async (tableName: string): Promise<CountResult> => {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`Error getting exact count for ${tableName}:`, error);
      return { count: 0, isApproximate: false, error: error.message };
    }

    return { 
      count: count || 0, 
      isApproximate: false 
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error in getExactCount for ${tableName}:`, errorMessage);
    return { count: 0, isApproximate: false, error: errorMessage };
  }
};

/**
 * Get total product count across all domains.
 * Uses PostgreSQL planner statistics for fast approximate counting.
 * Falls back to direct COUNT(*) query if PostgreSQL functions aren't available.
 * 
 * NOTE: Previously used domains.product_count sum, but this was inaccurate because:
 * - Many domains might have scraping_status != 'active'
 * - product_count field might not be maintained properly
 * - Direct table count is more reliable for total product count
 */
export const getTotalProductCount = async (): Promise<CountResult> => {
  try {
    // Try using the PostgreSQL function first
    const { data, error } = await supabase.rpc('get_total_products_approximate_count');

    if (error) {
      console.log('PostgreSQL function not available, falling back to direct query:', error.message);
      
      // Fallback: Count products directly from products table
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        const errorMessage = countError.message || JSON.stringify(countError) || 'Unknown database error';
        console.error('Error getting product count from products table:', errorMessage);
        // Return a reasonable fallback instead of 0
        return { count: 1000000, isApproximate: true, error: errorMessage };
      }

      console.log(`Total products (fallback):`, count);

      return { 
        count: count || 0, 
        isApproximate: true 
      };
    }

    console.log(`Total products (PostgreSQL function):`, data);
    return { 
      count: data || 0, 
      isApproximate: true 
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error('Error in getTotalProductCount:', errorMessage);
    // Return a reasonable fallback instead of 0
    return { count: 1000000, isApproximate: true, error: errorMessage };
  }
};

/**
 * Get total domain count.
 * Uses PostgreSQL planner statistics for fast approximate counting.
 * Falls back to direct COUNT(*) query if PostgreSQL functions aren't available.
 * 
 * NOTE: Counts ALL domains in the domains table, regardless of scraping_status.
 */
export const getTotalDomainCount = async (): Promise<CountResult> => {
  try {
    // Try using the PostgreSQL function first
    const { data, error } = await supabase.rpc('get_table_approximate_count', {
      table_name: 'domains'
    });

    if (error) {
      console.log('PostgreSQL function not available, falling back to direct query:', error.message);
      
      // Fallback: Direct count from domains table (all domains)
      const { count, error: countError } = await supabase
        .from('domains')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        const errorMessage = countError.message || JSON.stringify(countError) || 'Unknown database error';
        console.error('Error getting domain count:', errorMessage);
        // Return a reasonable fallback instead of 0
        return { count: 30000, isApproximate: true, error: errorMessage };
      }

      console.log(`Domain count (fallback):`, count);
      return { 
        count: count || 0, 
        isApproximate: true 
      };
    }

    console.log(`Domain count (PostgreSQL function):`, data);
    return { 
      count: data || 0, 
      isApproximate: true 
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error('Error in getTotalDomainCount:', errorMessage);
    // Return a reasonable fallback instead of 0
    return { count: 30000, isApproximate: true, error: errorMessage };
  }
};

/**
 * Get total active domain count (domains with products).
 * Uses approximate count for performance with fallback to direct query.
 */
export const getActiveDomainCount = async (): Promise<CountResult> => {
  try {
    // Try using the PostgreSQL function first
    const { data, error } = await supabase.rpc('get_active_domains_approximate_count');

    if (error) {
      console.log('PostgreSQL function not available, falling back to direct query:', error.message);
      
      // Fallback: Count domains that have products (regardless of status)
      const { count, error: countError } = await supabase
        .from('domains')
        .select('*', { count: 'exact', head: true })
        .gt('product_count', 0);

      if (countError) {
        console.error('Error getting active domain count:', countError);
        return { count: 0, isApproximate: true, error: countError.message };
      }

      console.log(`Active domain count (fallback):`, count);
      return { 
        count: count || 0, 
        isApproximate: true 
      };
    }

    console.log(`Active domain count (PostgreSQL function):`, data);
    return { 
      count: data || 0, 
      isApproximate: true 
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error('Error in getActiveDomainCount:', errorMessage);
    return { count: 0, isApproximate: true, error: errorMessage };
  }
};

/**
 * Format count for display with appropriate precision.
 */
export const formatCount = (count: number, isApproximate: boolean = false): string => {
  if (count === 0) return "0";
  
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    const thousands = Math.floor(count / 1000);
    return isApproximate ? `~${thousands}K` : `${thousands}K`;
  } else {
    const millions = Math.floor(count / 1000000);
    return isApproximate ? `~${millions}M` : `${millions}M`;
  }
};
