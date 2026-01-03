// Check for placeholder images in Firestore
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

async function checkPlaceholders() {
  try {
    const snapshot = await db.collection('companies').get();
    let found = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.image && data.image.includes('placeholder')) {
        console.log(`\n❌ Found placeholder in: ${data.name}`);
        console.log(`   Image: ${data.image}`);
        console.log(`   Document ID: ${doc.id}`);
        found++;
      }
    });
    
    console.log(`\n✅ Checked ${snapshot.size} companies`);
    console.log(`${found > 0 ? '❌' : '✅'} Found ${found} companies with placeholder images`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPlaceholders();
