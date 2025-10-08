import express from "npm:express@4.18.2";
import { createClient } from "npm:@supabase/supabase-js@2.46.1";
import { HfInference } from "npm:@huggingface/inference@2.6.1";

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
const REQUIRED_FIELDS = 'product_id,domain,title,raw_json->images->0->src,raw_json->variants->0->price';
const MAX_RESULTS = 24;
const SIMILARITY_THRESHOLD = 0.6; // Minimum cosine similarity score

// Cache configuration
const CACHE_CONTROL_HEADER = 'public, s-maxage=60, stale-while-revalidate=30';
const CACHE_VARY_HEADER = 'Origin';
const CACHE_TAG_PREFIX = 'semantic-search:';

app.use((req, res, next)=>{
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    if (ALLOW_CREDENTIALS) res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", ALLOW_METHODS.join(", "));
  res.setHeader("Access-Control-Allow-Headers", ALLOW_HEADERS.join(", "));
  
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

function toInt(val: string | undefined, def: number): number {
  const n = val ? parseInt(val, 10) : def;
  return Number.isFinite(n) && n > 0 ? n : def;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: { persistSession: false },
    db: { schema: "public" }
  }
);

const hf = new HfInference(Deno.env.get("HF_TOKEN"));

app.get("/products-semantic-search", async (req, res)=>{
  const startTime = performance.now();
  console.log(`[EDGE] Starting semantic search request processing`);

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
        sort: "similarity"
      });
      return;
    }

    const domain = (typeof req.query.domain === "string" ? req.query.domain : "").trim() || undefined;
    const limit = Math.min(toInt(req.query.limit as string, 20), MAX_RESULTS);
    const cursor = req.query.cursor as string | undefined;
    
    console.log(`[EDGE] Query params: q="${q}", domain=${domain}, limit=${limit}, cursor=${cursor}`);
    
    // Generate embedding for search query
    console.log(`[EDGE] Generating embedding for query`);
    const embeddingStartTime = performance.now();
    
    const embedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: q
    });

    console.log(`[EDGE] Embedding generated in ${performance.now() - embeddingStartTime}ms`);

    // Construct the query
    let query = supabase.rpc('match_products', {
      query_embedding: embedding,
      similarity_threshold: SIMILARITY_THRESHOLD,
      match_count: limit + 1
    });

    if (domain) {
      query = query.eq('domain', domain);
    }

    if (cursor) {
      query = query.lt('similarity', cursor);
    }

    // Set query timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT_MS);
    });

    const queryPromise = query;
    
    console.log(`[EDGE] Executing database query`);
    const queryStartTime = performance.now();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    const queryDuration = performance.now() - queryStartTime;
    console.log(`[EDGE] Query completed in ${queryDuration}ms`);
    
    if (error) throw error;

    let hasMore = false;
    let nextCursor = null;

    if (data && data.length > limit) {
      hasMore = true;
      data.pop(); // Remove the extra item we fetched
      nextCursor = data[data.length - 1]?.similarity;
    }

    // Clear function timeout since we have data
    clearTimeout(functionTimeoutId);

    const response = {
      items: data || [],
      total: data?.length || 0,
      hasMore,
      nextCursor,
      sort: "similarity"
    };

    // Set up caching headers
    const cacheKey = `${CACHE_TAG_PREFIX}${q}:${domain || '*'}`;
    
    // Set caching headers
    res.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
    res.setHeader('Vary', CACHE_VARY_HEADER);
    res.setHeader('Cache-Tag', cacheKey);
    res.setHeader('ETag', `"${response.items.length}-${Date.now()}"`);
    
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

app.get("/products-semantic-search/health", (_req, res)=>{
  res.json({ ok: true });
});

app.listen(8000, ()=>{
  console.info("products-semantic-search function started on :8000");
});
