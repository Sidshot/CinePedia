# Repo Structure Plan

## 1. Root Directory (`d:/CinePedia - IDL/CinePedia`)
Currently contains 120+ mixed files.
**Action**:
- `maintenance/`: Move all ad-hoc `*.py` and `*.js` scripts here (e.g. `clean_*.py`, `check_*.js`).
- `data/`: Move all `*.json`, `*.csv`, `*.xlsx`, `*.txt` here.
- `docs/`: Move all `*.md` (except README) here.
- `archive/`: Move unused or old logs (`*.log`, `*.html`).

## 2. Next.js App (`d:/CinePedia - IDL/CinePedia/cineamore-next`)
Currently cleaner, but has loose scripts.
**Action**:
- `scripts/`: Move `apply_indexes.js`, `get_test_id.js`.
- `public/`: Check if clean.
- `lib/`: Check if clean.

## 3. Exclusion
- Keep `package.json`, `.env.local` (if exists), `node_modules` in place.
