# CinePedia / CineAmore — Project Context

## Identity
CineAmore (CinePedia) is a **film catalogue dashboard** showcasing a curated archive of films with robust search, filters, and structured metadata.  
It is NOT a streaming platform.  
It is NOT a social/ratings site.

Live site: https://cineamore-ikz7.onrender.com/

## Core Principles
- Film metadata first — minimal distraction
- Usability for serious cinephiles
- No algorithmic recommendations
- No gamification or popularity bias
- Performance and simplicity prioritized

## Architecture (Legacy V1 -> V2 Migration)
- **Current (V1):** Node.js, Express, Vanilla JS, JSON/MongoDB.
- **Target (V2):** Next.js (App Router), Tailwind CSS, MongoDB Atlas.
- **Migration Strategy:**
  1.  Harden V1 DB (Immutable IDs).
  2.  Parallel Build of V2 (Next.js) in `cineamore-next`.
  3.  Switch Deployment when V2 reaches parity.

## Workflow Rules
- **Preserve custom identifiers:**  
  Transitioning to `_id` (ObjectId) as primary key. `slug` (Title+Year) becomes secondary for URLs only.
- Authentication:
  - Moving to JWT / NextAuth.
- UI:
  - Moving to React/Tailwind Components.
  - **Updates Tab:** maintained manually in `app.js` (marketing style, not technical).

## Explicit Non-Goals (Revised)
- *Legacy:* No recommendations engine -> *Revised:* AI "Vibe Search" (Phase 3).
- *Legacy:* No client frameworks -> *Revised:* Next.js for SSR/SEO.
- **Still Restricted:** No "Social Media" clutter (likes/comments focus on film appreciation, not noise).
