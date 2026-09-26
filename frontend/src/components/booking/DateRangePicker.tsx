"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker, type DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import "react-day-picker/style.css";
import { UnavailableDateRange } from "@/types/listing";

export function parseYmd(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Occupied nights are [check_in, check_out) so exclusive checkout stays bookable. */
export function occupiedDatesFromRanges(ranges: UnavailableDateRange[]): Date[] {
  const dates: Date[] = [];
  for (const range of ranges) {
    const start = parseYmd(range.check_in);
    const end = parseYmd(range.check_out);
    if (!start || !end) continue;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor < end) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return dates;
}

export function formatShortRange(checkIn: string, checkOut: string): string {
  const from = parseYmd(checkIn);
  const to = parseYmd(checkOut);
  if (!from || !to) return "";
  return `${format(from, "d MMM")} – ${format(to, "d MMM")}`;
}

function formatFieldDate(value: string): string {
  const date = parseYmd(value);
  return date ? format(date, "d MMM yyyy") : "Add date";
}

function formatSummaryDate(value: string): string {
  const date = parseYmd(value);
  return date ? format(date, "d MMM yyyy") : "";
}

function rangeCrossesOccupied(from: Date, to: Date, occupied: Date[]): boolean {
  const blocked = new Set(occupied.map(toYmd));
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (cursor < to) {
    if (blocked.has(toYmd(cursor))) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  unavailableDates: UnavailableDateRange[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestCount?: number;
  onGuestCountChange?: (guests: number) => void;
  maxGuests?: number;
  showTrigger?: boolean;
  activeWhen?: "always" | "desktop" | "mobile";
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onDatesChange,
  unavailableDates,
  open,
  onOpenChange,
  guestCount = 1,
  onGuestCountChange,
  maxGuests = 1,
  showTrigger = true,
  activeWhen = "always",
}: DateRangePickerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const today = useMemo(() => startOfLocalDay(), []);
  const occupiedDates = useMemo(
    () => occupiedDatesFromRanges(unavailableDates),
    [unavailableDates],
  );

  const selected = useMemo<DateRange | undefined>(() => {
    const from = parseYmd(checkIn);
    const to = parseYmd(checkOut);
    if (!from && !to) return undefined;
    return { from, to };
  }, [checkIn, checkOut]);

  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInCalendarDays(parseYmd(checkOut)!, parseYmd(checkIn)!))
      : 0;

  const matchesViewport =
    activeWhen === "always" ||
    (activeWhen === "desktop" && isDesktop) ||
    (activeWhen === "mobile" && !isDesktop);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || !matchesViewport) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, matchesViewport, onOpenChange]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onDatesChange("", "");
      return;
    }
    if (!range.to || toYmd(range.from) === toYmd(range.to)) {
      onDatesChange(toYmd(range.from), "");
      return;
    }
    if (rangeCrossesOccupied(range.from, range.to, occupiedDates)) {
      onDatesChange(toYmd(range.from), "");
      return;
    }
    onDatesChange(toYmd(range.from), toYmd(range.to));
  };

  const adjustGuests = (delta: number) => {
    if (!onGuestCountChange) return;
    onGuestCountChange(Math.min(maxGuests, Math.max(1, guestCount + delta)));
  };

  const calendar = (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={handleSelect}
      numberOfMonths={isDesktop ? 2 : 1}
      navLayout="around"
      animate={false}
      autoFocus={open}
      excludeDisabled
      resetOnSelect
      min={1}
      defaultMonth={parseYmd(checkIn) ?? today}
      startMonth={today}
      disabled={[{ before: today }, ...occupiedDates]}
      className="airbnb-daypicker"
      aria-label="Select check-in and checkout dates"
      formatters={{
        formatWeekdayName: (date) => format(date, "EEEEE"),
        formatCaption: (date) => format(date, "MMMM yyyy"),
      }}
    />
  );

  const guestStepper = onGuestCountChange ? (
    <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-1 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">Guests</p>
        <p className="text-xs text-gray-500">Maximum {maxGuests}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => adjustGuests(-1)}
          disabled={guestCount <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease guest count"
        >
          −
        </button>
        <span className="min-w-4 text-center text-sm font-semibold text-gray-900" aria-live="polite">
          {guestCount}
        </span>
        <button
          type="button"
          onClick={() => adjustGuests(1)}
          disabled={guestCount >= maxGuests}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase guest count"
        >
          +
        </button>
      </div>
    </div>
  ) : null;

  const panel = isDesktop ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Date range calendar"
      className="fixed left-1/2 top-1/2 z-[70] w-[850px] max-w-[calc(100vw-32px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_16px_48px_rgba(31,41,55,0.16)]"
    >
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Select dates"}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            {checkIn && checkOut
              ? `${formatSummaryDate(checkIn)} – ${formatSummaryDate(checkOut)}`
              : "Add your travel dates for exact pricing"}
          </p>
        </div>
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-300 text-left text-xs">
          <div className="border-r border-gray-300 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800">Check-in</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatFieldDate(checkIn)}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800">Checkout</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatFieldDate(checkOut)}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-0.5 pb-3">{calendar}</div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => onDatesChange("", "")}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 underline underline-offset-2 hover:bg-gray-50"
          aria-label="Clear dates"
        >
          Clear dates
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          aria-label="Close calendar"
        >
          Close
        </button>
      </div>
    </div>
  ) : (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Select dates"
      className="fixed inset-0 z-[90] flex w-full max-w-full flex-col overflow-hidden bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">Select dates</h2>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-gray-700 hover:bg-gray-100"
          aria-label="Close calendar"
        >
          ×
        </button>
      </div>

      <div className="px-4 pt-3">
        <p className="text-sm text-gray-500">
          {nights > 0 && checkIn && checkOut
            ? `${nights} ${nights === 1 ? "night" : "nights"} · ${formatShortRange(checkIn, checkOut)}`
            : "Add your travel dates"}
        </p>
        <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-300 text-left text-xs">
          <div className="border-r border-gray-300 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800">Check-in</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatFieldDate(checkIn)}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800">Checkout</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatFieldDate(checkOut)}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
        {calendar}
      </div>

      <div className="border-t border-gray-100 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {guestStepper}
        <div className="flex items-center justify-between gap-3 py-3">
          <button
            type="button"
            onClick={() => onDatesChange("", "")}
            className="rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 underline underline-offset-2"
            aria-label="Clear dates"
          >
            Clear dates
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
            aria-label="Done selecting dates"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showTrigger && (
        <div
          ref={triggerRef}
          className="grid grid-cols-2 divide-x divide-gray-300 bg-white"
        >
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            aria-label="Select check-in date"
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`p-3 text-left ${open ? "bg-gray-50" : "hover:bg-gray-50"}`}
          >
            <span className="block text-[10px] font-bold uppercase text-gray-800">Check-in</span>
            <span className={`mt-0.5 block text-xs font-medium ${checkIn ? "text-gray-900" : "text-gray-400"}`}>
              {formatFieldDate(checkIn)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            aria-label="Select checkout date"
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`p-3 text-left ${open ? "bg-gray-50" : "hover:bg-gray-50"}`}
          >
            <span className="block text-[10px] font-bold uppercase text-gray-800">Checkout</span>
            <span className={`mt-0.5 block text-xs font-medium ${checkOut ? "text-gray-900" : "text-gray-400"}`}>
              {formatFieldDate(checkOut)}
            </span>
          </button>
        </div>
      )}

      {mounted &&
        open &&
        matchesViewport &&
        createPortal(
          <>
            {isDesktop && (
              <button
                type="button"
                aria-label="Dismiss calendar"
                className="fixed inset-0 z-[60] bg-black/30"
                onClick={() => onOpenChange(false)}
              />
            )}
            {panel}
          </>,
          document.body,
        )}
    </>
  );
}
