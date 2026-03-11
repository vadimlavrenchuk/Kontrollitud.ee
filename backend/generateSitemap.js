// Generate sitemap.xml for SEO
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const DB_URI = process.env.MONGODB_URI || process.env.DB_URI;

if (!DB_URI) {
    console.error('❌ ERROR: MONGODB_URI or DB_URI not found in environment variables!');
    process.exit(1);
}

// Company Schema (minimal version for sitemap generation)
const companySchema = new mongoose.Schema({
    name: String,
    slug: String,
    approvalStatus: String,
    createdAt: Date,
    updatedAt: Date
});

const Company = mongoose.model('Company', companySchema);

/**
 * Generate sitemap.xml with all approved companies
 */
async function generateSitemap() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        // Fetch all approved companies
        console.log('📦 Fetching approved companies...');
        const companies = await Company.find({ 
            approvalStatus: 'approved' 
        }).select('slug updatedAt createdAt').sort({ updatedAt: -1 });

        console.log(`✅ Found ${companies.length} approved companies`);

        // Generate XML
        const baseUrl = 'https://kontrollitud.ee';
        const today = new Date().toISOString().split('T')[0];

        const staticPages = [
            { loc: '/',              changefreq: 'daily',   priority: '1.0' },
            { loc: '/catalog',       changefreq: 'daily',   priority: '0.9' },
            { loc: '/partners',      changefreq: 'weekly',  priority: '0.8' },
            { loc: '/add-business',  changefreq: 'monthly', priority: '0.7' },
            { loc: '/about',         changefreq: 'monthly', priority: '0.6' },
            { loc: '/privacy',       changefreq: 'yearly',  priority: '0.3' },
            { loc: '/terms',         changefreq: 'yearly',  priority: '0.3' },
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;
        staticPages.forEach(page => {
            xml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
        });


        // Add all approved companies
        companies.forEach(company => {
            const slug = company.slug || company._id;
            const lastmod = (company.updatedAt || company.createdAt || new Date()).toISOString().split('T')[0];
            
            xml += `  <!-- ${company.name || slug} -->
  <url>
    <loc>${baseUrl}/companies/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
`;
        });

        xml += `</urlset>`;

        // Write to file — в папку деплоя или локально
        const fs = require('fs');
        const path = require('path');
        const deployPath = '/var/www/kontrollitud.ee/frontend/sitemap.xml';
        const localPath = path.join(__dirname, '..', 'frontend', 'public', 'sitemap.xml');
        const sitemapPath = fs.existsSync('/var/www/kontrollitud.ee/frontend') ? deployPath : localPath;

        fs.writeFileSync(sitemapPath, xml, 'utf8');
        console.log(`✅ Sitemap generated: ${sitemapPath}`);
        console.log(`📊 Total URLs: ${companies.length + staticPages.length}`);

        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap };
