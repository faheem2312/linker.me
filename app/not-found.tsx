import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-full bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-14 text-center shadow-xl shadow-zinc-200/40 dark:bg-zinc-950 dark:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Page not found</p>
        <h1 className="mt-6 text-4xl font-semibold text-zinc-950 dark:text-white">We couldn&apos;t find that profile.</h1>
        <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-300">Either the handle does not exist or the page has moved.</p>
        <Link href="/" className="mt-8 inline-flex rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
          Back to home
        </Link>
      </div>
    </div>
  );
}
