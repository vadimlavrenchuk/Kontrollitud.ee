// Generate sitemap.xml for SEO
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const DB_URI = process.env.DB_URI || 'mongodb+srv://Kontrollitud:6MXhF8u4qfK5qBUs@kontrollituddbcluster.bxlehah.mongodb.net/?appName=KontrollitudDBCluster';

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

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/add-business</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/auth</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
`;

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

        // Write to file
        const fs = require('fs');
        const path = require('path');
        const sitemapPath = path.join(__dirname, '..', 'frontend', 'public', 'sitemap.xml');
        
        fs.writeFileSync(sitemapPath, xml, 'utf8');
        console.log(`✅ Sitemap generated successfully at: ${sitemapPath}`);
        console.log(`📊 Total URLs: ${companies.length + 3}`);

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
