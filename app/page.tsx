import { cookies } from "next/headers";
import { getUserFromSessionCookie } from "@/lib/auth";
import AuthForms from "@/app/components/AuthForms";
import HandleSearch from "@/app/components/HandleSearch";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = await getUserFromSessionCookie(session);

  return (
    <div className="min-h-full bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-12">
        <section className="rounded-[2rem] bg-white p-10 shadow-xl shadow-zinc-200/40 dark:bg-zinc-950 dark:shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Linker.me</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            Personal bookmarks with a public profile and private dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
            Save links privately, publish the ones you want, and share your profile at a unique @{`handle`}. Everything is stored backend-side and only you can manage your bookmarks.
          </p>

          <div className="mt-8 space-y-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Browse a profile</p>
            <HandleSearch />
          </div>

          {user ? (
            <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Signed in</p>
              <h2 className="mt-2 text-2xl font-semibold">Welcome back, @{user.handle}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">Your dashboard is ready. Continue managing bookmarks from the dashboard.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/dashboard" className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">Go to dashboard</a>
                <a href={`/${user.handle}`} className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm text-zinc-900 transition hover:border-zinc-300 dark:border-zinc-700 dark:text-white">View public profile</a>
              </div>
            </div>
          ) : null}
        </section>

        <section>
          <AuthForms />
        </section>
      </main>
    </div>
  );
}
