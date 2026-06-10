import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromSessionCookie } from "@/lib/auth";
import { deleteBookmark, updateBookmark } from "@/lib/db";

async function parseSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionCookie();
  const user = await getUserFromSessionCookie(session);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || (body.title && typeof body.title !== "string") || (body.url && typeof body.url !== "string") || (body.isPublic !== undefined && typeof body.isPublic !== "boolean")) {
    return NextResponse.json({ error: "Invalid bookmark payload." }, { status: 400 });
  }

  try {
    const bookmark = await updateBookmark(user.id, id, {
      title: body.title,
      url: body.url,
      isPublic: body.isPublic,
    }, session);

    return NextResponse.json({ bookmark });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionCookie();
  const user = await getUserFromSessionCookie(session);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const deleted = await deleteBookmark(user.id, id, session);
    return NextResponse.json({ deleted });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
