import { PageContainer } from "@/components/layout/PageContainer";
import { StateCard } from "@/components/feedback/StateCard";

export default async function DomainsPage() {


  return (
    <PageContainer className="space-y-10">
      <div className="flex min-h-[30vh] items-center justify-center">
        <StateCard
          icon={null}
          title="No domains yet"
          description="We’ll populate this list as soon as products are indexed."
        />
      </div>
    </PageContainer>
  );
}
