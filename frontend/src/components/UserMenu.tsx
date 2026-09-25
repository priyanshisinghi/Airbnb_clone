"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import UserSwitcher from "./UserSwitcher";

export default function UserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUser();

  useEffect(() => {
    if (!menuOpen) return;
    const escapeHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escapeHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escapeHandler);
    };
  }, [menuOpen]);

  const initials = currentUser?.name.charAt(0).toUpperCase() || "D";
  const role = currentUser?.is_host ? "Host" : "Guest";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className="flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 transition hover:shadow-md"
        aria-label="User menu"
        aria-expanded={menuOpen}
      >
        <svg className="h-4 w-4 stroke-current stroke-2 text-gray-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-xs font-bold text-white">
          {initials}
        </div>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl animate-[fadeSlideDown_0.15s_ease-out]">
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="border-b border-gray-100 px-4 py-2.5">
            <p className="eyebrow">Mock login</p>
            <p className="mt-1 text-sm font-bold text-gray-900">Log in or sign up</p>
            <p className="text-xs font-semibold text-gray-900">{currentUser?.name || "Demo user"}</p>
            <p className="text-xs text-gray-400">{role} · {currentUser?.email || "Select a user"}</p>
          </div>

          <UserSwitcher />

          <Link
            href="/trips"
            onClick={() => setMenuOpen(false)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Trips
          </Link>

          {currentUser?.is_host && (
            <Link
              href="/host"
              onClick={() => setMenuOpen(false)}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Host dashboard
            </Link>
          )}

          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Profile
          </Link>

          <Link
            href="/wishlists"
            onClick={() => setMenuOpen(false)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Wishlists
          </Link>

          <div className="my-1.5 border-t border-gray-100" />

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Explore
          </Link>
        </div>
      )}
    </div>
  );
}
