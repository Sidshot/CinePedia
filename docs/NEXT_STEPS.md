# 🚀 CineAmore V2: Next Steps & Roadmap Discussion

Please add your comments, priorities, or questions below each item.

## 1. 🔍 Verify Live Deployment (Immediate Priority)
We pushed the code (`v2/identity-migration`), but we haven't seen it running on the live Vercel URL yet.
*   **Action:** Check Vercel Preview URL.
*   **Verify:** Dark Mode, Glossy Ratings (Submission), Mobile Layout.
*   *Why:* Real-world mobile testing often reveals CSS issues that localhost doesn't show.

**User Comments:**
- [ ] 

## 2. 🖼️ Image Optimization (High Priority)
Currently, we are hotlinking images from Bing (`tse2.mm.bing.net`).
*   **Risk:** Links expire, break, or get blocked (Hotlink protection).
*   **Proposal:** Integrate **Cloudinary** or **ImageKit**.
*   **Plan:** Script to upload existing URLs -> Cloudinary -> Update MongoDB.
*   *Why:* Ensures the UI remains glossy and broken images don't appear.

**User Comments:**
- [ ] 

## 3. 💾 Identity Migration Script (Technical Debt)
The code currently supports both `_id` (New) and `__id` (Old Title+Year), leading to complex `||` logic.
*   **Proposal:** Create `migration_v1_identity.js`.
*   **Plan:** Assign UUID/ObjectId to every legacy film in DB. Refactor code to access only `_id`.
*   *Why:* Simplifies codebase, prepares DB for relations (e.g., Users rating Movies).

**User Comments:**
- [ ] 

## 4. 🤖 TMDB Integration (Feature)
Stop manual data entry.
*   **Proposal:** Build "Import from TMDB" in Admin Panel.
*   **Plan:** Admin types "Inception" -> App fetches Metadata/Poster -> Auto-fills form.
*   *Why:* drastically speeds up content addition.

**User Comments:**
- [ ] 

## 5. 📱 Mobile App (PWA) Polish
Ensure the site feels like a native app on phones.
*   **Proposal:** Add `manifest.json`, service workers for offline support, and touch gestures.
*   *Why:* "CineAmore" should feel like an app, not just a website.

**User Comments:**
- [ ] 
