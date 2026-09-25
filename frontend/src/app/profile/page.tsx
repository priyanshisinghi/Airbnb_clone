"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserSwitcher from "@/components/UserSwitcher";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
  const { currentUser, loading } = useUser();
  const initials = currentUser?.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "DU";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-muted)] text-[var(--ink)]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
        <div className="mb-8"><p className="eyebrow">Your account</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.03em]">Profile</h1></div>
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-7 shadow-[var(--shadow-soft)]">
            {loading ? <div className="h-24 animate-pulse rounded-2xl bg-gray-100" /> : (
              <>
                {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.name} className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl font-bold text-[var(--accent)]">{initials}</div>}
                <h2 className="mt-5 text-2xl font-bold">{currentUser?.name || "Demo user"}</h2>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{currentUser?.email}</p>
                <span className="mt-5 inline-flex rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-bold text-white">{currentUser?.is_host ? "Host" : "Guest"}</span>
                <div className="mt-8 border-t border-[var(--line)] pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--ink-soft)]">Switch demo profile</p><UserSwitcher /></div>
              </>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/trips" className="profile-action"><span className="profile-action__icon">01</span><span><strong>Past trips</strong><small>Review your travel history</small></span></Link>
            <Link href="/wishlists" className="profile-action"><span className="profile-action__icon">02</span><span><strong>Wishlist</strong><small>Return to saved homes</small></span></Link>
            <Link href="/messages" className="profile-action"><span className="profile-action__icon">03</span><span><strong>Messages</strong><small>Coming Soon</small></span></Link>
            <Link href="/host" className="profile-action"><span className="profile-action__icon">04</span><span><strong>{currentUser?.is_host ? "Host dashboard" : "Become a host"}</strong><small>{currentUser?.is_host ? "Manage your listings" : "Try the host demo"}</small></span></Link>
            <button type="button" className="profile-action text-left"><span className="profile-action__icon">04</span><span><strong>Account settings</strong><small>Coming Soon</small></span></button>
            <button type="button" className="profile-action text-left"><span className="profile-action__icon">05</span><span><strong>Identity verification</strong><small>Coming Soon</small></span></button>
            <button type="button" className="profile-action text-left"><span className="profile-action__icon">06</span><span><strong>Help and privacy</strong><small>Coming Soon</small></span></button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
