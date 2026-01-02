// Add test companies to Firestore for testing filters and pagination
const admin = require('firebase-admin');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Initialize Firebase Admin using environment variables
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

// Test companies data
const testCompanies = [
  {
    name: 'Rimi Supermarket',
    mainCategory: 'Ostlemine',
    subCategory: 'Poed',
    category: 'Poed', // For backward compatibility
    city: 'Tallinn',
    address: 'Peterburi tee 2, Tallinn',
    phone: '+372 600 5000',
    email: 'info@rimi.ee',
    website: 'https://www.rimi.ee',
    description: {
      et: 'Rimi on Eesti juhtiv toidukaupluste kett, mis pakub kvaliteetseid tooteid soodsate hindadega.',
      en: 'Rimi is Estonia\'s leading grocery store chain offering quality products at affordable prices.',
      ru: 'Rimi - ведущая сеть продуктовых магазинов в Эстонии, предлагающая качественные товары по доступным ценам.'
    },
    location: {
      lat: 59.4370,
      lng: 24.7536
    },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 128,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Vapiano Tallinn',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Tallinn',
    address: 'Viru väljak 4, Tallinn',
    phone: '+372 630 0800',
    email: 'tallinn@vapiano.ee',
    website: 'https://www.vapiano.ee',
    description: {
      et: 'Vapiano on Itaalia restoran, mis pakub värsket pasta, pitsat ja salate.',
      en: 'Vapiano is an Italian restaurant offering fresh pasta, pizza and salads.',
      ru: 'Vapiano - итальянский ресторан, предлагающий свежую пасту, пиццу и салаты.'
    },
    location: {
      lat: 59.4372,
      lng: 24.7536
    },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.3,
    reviewCount: 89,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Kalev Spa',
    mainCategory: 'Puhkus',
    subCategory: 'SPA',
    category: 'SPA',
    city: 'Tallinn',
    address: 'Aia 18, Tallinn',
    phone: '+372 649 3300',
    email: 'spa@kalevspa.ee',
    website: 'https://www.kalevspa.ee',
    description: {
      et: 'Kalev SPA on suurim veekeskus Baltimaades, mis pakub spaa-teenuseid ja majutust.',
      en: 'Kalev SPA is the largest water park in the Baltics offering spa services and accommodation.',
      ru: 'Kalev SPA - крупнейший водный центр в Прибалтике, предлагающий спа-услуги и проживание.'
    },
    location: {
      lat: 59.4378,
      lng: 24.7545
    },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.6,
    reviewCount: 234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'AutoExpert Tallinn',
    mainCategory: 'Auto',
    subCategory: 'Autoteenus',
    category: 'Autoteenus',
    city: 'Tallinn',
    address: 'Mustamäe tee 5, Tallinn',
    phone: '+372 555 1234',
    email: 'info@autoexpert.ee',
    website: 'https://www.autoexpert.ee',
    description: {
      et: 'AutoExpert pakub kvaliteetset autohooldust ja remonti taskukohaste hindadega.',
      en: 'AutoExpert provides quality car maintenance and repair at affordable prices.',
      ru: 'AutoExpert предоставляет качественное обслуживание и ремонт автомобилей по доступным ценам.'
    },
    location: {
      lat: 59.3970,
      lng: 24.6716
    },
    verified: false,
    isVerified: false,
    priority: 2,
    rating: 4.1,
    reviewCount: 42,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Caffeine Coffee Bar',
    mainCategory: 'Toit',
    subCategory: 'Kohvikud',
    category: 'Kohvikud',
    city: 'Tartu',
    address: 'Rüütli 16, Tartu',
    phone: '+372 733 4455',
    email: 'hello@caffeine.ee',
    website: 'https://www.caffeine.ee',
    description: {
      et: 'Hubane kohvik Tartu kesklinnas, mis pakub kvaliteetset kohvi ja koduseid kooke.',
      en: 'Cozy cafe in Tartu city center offering quality coffee and homemade cakes.',
      ru: 'Уютное кафе в центре Тарту, предлагающее качественный кофе и домашние торты.'
    },
    location: {
      lat: 58.3806,
      lng: 26.7226
    },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.7,
    reviewCount: 67,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addTestCompanies() {
  console.log('🚀 Starting to add test companies to Firestore...');
  
  try {
    const companiesRef = db.collection('companies');
    
    // Check existing companies
    const existingSnapshot = await companiesRef.get();
    console.log(`📊 Current companies in database: ${existingSnapshot.size}`);
    
    // Add test companies
    for (const company of testCompanies) {
      // Check if company already exists by name
      const existingCompany = await companiesRef
        .where('name', '==', company.name)
        .get();
      
      if (!existingCompany.empty) {
        console.log(`⏭️  Skipping "${company.name}" - already exists`);
        continue;
      }
      
      const docRef = await companiesRef.add(company);
      console.log(`✅ Added: ${company.name} (ID: ${docRef.id})`);
    }
    
    // Show final count
    const finalSnapshot = await companiesRef.get();
    console.log(`\n📊 Total companies after migration: ${finalSnapshot.size}`);
    
    // Show all companies with their categories
    console.log('\n📋 All companies in database:');
    finalSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name}: ${data.mainCategory} > ${data.subCategory} (verified: ${data.verified || data.isVerified})`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error adding test companies:', error);
    process.exit(1);
  }
}

addTestCompanies();
