"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

export default function Navbar() {
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

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <Link href="/" className="nav-link nav-link--active">Homes</Link>
          <Link href="/experiences" className="nav-link">Experiences</Link>
          <Link href="/services" className="nav-link">Services</Link>
        </nav>

        {/* Center — Search Bar */}
        <div className="flex-1 max-w-2xl px-2">
          <SearchBar />
        </div>

        {/* Right — Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/host"
            className="hidden lg:block text-sm font-semibold text-gray-800 hover:bg-gray-100 px-4 py-2.5 rounded-full transition cursor-pointer"
          >
            Become a host
          </Link>

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

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
