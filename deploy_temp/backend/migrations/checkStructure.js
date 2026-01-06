// Check single company structure
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

async function checkStructure() {
  const snapshot = await db.collection('companies').limit(1).get();
  snapshot.forEach(doc => {
    console.log('Sample company structure:');
    console.log(JSON.stringify(doc.data(), null, 2));
  });
  process.exit(0);
}

checkStructure();
