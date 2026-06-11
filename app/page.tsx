import { cookies } from "next/headers";
import { getUserFromSessionCookie } from "@/lib/auth";
import AuthForms from "@/app/components/AuthForms";
import HandleSearch from "@/app/components/HandleSearch";
import Link from "next/link";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = await getUserFromSessionCookie(session);

  return (
    <div className="min-h-full bg-almond px-6 py-10 text-espresso">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-12">
        <section className="rounded-[2rem] bg-latte p-10 border border-muted-tan shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-walnut">Linker.me</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-espresso sm:text-5xl">
            Personal bookmarks with a public profile and private dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-walnut">
            Save links privately, publish the ones you want, and share your profile at a unique @{`handle`}. Everything is stored backend-side and only you can manage your bookmarks.
          </p>

          <div className="mt-8 space-y-6 rounded-3xl border border-muted-tan bg-almond p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-walnut">Browse a profile</p>
            <HandleSearch />
          </div>

          {user ? (
            <div className="mt-10 rounded-3xl border border-muted-tan bg-almond p-6 text-espresso">
              <p className="text-sm uppercase tracking-[0.3em] text-walnut">Signed in</p>
              <h2 className="mt-2 text-2xl font-semibold text-espresso">Welcome back, @{user.handle}</h2>
              <p className="mt-3 text-sm leading-7 text-walnut">Your dashboard is ready. Continue managing bookmarks from the dashboard.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard" className="rounded-2xl bg-caramel hover:bg-caramel-hover px-5 py-3 text-sm font-semibold text-white transition">Go to dashboard</Link>
                <Link href={`/${user.handle}`} className="rounded-2xl border border-muted-tan px-5 py-3 text-sm text-espresso transition hover:border-walnut">View public profile</Link>
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
