"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Left — Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <svg
            className="w-8 h-8 text-rose-500 fill-current transition-transform duration-200 group-hover:scale-105"
            viewBox="0 0 32 32"
            aria-label="Airbnb logo"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.308-3.327 7.806-7.5 7.806-3.181 0-6.02-2.029-7.1-4.996l-.328-.902-.328.902c-1.08 2.967-3.919 4.996-7.1 4.996-4.173 0-7.5-3.498-7.5-7.806 0-1.28.326-2.5.971-3.711l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.246 0-2.26.657-3.23 2.484l-.454.912c-1.87 3.666-5.918 12.14-6.852 14.321l-.105.255c-.496 1.22-.759 2.12-.759 3.028 0 3.208 2.463 5.806 5.5 5.806 2.379 0 4.544-1.579 5.378-3.922l.666-1.864.666 1.864c.834 2.343 3 3.922 5.378 3.922 3.037 0 5.5-2.598 5.5-5.806 0-.908-.263-1.808-.759-3.028l-.105-.255c-.934-2.181-4.982-10.655-6.852-14.321l-.454-.912C18.26 3.657 17.246 3 16 3z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-rose-500 hidden md:inline">
            airbnb
          </span>
        </Link>

        {/* Center — Search Bar */}
        <div className="flex-1 max-w-2xl px-2">
          <SearchBar />
        </div>

        {/* Right — Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            className="hidden lg:block text-sm font-semibold text-gray-800 hover:bg-gray-100 px-4 py-2.5 rounded-full transition cursor-pointer"
          >
            Become a host
          </button>

          <button
            type="button"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-700 transition cursor-pointer"
            aria-label="Language & region"
          >
            <svg className="w-5 h-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
            </svg>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center space-x-2 border border-gray-300 hover:shadow-md rounded-full px-3 py-1.5 bg-white cursor-pointer transition"
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-4 h-4 text-gray-600 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <div className="w-7 h-7 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold">
                D
              </div>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-[fadeSlideDown_0.15s_ease-out]">
                <style>{`
                  @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900">Demo Guest</p>
                  <p className="text-xs text-gray-400">demo@example.com</p>
                </div>

                <Link
                  href="/trips"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Trips
                </Link>

                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  Wishlists
                </Link>

                <div className="my-1.5 border-t border-gray-100" />

                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  Explore
                </Link>

                <div className="my-1.5 border-t border-gray-100" />

                <button
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
