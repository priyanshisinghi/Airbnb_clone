import { ListingSummary, ListingDetail, PaginatedListings, ListingSearchParams, UnavailableDateRange, QuoteResponse, BookingResponse } from "@/types/listing";
import { Category, Amenity } from "@/types/meta";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/api/health");
}

export async function fetchListings(params?: ListingSearchParams): Promise<PaginatedListings> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.location) searchParams.append("location", params.location);
    if (params.check_in) searchParams.append("check_in", params.check_in);
    if (params.check_out) searchParams.append("check_out", params.check_out);
    if (params.guests && params.guests > 0) searchParams.append("guests", params.guests.toString());
    if (params.min_price !== undefined) searchParams.append("min_price", params.min_price.toString());
    if (params.max_price !== undefined) searchParams.append("max_price", params.max_price.toString());
    if (params.property_type) searchParams.append("property_type", params.property_type);
    if (params.category) searchParams.append("category", params.category);
    if (params.bedrooms && params.bedrooms > 0) searchParams.append("bedrooms", params.bedrooms.toString());
    if (params.beds && params.beds > 0) searchParams.append("beds", params.beds.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.page_size) searchParams.append("page_size", params.page_size.toString());

    if (params.amenities && params.amenities.length > 0) {
      params.amenities.forEach((amenity) => {
        searchParams.append("amenities", amenity);
      });
    }
  }

  const queryStr = searchParams.toString();
  const endpoint = `/api/listings${queryStr ? `?${queryStr}` : ""}`;
  return request<PaginatedListings>(endpoint);
}

export async function fetchListingById(listingId: number): Promise<ListingDetail> {
  return request<ListingDetail>(`/api/listings/${listingId}`);
}

export async function fetchUnavailableDates(listingId: number): Promise<UnavailableDateRange[]> {
  return request<UnavailableDateRange[]>(`/api/listings/${listingId}/unavailable-dates`);
}

export async function fetchCategories(): Promise<Category[]> {
  return request<Category[]>("/api/meta/categories");
}

export async function fetchAmenities(): Promise<Amenity[]> {
  return request<Amenity[]>("/api/meta/amenities");
}

export async function fetchPriceQuote(
  listingId: number,
  checkIn: string,
  checkOut: string,
  guests: number = 1
): Promise<QuoteResponse> {
  const query = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    guests: guests.toString(),
  });
  return request<QuoteResponse>(`/api/listings/${listingId}/quote?${query.toString()}`);
}

export async function createBooking(payload: {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}): Promise<BookingResponse> {
  return request<BookingResponse>("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchMyBookings(): Promise<BookingResponse[]> {
  return request<BookingResponse[]>("/api/bookings/me");
}

export async function cancelBooking(bookingId: number): Promise<BookingResponse> {
  return request<BookingResponse>(`/api/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}

// ── Wishlist ───────────────────────────────────────────────────────────────

export async function fetchWishlistIds(): Promise<number[]> {
  return request<number[]>("/api/wishlist/ids");
}

export async function fetchWishlist(): Promise<ListingSummary[]> {
  return request<ListingSummary[]>("/api/wishlist");
}

export async function addToWishlist(listingId: number): Promise<{ saved: boolean; listing_id: number }> {
  return request(`/api/wishlist/${listingId}`, { method: "POST" });
}

export async function removeFromWishlist(listingId: number): Promise<{ saved: boolean; listing_id: number }> {
  return request(`/api/wishlist/${listingId}`, { method: "DELETE" });
}
