import { Amenity } from "./meta";

export interface UserSummary {
  id: number;
  name: string;
  avatar_url?: string;
  is_superhost: boolean;
}

export interface ListingImage {
  id: number;
  url: string;
  position: number;
}

export interface ListingSummary {
  id: number;
  title: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  images: ListingImage[];
  amenities: Amenity[];
  host: UserSummary;
  rating?: number | null;
  reviews_count: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: UserSummary;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  reviews?: Review[];
}

export interface PaginatedListings {
  items: ListingSummary[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ListingSearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  category?: string;
  amenities?: string[];
  bedrooms?: number;
  beds?: number;
  page?: number;
  page_size?: number;
}

export interface UnavailableDateRange {
  check_in: string;
  check_out: string;
}

export interface QuoteResponse {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_price: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
  is_available: boolean;
}

export interface BookingResponse {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_price: number;
  nights: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string;
  listing?: ListingSummary;
  guest?: UserSummary;
}
