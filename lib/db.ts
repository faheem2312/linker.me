import { createClient } from "@supabase/supabase-js";
import { verifySessionToken } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export type User = {
  id: string;
  email: string;
  handle: string;
  createdAt: string;
};

export type Bookmark = {
  id: string;
  userId: string;
  title: string;
  url: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getClientForSession(sessionCookie?: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  if (sessionCookie) {
    const sessionData = verifySessionToken(sessionCookie);
    if (sessionData) {
      await supabase.auth.setSession({
        access_token: sessionData.accessToken,
        refresh_token: sessionData.refreshToken,
      });
    }
  }
  return supabase;
}

export async function getUserByHandle(handle: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("handle", handle.trim().toLowerCase())
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as { id: string; handle: string };
}

export async function getUserById(id: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as { id: string; handle: string };
}

export async function createUser(email: string, handle: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password,
    options: {
      data: {
        handle: handle.trim().toLowerCase(),
      },
    },
  });

  if (signUpError || !signUpData.user) {
    throw new Error(signUpError?.message ?? "Failed to sign up user in Supabase.");
  }

  const session = signUpData.session;
  if (session) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    await client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    const { error: profileError } = await client
      .from("profiles")
      .upsert({
        id: signUpData.user.id,
        handle: handle.trim().toLowerCase(),
      });

    if (profileError && !profileError.message.includes("duplicate key")) {
      throw new Error(profileError.message);
    }
  }

  return {
    id: signUpData.user.id,
    email: signUpData.user.email!,
    handle: handle.trim().toLowerCase(),
    session: signUpData.session,
  };
}

export async function getBookmarksByUserId(userId: string, sessionCookie?: string) {
  const supabase = await getClientForSession(sessionCookie);
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, user_id, title, url, is_public, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }

  return (data || []).map((b) => ({
    id: b.id,
    userId: b.user_id,
    title: b.title,
    url: b.url,
    isPublic: b.is_public,
    createdAt: b.created_at,
    updatedAt: b.created_at,
  }));
}

export async function getPublicBookmarksByUserId(userId: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, user_id, title, url, is_public, created_at")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public bookmarks:", error);
    return [];
  }

  return (data || []).map((b) => ({
    id: b.id,
    userId: b.user_id,
    title: b.title,
    url: b.url,
    isPublic: b.is_public,
    createdAt: b.created_at,
    updatedAt: b.created_at,
  }));
}

export async function getPublicBookmarksByHandle(handle: string) {
  const user = await getUserByHandle(handle);
  if (!user) {
    return { user: null, bookmarks: [] };
  }

  const bookmarks = await getPublicBookmarksByUserId(user.id);
  return { user, bookmarks };
}

export async function createBookmark(userId: string, title: string, url: string, isPublic: boolean, sessionCookie?: string) {
  const supabase = await getClientForSession(sessionCookie);
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      title: title.trim(),
      url: url.trim(),
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    url: data.url,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
}

export async function updateBookmark(
  userId: string,
  bookmarkId: string,
  updates: Partial<Omit<Bookmark, "id" | "userId" | "createdAt">>,
  sessionCookie?: string
) {
  const supabase = await getClientForSession(sessionCookie);
  const { data, error } = await supabase
    .from("bookmarks")
    .update({
      title: updates.title?.trim(),
      url: updates.url?.trim(),
      is_public: updates.isPublic,
    })
    .eq("id", bookmarkId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    url: data.url,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
}

export async function deleteBookmark(userId: string, bookmarkId: string, sessionCookie?: string) {
  const supabase = await getClientForSession(sessionCookie);
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    url: data.url,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
}
