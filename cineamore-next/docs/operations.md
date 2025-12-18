# CineAmore Operations: Survival Guide 🛡️

> "If DB looks wrong, stop and do Z"

## 1. Data Invariants (Non-Negotiable)
These rules must NEVER be broken. If a script or action violates them, it must ABORT.

*   **Identity:**
    *   `_id` is the **only** authoritative ID.
    *   `__id` is a legacy alias for read-only mapping. Never generate new `__id`s.
*   **Downloads:**
    *   `downloadLinks` (Array) is the **only** valid field.
    *   `dl` and `drive` fields must **not exist**. Queries should explicitly exclude them or migration scripts must run immediately if detected.
*   **Core Fields:**
    *   `title`: String, length ≥ 1.
    *   `genre`: Array (must exist, default to `[]` or `['Uncategorized']`).
    *   `poster`: String (never null in UI rendering, verified via proxy).

## 2. Write Safety Protocols
*   **Admin Actions:** Must be Explicit + Confirmed + Logged.
*   **Dry-Runs:**
    *   **Mandatory** for: Bulk Import, Genre Backfill, Schema Cleanup.
    *   Script must print: `Found X records. Will modify Y. Proceed? (y/n)`
*   **Circuit Breakers:**
    *   Stop immediately if >50 deletions detected in a batch.
    *   Stop if error rate > 5%.

## 3. Bulk Import Defenses
*   **Hard Cap:** Max 500 rows per session.
*   **Preview:** User MUST see the JSON preview before commit.
*   **Rejection Criteria:**
    *   Abort if >5% rows are invalid.
    *   Abort if >10% duplicates found.
    *   Abort if TMDB API failure rate > 20%.

## 4. Background Scripts
*   **No Infinite Loops:**
    *   Max iterations: e.g., 2500 (db size) + buffer.
    *   Per-item timeout: 10s.
    *   **Mark Processed:** Success/Fail status must be persisted to avoid re-running on the same broken record.

## 5. Deployment Guardrails
Before `npm run build`, the **Pre-Deploy Check** (`scripts/pre-deploy.mjs`) must pass:
1.  **DB Connection:** Can connect to Atlas?
2.  **Schema Validate:** Do any docs have legacy fields (`dl`/`drive`)? -> **Fail Build**.
3.  **Environment:** Are `MONGODB_URI` and `TMDB_API_KEY` present?

## 6. Recovery & Emergency
*   **Auth Failure:**
    *   If Auth is down, app downgrades to **Read-Only**.
    *   Admin Routes hard-fail (403), do not render half-broken UI.
*   **Bad Import:**
    *   **Stop.** Do not try to "fix forward".
    *   Run `scripts/audit-db.mjs` to assess damage.
    *   Rollback using Atlas backups if >10% corruption.

## 7. Observability
*   **Audit Logs:**
    *   Found in server console (standard output).
    *   Format: JSON.
    *   Events: `CREATE_MOVIE`, `UPDATE_MOVIE`, `DELETE_MOVIE`, `BULK_IMPORT`.
    *   **Action:** If `BULK_IMPORT` shows high error count, check file source immediately.
