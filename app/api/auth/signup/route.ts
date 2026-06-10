import { NextResponse } from "next/server";
import { createUser, getUserByHandle } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

const RESERVED_HANDLES = new Set(["dashboard", "api", "profile", "static", "public", "favicon.ico", "login", "signup", "logout"]);

function validateEmail(email: unknown) {
  return typeof email === "string" && email.trim().length > 0 && email.includes("@");
}

function validateHandle(handle: unknown) {
  if (typeof handle !== "string") {
    return false;
  }
  const trimmed = handle.trim().toLowerCase();
  return /^[a-z0-9_\-]{3,24}$/i.test(trimmed) && !RESERVED_HANDLES.has(trimmed);
}

function validatePassword(password: unknown) {
  return typeof password === "string" && password.length >= 8;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !validateEmail(body.email) || !validateHandle(body.handle) || !validatePassword(body.password)) {
    return NextResponse.json({ error: "Email, handle, and password are required. Handle must be 3-24 chars." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const handle = body.handle.trim().toLowerCase();

  try {
    if (await getUserByHandle(handle)) {
      return NextResponse.json({ error: "Handle is already taken." }, { status: 400 });
    }

    const user = await createUser(email, handle, body.password);
    await sendWelcomeEmail(user.email, user.handle);

    const response = NextResponse.json({ user: { id: user.id, email: user.email, handle: user.handle } });
    if (user.session) {
      response.headers.set("Set-Cookie", createSessionCookie(user.id, user.email, user.session.access_token, user.session.refresh_token));
    }
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message ?? "Could not create user." }, { status: 400 });
  }
}
