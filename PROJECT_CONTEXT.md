# 🚨 PROJECT CONTEXT: KONTROLLITUD.EE 🚨

## 📋 Project Overview
**Kontrollitud.ee** is a directory of verified Estonian businesses with interactive map and search functionality.

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: SCSS modules
- **Maps**: Leaflet + OpenStreetMap
- **Charts**: Recharts
- **i18n**: react-i18next (Estonian, Russian, English)
- **PWA**: Service Worker, Web Manifest

### Backend & Services
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Image Hosting**: Cloudinary
- **Analytics**: Google Analytics 4
- **Server**: Nginx Proxy Manager + Docker

### Important Notes
- **NO local backend**: We do NOT use Node.js/Express or MongoDB
- **NO local database**: All data stored in Firebase Firestore
- All Firebase and Cloudinary credentials are in `.env` files (not in git)

## 🎨 Visual Design

### Color Scheme
- **Background**: `#f4f7f9` (soft grey-blue)
- **Cards**: White (`#ffffff`) with shadow `0 4px 12px rgba(0, 0, 0, 0.05)`
- **Selected**: Blue border `2px solid #3b82f6` with glow effect
- **Golden Spot**: Premium gradient with shine animation

### Layout
- **CatalogPage.jsx**: Flexible grid with fixed Sidebar (left) and Map (right)
- **Responsive**: Mobile-optimized with bottom sheet for map
- **No inline styles**: SCSS/CSS modules only

## 🔐 Authentication & Authorization

### User Auth (Firebase)
- Google Sign-In (recommended)
- Facebook Login
- Email/Password

### Admin Access
- Admin emails defined in `frontend/src/ProtectedRoute.jsx`
- Admins have access to `/admin` panel
- Check user email against ADMIN_EMAILS array

## 📁 Key Project Structure

```
kontrollitud.ee/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # Auth & Language context
│   │   ├── i18n/            # Translations
│   │   └── ProtectedRoute.jsx # Admin protection
│   ├── public/              # Static assets
│   └── .env                 # Frontend env variables (local only)
├── docker-compose.yml        # Docker configuration
├── firebase.json            # Firebase config
└── firestore.rules          # Firestore security rules
```

## 🚀 Development Workflow

### Local Development
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Deployment
- Build frontend locally
- Deploy `dist/` folder to server
- Server handles routing with Nginx
- Check deployment scripts (*.local.ps1 files for details)

## 🔍 Key Features

### Catalog & Search
- Company cards with images, ratings, categories
- Multi-language support (ET, RU, EN)
- URL-based filtering: `/catalog?city=tallinn&category=food`
- State preservation between list and map views

### Interactive Map
- Real-time synchronization with company list
- Hover effects sync between list and map
- Custom markers with company logos
- Click to open company details

### Company Management
- Add/Edit companies (admin only)
- Image upload via Cloudinary
- Categories, locations, contact info
- Review and rating system

### Performance
- Code splitting & lazy loading
- Image optimization (Cloudinary transformations)
- Critical CSS inlining
- Service Worker for offline support

## 📝 Important Rules

### Code Quality
1. **No inline styles** - use SCSS/CSS modules only
2. **Clean code** - no console.logs in production
3. **Type safety** - prop validation
4. **Responsive** - mobile-first approach

### State Management
- Use React Context for global state (Auth, Language)
- Local state for component-specific data
- URL parameters for shareable filters

### Firebase Integration
- All database operations through Firestore SDK
- Authentication handled by Firebase Auth
- Images uploaded to Cloudinary, URLs stored in Firestore

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
VITE_GA_MEASUREMENT_ID=...
```

**Note**: All `.env` files are git-ignored for security

## 📊 Data Structure (Firestore)

### Companies Collection
```javascript
{
  id: "company-slug",
  name: { et: "...", ru: "...", en: "..." },
  description: { et: "...", ru: "...", en: "..." },
  category: "food",
  city: "tallinn",
  coordinates: { lat: 59.4370, lng: 24.7536 },
  imageUrl: "https://res.cloudinary.com/...",
  phone: "+372...",
  email: "...",
  website: "...",
  rating: 4.5,
  reviewCount: 23,
  verified: true,
  premium: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🌍 Deployment Architecture

### Production Setup
- **Web Server**: Nginx (in Docker container)
- **Proxy Manager**: Nginx Proxy Manager
- **SSL**: Let's Encrypt (auto-renewal)
- **Domain**: kontrollitud.ee

### Docker Services
- `frontend`: Nginx serving React SPA
- Nginx Proxy Manager handles routing and SSL

## 📚 Before You Start Coding

1. ✅ Confirm you're working on **Kontrollitud.ee**
2. ✅ Remember: **Firebase only** (no local backend/MongoDB)
3. ✅ Check existing components before creating new ones
4. ✅ Test on multiple screen sizes
5. ✅ Verify translations exist in all 3 languages

## 🔒 Security Rules (CRITICAL!) ⚠️

### ⛔ NEVER Write in Public Documentation:

1. **API Keys & Secrets**
   - ❌ `VITE_FIREBASE_API_KEY=AIzaSyAbc123...`
   - ✅ `VITE_FIREBASE_API_KEY=...` (use placeholder)
   
2. **Server Information**
   - ❌ `ssh root@YOUR_SERVER_IP`
   - ❌ `root@kontrollitud.ee`
   - ✅ `ssh root@YOUR_SERVER` (use placeholder)
   
3. **Credentials**
   - ❌ Real passwords, tokens, SSH keys
   - ❌ Admin email addresses
   - ✅ Use `.env` files (git-ignored)
   
4. **Personal Information**
   - ❌ `C:\Users\vadim\...`
   - ✅ `/path/to/project` (generic path)

### ✅ Security Checklist Before Committing:

- [ ] Run `pre-push-check.ps1` to scan for secrets
- [ ] All API keys in `.env` files (git-ignored)
- [ ] No real server IPs or SSH commands in docs
- [ ] All sensitive files use `.local` extension
- [ ] Use placeholders: `YOUR_SERVER`, `YOUR_API_KEY`, etc.
- [ ] Review `git diff` before committing

### 🛡️ Protected File Patterns:

- `*.local.*` - Local configuration files
- `*.env` - Environment variables
- `deploy*.ps1/sh/bat` - Deployment scripts
- `*SETUP*.md`, `*SERVER*.md`, `*ADMIN*.md` - Setup docs

### 🚨 If You Accidentally Commit Secrets:

1. **Immediately** rotate/change the exposed credentials
2. Remove from git history (see SECURITY.md)
3. Verify with `pre-push-check.ps1`

## 📖 Additional Documentation

For detailed setup instructions, check local files:
- Server setup: `*.local.md` files (not in git)
- Deploy scripts: `deploy*.local.ps1` files (not in git)
- Firebase/Cloudinary: Check respective documentation

---

**Last Updated**: February 2026
**Project Status**: Active Development
**Public Repo**: Kontrollitud.ee (public GitHub - no secrets!)
