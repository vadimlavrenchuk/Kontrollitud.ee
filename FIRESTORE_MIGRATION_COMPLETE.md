# Firestore Migration Complete - Troubleshooting Guide

## ✅ What's Working

### 1. **Firestore Integration**
- Companies are now fetched from Firestore in both `CompanyList.jsx` (homepage) and `CatalogPage.jsx` (catalog)
- Test data added successfully: 6 companies total
- Categories properly structured: `mainCategory` and `subCategory`

### 2. **Search Functionality**
- Client-side search implemented in `CatalogPage.jsx` (lines 107-122)
- Searches across: `name`, `description.et`, `description.en`, `description.ru`
- Works correctly after all companies are loaded from Firestore

### 3. **Filter System**
- **Main Categories**: 8 categories from `constants/categories.js`
  - Puhkus, Toit, Auto, Teenused, Ilu, Ostlemine, Lapsed, Reisimine
- **Subcategories**: Dynamic based on selected main category
- **City Filter**: Tallinn, Tartu, Pärnu, Narva
- **Verified Filter**: Shows only verified companies

### 4. **Test Companies Added**
```
✅ Rimi Supermarket - Ostlemine > Poed (Tallinn, verified)
✅ Vapiano Tallinn - Toit > Restoranid (Tallinn, verified)
✅ Kalev Spa - Puhkus > SPA (Tallinn, verified)
✅ AutoExpert Tallinn - Auto > Autoteenus (Tallinn, not verified)
✅ Caffeine Coffee Bar - Toit > Kohvikud (Tartu, verified)
✅ Hyper Rimi Ülemiste - Ostlemine > Poed (Tallinn, verified)
```

## 🔍 Potential Issues & Solutions

### Issue 1: "Магазины" (Ostlemine) button not visible

**Possible Causes:**
1. **CSS Issue**: Button might be rendered but hidden by styles
2. **Translation Issue**: Missing translation key
3. **Filter Applied**: If `searchQuery` is not empty, category pills are hidden

**Solutions:**
- Check browser DevTools to see if all 8 category pills are rendered in DOM
- Verify i18n translations for "Ostlemine" (already verified - line 226, 689, 1151 in i18n.js)
- Clear search query to show category pills

**Debug Steps:**
```javascript
// Add this to CatalogPage.jsx after line 205
console.log('Main Categories:', mainCategories);
console.log('Filtered Categories:', mainCategories.filter(cat => cat !== 'Все'));
```

### Issue 2: Only one company showing in catalog

**Possible Causes:**
1. **Filter Applied**: Check if any filters are active
2. **Approved Status**: Companies might need `approved: true` field
3. **Client-side filtering**: Issue in filter logic

**Solutions:**
- Check console logs: "🔍 Filtering companies. Total: X"
- Open browser DevTools Console and check filter states
- Verify all companies have proper `mainCategory` field

**Debug Steps:**
```bash
# Run this script to check all companies
cd backend/migrations
node addTestCompanies.js
```

### Issue 3: Search not finding companies

**Current Implementation:**
- Search is **client-side** (lines 107-122 in CatalogPage.jsx)
- Firestore doesn't support full-text search natively
- All companies are loaded first, then filtered in browser

**Limitations:**
- Won't scale well with 1000+ companies
- No typo tolerance
- Case-insensitive but requires exact substring match

**Future Improvements (Optional):**
1. **Algolia Integration**: For advanced search with typos, filters, etc.
2. **Firestore Array-contains**: For tag-based search
3. **Server-side search**: Implement in backend with more advanced logic

## 🧪 Testing Checklist

### Test Filters
- [ ] Click "Ostlemine" category pill - should show 2 Rimi stores
- [ ] Click "Toit" category pill - should show Vapiano and Caffeine
- [ ] Click "Puhkus" category pill - should show Kalev Spa
- [ ] Select "Tallinn" city - should show 5 companies
- [ ] Enable "Verified Only" - should show 5 companies (exclude AutoExpert)

### Test Search
- [ ] Search "Rimi" - should show 2 results
- [ ] Search "kohv" - should show Caffeine Coffee Bar (matches "Kohvikud")
- [ ] Search "spa" - should show Kalev Spa
- [ ] Search "nonexistent" - should show empty state

### Test Subcategories
- [ ] Select "Ostlemine" main category
- [ ] Subcategory dropdown should show: Poed, Kaubanduskeskused, Butiigid, Turud, E-poed
- [ ] Select "Poed" - should show 2 Rimi stores

## 📊 Database Schema

### Company Document Structure
```javascript
{
  name: String,
  mainCategory: String,      // From CATEGORIES keys: 'Puhkus', 'Toit', etc.
  subCategory: String,        // From CATEGORIES[mainCategory].subcategories
  category: String,           // Legacy field (same as subCategory)
  city: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  description: {
    et: String,
    en: String,
    ru: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  verified: Boolean,
  isVerified: Boolean,        // Legacy field (same as verified)
  priority: Number,           // 0-10, higher = shown first
  rating: Number,             // 0-5
  reviewCount: Number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Quick Fixes

### If categories don't match database:
```javascript
// Option 1: Update database companies to match constants
// Run: backend/migrations/addTestCompanies.js

// Option 2: Update constants to match database
// Edit: frontend/src/constants/categories.js
```

### If search is too slow:
```javascript
// Consider limiting displayed companies
const displayedCompanies = filteredCompanies.slice(0, 50);
```

### If you need to add more test data:
```bash
# Edit backend/migrations/addTestCompanies.js
# Add more companies to testCompanies array
# Run: node backend/migrations/addTestCompanies.js
```

## 🔧 Maintenance Scripts

### Check Firestore Data
```bash
cd backend/migrations
node addTestCompanies.js  # Shows all companies with categories
```

### Clear Test Data (if needed)
```javascript
// Create backend/migrations/clearTestCompanies.js
// Delete specific companies by name or ID
```

## 📝 Notes

1. **Both field names supported**: `verified` and `isVerified`, `category` and `subCategory`
2. **Firestore Timestamps**: Properly converted with `.toDate()`
3. **Search is case-insensitive**: `.toLowerCase()` used
4. **No pagination yet**: All companies loaded at once (consider adding for 50+ companies)
5. **Map integration**: Companies with `location.lat/lng` show on map

---

**Last Updated**: January 2, 2026  
**Migration Script**: `backend/migrations/addTestCompanies.js`  
**Total Test Companies**: 6
