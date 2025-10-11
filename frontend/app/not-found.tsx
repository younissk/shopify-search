import Link from "next/link";
import { PackageX, Home, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { StateCard } from "@/components/feedback/StateCard";

export default function NotFound() {
  return (
    <PageContainer className="flex items-center justify-center min-h-[60vh]">
      <StateCard
        tone="neutral"
        icon={<PackageX className="h-12 w-12" />}
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved. Try searching for products or return to the homepage."
        action={
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Search Products
              </Link>
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}

