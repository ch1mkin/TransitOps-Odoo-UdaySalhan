# TransitOps

Smart Transport Operations Platform — a modern fleet management SaaS with a **software-like workspace UI**.

## Quick Start

### 1. Environment

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Database

Run the migration in Supabase SQL Editor:

```
supabase/migrations/001_profiles.sql
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Workspace UI

TransitOps uses a **Linked Workspace** shell inspired by desktop software:

| Feature | Behavior |
|---------|----------|
| **Linked Workspace header** | Dark bar indicating connected workspace context |
| **Chrome-like tabs** | Draggable, closable tabs inside the app chrome |
| **Home tab** | Pinned — always available |
| **Entity tabs** | Open vehicles, trips, drivers as tabs |
| **Double-click tab** | Pop out into floating sub-window |
| **Pop-out windows** | Draggable, minimizable, dockable back to tabs |
| **Collapsible sidebar** | Icon-only mode for more workspace space |
| **Module panels** | Profile, filters slide in from the right |
| **Ephemeral modules** | Auto-close when navigating to another page |

### Keyboard / Mouse

- **Click tab** — activate and navigate
- **Drag tab** — reorder (Home stays pinned)
- **Double-click tab** — pop out to floating window
- **X on tab** — close tab
- **Profile in sidebar** — opens ephemeral module panel

---

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase · Zustand · TanStack Query · React Hook Form · Zod

See `context.md` for full product specification.
