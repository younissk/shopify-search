import express from "npm:express@4.18.2";
import { createClient } from "npm:@supabase/supabase-js@2.46.1";

const app = express();
app.use(express.json());

// CORS allowlist
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "https://shopify-search.up.railway.app"
]);

const ALLOW_CREDENTIALS = false;
const ALLOW_HEADERS = [
  "authorization",
  "content-type",
  "x-client-info",
  "apikey"
];
const ALLOW_METHODS = [
  "GET",
  "OPTIONS"
];

// Performance constants
const QUERY_TIMEOUT_MS = 2500; // 2.5 seconds for DB query
const FUNCTION_TIMEOUT_MS = 4000; // 4 seconds total function time
const REQUIRED_FIELDS = 'product_id,domain,title,raw_json->images->0->src,raw_json->variants->0->price'; // Only first image and price
const MAX_RESULTS = 24; // Limit max results to prevent large responses
// Cache configuration
const CACHE_CONTROL_HEADER = 'public, s-maxage=60, stale-while-revalidate=30';
const CACHE_VARY_HEADER = 'Origin, Accept-Encoding';
const CACHE_TAG_PREFIX = 'search:';

app.use((req, res, next)=>{
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    if (ALLOW_CREDENTIALS) res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", ALLOW_METHODS.join(", "));
  res.setHeader("Access-Control-Allow-Headers", ALLOW_HEADERS.join(", "));
  
  // Short-circuit preflight
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

function toInt(val, def) {
  const n = val ? parseInt(val, 10) : def;
  return Number.isFinite(n) && n > 0 ? n : def;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: { persistSession: false },
    db: { schema: "public" }
  }
);

app.get("/products-search", async (req, res)=>{
  const startTime = performance.now();
  console.log(`[EDGE] Starting search request processing`);

  // Set overall function timeout
  const functionTimeoutId = setTimeout(() => {
    console.error(`[EDGE] Function timeout after ${FUNCTION_TIMEOUT_MS}ms`);
    res.status(504).json({
      error: "Function timeout",
      timestamp: new Date().toISOString()
    });
  }, FUNCTION_TIMEOUT_MS);
  
  try {
    // Early validation
    const q = (typeof req.query.q === "string" ? req.query.q : "").trim();
    if (!q) {
      clearTimeout(functionTimeoutId);
      res.status(200).json({
        items: [],
        total: 0,
        hasMore: false,
        nextCursor: null,
        sort: "recent"
      });
      return;
    }
    const domain = (typeof req.query.domain === "string" ? req.query.domain : "").trim() || undefined;
    const sort = (typeof req.query.sort === "string" ? req.query.sort : "rank").toLowerCase();
    const limit = Math.min(toInt(req.query.limit, 20), MAX_RESULTS);
    const cursor = req.query.cursor as string | undefined;
    
    console.log(`[EDGE] Query params: q="${q}", domain=${domain}, sort=${sort}, limit=${limit}, cursor=${cursor}`);
    
    let query = supabase.from("products")
      .select(REQUIRED_FIELDS, {
        count: "exact"
      });

    if (domain) query = query.eq("domain", domain);
    
    if (q) {
      const queryStartTime = performance.now();
      // Use the tsvector column backed by a GIN index for FTS
      query = query.textSearch("title_search", q, {
        type: "websearch",
        config: "english"
      });
      console.log(`[EDGE] Text search query built in ${performance.now() - queryStartTime}ms`);
    }

    // Use cursor-based pagination for better performance
    if (cursor) {
      query = query.lt('id', cursor).limit(limit + 1);
    } else {
      query = query.limit(limit + 1);
    }

    // Use composite index (title_search, updated_at) for efficient sorting
    query = query.order("updated_at", {
      ascending: false,
      nullsFirst: false
    });

    // Set query timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT_MS);
    });

    const queryPromise = query.abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
    
    console.log(`[EDGE] Executing database query`);
    const queryStartTime = performance.now();
    
    const { data, error, count } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    const queryDuration = performance.now() - queryStartTime;
    console.log(`[EDGE] Query completed in ${queryDuration}ms`);
    
    if (error) throw error;

    const total = count || 0;
    let hasMore = false;
    let nextCursor = null;

    if (data && data.length > limit) {
      hasMore = true;
      data.pop(); // Remove the extra item we fetched
      nextCursor = data[data.length - 1]?.id;
    }

    // Clear function timeout since we have data
    clearTimeout(functionTimeoutId);

    const response = {
      items: data || [],
      total: Math.min(total, MAX_RESULTS * 10), // Cap total to prevent huge numbers
      hasMore,
      nextCursor,
      sort: q ? sort : "recent"
    };

    // Set up caching headers
    const cacheKey = `${CACHE_TAG_PREFIX}${q}:${domain || '*'}`;
    
    // Set caching headers
    res.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
    res.setHeader('Vary', CACHE_VARY_HEADER);
    res.setHeader('Cache-Tag', cacheKey);
    res.setHeader('ETag', `"${response.items.length}-${Date.now()}"`);
    
    // Add Cloudflare-specific headers
    res.setHeader('CDN-Cache-Control', CACHE_CONTROL_HEADER);
    res.setHeader('Cloudflare-CDN-Cache-Control', CACHE_CONTROL_HEADER);
    
    const totalDuration = performance.now() - startTime;
    console.log(`[EDGE] Total request processing time: ${totalDuration}ms`);
    
    res.status(200).json(response);
    } catch (e) {
      console.error(`[EDGE] Error:`, e);
      clearTimeout(functionTimeoutId);
      
      // Return a more specific error status
      const status = e?.message?.includes('timeout') ? 504 : 500;
      res.status(status).json({
        error: e?.message || "Internal error",
        timestamp: new Date().toISOString()
      });
    }
});

app.get("/products-search/health", (_req, res)=>{
  res.json({ ok: true });
});

app.listen(8000, ()=>{
  console.info("products-search function started on :8000");
});
