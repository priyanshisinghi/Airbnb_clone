"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingForm from "@/components/ListingForm";
import { fetchListingById, updateHostListing } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { HostListingPayload } from "@/types/hostListing";
import { ListingDetail } from "@/types/listing";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id } = use(params);
  const listingId = Number(id);
  const router = useRouter();
  const { currentUser, loading: userLoading } = useUser();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !currentUser?.is_host || !listingId) return;

    fetchListingById(listingId)
      .then(setListing)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load listing"))
      .finally(() => setLoading(false));
  }, [currentUser, listingId, userLoading]);

  const handleSubmit = async (payload: HostListingPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await updateHostListing(listingId, payload);
      router.push("/host?notice=updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-white py-24 text-center text-sm text-gray-500">Loading listing...</div>}>
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          {userLoading || loading ? (
            <div className="py-24 text-center text-sm text-gray-500">Loading listing...</div>
          ) : !currentUser?.is_host ? (
            <div className="py-20 text-center"><h1 className="text-2xl font-bold">Switch to a host to edit listings</h1></div>
          ) : !listing ? (
            <div className="py-20 text-center"><h1 className="text-2xl font-bold">Listing unavailable</h1><p className="mt-2 text-sm text-gray-500">{error || "This listing could not be loaded."}</p></div>
          ) : (
            <>
              <div className="mb-8"><p className="text-sm font-semibold text-rose-500">Host dashboard</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Edit listing</h1><p className="mt-2 text-sm text-gray-500">Keep your listing details current for guests.</p></div>
              {error && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-xl" role="alert">{error}</div>}
              <ListingForm mode="edit" initialListing={listing} submitting={submitting} onSubmit={handleSubmit} onCancel={() => router.push("/host")} />
            </>
          )}
        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
