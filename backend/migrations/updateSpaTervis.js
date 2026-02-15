// Update Spa Tervis to Enterprise tier with image
const admin = require('firebase-admin');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  console.log('✅ Firebase Admin initialized');
}

const db = admin.firestore();

async function updateSpaTervis() {
  try {
    console.log('🔍 Looking for Spa Tervis...');
    
    const querySnapshot = await db.collection('companies')
      .where('name', '==', 'Spa Tervis')
      .limit(1)
      .get();
    
    if (querySnapshot.empty) {
      console.log('❌ Spa Tervis not found!');
      process.exit(1);
    }
    
    const doc = querySnapshot.docs[0];
    console.log(`✅ Found Spa Tervis (ID: ${doc.id})`);
    
    // Update fields
    await doc.ref.update({
      tier: 'Enterprise',
      subscriptionLevel: 'enterprise',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      priority: 10,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✨ Spa Tervis updated successfully!');
    console.log('   - tier: Enterprise');
    console.log('   - image: added');
    console.log('   - priority: 10');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateSpaTervis();
