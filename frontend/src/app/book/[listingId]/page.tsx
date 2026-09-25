"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchListingById, fetchPriceQuote, createBooking } from "@/lib/api";
import { ListingDetail, QuoteResponse, BookingResponse } from "@/types/listing";

interface BookPageProps {
  params: Promise<{ listingId: string }>;
}

export default function BookPage({ params }: BookPageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.listingId);
  const searchParams = useSearchParams();
  const router = useRouter();

  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guests = Number(searchParams.get("guests") || 1);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Flow & Confirmation State
  const [bookingLoading, setBookingLoading] = useState(false);
  const [raceConditionError, setRaceConditionError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null);

  // Mock Payment Selection
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (!listingId || !checkIn || !checkOut) {
      setError("Invalid checkout parameters. Please select valid dates.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchListingById(listingId),
      fetchPriceQuote(listingId, checkIn, checkOut, guests),
    ])
      .then(([listingData, quoteData]) => {
        setListing(listingData);
        setQuote(quoteData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load checkout details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [listingId, checkIn, checkOut, guests]);

  const handleConfirmAndBook = async () => {
    if (!listing || !checkIn || !checkOut) return;

    setBookingLoading(true);
    setRaceConditionError(null);

    try {
      const res = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
      });
      setConfirmedBooking(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409") || msg.includes("no longer available")) {
        setRaceConditionError("These dates are no longer available. Please choose different dates.");
      } else {
        setRaceConditionError(msg || "Failed to create booking. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded-2xl" />
              <div className="h-40 bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !listing || !quote) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "Unable to load checkout quote."}</p>
          <Link
            href={`/rooms/${listingId}`}
            className="px-6 py-3 bg-rose-500 text-white font-semibold text-sm rounded-xl transition shadow-xs"
          >
            Back to Property
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // CONFIRMATION STATE (When Booking is Created Successfully)
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <svg className="w-10 h-10 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Booking confirmed!</h1>
              <p className="text-sm text-emerald-700 mt-1 font-medium">
                Reference ID: <span className="font-bold">Booking #{confirmedBooking.id}</span>
              </p>
            </div>

            {/* Booking Details Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 text-left space-y-4 text-sm text-gray-800 shadow-2xs">
              <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                {listing.images && listing.images[0] && (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{listing.title}</h3>
                  <p className="text-xs text-gray-500">{listing.city}, {listing.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-gray-500 font-medium">Check-in</span>
                  <span className="font-bold text-gray-900 text-sm">{confirmedBooking.check_in}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">Checkout</span>
                  <span className="font-bold text-gray-900 text-sm">{confirmedBooking.check_out}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">Guests</span>
                  <span className="font-bold text-gray-900 text-sm">{confirmedBooking.guests} guests</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">Total Paid</span>
                  <span className="font-bold text-rose-500 text-sm">{formatCurrency(confirmedBooking.total_price)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-4">
              <Link
                href="/trips"
                className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer active:scale-95"
              >
                View my trips
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // CHECKOUT PAGE STATE
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href={`/rooms/${listingId}`}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition cursor-pointer"
          >
            <svg className="w-5 h-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Confirm and pay
          </h1>
        </div>

        {/* Race Condition Error Toast Banner */}
        {raceConditionError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-700 font-semibold text-sm flex items-center space-x-3 shadow-xs">
            <svg className="w-6 h-6 shrink-0 fill-current text-rose-500" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{raceConditionError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Column: Trip Details & Mock Payment */}
          <div className="md:col-span-7 space-y-8 divide-y divide-gray-200">
            {/* Trip Details Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your trip</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900">Dates</h4>
                    <p className="text-gray-600">{quote.check_in} – {quote.check_out} ({quote.nights} {quote.nights === 1 ? "night" : "nights"})</p>
                  </div>
                  <Link href={`/rooms/${listingId}`} className="font-semibold text-gray-900 underline text-xs">Edit</Link>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900">Guests</h4>
                    <p className="text-gray-600">{quote.guests} {quote.guests === 1 ? "guest" : "guests"}</p>
                  </div>
                  <Link href={`/rooms/${listingId}`} className="font-semibold text-gray-900 underline text-xs">Edit</Link>
                </div>
              </div>
            </div>

            {/* Mock Payment Section */}
            <div className="pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pay with (Mocked Payment)</h2>

              {/* Payment Method Selector */}
              <div className="space-y-3 mb-6">
                <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === "card" ? "border-gray-900 bg-gray-50/80 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-400"}`}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="font-bold text-sm text-gray-900">Credit or Debit Card</span>
                  </div>
                  <span className="text-xs text-gray-500">Visa / Mastercard / Amex</span>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === "upi" ? "border-gray-900 bg-gray-50/80 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-400"}`}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="font-bold text-sm text-gray-900">UPI / Google Pay</span>
                  </div>
                  <span className="text-xs text-gray-500">Instant UPI</span>
                </label>
              </div>

              {/* Mock Card Form */}
              {paymentMethod === "card" && (
                <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Card number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9101 1121"
                      defaultValue="4111 2222 3333 4444"
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono text-sm focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Expiration</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        defaultValue="123"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation Policy */}
            <div className="pt-8">
              <h3 className="text-base font-bold text-gray-900 mb-2">Cancellation policy</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Free cancellation for 48 hours. Cancel before check-in date for a full refund of your reservation total.
              </p>
            </div>

            {/* Confirm & Book CTA */}
            <div className="pt-8 space-y-4">
              <p className="text-xs text-gray-500">
                By selecting the button below, I agree to the Host's House Rules, Ground rules for guests, and Airbnb's Rebooking and Refund Policy.
              </p>

              <button
                type="button"
                onClick={handleConfirmAndBook}
                disabled={bookingLoading}
                className="w-full md:w-auto px-10 py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white font-bold text-base rounded-2xl shadow-lg transition active:scale-98 cursor-pointer"
              >
                {bookingLoading ? "Processing reservation..." : "Confirm and book"}
              </button>
            </div>
          </div>

          {/* Right Column: Listing Card & Server Price Quote Summary */}
          <div className="md:col-span-5">
            <div className="sticky top-28 border border-gray-200 rounded-3xl p-6 bg-white shadow-xl space-y-6">
              {/* Listing Thumbnail & Header */}
              <div className="flex space-x-4 border-b border-gray-200 pb-6">
                {listing.images && listing.images[0] && (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                  />
                )}
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">{listing.property_type}</span>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mt-0.5">{listing.title}</h3>
                  <div className="flex items-center space-x-1 text-xs font-medium text-gray-900 mt-2">
                    {listing.rating ? (
                      <>
                        <span>★ {listing.rating.toFixed(2)}</span>
                        <span className="text-gray-400">({listing.reviews_count} reviews)</span>
                      </>
                    ) : (
                      <span className="text-gray-500">New listing</span>
                    )}
                    {listing.host.is_superhost && <span className="text-rose-500 font-bold ml-1">· Superhost</span>}
                  </div>
                </div>
              </div>

              {/* Price Details Breakdown */}
              <div className="space-y-3 text-sm text-gray-700">
                <h4 className="font-bold text-gray-900 text-base mb-2">Price details</h4>
                <div className="flex justify-between">
                  <span>{formatCurrency(quote.nightly_price)} x {quote.nights} {quote.nights === 1 ? "night" : "nights"}</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>{formatCurrency(quote.cleaning_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Airbnb service fee</span>
                  <span>{formatCurrency(quote.service_fee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-lg font-bold text-gray-900">
                <span>Total (INR)</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
