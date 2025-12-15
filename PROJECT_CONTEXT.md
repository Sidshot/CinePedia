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

## Architecture
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Frontend:** Vanilla JS + DOM + CSS
- **No front frameworks** (React/Vue) in UI

## Workflow Rules
- **Preserve custom identifiers:**  
  Do NOT replace or refactor the custom string `__id` logic that front end uses for routing/state.  
- Authentication:
  - Guest vs Admin modes
  - Admin actions protected via password
- UI:
  - Filters, sorts, export, import CSV
  - Film list pagination
  - Bulk import via CSV
  - **Updates Tab:** maintained manually in `app.js` (marketing style, not technical).
- Minimal UI palette and layout — avoid flashy/redesigns by default

## Explicit Non-Goals
- No recommendations engine
- No comments/reviews
- No social features
- No client frameworks
