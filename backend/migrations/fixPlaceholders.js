// Fix placeholder images in Firestore
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

// SVG placeholder
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

async function fixPlaceholders() {
  try {
    const snapshot = await db.collection('companies').get();
    let updated = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.image && data.image.includes('via.placeholder')) {
        console.log(`\n🔧 Updating: ${data.name}`);
        await doc.ref.update({
          image: '' // Remove placeholder, let frontend handle it
        });
        updated++;
      }
    }
    
    console.log(`\n✅ Updated ${updated} companies`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPlaceholders();
