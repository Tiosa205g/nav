<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/16_guJDCEVgjBZKC0e8QAM0q0yPLznmpE

## Run Locally

**Prerequisites:**  Node.js 18+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `VITE_AI_PROVIDER`: `gemini` (default) or `glm`
   - `VITE_AI_API_KEY`: API key for the chosen provider
   - `VITE_AI_MODEL` (optional): override model (`gemini-3-flash-preview` or e.g. `glm-4-flash`)
3. Start API server (persistence): `npm run server`
4. Start dev server: `npm run dev`
5. Build for production: `npm run build`; preview: `npm run preview`

Notes
- Data (bookmarks, categories, admin password) persists in browser `localStorage` under `nexus_*` keys; no backend required.
- Server-side persistence: an Express API at `http://localhost:3001` writes to `data.json`.
   - Endpoints: `/api/state`, `/api/bookmarks` (POST), `/api/bookmarks/:id` (PUT/DELETE), `/api/categories` (POST/DELETE), `/api/password` (PUT), `/api/export`, `/api/import`.
- The metadata autofill uses the configured provider; Gemini uses `@google/genai`, GLM hits `https://open.bigmodel.cn/api/paas/v4/chat/completions`.
