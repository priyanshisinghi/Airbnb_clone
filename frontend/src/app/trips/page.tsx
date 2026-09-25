"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchMyBookings, cancelBooking } from "@/lib/api";
import { BookingResponse } from "@/types/listing";

/* ─────────────────────────────────────────── types */
type TabKey = "upcoming" | "past" | "cancelled";

/* ─────────────────────────────────────────── helpers */
const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtShort = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

/* ─────────────────────────────────────────── sub-components */

/** Animated skeleton card while loading */
function SkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col sm:flex-row gap-0 rounded-3xl overflow-hidden border border-gray-100 bg-white">
      <div className="sm:w-52 h-52 sm:h-auto bg-gray-200 shrink-0" />
      <div className="flex-1 p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-2/3" />
        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-px bg-gray-100 my-4" />
        <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-4 bg-gray-200 rounded-lg w-1/4" />
      </div>
    </div>
  );
}

/** Airbnb-style empty state */
function EmptyState({ tab }: { tab: TabKey }) {
  const copy: Record<TabKey, { title: string; body: string; cta: boolean }> = {
    upcoming: {
      title: "No trips booked…yet!",
      body: "Time to dust off your bags and start planning your next adventure.",
      cta: true,
    },
    past: {
      title: "Time to get some stamps on your passport",
      body: "Once you've taken a trip, you can relive it here.",
      cta: false,
    },
    cancelled: {
      title: "No cancelled trips",
      body: "When you cancel a booking it will appear here.",
      cta: false,
    },
  };
  const { title, body, cta } = copy[tab];

  return (
    <div className="flex flex-col items-center py-24 px-6 text-center">
      {/* Luggage illustration */}
      <div className="relative w-32 h-32 mb-8">
        <svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
          {/* Suitcase body */}
          <rect x="18" y="42" width="92" height="70" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="3"/>
          {/* Handle */}
          <path d="M46 42 V30 a18 18 0 0 1 36 0 V42" stroke="#9ca3af" strokeWidth="3" fill="none" strokeLinecap="round"/>
          {/* Stripe */}
          <rect x="18" y="70" width="92" height="8" fill="#e5e7eb"/>
          {/* Lock */}
          <rect x="52" y="62" width="24" height="16" rx="4" fill="#d1d5db"/>
          <circle cx="64" cy="70" r="3" fill="#9ca3af"/>
          {/* Wheels */}
          <circle cx="35" cy="115" r="7" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/>
          <circle cx="93" cy="115" r="7" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/>
          {tab === "upcoming" && (
            <>
              {/* Sparkle accents for upcoming */}
              <circle cx="108" cy="30" r="3" fill="#f43f5e" opacity="0.7"/>
              <circle cx="20" cy="25" r="2" fill="#f43f5e" opacity="0.5"/>
              <circle cx="100" cy="18" r="1.5" fill="#f43f5e" opacity="0.6"/>
            </>
          )}
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h2>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">{body}</p>

      {cta && (
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-[.97] text-white font-bold text-sm rounded-2xl shadow-lg transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Start exploring
        </Link>
      )}
    </div>
  );
}

/** Status pill */
function StatusBadge({ status, checkOut, today }: { status: string; checkOut: string; today: string }) {
  if (status === "cancelled")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
        Cancelled
      </span>
    );
  if (checkOut <= today)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
        Completed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
      Confirmed
    </span>
  );
}

/** Cancel confirmation modal */
function CancelModal({
  open,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-[fadeSlideUp_0.2s_ease-out]">
        {/* Icon */}
        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Cancel this booking?</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-7">
          Are you sure you want to cancel? This action cannot be undone and the
          booking will be permanently cancelled.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold text-sm rounded-xl transition active:scale-[.97] cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Cancelling…
              </span>
            ) : (
              "Yes, cancel booking"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition cursor-pointer"
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  );
}

