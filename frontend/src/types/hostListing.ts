import { ListingSummary } from "./listing";

export interface HostListingPayload {
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  image_urls: string[];
  amenities: string[];
}

export type HostListing = ListingSummary;
