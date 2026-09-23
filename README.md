# BXB OS

The redesigned BXB OS is the primary application at https://bxbcc.vercel.app.

The active frontend is in `public/os/`: ranked fronts and HQ, Today, weekly reviews, goals, tasks, entity hierarchy, assets, financial tracking, CRM, documents, capture, backup recovery, and mobile navigation. The former prototype UI and server actions have been removed from the active source; Git history retains them. Existing database records are unchanged.

Run `npm ci` then `npm run dev`. Next.js serves the workspace at the root and its page URLs. `/os` remains a compatibility entry point for existing links and email sign-in callbacks.

Data is browser-local until explicitly saved to or restored from Supabase in Settings & recovery. Email-link sign-in supports invited accounts. Only the public Supabase key is bundled. No service-role key is needed by this frontend. Existing browser data on this domain keeps the same storage keys; local-host data can be moved using backup export/import.

Changes to main automatically deploy through the existing Vercel GitHub connection. Use pull requests for preview deployments before merging.
