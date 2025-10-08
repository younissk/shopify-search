import { StatsSummary } from "@/components/StatsSummary";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchExperience } from "@/components/search/SearchExperience";
import { getCatalogueStatistics } from "@/supabase/stats";
import { searchProducts } from "@/lib/productSearch";

type SearchPageProps = {
  searchParams?: Promise<{
    query?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialQuery =
    typeof resolvedSearchParams?.query === "string" ? resolvedSearchParams.query : "";
  const trimmedInitialQuery = initialQuery.trim();
  const { data: stats } = await getCatalogueStatistics();
  let initialResults = null;
  let initialError: string | null = null;

  if (trimmedInitialQuery.length > 0) {
    const { data, error } = await searchProducts({
      query: trimmedInitialQuery,
      page: 1,
    });

    initialResults = data;
    initialError = error && !error.aborted ? error.message : null;
  }

  return (
    <PageContainer className="space-y-10">
      <SearchExperience
        initialQuery={initialQuery}
        initialResults={initialResults}
        initialError={initialError}
      />

      {stats ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-secondary">
            Catalogue snapshot
          </h2>
          <StatsSummary stats={stats} />
        </section>
      ) : null}
    </PageContainer>
  );
}
