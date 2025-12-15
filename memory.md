# CineAmore Session Memory
**Last Updated:** 2025-12-15

## 🟢 Current Status
*   **Active Branch:** `main` (Deployed)
*   **Mode:** `IDLE` (Live & Stable)
*   **Server Status:** Verified (Live Site Updated)

## 📝 Staged Changes
## 📝 Staged Changes
*   **V2 Migration Plan:** roadmap added to memory.
*   **Backup:** Created `backup/pre-v2-migration` branch at current HEAD.

## 🐛 Active Bugs
*   *None known.* (System is stable).

## ✅ Recent Actions
1.  **Fixed & Finalized:** Resolved `TipsManager` timing bug.
2.  **Established Workflow:** Added "Updates Tab Maintenance" rule to docs.
3.  **Deployed:** Merged `feat/multi-download-options` to `main` and pushed.
    *   SHA: `f39eac3`
    *   Features: Glossy UI, Report Issue, Tips Modal.

## ⏭️ Immediate Next Steps
1.  **Phase 1 Migration:** Create `migration_v1_identity.js` to assign stable `_id` (UUID/ObjectId) to all films.
2.  **Harden Logic:** Update backend to use `_id` instead of Title+Year.
3.  **Parallel Dev:** Initialize Next.js project in `cineamore-next` folder (Phase 2).
4.  **REMINDER:** Do NOT touch `main` branch or live site until Phase 2 is 100% ready.

## 🧠 Key Context & Rules
*   **Identity:** Film Catalogue (Not streaming/social).
*   **Constraint:** Preserve `__id` logic. No Front-End Frameworks.
*   **Process:** Branch -> Local Verify -> **Update 'Updates' Tab** -> Commit -> Report. (NEVER touch Main).
*   **Update Rule:** Always update `TipsManager.updates` in `app.js` with user-friendly, hype-driven changelogs (no tech jargon) before every deployment.
*   **Pre-Flight:** Review `memory.md` for clean code/context before pushing.

## 🛡️ Failsafe Protocol (Nuclear Doomsday)
1.  **Backup Location:** Branch `backup/pre-v2-migration` (Contains the "Golden" state of V1).
2.  **Restore:** If V2 fails, `git checkout backup/pre-v2-migration` and re-deploy.
3.  **Record Failures:** If a task fails, log it here immediately under "Current Status".
4.  **When Stuck:** READ THIS FILE. It is the absolute source of truth.
5.  **Restore Context:** Use this file to reboot the "Mind Meld" after any crash, cache clear, or conversation reset.

## 🚀 V2 Roadmap ("The Infinite Scale")
### Phase 1: Core Architecture (Stability)
- [ ] **Immutable Identity:** Migrate from Title+Year to `_id` (UUID/ObjectId).
- [ ] **Auth:** Implement Admin Token (JWT) + Google Auth (Guest).
- [ ] **Caching:** Pre-compute aggregation stats (directors, years).

### Phase 2: Frontend Evolution
- [ ] **Next.js Migration:** React, SSR, Tailwind, React Query.
- [ ] **Image Optimization:** Cloudinary/ImageKit integration.

### Phase 3: Infinite Expansion
- [ ] **Automated Data:** TMDB API integration.
- [ ] **AI Search:** Vector embeddings for "Vibe Search".
- [ ] **Social:** Lists, Activity Feeds.
