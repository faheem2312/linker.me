import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromSessionCookie } from "@/lib/auth";
import { createBookmark, getBookmarksByUserId } from "@/lib/db";

function validateBookmark(payload: any) {
  return (
    payload &&
    typeof payload.title === "string" &&
    payload.title.trim().length > 0 &&
    typeof payload.url === "string" &&
    payload.url.trim().length > 0 &&
    typeof payload.isPublic === "boolean"
  );
}

async function parseSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value;
}

export async function POST(request: Request) {
  const session = await parseSessionCookie();
  const user = await getUserFromSessionCookie(session);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!validateBookmark(body)) {
    return NextResponse.json({ error: "Title, URL, and visibility are required." }, { status: 400 });
  }

  try {
    const bookmark = await createBookmark(user.id, body.title, body.url, body.isPublic, session);
    const bookmarks = await getBookmarksByUserId(user.id, session);
    return NextResponse.json({ bookmark, bookmarks });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
