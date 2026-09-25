"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingForm from "@/components/ListingForm";
import { createHostListing } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { HostListingPayload } from "@/types/hostListing";

export default function NewListingPage() {
  const router = useRouter();
  const { currentUser, loading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: HostListingPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await createHostListing(payload);
      router.push("/host?notice=created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white py-24 text-center text-sm text-gray-500">Loading...</div>;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white py-24 text-center text-sm text-gray-500">Loading...</div>}>
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          {!currentUser?.is_host ? (
            <div className="py-20 text-center"><h1 className="text-2xl font-bold">Switch to a host to create a listing</h1></div>
          ) : (
            <>
              <div className="mb-8"><p className="text-sm font-semibold text-rose-500">Host dashboard</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Create a listing</h1><p className="mt-2 text-sm text-gray-500">Share the details guests need to plan their stay.</p></div>
              {error && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-xl" role="alert">{error}</div>}
              <ListingForm mode="create" submitting={submitting} onSubmit={handleSubmit} onCancel={() => router.push("/host")} />
            </>
          )}
        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
