"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeartButton from "@/components/HeartButton";
import { fetchListingById, fetchUnavailableDates, fetchPriceQuote } from "@/lib/api";
import { ListingDetail, UnavailableDateRange, QuoteResponse } from "@/types/listing";
import DateRangePicker, { formatShortRange } from "@/components/booking/DateRangePicker";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDateRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery Modal State
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Quote State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchListingById(listingId),
      fetchUnavailableDates(listingId).catch(() => []),
    ])
      .then(([listingData, datesData]) => {
        setListing(listingData);
        setUnavailableDates(datesData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load listing details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [listingId]);

  // Fetch backend quote dynamically when checkIn, checkOut, or guestCount change
  useEffect(() => {
    if (!listingId || !checkIn || !checkOut) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    if (checkOut <= checkIn) {
      setQuote(null);
      setQuoteError("Checkout date must be after check-in date");
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);

    fetchPriceQuote(listingId, checkIn, checkOut, guestCount)
      .then((data) => {
        setQuote(data);
        setQuoteError(null);
      })
      .catch((err) => {
        setQuote(null);
        setQuoteError(err instanceof Error ? err.message : "Selected dates are unavailable");
      })
      .finally(() => {
        setQuoteLoading(false);
      });
  }, [listingId, checkIn, checkOut, guestCount]);

  const router = useRouter();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReserve = () => {
    if (!checkIn || !checkOut || quoteError) return;
    router.push(`/book/${listingId}?check_in=${checkIn}&check_out=${checkOut}&guests=${guestCount}`);
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="w-full aspect-[21/9] bg-gray-200 rounded-3xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-80 bg-gray-200 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "The requested property could not be found."}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-xl transition shadow-xs"
          >
            Return to Explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages = listing.images && listing.images.length > 0
    ? listing.images
    : [{ id: 0, url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", position: 0 }];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900 flex flex-col pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
        {/* Header Title Section */}
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {listing.title}
          </h1>

          {listing.rating !== null && listing.rating !== undefined && listing.rating >= 4.8 && listing.reviews_count >= 3 && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent-deep)]">
              <span aria-hidden="true">★</span> Guest favourite
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-sm font-semibold text-gray-900">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {listing.rating ? (
                <>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 32 32">
                      <path d="M16 2l4.55 9.22 10.17 1.48-7.36 7.17 1.74 10.13L16 25.23l-9.1 4.77 1.74-10.13-7.36-7.17 10.17-1.48z" />
                    </svg>
                    <span>{listing.rating.toFixed(2)}</span>
                  </div>
                  <span>·</span>
                  <span className="underline cursor-pointer">{listing.reviews_count} reviews</span>
                  <span>·</span>
                </>
              ) : (
                <>
                  <span className="text-gray-500">New listing</span>
                  <span>·</span>
                </>
              )}
              {listing.host.is_superhost && (
                <>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 32 32">
                      <path d="M16 2l3.4 6.9 7.6 1.1-5.5 5.4 1.3 7.6L16 19.4 9.2 23l1.3-7.6-5.5-5.4 7.6-1.1z" />
                    </svg>
                    <span>Superhost</span>
                  </span>
                  <span>·</span>
                </>
              )}
              <span className="underline cursor-pointer">{listing.city}, {listing.country}</span>
            </div>

            {/* Share and Wishlist Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              <button
                onClick={handleShare}
                type="button"
                className="flex items-center space-x-1.5 hover:bg-gray-100 px-2 sm:px-3 py-1.5 rounded-lg transition underline cursor-pointer text-xs sm:text-sm font-semibold text-gray-800"
              >
                <svg className="w-4 h-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{copied ? "Link Copied!" : "Share"}</span>
              </button>

              <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 px-2 sm:px-3 py-1.5 rounded-lg transition text-xs sm:text-sm font-semibold underline">
                <HeartButton listingId={listing.id} />
                <span>Save</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-6 md:mb-10 group">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[4/3] sm:aspect-[16/9] max-h-[280px] sm:max-h-[500px]">
            {/* Primary Image (Spans 2 columns & 2 rows on desktop) */}
            <div className="md:col-span-2 relative h-full bg-gray-100 cursor-pointer" onClick={() => setGalleryOpen(true)}>
              <img
                src={galleryImages[0]?.url}
                alt={listing.title}
                className="w-full h-full object-cover hover:opacity-95 transition duration-200"
              />
            </div>

            {/* Supporting Images */}
            <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
              {galleryImages.slice(1, 5).map((img, idx) => (
                <div key={img.id || idx} className="relative h-full bg-gray-100 cursor-pointer overflow-hidden" onClick={() => setGalleryOpen(true)}>
                  <img
                    src={img.url}
                    alt={`${listing.title} image ${idx + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Show All Photos Button */}
          <button
            onClick={() => setGalleryOpen(true)}
            type="button"
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white hover:bg-gray-50 border border-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-gray-900 shadow-md flex items-center space-x-2 transition cursor-pointer active:scale-95 z-10"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
              <path d="M2 3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm0 7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3zm7-7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V3zm0 7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3z"/>
            </svg>
            <span>Show all photos</span>
          </button>
        </div>

        {/* Main Details Grid: Left 2/3 Content, Right 1/3 Sticky Booking Card */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-12">
          {/* Left Column Content */}
          <div className="lg:col-span-2 divide-y divide-gray-200">
            {/* Overview & Host Info */}
            <div className="pb-6 md:pb-8">
              <div className="flex items-center justify-between gap-3 pb-4 md:pb-6">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    {listing.property_type} hosted by {listing.host.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} bathrooms
                  </p>
                </div>
                {listing.host.avatar_url && (
                  <img
                    src={listing.host.avatar_url}
                    alt={listing.host.name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                )}
              </div>

              {/* Highlights */}
              <div className="space-y-3 pt-1 md:space-y-4 md:pt-4">
                {listing.host.is_superhost && (
                    <div className="flex items-start gap-3 md:gap-4">
                    <svg className="w-6 h-6 text-gray-800 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{listing.host.name} is a Superhost</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Superhosts are experienced, highly rated hosts who are committed to providing great stays.</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 md:gap-4">
                  <svg className="w-6 h-6 text-gray-800 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Great location</h4>
                    <p className="text-xs text-gray-500 mt-0.5">100% of recent guests gave the location a 5-star rating.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:gap-4">
                  <svg className="w-6 h-6 text-gray-800 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Free cancellation for 48 hours</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Get a full refund if you change your mind.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 md:py-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 md:mb-4">About this space</h3>
              <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">
                {descriptionExpanded || listing.description.length <= 280 ? listing.description : `${listing.description.slice(0, 280).trim()}...`}
              </p>
              {listing.description.length > 280 && (
                <button type="button" onClick={() => setDescriptionExpanded((expanded) => !expanded)} className="mt-3 text-sm font-bold text-gray-900 underline underline-offset-2">
                  {descriptionExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Where you'll sleep */}
            <div className="py-6 md:py-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 md:mb-4">Where you'll sleep</h3>
              <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none">
                {Array.from({ length: listing.bedrooms }).map((_, idx) => (
                  <div key={idx} className="min-w-[168px] max-w-[168px] snap-start rounded-2xl border border-gray-200 bg-gray-50/50 p-3 sm:max-w-none sm:min-w-0 md:p-6">
                    <svg className="w-6 h-6 text-gray-800 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12V8H4v4M3 20h18M4 12v8m16-8v8" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-900">Bedroom {idx + 1}</h4>
                    <p className="text-xs text-gray-500 mt-1">1 double bed, 1 sofa bed</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Section */}
            <div className="py-6 md:py-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 md:mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:gap-4">
                {(showAllAmenities ? listing.amenities : listing.amenities.slice(0, 6)).map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-3 text-sm text-gray-800">
                    <svg className="w-5 h-5 text-gray-600 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">{amenity.name}</span>
                  </div>
                ))}
              </div>
              {listing.amenities.length > 6 && (
                <button type="button" onClick={() => setShowAllAmenities((visible) => !visible)} className="mt-4 text-sm font-bold text-gray-900 underline underline-offset-2">
                  {showAllAmenities ? "Show fewer amenities" : `Show all ${listing.amenities.length} amenities`}
                </button>
              )}
            </div>

            {/* Reviews Section */}
            <div className="py-6 md:py-8">
              <div className="flex items-center space-x-2 mb-3 md:mb-6">
                <svg className="w-5 h-5 fill-current text-gray-900" viewBox="0 0 32 32">
                  <path d="M16 2l4.55 9.22 10.17 1.48-7.36 7.17 1.74 10.13L16 25.23l-9.1 4.77 1.74-10.13-7.36-7.17 10.17-1.48z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">
                  {listing.rating ? `${listing.rating.toFixed(2)} · ${listing.reviews_count} reviews` : "No reviews yet"}
                </h3>
              </div>

              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  {listing.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border border-gray-100 bg-gray-50/60 rounded-2xl space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">
                          {rev.author.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{rev.author.name}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(rev.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Be the first guest to leave a review!</p>
              )}
            </div>

            {/* Static Map Section */}
            <div className="py-6 md:py-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Where you'll be</h3>
              <p className="text-sm text-gray-600 mb-3 md:mb-4">{listing.city}, {listing.country}</p>

              <div className="relative flex h-56 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-slate-100 p-5 text-center md:h-72 md:rounded-3xl md:p-6">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg mb-2">
                  <svg className="w-6 h-6 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-bold text-sm text-gray-900">{listing.title}</span>
                <span className="text-xs text-gray-500 mt-1">
                  Lat: {listing.latitude?.toFixed(4)}, Long: {listing.longitude?.toFixed(4)}
                </span>
                <span className="text-xs text-gray-400 mt-4">Exact location provided after booking.</span>
              </div>
            </div>
          </div>

          {/* Right Column Sticky Booking Card (Desktop) */}
          <div className="hidden lg:block relative">
            <div className="sticky top-28 overflow-visible border border-gray-200 shadow-xl rounded-3xl p-6 bg-white space-y-6">
              {/* Header Pricing */}
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(listing.price_per_night)}</span>
                  <span className="text-sm text-gray-600 font-normal"> / night</span>
                </div>
                {listing.rating && (
                  <div className="flex items-center space-x-1 text-xs font-semibold text-gray-900">
                    <span>★ {listing.rating.toFixed(2)}</span>
                    <span>·</span>
                    <span className="text-gray-500">{listing.reviews_count} reviews</span>
                  </div>
                )}
              </div>

              {/* Interactive Dates / Guests Input Box */}
              <div className="border border-gray-300 rounded-2xl overflow-hidden divide-y divide-gray-300 text-xs">
                <DateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onDatesChange={(nextCheckIn, nextCheckOut) => {
                    setCheckIn(nextCheckIn);
                    setCheckOut(nextCheckOut);
                  }}
                  unavailableDates={unavailableDates}
                  open={calendarOpen}
                  onOpenChange={setCalendarOpen}
                  activeWhen="desktop"
                />

                <div className="p-3 bg-white">
                  <label className="block text-[10px] font-bold text-gray-800 uppercase">Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-medium text-gray-900 focus:outline-none mt-0.5"
                  >
                    {Array.from({ length: listing.max_guests }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1} {idx + 1 === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quote Validation Error Banner */}
              {quoteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                  ⚠️ {quoteError}
                </div>
              )}

              {/* Reserve Button CTA */}
              <button
                type="button"
                onClick={handleReserve}
                disabled={Boolean(quoteError) || !checkIn || !checkOut || quoteLoading}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl transition shadow-md cursor-pointer active:scale-98"
              >
                {quoteLoading ? "Checking backend..." : "Reserve"}
              </button>

              <p className="text-center text-xs text-gray-500">You won't be charged yet</p>

              {/* Backend Authoritative Price Calculation Breakdown */}
              {quote ? (
                <div className="space-y-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="underline">{formatCurrency(quote.nightly_price)} x {quote.nights} {quote.nights === 1 ? "night" : "nights"}</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span>{formatCurrency(quote.cleaning_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Airbnb service fee</span>
                    <span>{formatCurrency(quote.service_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-base font-bold text-gray-900">
                    <span>Total before taxes</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
                  Enter check-in and checkout dates to see exact pricing totals
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile calendar host — always mounted below lg so the shared picker can open */}
      <div className="lg:hidden">
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onDatesChange={(nextCheckIn, nextCheckOut) => {
            setCheckIn(nextCheckIn);
            setCheckOut(nextCheckOut);
          }}
          unavailableDates={unavailableDates}
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          guestCount={guestCount}
          onGuestCountChange={setGuestCount}
          maxGuests={listing.max_guests}
          showTrigger={false}
          activeWhen="mobile"
        />
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="min-w-0 flex-1 text-left"
            aria-label={checkIn && checkOut ? "Change selected dates" : "Add dates"}
          >
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(quote?.total || listing.price_per_night)}
              </span>
              <span className="text-xs font-normal text-gray-500">{quote ? " total" : " / night"}</span>
            </div>
            <span className="block text-xs text-gray-600 underline underline-offset-2">
              {quote
                ? `${quote.nights} ${quote.nights === 1 ? "night" : "nights"} · ${formatShortRange(checkIn, checkOut)}`
                : checkIn && checkOut
                  ? formatShortRange(checkIn, checkOut)
                  : "Add dates"}
            </span>
            {quoteError && (
              <span className="mt-1 block text-[11px] font-medium text-rose-600 line-clamp-2">{quoteError}</span>
            )}
          </button>
          {checkIn && checkOut ? (
            <button
              type="button"
              onClick={handleReserve}
              disabled={Boolean(quoteError) || quoteLoading || !quote}
              className="shrink-0 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {quoteLoading ? "Checking..." : "Reserve"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="shrink-0 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-600"
            >
              Check availability
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black text-white p-4 sm:p-8 overflow-y-auto animate-in fade-in">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/80 py-4 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold text-white">{listing.title} Photos</h3>
              <button
                onClick={() => setGalleryOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-6">
              {galleryImages.map((img, idx) => (
                <div key={img.id || idx} className="rounded-2xl overflow-hidden bg-gray-900">
                  <img
                    src={img.url}
                    alt={`${listing.title} photo ${idx + 1}`}
                    className="w-full h-auto object-cover max-h-[80vh] mx-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
