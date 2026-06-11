"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  user: { handle: string; email: string };
  initialBookmarks: Bookmark[];
};

const blankBookmark = { title: "", url: "", isPublic: true };

export default function DashboardApp({ user, initialBookmarks }: Props) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [form, setForm] = useState(blankBookmark);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submitLabel = editingId ? "Update bookmark" : "Add bookmark";
  const formTitle = editingId ? "Edit bookmark" : "Add bookmark";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setForm({ title: bookmark.title, url: bookmark.url, isPublic: bookmark.isPublic });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(blankBookmark);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const method = editingId ? "PATCH" : "POST";
    const path = editingId ? `/api/bookmarks/${editingId}` : "/api/bookmarks";

    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to save bookmark.");
      return;
    }

    if (editingId) {
      setBookmarks((current) => current.map((bookmark) => (bookmark.id === editingId ? data.bookmark : bookmark)));
    } else {
      setBookmarks((current) => [data.bookmark, ...current]);
    }

    setEditingId(null);
    setForm(blankBookmark);
  };

  const handleDelete = async (bookmarkId: string) => {
    if (!confirm("Delete this bookmark?")) {
      return;
    }

    const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Unable to delete bookmark.");
      return;
    }

    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== bookmarkId));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/");
  };

  const publicProfileUrl = useMemo(() => `/${user.handle}`, [user.handle]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 rounded-3xl border border-muted-tan bg-latte p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-walnut">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-espresso">@{user.handle}</h1>
          <p className="mt-2 text-sm text-walnut">Manage your personal bookmarks and choose whether each link should be public or private.</p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <Link href={publicProfileUrl} className="rounded-full bg-caramel hover:bg-caramel-hover px-4 py-2 text-sm font-medium text-white transition">
            View public profile
          </Link>
          <button onClick={handleLogout} className="rounded-full border border-muted-tan bg-white px-4 py-2 text-sm text-espresso transition hover:border-walnut hover:text-caramel">
            Log out
          </button>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-muted-tan bg-latte p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-walnut">{formTitle}</p>
              <h2 className="mt-2 text-xl font-semibold text-espresso">Add or update a bookmark</h2>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-espresso">
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-muted-tan bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-caramel"
                required
              />
            </label>

            <label className="block text-sm font-medium text-espresso">
              URL
              <input
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-muted-tan bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-caramel"
                placeholder="https://example.com"
                required
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-espresso">
              <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} className="h-4 w-4 rounded border-muted-tan text-caramel focus:ring-caramel bg-white" />
              Make bookmark public
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-2xl bg-caramel px-4 py-3 text-sm font-semibold text-white transition hover:bg-caramel-hover disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? "Saving…" : submitLabel}
              </button>
              {editingId ? (
                <button type="button" onClick={handleCancel} className="inline-flex w-full items-center justify-center rounded-2xl border border-muted-tan bg-white px-4 py-3 text-sm font-semibold text-espresso transition hover:border-walnut hover:text-caramel">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-muted-tan bg-latte p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-walnut">Quick start</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-walnut">
            <p>Use the form to save bookmarks. Public items are visible on your profile, private items are only in your dashboard.</p>
            <p>Bookmarks are stored server-side and can only be read, edited, or deleted by you.</p>
            <p>Your public profile is available at <span className="font-semibold text-espresso">{publicProfileUrl}</span>.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-muted-tan bg-latte p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-espresso">Your bookmarks</h2>
          <span className="rounded-full bg-almond border border-muted-tan px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-espresso">{bookmarks.length}</span>
        </div>

        {bookmarks.length === 0 ? (
          <p className="text-sm text-walnut">Add your first bookmark to see it here.</p>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="rounded-3xl border border-muted-tan bg-almond p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <a href={bookmark.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-espresso transition hover:text-caramel">
                      {bookmark.title}
                    </a>
                    <p className="mt-1 text-sm text-walnut">{bookmark.url}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-latte px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-espresso border border-muted-tan">
                    {bookmark.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <button onClick={() => handleEdit(bookmark)} className="rounded-2xl border border-muted-tan bg-white px-3 py-2 text-espresso transition hover:border-walnut hover:text-caramel">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(bookmark.id)} className="rounded-2xl border border-red-200 bg-red-50/50 px-3 py-2 text-red-700 transition hover:bg-red-50 hover:border-red-300">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
