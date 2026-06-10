"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  email: "",
  password: "",
  handle: "",
};

export default function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = `/api/auth/${mode}`;
    const payload: Record<string, unknown> = {
      email: form.email,
      password: form.password,
    };

    if (mode === "signup") {
      payload.handle = form.handle;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to sign in.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Personal bookmarks</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-white">Get started with login or sign up</h2>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-200"
        >
          {mode === "login" ? "Create an account" : "Have an account?"}
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:text-white dark:focus:border-white"
            required
          />
        </label>

        {mode === "signup" ? (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Choose a handle
            <input
              name="handle"
              type="text"
              value={form.handle}
              onChange={handleChange}
              placeholder="your-handle"
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:text-white dark:focus:border-white"
              required
            />
            <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">Lowercase letters, numbers, dashes and underscores only.</span>
          </label>
        ) : null}

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:text-white dark:focus:border-white"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Working…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
        Signing up creates a dashboard for your bookmarks. We also log a welcome email to the server so you can inspect it during local development.
      </p>
    </div>
  );
}