/** Individual booking card */
function BookingCard({
  booking,
  today,
  onCancelRequest,
}: {
  booking: BookingResponse;
  today: string;
  onCancelRequest: (id: number) => void;
}) {
  const listing = booking.listing;
  const imageUrl = listing?.images?.[0]?.url;
  const isUpcoming = booking.status === "confirmed" && booking.check_out > today;
  const propertyType = listing?.property_type || "Property";
  const location = listing ? `${listing.city}, ${listing.country}` : null;

  return (
    <div className="group flex flex-col sm:flex-row rounded-3xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 bg-white">
      {/* ── Image panel */}
      <div className="relative sm:w-56 md:w-64 shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing?.title || "Property"}
            className="w-full h-52 sm:h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-52 sm:h-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
        )}
        {/* Overlay status on mobile */}
        <div className="absolute top-3 left-3 sm:hidden">
          <StatusBadge status={booking.status} checkOut={booking.check_out} today={today} />
        </div>
      </div>

      {/* ── Content panel */}
      <div className="flex-1 flex flex-col p-5 sm:p-6">
        {/* Top row: title + status (desktop) */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              {propertyType}
            </p>
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
              {listing?.title || `Listing #${booking.listing_id}`}
            </h3>
            {location && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {location}
              </p>
            )}
          </div>
          <div className="hidden sm:block shrink-0">
            <StatusBadge status={booking.status} checkOut={booking.check_out} today={today} />
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gray-100" />

        {/* Date / guest row */}
        <div className="flex flex-wrap gap-5 text-sm mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Check-in</p>
            <p className="font-semibold text-gray-800">{fmtShort(booking.check_in)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Checkout</p>
            <p className="font-semibold text-gray-800">{fmtShort(booking.check_out)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Guests</p>
            <p className="font-semibold text-gray-800">
              {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Duration</p>
            <p className="font-semibold text-gray-800">
              {booking.nights} {booking.nights === 1 ? "night" : "nights"}
            </p>
          </div>
        </div>

        {/* Bottom row: total + actions */}
        <div className="mt-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total paid</p>
            <p className="text-lg font-extrabold text-gray-900">{fmt(booking.total_price)}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-[11px] text-gray-400">Ref #{booking.id}</p>

            {listing && (
              <Link
                href={`/rooms/${booking.listing_id}`}
                className="px-4 py-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-sm transition"
              >
                View listing
              </Link>
            )}

            {isUpcoming && (
              <button
                onClick={() => onCancelRequest(booking.id)}
                className="px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── main page */
export default function TripsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  // Cancel modal state
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  /* ── fetch */
  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load trips")
      )
      .finally(() => setLoading(false));
  }, []);

  /* ── tab filter */
  const filter = useCallback(
    (key: TabKey, list: BookingResponse[]) =>
      list.filter((b) => {
        if (key === "cancelled") return b.status === "cancelled";
        if (key === "past") return b.status === "confirmed" && b.check_out <= today;
        return b.status === "confirmed" && b.check_out > today;
      }),
    [today]
  );

  const displayed = filter(activeTab, bookings);

  /* ── cancel */
  const handleConfirmCancel = async () => {
    if (!pendingCancelId) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelBooking(pendingCancelId);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setPendingCancelId(null);
      // Switch to upcoming so user sees the change
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  /* ─── render */
  return (
    <>
      {/* Keyframe for modal animation */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <CancelModal
        open={pendingCancelId !== null}
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => {
          if (!cancelling) {
            setPendingCancelId(null);
            setCancelError(null);
          }
        }}
      />

      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Page header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Trips</h1>
          </div>

          {/* ── Tab bar */}
          <div className="flex border-b border-gray-200 mb-8 -mx-1">
            {tabs.map((tab) => {
              const count = filter(tab.key, bookings).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative mx-1 pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? "text-gray-900"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.key
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {count}
                    </span>
                  )}
                  {/* Active underline */}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Cancel error banner */}
          {cancelError && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">
              <svg className="w-5 h-5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>{cancelError}</span>
              <button
                onClick={() => setCancelError(null)}
                className="ml-auto text-rose-400 hover:text-rose-600 cursor-pointer"
              >✕</button>
            </div>
          )}

          {/* ── Content */}
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="text-gray-500 text-sm mb-5">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition"
              >
                Try again
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="space-y-5">
              {displayed.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  today={today}
                  onCancelRequest={setPendingCancelId}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
