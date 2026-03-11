const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const DB_URI = process.env.MONGODB_URI;
const schema = new mongoose.Schema({
    name: String, slug: String,
    approvalStatus: String,
    createdAt: Date, updatedAt: Date
});
const Company = mongoose.model('Company', schema);
const baseUrl = 'https://kontrollitud.ee';
const today = new Date().toISOString().split('T')[0];

mongoose.connect(DB_URI).then(async () => {
    const companies = await Company.find({ approvalStatus: 'approved' })
        .select('slug updatedAt createdAt name');

    const statics = [
        { loc: '/',             changefreq: 'daily',   priority: '1.0' },
        { loc: '/catalog',      changefreq: 'daily',   priority: '0.9' },
        { loc: '/partners',     changefreq: 'weekly',  priority: '0.8' },
        { loc: '/add-business', changefreq: 'monthly', priority: '0.7' },
        { loc: '/about',        changefreq: 'monthly', priority: '0.6' },
        { loc: '/privacy',      changefreq: 'yearly',  priority: '0.3' },
        { loc: '/terms',        changefreq: 'yearly',  priority: '0.3' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    statics.forEach(p => {
        xml += `  <url><loc>${baseUrl}${p.loc}</loc><lastmod>${today}</lastmod>`;
        xml += `<changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>\n`;
    });

    companies.forEach(c => {
        const slug = c.slug || c._id;
        const lastmod = (c.updatedAt || c.createdAt || new Date()).toISOString().split('T')[0];
        xml += `  <url><loc>${baseUrl}/companies/${slug}</loc>`;
        xml += `<lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
    });

    xml += '</urlset>\n';

    fs.writeFileSync('/tmp/sitemap.xml', xml, 'utf8');
    console.log('OK: ' + companies.length + ' companies, ' + (statics.length + companies.length) + ' total URLs');
    await mongoose.disconnect();
    process.exit(0);
}).catch(e => { console.error('ERROR:', e.message); process.exit(1); });
