"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HandleSearch() {
  const router = useRouter();
  const [handle, setHandle] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = handle.trim().toLowerCase();
    if (normalized) {
      router.push(`/${normalized}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="handle-search">
        Search handle
      </label>
      <input
        id="handle-search"
        value={handle}
        onChange={(event) => setHandle(event.target.value)}
        placeholder="Enter a handle, e.g. alice"
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
      />
      <button className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800" type="submit">
        View profile
      </button>
    </form>
  );
}
