"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { deleteHostListing, fetchHostBookings, fetchHostListings } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { HostListing } from "@/types/hostListing";
import { BookingResponse } from "@/types/listing";

function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${error ? "bg-red-600" : "bg-emerald-600"}`} role="status">
      {message}
    </div>
  );
}

function HostDashboard() {
  const searchParams = useSearchParams();
  const { currentUser, loading: userLoading, users, switchUser } = useUser();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [reservations, setReservations] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState(false);

  useEffect(() => {
    const status = searchParams.get("notice");
    if (status === "created") setNotice("Listing created successfully");
    if (status === "updated") setNotice("Listing updated successfully");
  }, [searchParams]);

  useEffect(() => {
    if (userLoading || !currentUser) return;
    if (!currentUser.is_host) {
      setLoading(false);
      return;
    }

    Promise.all([fetchHostListings(), fetchHostBookings()])
      .then(([hostListings, hostBookings]) => {
        setListings(hostListings);
        setReservations(hostBookings);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load host listings"))
      .finally(() => setLoading(false));
  }, [currentUser, userLoading]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleDelete = async (listing: HostListing) => {
    if (!window.confirm(`Delete \"${listing.title}\"? Listings with booking history cannot be deleted.`)) return;

    setNotice(null);
    setNoticeError(false);
    try {
      await deleteHostListing(listing.id);
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setNotice("Listing deleted successfully");
    } catch (err) {
      setNoticeError(true);
      setNotice(err instanceof Error ? err.message : "Unable to delete listing");
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcomingReservations = reservations.filter(
    (booking) => booking.status === "confirmed" && booking.check_out >= today,
  );
  const revenue = reservations
    .filter((booking) => booking.status !== "cancelled")
    .reduce((total, booking) => total + booking.total_price, 0);
  const bookingCounts = reservations.reduce<Record<number, number>>((counts, booking) => {
    counts[booking.listing_id] = (counts[booking.listing_id] || 0) + 1;
    return counts;
  }, {});

  if (userLoading || loading) {
    return <div className="py-24 text-center text-sm text-gray-500">Loading host dashboard...</div>;
  }

  if (!currentUser?.is_host) {
    const firstHost = users.find((user) => user.is_host);
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Become a host</h1>
        <p className="mt-3 text-sm text-gray-500">Switch this demo account to a seeded host profile and start managing stays.</p>
        {firstHost ? (
          <button type="button" onClick={() => switchUser(firstHost.id)} className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black">Become a host</button>
        ) : (
          <Link href="/" className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white">Back to explore</Link>
        )}
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-rose-500">Host dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Your listings</h1>
          <p className="mt-2 text-sm text-gray-500">Manage the stays hosted by {currentUser.name}.</p>
        </div>
        <Link href="/host/listings/new" className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white hover:bg-rose-600">Create listing</Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total listings", listings.length.toString()],
          ["Upcoming reservations", upcomingReservations.length.toString()],
          ["Total bookings", reservations.length.toString()],
          ["Mock revenue", `₹${revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
          </div>
        ))}
      </section>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Owned listings</h2>
          <p className="mt-1 text-sm text-gray-500">Your properties and their booking activity.</p>
        </div>
      </div>

      {listings.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900">Your hosting story starts here</h2>
          <p className="mt-2 text-sm text-gray-500">Create your first listing and share your space with guests.</p>
          <Link href="/host/listings/new" className="mt-6 inline-flex rounded-xl border border-gray-900 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">Add a listing</Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <article key={listing.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gray-100">
                {listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{listing.property_type} · {listing.city}</p>
                <h2 className="mt-1 line-clamp-2 font-bold text-gray-900">{listing.title}</h2>
                <p className="mt-2 text-sm text-gray-500">₹{listing.price_per_night.toLocaleString("en-IN")} per night · {listing.max_guests} guests</p>
                <p className="mt-1 text-xs font-semibold text-gray-400">{bookingCounts[listing.id] || 0} {bookingCounts[listing.id] === 1 ? "booking" : "bookings"}</p>
                <div className="mt-5 flex gap-2">
                  <Link href={`/host/listings/${listing.id}/edit`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50">Edit</Link>
                  <button type="button" onClick={() => handleDelete(listing)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="mt-12">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Reservations</h2>
          <p className="mt-1 text-sm text-gray-500">Guest stays across your properties.</p>
        </div>
        {reservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500">Reservations will appear here when guests book your listings.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {reservations.map((booking) => (
                <div key={booking.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1.2fr_1.4fr_1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{booking.guest?.name || `Guest #${booking.guest_id}`}</p>
                    <p className="mt-1 text-xs text-gray-500">{booking.guests} {booking.guests === 1 ? "guest" : "guests"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{booking.listing?.title || `Listing #${booking.listing_id}`}</p>
                    <p className="mt-1 text-xs text-gray-500">{booking.listing?.city || ""}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dates</p>
                    <p className="mt-1 text-sm text-gray-700">{booking.check_in} - {booking.check_out}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{booking.total_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function HostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white py-24 text-center text-sm text-gray-500">Loading host dashboard...</div>}>
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Navbar />
        <HostDashboard />
        <Footer />
      </div>
    </Suspense>
  );
}
