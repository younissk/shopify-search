import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Shopify Search - a portfolio project showcasing product discovery across Shopify stores. See our changelog and get in touch.",
  openGraph: {
    title: "About - Shopify Search",
    description: "Learn about Shopify Search - a portfolio project showcasing product discovery across Shopify stores.",
  },
  twitter: {
    card: "summary",
    title: "About - Shopify Search",
    description: "Learn about Shopify Search - a portfolio project showcasing product discovery across Shopify stores.",
  },
};

const changelog = [
  {
    version: "0.1.1",
    date: "2025-10-11",
    changes: [
      "Made the site look a lot prettier with my own, non-AI design",
      "Added a bunch of domains (32k) for possible future scraping",
      "Added the functionality to request domain changes",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-10-08",
    changes: [
      "Added 580k Products from about 1.3k Stores",
      "Implemented Full-Text Search",
      "Added Similar Products Search using SentenceBERT Embeddings",
    ],
  },

];

export default function AboutPage() {
  return (
    <PageContainer className="space-y-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-primary">About Shopify Search</h1>
        <div className="space-y-4 text-lg text-[var(--color-foreground-soft)]">
          <p>I just kinda made this as a portfolio project. Don&apos;t sue me please.</p>
          <p>
            But also because I&apos;m kinda sick of using Amazon to buy things and want to
            support smaller customers. So in a really dumb way this kinda rivals
            Amazon, but not really.
          </p>
          <p>
            This project showcases full-text search, semantic search using SentenceBERT embeddings,
            and aggregation of products from over 1,300 Shopify stores with 580,000+ products indexed.
          </p>
        </div>
      </div>

      {/* Changelog Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-secondary">Changelog</h2>
        <div className="space-y-6">
          {changelog.map((release, index) => (
            <Card
              key={index}
              className="border-2 border-dashed border-primary bg-[var(--background)] shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      v{release.version}
                    </Badge>
                    <span className="text-sm text-[var(--color-foreground-soft)]">
                      {release.date}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {release.changes.map((change, changeIndex) => (
                    <li
                      key={changeIndex}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[var(--color-foreground-soft)]">
                        {change}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-secondary">Get in Touch</h2>
        <Card className="border-2 border-dashed border-primary bg-[var(--background)] shadow-sm">
          <div className="p-6">
            <p className="text-[var(--color-foreground-soft)] mb-4">
              Have questions, suggestions, or want to request a domain to be
              added or removed? We&apos;d love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/domain-requests"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Request Domain Changes
              </a>
              <a
                href="mailto:support@shopifysearch.com"
                className="inline-flex items-center justify-center rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-[var(--color-overlay)]"
              >
                Contact Support
              </a>
            </div>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
