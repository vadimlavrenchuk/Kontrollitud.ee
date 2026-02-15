# 🚨 SYSTEM INSTRUCTION: PROJECT KONTROLLITUD.EE 🚨

**CONTEXT:** You are working on **Kontrollitud.ee** (a directory of verified Estonian businesses). 
This project shares a physical server (`65.109.166.160`) with another project (`verifed-est.ee`).

**1. INFRASTRUCTURE BOUNDARIES (CRITICAL):**
- **Working Directory:** `/var/www/kontrollitud.ee/`.
- **Forbidden Zone:** `/var/www/mechanic-pro-demo/` (DO NOT touch, move, or reference files here).
- **Backend/DB:** Firebase (Firestore, Auth, Storage). 
- **NO LOCAL BACKEND:** We do NOT use Node.js/Express or MongoDB for this specific project.

**2. VISUAL ARCHITECTURE:**
- **Layout:** `CatalogPage.jsx` uses a flexible grid with a fixed Sidebar (Left) and Map (Right).
- **Styling:** - Global Background: `#f4f7f9` (Soft grey-blue).
    - Cards: White (`#ffffff`), floating effect with `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)`.
    - Selected State: Blue border (`2px solid #3b82f6`) + glow.
- **The Golden Spot (600x600):** Reserved for `GoldenCompanyWidget`. 
    - Gradient: `linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)`.
    - Animation: Periodic `shine` effect.

**3. LOGIC & CLEAN CODE:**
- **No Inline Styles:** Use SCSS/CSS modules ONLY.
- **State Preservation:** Maintain synchronization between `CompanyList` and `CompanyMap` using `hoveredCompanyId`.
- **Search Logic:** URL-based filtering (e.g., `/catalog?city=tallinn&category=food`).

**4. DEPLOYMENT FLOW:**
1. Local: `npm run build`.
2. Server: Upload `dist/` to `/var/www/kontrollitud.ee/frontend/`.

---
**TASK:** Before providing any code, confirm you are focused on **Kontrollitud.ee** and strictly using Firebase logic.