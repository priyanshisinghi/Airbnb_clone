"use client";

/**
 * WishlistContext
 *
 * Provides wishlist state globally. Features:
 *  - Initial hydration from GET /api/wishlist/ids on mount
 *  - Optimistic toggle: updates UI instantly, reverts on API failure
 *  - Toast notifications on save / unsave / error
 *  - All API calls go through this context — never directly from HeartButton
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { addToWishlist, removeFromWishlist, fetchWishlistIds } from "@/lib/api";
import { useUser } from "@/context/UserContext";

/* ─── Toast types ─────────────────────────────────────────── */
type ToastType = "saved" | "removed" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/* ─── Context shape ───────────────────────────────────────── */
interface WishlistCtx {
  savedIds: Set<number>;
  loading: boolean;
  toggle: (listingId: number) => void;
  isSaved: (listingId: number) => boolean;
}

const WishlistContext = createContext<WishlistCtx>({
  savedIds: new Set(),
  loading: true,
  toggle: () => {},
  isSaved: () => false,
});

/* ─── Toast renderer (floats at bottom-right) ─────────────── */
function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white pointer-events-auto
            animate-[fadeSlideUp_0.25s_ease-out]
            ${t.type === "saved" ? "bg-rose-500" : t.type === "removed" ? "bg-gray-800" : "bg-red-600"}
          `}
        >
          {t.type === "saved" && (
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 32 32">
              <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.83-4.84 2.11L16 8.36l-2.16-2.25A6.98 6.98 0 0 0 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z" />
            </svg>
          )}
          {t.type === "removed" && (
            <svg className="w-4 h-4 stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {t.type === "error" && (
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Provider ────────────────────────────────────────────── */
let toastCounter = 0;

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { selectedUserId } = useUser();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Track in-flight requests to prevent double-clicks
  const inFlight = useRef<Set<number>>(new Set());

  /* hydrate */
  useEffect(() => {
    if (selectedUserId === null) return;

    setLoading(true);
    fetchWishlistIds()
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => setSavedIds(new Set()))
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  /* toast helper */
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /* optimistic toggle */
  const toggle = useCallback(
    async (listingId: number) => {
      if (inFlight.current.has(listingId)) return;
      inFlight.current.add(listingId);

      const wasSaved = savedIds.has(listingId);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.delete(listingId) : next.add(listingId);
        return next;
      });

      try {
        if (wasSaved) {
          await removeFromWishlist(listingId);
          showToast("removed", "Removed from wishlist");
        } else {
          await addToWishlist(listingId);
          showToast("saved", "Saved to wishlist");
        }
      } catch {
        // Revert
        setSavedIds((prev) => {
          const next = new Set(prev);
          wasSaved ? next.add(listingId) : next.delete(listingId);
          return next;
        });
        showToast("error", "Something went wrong. Please try again.");
      } finally {
        inFlight.current.delete(listingId);
      }
    },
    [savedIds, showToast]
  );

  const isSaved = useCallback(
    (listingId: number) => savedIds.has(listingId),
    [savedIds]
  );

  return (
    <WishlistContext.Provider value={{ savedIds, loading, toggle, isSaved }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
      <ToastStack toasts={toasts} />
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
