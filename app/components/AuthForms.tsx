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
  const [isSignUp, setIsSignUp] = useState(false);
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

    const url = isSignUp ? "/api/auth/signup" : "/api/auth/login";
    const payload: Record<string, unknown> = {
      email: form.email,
      password: form.password,
    };

    if (isSignUp) {
      let handle = form.handle.trim();
      if (handle.startsWith("@")) {
        handle = handle.slice(1);
      }
      payload.handle = handle;
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
    <div className="rounded-3xl border border-muted-tan bg-latte p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-walnut">Personal bookmarks</p>
          <h2 className="mt-3 text-2xl font-semibold text-espresso">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="rounded-full border border-muted-tan bg-almond px-4 py-2 text-sm text-espresso transition hover:border-walnut hover:text-caramel"
        >
          {isSignUp ? "Sign in instead" : "Create an account"}
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-espresso">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-muted-tan bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-caramel"
            required
          />
        </label>

        {isSignUp ? (
          <label className="block text-sm font-medium text-espresso">
            Choose a Handle
            <input
              name="handle"
              type="text"
              value={form.handle}
              onChange={handleChange}
              placeholder="@username"
              className="mt-2 w-full rounded-2xl border border-muted-tan bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-caramel placeholder:text-walnut/50"
              required
            />
            <span className="mt-1 block text-xs text-walnut">Lowercase letters, numbers, dashes and underscores only.</span>
          </label>
        ) : null}

        <label className="block text-sm font-medium text-espresso">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-muted-tan bg-white px-4 py-3 text-sm text-espresso outline-none transition focus:border-caramel"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-caramel hover:bg-caramel-hover text-white py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Working…" : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p className="mt-5 text-sm text-walnut">
        {isSignUp
          ? "Signing up creates a private dashboard for your bookmarks."
          : "Sign in to access your private dashboard and manage your bookmarks."}
      </p>
    </div>
  );
}
