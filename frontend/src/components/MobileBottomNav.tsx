"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Explore", href: "/", icon: "explore" },
  { label: "Wishlists", href: "/wishlists", icon: "heart" },
  { label: "Trips", href: "/trips", icon: "trips" },
  { label: "Messages", href: "/messages", icon: "messages" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

function Icon({ name }: { name: string }) {
  if (name === "heart") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>;
  }
  if (name === "trips") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
  }
  if (name === "messages") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.7-.84L4 20l1.34-3.57A8 8 0 1 1 20 11.5Z" /><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" /></svg>;
  }
  if (name === "profile") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/book/") || pathname.startsWith("/rooms/") || pathname.startsWith("/host/listings/");
  if (hidden) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "mobile-bottom-nav__item mobile-bottom-nav__item--active" : "mobile-bottom-nav__item"}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
