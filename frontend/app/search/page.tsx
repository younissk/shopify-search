import { PageContainer } from "@/components/layout/PageContainer";
import { SearchExperience } from "@/components/search/SearchExperience";
import { searchProducts } from "@/lib/productSearch";

type SearchPageProps = {
  searchParams?: Promise<{
    query?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const serverStartTime = performance.now();
  console.log(`🖥️ [SERVER] Starting server-side search page render at ${new Date().toISOString()}`);
  
  const resolvedSearchParams = await searchParams;
  const initialQuery =
    typeof resolvedSearchParams?.query === "string" ? resolvedSearchParams.query : "";
  const trimmedInitialQuery = initialQuery.trim();
  let initialResults = null;
  let initialError: string | null = null;

  if (trimmedInitialQuery.length > 0) {
    console.log(`🖥️ [SERVER] Server-side search for: "${trimmedInitialQuery}"`);
    const serverSearchStartTime = performance.now();
    
    const { data, error } = await searchProducts({
      query: trimmedInitialQuery,
    });

    const serverSearchEndTime = performance.now();
    const serverSearchDuration = serverSearchEndTime - serverSearchStartTime;
    console.log(`🖥️ [SERVER] Server-side search completed in ${serverSearchDuration.toFixed(2)}ms (${(serverSearchDuration/1000).toFixed(2)}s)`);

    initialResults = data;
    initialError = error && !error.aborted ? error.message : null;
  }

  const serverEndTime = performance.now();
  const serverTotalTime = serverEndTime - serverStartTime;
  console.log(`🖥️ [SERVER] Total server-side render time: ${serverTotalTime.toFixed(2)}ms (${(serverTotalTime/1000).toFixed(2)}s)`);

  return (
    <PageContainer className="space-y-10">
      <SearchExperience
        initialQuery={initialQuery}
        initialResults={initialResults}
        initialError={initialError}
      />

    </PageContainer>
  );
}
