# 👨‍💻 CineAmore V2: Technical Engineering Log (December 2025)

**To:** Engineering Team / Audit
**Subject:** System Hardening & Architecture Overhaul

This log details the transition from a "Prototype" phase to a "Production-Grade" architecture. We focused on Type Safety, Algorithmic Robustness, and DevOps Gates.

---

## 1. 🛡️ Data Integrity & Schema Validation
*   **Problem:** Weak schema enforcement allowed "poison pills" (movies without titles/years) and massive data duplication.
*   **Solution:** Implemented **Strict Invariant Enforcement**.
    *   **Zod Integration:** All inputs (Forms, APIs, Imports) are now validated against a Zod schema before touching the DB.
    *   **Mongoose Middleware:** Added `pre-save` hooks to enforce business logic at the ODM layer (e.g., stripping legacy fields).
    *   **Migration:** Wrote idempotent scripts (`scripts/audit-db.mjs`) to scrub 2,500+ records, migrating legacy `dl` fields to a normalized `downloadLinks` array structure.

## 2. 🧠 Algorithmic CSV/JSON Parser (`O(n)` Analysis)
*   **Feature:** "Smart Import" for admins.
*   **Challenge:** User-uploaded CSVs have unpredictable headers (e.g., "Name" vs "Title", Spanish vs English) and ordering.
*   **Algorithm:** Developed a **Content-Based Heuristic Parser**.
    1.  **Sampling:** Reads the first 20 rows.
    2.  **Type Inference:** Analyzes column data types (checking for URL patterns, Year integers `1880-2100`, Text entropy).
    3.  **Mapping:** Dynamically maps columns to schema fields based on content confidence scores, ignoring headers entirely if needed.
    4.  **Result:** successfully parses messy datasets where `title` is Column 5 and `url` is Column 2, with zero user config.

## 3. 🚦 Write Safety & Circuit Breakers
*   **Pattern:** **Circuit Breaker**.
*   **Implementation:**
    *   In bulk operations (Import/Backfill), the system monitors the **Error Rate** in real-time.
    *   If `(Errors / Processed) > 5%`, the process **throws an exception** and rolls back (or aborts) to prevent database pollution.
    *   **Hard Cap:** Enforced a `MAX_BATCH_SIZE = 500` constant to prevent memory leaks in the Node.js event loop during heavy writes.

## 4. 🔒 DevOps: The "Pre-Deploy" Gate
*   **Philosophy:** "If it can break, it shouldn't build."
*   **Implementation:**
    *   Hacked `package.json` scripts to inject a `pre-deploy` hook.
    *   `npm run build` is now `node scripts/pre-deploy.mjs && next build`.
    *   **The Check:** Spawns a child process to audit the *live* production DB connection and run a Schema Fidelity Check.
    *   **Effect:** Prevents deployment if Environment Variables are missing or if the DB contains invalid legacy data.

## 5. 🔭 Observability
*   **Pattern:** Structured Logging.
*   **Change:** Replaced ad-hoc `console.log` with a centralized `logger` utility.
*   **Format:** JSON-structured logs (`{ level: 'INFO', action: 'CREATE_MOVIE', meta: {...} }`) for easy ingestion by Datadog/CloudWatch.

---

## 🏗️ Stack Overview (Current)
*   **Framework:** Next.js 15 (App Router, Server Actions)
*   **Database:** MongoDB (Mongoose ODM)
*   **Validation:** Zod
*   **Auth:** JWT (Stateless Session) via NextAuth v5
*   **Styling:** TailwindCSS + CSS Variables (Theme Aware)

*Signed,*
*The DevOps Team*
