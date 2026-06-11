# Linker.me 🤎

A premium, minimalist personal bookmarks application with public profiles and private dashboards, built using Next.js 16 (Turbopack), Tailwind CSS v4, and Supabase.

---

## 🛠️ How to Run Locally

1. **Clone the repository** and navigate to the root directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and define the Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   JWT_SECRET=your-secure-jwt-secret-string
   ```
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
5. **Open localhost**: Navigate to [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🤖 AI Agent Reflection (Errors & Corrections)

* During our session, the AI agent introduced an explicit `any` parameter check in `validateBookmark` which triggered an ESLint warning (`@typescript-eslint/no-explicit-any`). Furthermore, declaring the parameters as optional in the payload interface caused the TypeScript compiler to throw a type assignment error on `createBookmark` due to a potential `string | undefined` type mismatch. We resolved this by defining a strict type guard interface (`BookmarkPayload`) and declaring properties as required, ensuring types were safely narrowed at compile-time.
* Additionally, the agent initially used standard HTML anchor tags (`<a>`) for routing between the home page and dashboard, triggering Next.js linting errors (`@next/next/no-html-link-for-pages`); this was solved by refactoring them into Next.js `<Link>` components.

---

## 🚀 Future Improvements

With more time, I would implement **Framer Motion page transition animations** and add dynamic **search query indexing** inside the dashboard. This would allow users to search through hundreds of links instantly with visual filtering and animations that match the warm, minimalist cream theme.
