// Migration script to add slugs to existing companies
const mongoose = require('mongoose');
require('dotenv').config();

const DB_URI = process.env.DB_URI || 'mongodb+srv://Kontrollitud:6MXhF8u4qfK5qBUs@kontrollituddbcluster.bxlehah.mongodb.net/?appName=KontrollitudDBCluster';

// Company Schema
const companySchema = new mongoose.Schema({
    name: String,
    slug: String
});

const Company = mongoose.model('Company', companySchema);

/**
 * Generate URL-friendly slug from company name
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        // Replace Estonian characters
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/õ/g, 'o')
        .replace(/š/g, 's')
        .replace(/ž/g, 'z')
        // Replace spaces and special characters with hyphens
        .replace(/[^a-z0-9]+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');
}

/**
 * Add slugs to all companies that don't have one
 */
async function addSlugs() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        // Find companies without slugs
        const companies = await Company.find({ 
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: '' }
            ]
        });

        console.log(`📦 Found ${companies.length} companies without slugs`);

        let updated = 0;
        let skipped = 0;

        for (const company of companies) {
            try {
                const slug = generateSlug(company.name);
                
                // Check if slug already exists
                const existing = await Company.findOne({ slug, _id: { $ne: company._id } });
                
                if (existing) {
                    // Append ID to make it unique
                    company.slug = `${slug}-${company._id.toString().slice(-6)}`;
                    console.log(`⚠️  Duplicate slug detected, using: ${company.slug}`);
                } else {
                    company.slug = slug;
                }
                
                await company.save();
                updated++;
                console.log(`✅ Updated: ${company.name} -> ${company.slug}`);
                
            } catch (error) {
                console.error(`❌ Failed to update ${company.name}:`, error.message);
                skipped++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully updated: ${updated}`);
        console.log(`⚠️  Skipped: ${skipped}`);
        console.log(`📦 Total processed: ${companies.length}`);

        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    addSlugs();
}

module.exports = { addSlugs };
