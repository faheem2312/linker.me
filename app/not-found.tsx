import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-full bg-almond px-6 py-10 text-espresso">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-latte border border-muted-tan p-14 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-walnut">Page not found</p>
        <h1 className="mt-6 text-4xl font-semibold text-espresso">We couldn&apos;t find that profile.</h1>
        <p className="mt-4 text-base leading-8 text-walnut">Either the handle does not exist or the page has moved.</p>
        <Link href="/" className="mt-8 inline-flex rounded-2xl bg-caramel hover:bg-caramel-hover px-6 py-3 text-sm font-semibold text-white transition">
          Back to home
        </Link>
      </div>
    </div>
  );
}
