# SEO Implementation Guide

## Overview
This document describes the SEO optimizations implemented for Kontrollitud.ee to improve search engine visibility and social media sharing.

## ✅ Implemented Features

### 1. URL Structure (Clean Slugs)
- **Before**: `/companies/507f1f77bcf86cd799439011`
- **After**: `/companies/spa-palace-tallinn`

Companies now have SEO-friendly URLs using slugs generated from their names.

#### Backend Changes:
- Added `slug` field to Company schema
- Auto-generate slugs on company creation
- Support both slug and ID in API endpoint `/api/companies/:id`
- Migration script to add slugs to existing companies

#### Frontend Changes:
- Updated all links to use `company.slug || company._id`
- Files updated: `CompanyCard.jsx`, `CompanyMap.jsx`

### 2. Meta Tags & Open Graph

#### Enhanced `<head>` Tags:
```html
<title>Company Name | Kontrollitud.ee</title>
<meta name="description" content="Description in Estonian/English/Russian (max 155 chars)" />
<meta name="keywords" content="company, category, city, Estonia" />
```

#### Open Graph (Facebook, LinkedIn, Telegram):
```html
<meta property="og:type" content="business.business" />
<meta property="og:title" content="Company Name | Kontrollitud.ee" />
<meta property="og:description" content="..." />
<meta property="og:image" content="company-image-url" />
<meta property="og:url" content="https://kontrollitud.ee/companies/slug" />
```

#### Twitter Card:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:image" content="..." />
```

### 3. Sitemap Generation

#### Manual Generation:
```bash
cd backend
npm run sitemap
```

This creates `frontend/public/sitemap.xml` with:
- Homepage
- All approved companies (using slugs)
- Static pages (add-business, auth)

#### Automatic Generation:
Sitemap is also available via API endpoint: `GET /api/sitemap.xml`

### 4. Structured Data (Schema.org)

Each company page includes JSON-LD structured data:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Company Name",
  "description": "...",
  "image": "...",
  "url": "...",
  "telephone": "...",
  "email": "...",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tallinn",
    "addressCountry": "EE"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 10
  }
}
```

### 5. robots.txt

Located at `frontend/public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Sitemap: https://kontrollitud.ee/sitemap.xml
```

## 🚀 Usage

### For New Companies:
Slugs are automatically generated when creating a company. No action needed.

### For Existing Companies:
Run the migration script once:
```bash
cd backend
npm run migrate:slugs
```

### Generate Sitemap:
After adding/updating companies:
```bash
cd backend
npm run sitemap
```

## 📊 SEO Best Practices

### Image Requirements for Social Sharing:
- **Recommended size**: 1200x630px
- **Minimum size**: 600x315px
- **Format**: JPG, PNG
- **File size**: < 5MB

### Meta Description:
- Length: 150-160 characters
- Include: Company name, location, main service
- Use primary language (Estonian) with English/Russian fallback

### URL Slugs:
- Lowercase only
- Hyphens for spaces
- No special characters (Estonian ä,ö,ü,õ converted to a,o,u,o)
- Unique per company

## 🔍 Testing

### Verify Meta Tags:
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### Check Sitemap:
Visit: https://kontrollitud.ee/sitemap.xml

### Test Structured Data:
Google Rich Results Test: https://search.google.com/test/rich-results

## 📝 Maintenance

### Regular Tasks:
1. **Weekly**: Regenerate sitemap after approving new companies
2. **Monthly**: Submit sitemap to Google Search Console
3. **As needed**: Update OG image for homepage

### Files to Update:
- `frontend/public/og-default.jpg` - Default Open Graph image
- `frontend/public/robots.txt` - Crawling rules
- `backend/generateSitemap.js` - Sitemap generation logic

## 🔗 Related Files

### Backend:
- `backend/server.js` - Schema, slug generation, API routes
- `backend/generateSitemap.js` - Sitemap generator
- `backend/migrations/addSlugs.js` - Migration script
- `backend/package.json` - NPM scripts

### Frontend:
- `frontend/src/CompanyDetails.jsx` - Meta tags, Open Graph
- `frontend/src/CompanyCard.jsx` - Links using slugs
- `frontend/src/CompanyMap.jsx` - Links using slugs
- `frontend/index.html` - Default meta tags
- `frontend/public/robots.txt` - Crawler rules
- `frontend/public/sitemap.xml` - Generated sitemap

## 📈 Expected Results

### Search Engine Benefits:
- ✅ Better indexing (clean URLs)
- ✅ Rich snippets in search results (structured data)
- ✅ Improved click-through rate (attractive meta descriptions)

### Social Media Benefits:
- ✅ Beautiful link previews on Facebook/Telegram
- ✅ Large image cards on Twitter
- ✅ Professional appearance on LinkedIn

### User Experience:
- ✅ Readable, shareable URLs
- ✅ Consistent branding across platforms
- ✅ Faster page discovery by search engines
