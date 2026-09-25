import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-muted)] text-[var(--ink)]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-xl rounded-[2rem] border border-[var(--line)] bg-white px-7 py-12 text-center shadow-[var(--shadow-soft)] sm:px-14">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.7-.84L4 20l1.34-3.57A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.6" /><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </div>
          <p className="eyebrow">Demo feature</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Nothing to see here</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--ink-muted)]">After booking a stay, messages with your host would appear here. Messaging is coming soon in this demo.</p>
          <Link href="/" className="button button--primary mt-8">Explore stays</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
