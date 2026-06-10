import { notFound } from "next/navigation";
import { getPublicBookmarksByHandle } from "@/lib/db";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: rawHandle } = await params;
  const handle = rawHandle.trim().toLowerCase();
  const profile = await getPublicBookmarksByHandle(handle);

  if (!profile.user) {
    notFound();
  }

  return (
    <div className="min-h-full bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-[2rem] bg-white p-10 shadow-xl shadow-zinc-200/40 dark:bg-zinc-950 dark:shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Public profile</p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-950 dark:text-white">@{profile.user.handle}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
            Only public bookmarks appear on this page. Private bookmarks remain accessible only through the signed-in dashboard.
          </p>
          <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <p>
              {profile.bookmarks.length === 0 ? "No public bookmarks yet." : `${profile.bookmarks.length} public bookmark${profile.bookmarks.length === 1 ? "" : "s"} available.`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {profile.bookmarks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p>When this user adds public bookmarks, they will show up here.</p>
            </div>
          ) : (
            profile.bookmarks.map((bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">{bookmark.title}</h2>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Public</span>
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{bookmark.url}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
