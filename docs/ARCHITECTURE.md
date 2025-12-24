# System Architecture & Edge Runtime Rules

> [!IMPORTANT]
> The application uses Vercel Edge Runtime for Middleware. This environment is NOT Node.js specific and has strict limitations.

## 1. Directory Structure
```
cineamore-next/
├── lib/
│   ├── edge/           # ⚠️ STRICT EDGE SAFETY ZONE
│   │   └── session.js  # JWT logic (jose only, NO dependencies)
│   ├── auth.js         # Node.js Auth (connects to DB)
│   └── mongodb.js      # Node.js Database Connection
├── middleware.js       # Vercel Edge Middleware
```

## 2. The Golden Rules
1.  **Middleware must NEVER import `lib/auth.js`**.
    *   `lib/auth.js` likely contains `mongoose` or `dbConnect`, which crash the Edge Runtime.
    *   Middleware must ONLY import from `lib/edge/`.
2.  **`lib/edge/` is a Sanitation Zone**.
    *   Files in this directory must self-contained.
    *   Allowed Imports: `jose`, `@upstash/redis`, `@upstash/ratelimit`.
    *   Banned Imports: `mongoose`, `fs`, `path`, `crypto` (Node native).
3.  **Static Imports over Dynamic Imports**.
    *   Use `import { foo } from './bar'` instead of `await import('./bar')` when possible to allow bundler to tree-shake correctly.

## 3. Dependency Graph
*   `middleware.js` -> `lib/edge/session.js` (✅ Safe)
*   `lib/auth.js` -> `lib/edge/session.js` (✅ Safe)
*   `middleware.js` -> `lib/auth.js` (❌ FATAL CRASH)

## 4. Debugging 500 Errors
If `MIDDLEWARE_INVOCATION_FAILED` occurs:
1.  Check `middleware.js` imports.
2.  Ensure no file in the import tree requires `mongoose`.
3.  The Middleware now has a `try/catch` block that returns JSON error details instead of a silent crash.
