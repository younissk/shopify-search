"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StateCard } from "@/components/feedback/StateCard";
import {
  Store,
  Plus,
  Minus,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Info,
} from "lucide-react";

type RequestType = "add" | "remove";

interface DomainRequest {
  id: string;
  domain: string;
  type: RequestType;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const mockRequests: DomainRequest[] = [
  {
    id: "1",
    domain: "example-store.myshopify.com",
    type: "add",
    reason: "Popular electronics store with unique products",
    status: "pending",
    submittedAt: "2024-01-10",
  },
  {
    id: "2",
    domain: "old-store.myshopify.com",
    type: "remove",
    reason: "Store is no longer active and products are outdated",
    status: "approved",
    submittedAt: "2024-01-05",
  },
];

const guidelines = [
  {
    icon: Store,
    title: "Domain Requirements",
    description:
      "Must be a valid Shopify store with active products and proper SSL certificate.",
  },
  {
    icon: Clock,
    title: "Processing Time",
    description:
      "Domain requests are typically processed within 2-3 business days.",
  },
  {
    icon: Info,
    title: "Review Process",
    description:
      "We review each request to ensure quality and relevance to our search index.",
  },
];

export default function DomainRequestsPage() {
  const [requestType, setRequestType] = useState<RequestType>("add");
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !reason.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
    setDomain("");
    setReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (submitted) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <StateCard
          title="Request Submitted Successfully"
          description="Thank you for your domain request. We'll review it and get back to you within 2-3 business days."
          action={
            <Button onClick={() => setSubmitted(false)} className="mt-4">
              Submit Another Request
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-12">
      <PageHeader
        eyebrow="Domain Management"
        title="Request Domain Changes"
        description="Request to add or remove Shopify stores from our search index. We review each request to maintain quality and relevance."
      />

      {/* Request Form */}
      <Card className="border border-[rgba(15,23,42,0.08)] bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-secondary mb-6">
            Submit a Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-secondary">
                Request Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setRequestType("add")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    requestType === "add"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-[rgba(15,23,42,0.08)] text-[var(--color-foreground-soft)] hover:bg-[var(--color-overlay)]"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Domain</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType("remove")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    requestType === "remove"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-[rgba(15,23,42,0.08)] text-[var(--color-foreground-soft)] hover:bg-[var(--color-overlay)]"
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>Remove Domain</span>
                </button>
              </div>
            </div>

            {/* Domain Input */}
            <div className="space-y-2">
              <label
                htmlFor="domain"
                className="text-sm font-medium text-secondary"
              >
                Shopify Domain
              </label>
              <Input
                id="domain"
                type="text"
                placeholder="store-name.myshopify.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-[var(--color-foreground-soft)]">
                Enter the full Shopify domain (e.g., store-name.myshopify.com)
              </p>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <label
                htmlFor="reason"
                className="text-sm font-medium text-secondary"
              >
                Reason for {requestType === "add" ? "Adding" : "Removing"}
              </label>
              <textarea
                id="reason"
                placeholder={`Please explain why this domain should be ${
                  requestType === "add" ? "added to" : "removed from"
                } our search index...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border border-[rgba(15,23,42,0.08)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !domain.trim() || !reason.trim()}
              className="w-full"
            >
              {isSubmitting
                ? "Submitting..."
                : `Submit ${
                    requestType === "add" ? "Addition" : "Removal"
                  } Request`}
            </Button>
          </form>
        </div>
      </Card>
    </PageContainer>
  );
}
