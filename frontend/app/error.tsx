"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { StateCard } from "@/components/feedback/StateCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (or error monitoring service like Sentry)
    console.error("Application error:", error);
  }, [error]);

  return (
    <PageContainer className="flex items-center justify-center min-h-[60vh]">
      <StateCard
        tone="danger"
        icon={<AlertTriangle className="h-12 w-12" />}
        title="Something went wrong"
        description={
          process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred. Please try again or return to the homepage."
        }
        action={
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}

