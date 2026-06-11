import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromSessionCookie } from "@/lib/auth";
import { getPublicBookmarksByHandle } from "@/lib/db";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: rawHandle } = await params;
  const handle = rawHandle.trim().toLowerCase();
  const profile = await getPublicBookmarksByHandle(handle);

  if (!profile.user) {
    notFound();
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = await getUserFromSessionCookie(session);

  return (
    <div className="min-h-full bg-almond px-6 py-10 text-espresso">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex justify-start">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-muted-tan bg-latte px-4 py-2.5 text-sm font-medium text-espresso transition hover:border-walnut hover:text-caramel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-muted-tan bg-latte px-4 py-2.5 text-sm font-medium text-espresso transition hover:border-walnut hover:text-caramel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Home
            </Link>
          )}
        </div>

        <div className="rounded-[2rem] bg-latte p-10 border border-muted-tan shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-walnut">Public profile</p>
          <h1 className="mt-4 text-4xl font-semibold text-espresso">@{profile.user.handle}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-walnut">
            Only public bookmarks appear on this page. Private bookmarks remain accessible only through the signed-in dashboard.
          </p>
          <div className="mt-6 rounded-3xl border border-muted-tan bg-almond p-5 text-sm text-espresso">
            <p>
              {profile.bookmarks.length === 0 ? "No public bookmarks yet." : `${profile.bookmarks.length} public bookmark${profile.bookmarks.length === 1 ? "" : "s"} available.`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {profile.bookmarks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-muted-tan bg-latte p-8 text-center text-walnut">
              <p>When this user adds public bookmarks, they will show up here.</p>
            </div>
          ) : (
            profile.bookmarks.map((bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-3xl border border-muted-tan bg-latte p-8 transition hover:border-walnut hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-espresso">{bookmark.title}</h2>
                  <span className="rounded-full bg-almond px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-espresso border border-muted-tan">Public</span>
                </div>
                <p className="mt-3 text-sm text-walnut">{bookmark.url}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
