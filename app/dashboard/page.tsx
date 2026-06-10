import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromSessionCookie } from "@/lib/auth";
import { getBookmarksByUserId } from "@/lib/db";
import DashboardApp from "@/app/components/DashboardApp";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = await getUserFromSessionCookie(session);

  if (!user) {
    redirect("/");
  }

  const bookmarks = await getBookmarksByUserId(user.id, session);
  return (
    <div className="min-h-full bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-6xl">
        <DashboardApp user={{ handle: user.handle, email: user.email }} initialBookmarks={bookmarks} />
      </div>
    </div>
  );
}
