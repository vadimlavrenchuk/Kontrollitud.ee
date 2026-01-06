// Simple script to verify Firestore data and categories
const admin = require('firebase-admin');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function verifyData() {
  console.log('\n🔍 Verifying Firestore Data...\n');
  
  try {
    const snapshot = await db.collection('companies').get();
    
    console.log(`📊 Total Companies: ${snapshot.size}\n`);
    
    // Group by mainCategory
    const byCategory = {};
    const byCity = {};
    const verified = { true: 0, false: 0 };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Count by category
      if (!byCategory[data.mainCategory]) {
        byCategory[data.mainCategory] = [];
      }
      byCategory[data.mainCategory].push(data.name);
      
      // Count by city
      if (!byCity[data.city]) {
        byCity[data.city] = 0;
      }
      byCity[data.city]++;
      
      // Count verified
      const isVerified = data.verified || data.isVerified;
      verified[isVerified]++;
      
      console.log(`✅ ${data.name}`);
      console.log(`   📍 ${data.city}`);
      console.log(`   📂 ${data.mainCategory} > ${data.subCategory}`);
      console.log(`   ${isVerified ? '✓' : '✗'} Verified: ${isVerified}`);
      console.log('');
    });
    
    console.log('\n📊 Statistics:\n');
    
    console.log('By Main Category:');
    Object.entries(byCategory).forEach(([cat, companies]) => {
      console.log(`  ${cat}: ${companies.length} companies`);
      companies.forEach(name => console.log(`    - ${name}`));
    });
    
    console.log('\nBy City:');
    Object.entries(byCity).forEach(([city, count]) => {
      console.log(`  ${city}: ${count} companies`);
    });
    
    console.log('\nBy Verification Status:');
    console.log(`  Verified: ${verified.true}`);
    console.log(`  Not Verified: ${verified.false}`);
    
    console.log('\n✅ Data verification complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyData();
