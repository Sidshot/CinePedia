# 🎬 CineAmore Admin Guide (The Vibe Edition)

**For the Site Owner:** You don't need to know code. You just need to know that your ship is unsinkable. Here is what we built to keep CineAmore running forever.

---

## 1. The "Unbreakable" Data Shield 🛡️
In the past, bad data could break the site (e.g., a movie without a title, or a download link in the wrong place).
**Now:** The system has "Immune System" rules.
*   **What it does:** It refuses to accept "garbage" data. If you try to save a movie that violates the rules (like missing a title), the system rejects it immediately.
*   **The Vibe:** The database stays pristine. No more "ghost movies" or broken cards.

## 2. Magic Bulk Import ✨
Importing thousands of movies used to be scary. Now it's a drag-and-drop experience.
*   **Smart Recognition:** Drop a `CSV`, `JSON`, or even a messy `TXT` file. The system figures out which column is the Title and which is the Link automatically.
*   **The "Safety Cap":** You can only do **500 movies at a time**. Why? To prevent the server from choking. It's a "speed limit" for safety.
*   **Auto-Magic Enrichment:** If your file only has "The Matrix", the system automatically asks the internet (TMDB) for the Poster, Plot, and Year. You get a full movie card for free.
*   **The "Circuit Breaker":** If 5% of your file is errors, the import **stops immediately**. It won't let you flood the database with bad data.

## 3. The "Bouncer" (Deployment Gate) 🛑
Every time we try to update the site (deploy), a digital Bouncer checks our ID.
*   **The Check:** It runs a script (`pre-deploy`) that scans the *entire* database and code.
*   **The Rules:**
    1.  Are all database connections alive?
    2.  Are there any "illegal" legacy fields left over from 2024?
    3.  Are the secret keys (passwords) present?
*   **The Result:** If *anything* is wrong, the update **fails**. The site stays online in its old, safe version. We cannot accidentally break the live site.

## 4. The "Black Box" (Audit Logs) ✈️
Just like a plane, we now record everything.
*   **What we see:** Every time an Admin creates, edits, deletes, or imports a movie, it is written to a secure log.
*   **Why:** If a movie mysteriously vanishes, we check the logs: *"Ah, Admin X deleted it at 4:00 PM."*
*   **The Vibe:** Total accountability. No mysteries.

## 5. What You Need To Do
*   **When Importing:** Watch the "Preview" screen. It shows you exactly what will happen before you click "Commit".
*   **When Updating:** Relax. The Bouncer handles the stress.
*   **If Things Break:** Check the logs. The system usually tells you exactly *why* it stopped you (e.g., "Error Rate > 5%").

---
**Summary:** The site is now "hardened". It resists errors, cleans its own data, and stops bad updates before they happen. You have fully operational control. 🚀
