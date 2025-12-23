# Copilot Instructions

- **Stack**: React 19 + Vite 6 (ESM). Entry [index.tsx](index.tsx) mounts [App.tsx](App.tsx); single-page client-only.
- **State + persistence**: [App.tsx](App.tsx) owns bookmarks, categories, admin password, search/filter, admin UI flags; persisted via localStorage keys `nexus_bookmarks`, `nexus_categories`, `nexus_admin_password`. Seeds live in [constants.ts](constants.ts).
- **Data model**: [types.ts](types.ts) defines `Bookmark` (id, title, url, description, category, tags, optional icon) and `Category` (id, name, icon). Category id `all` is the catch-all; keep it intact.
- **Bookmark lifecycle**: Create/update via AdminPanel `onAdd` (reuse id when editing; new ids default to `Date.now().toString()`). Delete also clears edit state. Search filters by title/description/tags; category filter gates results.
- **Drag + reorder**: Admin-only drag-and-drop across the grid. [BookmarkCard.tsx](components/BookmarkCard.tsx) handles drag visuals and dropPosition; [App.tsx](App.tsx) performs final reordering and drop-to-grid append.
- **Admin auth flow**: Login modal compares against stored password (default `admin`). Navbar toggles `isAdmin`; logout only drops admin flags (password persists in storage).
- **AdminPanel tabs**: Bookmarks (create/edit), Categories (add/delete except `all`), Settings (reset admin password). `defaultCategory` preselects the current category when launching from “Add node”.
- **Metadata autofill**: AdminPanel `handleAiFill` calls [geminiService.ts](geminiService.ts) `getWebsiteMetadata(url)` with JSON schema returning Simplified Chinese `title`/`description`/`tags` only; category is user-chosen and never set by AI. Provider via env: `VITE_AI_PROVIDER` (`gemini` | `glm`), `VITE_AI_API_KEY`, optional `VITE_AI_MODEL` (defaults `gemini-3-flash-preview` or `glm-4-flash`). Gemini uses `@google/genai`; GLM hits `https://open.bigmodel.cn/api/paas/v4/chat/completions`.
- **Icon handling**: `Category.icon` stores a lucide-react export name; Sidebar resolves via dynamic import map. Pick valid names (e.g., Code, Palette, Cpu) to avoid runtime failures.
- **Persistence quirks**: When deleting categories, [App.tsx](App.tsx) remaps affected bookmarks to `all` and resets activeCategory to avoid orphaned entries. The “Add node” card only appears for admins when not transitioning and search is empty.
- **Transitions**: Category switch uses `isTransitioning` to fade/scale cards over 600ms; keep new grid interactions aligned with that state to avoid flicker.
- **Search UX**: Case-insensitive search across title/description/tags via `useMemo` in [App.tsx](App.tsx). `activeCategory === 'all'` bypasses category filtering.
- **UI conventions**: Tailwind-like utility classes plus custom ones (glass-panel, mono, preserve-3d, custom-scrollbar). Cards tilt on pointer and show favicon from Google S2 with UI-Avatars fallback; preserve the cyber/Chinese copy tone when editing text.
- **Error handling**: `getWebsiteMetadata` catches errors and returns null; callers gate on null only—add UX feedback if expanding.
- **Build/run**: npm install; `npm run dev`/`build`/`preview` via Vite. Path alias `@/*` set in tsconfig; `moduleResolution: bundler`.
- **No backend**: All data lives client-side; changes persist per browser. For auth issues, users can clear browser storage; Settings tab also resets the password.
- **Contribution tips**: Keep shared state in [App.tsx](App.tsx) or lift appropriately (no global store). Gate admin-only actions with `isAdmin`. Maintain animation/3D transforms and pointer-event guards when adding new interactive elements.
- **Files to skim first**: [App.tsx](App.tsx) (data flow, layout), [components/AdminPanel.tsx](components/AdminPanel.tsx) (CRUD + AI), [components/BookmarkCard.tsx](components/BookmarkCard.tsx) (drag UX), [components/Sidebar.tsx](components/Sidebar.tsx) (category selection), [constants.ts](constants.ts) (seed data).
