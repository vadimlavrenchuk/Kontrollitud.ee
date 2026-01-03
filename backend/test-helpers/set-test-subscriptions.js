// Helper script to set test data for subscription expiration testing
// Run: node backend/test-helpers/set-test-subscriptions.js

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// MongoDB URI from environment (same as backend uses - database: test)
const MONGO_URI = 'mongodb+srv://kontrollitud:T07WI7ThsK7XTgTI@kontrollitud.bxlehah.mongodb.net/test?retryWrites=true&w=majority';

// Company Schema (simplified) - explicitly set collection name
const companySchema = new mongoose.Schema({}, { strict: false, collection: 'companies' });
const Company = mongoose.model('Company', companySchema);

async function setTestSubscriptions() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
        console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📂 Collections: ${collections.map(c => c.name).join(', ')}`);

        // Count total companies
        const totalCompanies = await Company.countDocuments();
        console.log(`📊 Total companies in collection: ${totalCompanies}`);
        
        // Find all companies (limit 10)
        const allCompanies = await Company.find().limit(10).select('name _id subscriptionLevel');
        console.log(`\n📋 Sample companies:`);
        allCompanies.forEach(c => {
            console.log(`  - ${c.name} (${c._id}): ${c.subscriptionLevel}`);
        });

        // Test Company 1: Pro plan - EXPIRED (3 days ago)
        const expiredDate1 = new Date();
        expiredDate1.setDate(expiredDate1.getDate() - 3);
        
        const company1 = await Company.findByIdAndUpdate(
            '695860f8225daeae6172fc90',
            {
                subscriptionLevel: 'pro',
                planExpiresAt: expiredDate1,
                isVerified: true,
                approvalStatus: 'approved',
                planReminderSent: false,
                image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
                instagramUrl: 'https://instagram.com/testpro',
                tiktokUrl: 'https://tiktok.com/@testpro'
            },
            { new: true }
        );
        
        if (company1) {
            console.log(`\n✅ Company 1: ${company1.name}`);
            console.log(`   Plan: ${company1.subscriptionLevel}, Expires: ${company1.planExpiresAt.toISOString()}`);
        } else {
            console.log('\n⚠️  Company 1 not found');
        }

        // Test Company 2: Pro plan - EXPIRING IN 3 DAYS
        const expiringDate = new Date();
        expiringDate.setDate(expiringDate.getDate() + 3);
        
        const company2 = await Company.findByIdAndUpdate(
            '69586100225daeae6172fc92',
            {
                subscriptionLevel: 'pro',
                planExpiresAt: expiringDate,
                isVerified: true,
                approvalStatus: 'approved',
                planReminderSent: false,
                image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
                instagramUrl: 'https://instagram.com/testpro2'
            },
            { new: true }
        );
        
        if (company2) {
            console.log(`\n✅ Company 2: ${company2.name}`);
            console.log(`   Plan: ${company2.subscriptionLevel}, Expires: ${company2.planExpiresAt.toISOString()}`);
        } else {
            console.log('\n⚠️  Company 2 not found');
        }

        // Test Company 3: Enterprise plan - EXPIRED (3 days ago)
        const expiredDate3 = new Date();
        expiredDate3.setDate(expiredDate3.getDate() - 3);
        
        const company3 = await Company.findByIdAndUpdate(
            '69586113225daeae6172fc95',
            {
                subscriptionLevel: 'enterprise',
                planExpiresAt: expiredDate3,
                isVerified: true,
                approvalStatus: 'approved',
                planReminderSent: false,
                image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
                instagramUrl: 'https://instagram.com/testent',
                tiktokUrl: 'https://tiktok.com/@testent',
                youtubeUrl: 'https://youtube.com/@testent',
                blogArticleUrl: 'https://blog.example.com/article'
            },
            { new: true }
        );
        
        if (company3) {
            console.log(`\n✅ Company 3: ${company3.name}`);
            console.log(`   Plan: ${company3.subscriptionLevel}, Expires: ${company3.planExpiresAt.toISOString()}`);
        } else {
            console.log('\n⚠️  Company 3 not found');
        }

        console.log('\n✅ Test data set successfully!');
        console.log('\nNext steps:');
        console.log('1. Run subscription check: Invoke-RestMethod http://localhost:5000/api/admin/test-subscription-check');
        console.log('2. Check logs: docker logs kontrollitudee-backend-1 --tail 50');
        console.log('3. Verify downgrade: Check companies in database');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

setTestSubscriptions();
