import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  body: string;
}

export default function ComingSoonPage({ eyebrow, title, body }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-muted)] text-[var(--ink)]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-xl rounded-[2rem] border border-[var(--line)] bg-white px-7 py-12 text-center shadow-[var(--shadow-soft)] sm:px-14">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />
            </svg>
          </div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--ink-muted)]">{body}</p>
          <Link href="/" className="button button--primary mt-8">Explore homes</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
