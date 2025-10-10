"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/feedback/StateCard";
import { DomainRequestService } from "@/lib/domainRequestService";
import {
  Plus,
  Minus,
} from "lucide-react";

type RequestType = "add" | "remove";

export default function DomainRequestsPage() {
  const [requestType, setRequestType] = useState<RequestType>("add");
  const [domain, setDomain] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !reason.trim()) return;

    // Validate email if provided
    if (requesterEmail.trim() && !isValidEmail(requesterEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = requestType === "add" 
        ? await DomainRequestService.requestAddDomain(
            domain.trim(),
            requesterName.trim() || undefined,
            requesterEmail.trim() || undefined,
            reason.trim()
          )
        : await DomainRequestService.requestRemoveDomain(
            domain.trim(),
            requesterName.trim() || undefined,
            requesterEmail.trim() || undefined,
            reason.trim()
          );

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Success - reset form and show success state
      setSubmitted(true);
      setDomain("");
      setRequesterName("");
      setRequesterEmail("");
      setReason("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
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

            {/* Requester Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="requesterName"
                  className="text-sm font-medium text-secondary"
                >
                  Your Name
                </label>
                <Input
                  id="requesterName"
                  type="text"
                  placeholder="John Doe"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-[var(--color-foreground-soft)]">
                  Optional - helps us contact you if needed
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="requesterEmail"
                  className="text-sm font-medium text-secondary"
                >
                  Your Email
                </label>
                <Input
                  id="requesterEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-[var(--color-foreground-soft)]">
                  Optional - for status updates
                </p>
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

            {/* Additional Notes */}
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-medium text-secondary"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                placeholder="Any additional information that might be helpful..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 border border-[rgba(15,23,42,0.08)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-[var(--color-foreground-soft)]">
                Optional - any extra details about your request
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting || 
                !domain.trim() || 
                !reason.trim() ||
                (requesterEmail.trim() !== "" && !isValidEmail(requesterEmail.trim()))
              }
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
