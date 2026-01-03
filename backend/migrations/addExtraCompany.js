// Add one more test company to verify map filtering
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

const newCompany = {
  name: 'Test Salon Pärnu',
  mainCategory: 'Ilu',
  subCategory: 'Juuksurid',
  category: 'Juuksurid',
  city: 'Pärnu',
  address: 'Rüütli 8, Pärnu',
  phone: '+372 444 5566',
  email: 'info@testsalon.ee',
  website: 'https://www.testsalon.ee',
  description: {
    et: 'Juuksur Pärnus, mis pakub professionaalseid juuksuriteenus.',
    en: 'Hair salon in Pärnu offering professional hairdressing services.',
    ru: 'Парикмахерская в Пярну, предлагающая профессиональные услуги.'
  },
  location: {
    lat: 58.3859,
    lng: 24.4971
  },
  verified: true,
  isVerified: true,
  priority: 2,
  rating: 4.4,
  reviewCount: 34,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function addCompany() {
  try {
    console.log('Adding Test Salon Pärnu...');
    
    const companiesRef = db.collection('companies');
    
    // Check if exists
    const existing = await companiesRef.where('name', '==', newCompany.name).get();
    if (!existing.empty) {
      console.log('⏭️  Company already exists');
      process.exit(0);
    }
    
    const docRef = await companiesRef.add(newCompany);
    console.log(`✅ Added: ${newCompany.name} (ID: ${docRef.id})`);
    
    // Show total
    const total = await companiesRef.get();
    console.log(`📊 Total companies: ${total.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCompany();
