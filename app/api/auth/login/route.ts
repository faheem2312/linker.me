import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserById } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function validateEmail(email: unknown) {
  return typeof email === "string" && email.trim().length > 0 && email.includes("@");
}

function validatePassword(password: unknown) {
  return typeof password === "string" && password.length >= 8;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !validateEmail(body.email) || !validatePassword(body.password)) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const password = body.password;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user || !data.session) {
    return NextResponse.json({ error: error?.message ?? "Invalid email or password." }, { status: 401 });
  }

  const profile = await getUserById(data.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const response = NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      handle: profile.handle,
    },
  });

  response.headers.set(
    "Set-Cookie",
    createSessionCookie(data.user.id, data.user.email!, data.session.access_token, data.session.refresh_token)
  );

  return response;
}
