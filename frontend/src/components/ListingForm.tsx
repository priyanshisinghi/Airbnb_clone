"use client";

import { FormEvent, useEffect, useState } from "react";
import { fetchAmenities } from "@/lib/api";
import { ListingDetail } from "@/types/listing";
import { HostListingPayload } from "@/types/hostListing";
import { Amenity } from "@/types/meta";

interface ListingFormProps {
  mode: "create" | "edit";
  initialListing?: ListingDetail | null;
  submitting?: boolean;
  onSubmit: (payload: HostListingPayload) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: HostListingPayload = {
  title: "",
  description: "",
  property_type: "Apartment",
  category: "Trending",
  city: "",
  country: "India",
  latitude: null,
  longitude: null,
  price_per_night: 0,
  cleaning_fee: 0,
  max_guests: 1,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  image_urls: [],
  amenities: [],
};

function formFromListing(listing: ListingDetail): HostListingPayload {
  return {
    title: listing.title,
    description: listing.description,
    property_type: listing.property_type,
    category: listing.category,
    city: listing.city,
    country: listing.country,
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
    price_per_night: listing.price_per_night,
    cleaning_fee: listing.cleaning_fee,
    max_guests: listing.max_guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
    image_urls: listing.images.map((image) => image.url),
    amenities: listing.amenities.map((amenity) => amenity.name),
  };
}

export default function ListingForm({
  mode,
  initialListing,
  submitting = false,
  onSubmit,
  onCancel,
}: ListingFormProps) {
  const [form, setForm] = useState<HostListingPayload>(emptyForm);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialListing ? formFromListing(initialListing) : emptyForm);
  }, [initialListing]);

  useEffect(() => {
    fetchAmenities().then(setAvailableAmenities).catch(() => setAvailableAmenities([]));
  }, []);

  const update = <K extends keyof HostListingPayload>(field: K, value: HostListingPayload[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateNumber = (field: keyof HostListingPayload, value: string) => {
    update(field, value === "" ? 0 : Number(value));
  };

  const toggleAmenity = (name: string) => {
    update(
      "amenities",
      form.amenities.includes(name)
        ? form.amenities.filter((item) => item !== name)
        : [...form.amenities, name],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const imageUrls = form.image_urls.filter(Boolean);

    if (form.title.trim().length < 3) {
      setValidationError("Title must be at least 3 characters.");
      return;
    }
    if (form.description.trim().length < 10) {
      setValidationError("Description must be at least 10 characters.");
      return;
    }
    if (!form.city.trim() || !form.country.trim()) {
      setValidationError("City and country are required.");
      return;
    }
    if (form.price_per_night <= 0 || form.max_guests < 1 || form.bedrooms < 1 || form.beds < 1 || form.bathrooms <= 0) {
      setValidationError("Enter valid pricing, capacity, and room values.");
      return;
    }
    if (imageUrls.some((url) => !url.startsWith("http://") && !url.startsWith("https://"))) {
      setValidationError("Image URLs must start with http:// or https://.");
      return;
    }

    setValidationError(null);
    await onSubmit({ ...form, image_urls: imageUrls });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {validationError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {validationError}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">About your place</h2>
        <label className="block text-sm font-semibold text-gray-700">
          Title
          <input required minLength={3} maxLength={200} value={form.title} onChange={(event) => update("title", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Description
          <textarea required minLength={10} maxLength={5000} rows={5} value={form.description} onChange={(event) => update("description", event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-gray-700">
            Property type
            <input required value={form.property_type} onChange={(event) => update("property_type", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Category
            <input required value={form.category} onChange={(event) => update("category", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-gray-700">
            City
            <input required value={form.city} onChange={(event) => update("city", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Country
            <input required value={form.country} onChange={(event) => update("country", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Latitude
            <input type="number" min={-90} max={90} step="any" value={form.latitude ?? ""} onChange={(event) => update("latitude", event.target.value === "" ? null : Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Longitude
            <input type="number" min={-180} max={180} step="any" value={form.longitude ?? ""} onChange={(event) => update("longitude", event.target.value === "" ? null : Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Pricing and capacity</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm font-semibold text-gray-700">
            Price per night
            <input required type="number" min={1} step="0.01" value={form.price_per_night || ""} onChange={(event) => updateNumber("price_per_night", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Cleaning fee
            <input type="number" min={0} step="0.01" value={form.cleaning_fee} onChange={(event) => updateNumber("cleaning_fee", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Max guests
            <input required type="number" min={1} value={form.max_guests} onChange={(event) => updateNumber("max_guests", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Bedrooms
            <input required type="number" min={1} value={form.bedrooms} onChange={(event) => updateNumber("bedrooms", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Beds
            <input required type="number" min={1} value={form.beds} onChange={(event) => updateNumber("beds", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Bathrooms
            <input required type="number" min={0.5} step="0.5" value={form.bathrooms} onChange={(event) => updateNumber("bathrooms", event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Photos and amenities</h2>
        <label className="block text-sm font-semibold text-gray-700">
          Image URLs
          <textarea rows={4} value={form.image_urls.join("\n")} onChange={(event) => update("image_urls", event.target.value.split("\n").map((url) => url.trim()).filter(Boolean))} placeholder="One image URL per line" className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-900" />
        </label>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Amenities</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {availableAmenities.map((amenity) => (
              <label key={amenity.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                <input type="checkbox" checked={form.amenities.includes(amenity.name)} onChange={() => toggleAmenity(amenity.name)} className="h-4 w-4 accent-rose-500" />
                {amenity.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300">
          {submitting ? "Saving..." : mode === "create" ? "Create listing" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
