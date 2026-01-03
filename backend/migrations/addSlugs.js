// Kontrollitud.ee/backend/migrations/addSlugs.js
// Migration script to add slugs to existing companies in Firestore

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
} catch (error) {
  console.log('Firebase already initialized');
}

const db = admin.firestore();

/**
 * Slugify function - converts text to URL-friendly slug with Cyrillic/Estonian support
 */
function slugify(text) {
  if (!text) return '';

  const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
    'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    'ä': 'a', 'ö': 'o', 'ü': 'u', 'õ': 'o',
    'Ä': 'A', 'Ö': 'O', 'Ü': 'U', 'Õ': 'O',
    'š': 's', 'ž': 'z', 'Š': 'S', 'Ž': 'Z'
  };

  let slug = text.toString().trim();
  slug = slug.split('').map(char => cyrillicMap[char] || char).join('');
  slug = slug
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return slug;
}

/**
 * Add slugs to all companies in Firestore
 */
async function addSlugsToCompanies() {
  try {
    console.log('🚀 Starting slug migration...\n');
    
    const companiesRef = db.collection('companies');
    const snapshot = await companiesRef.get();

    console.log(`📊 Found ${snapshot.size} companies to process\n`);

    const slugs = new Set();
    const updates = [];
    let skipped = 0;
    let processed = 0;

    for (const doc of snapshot.docs) {
      const company = doc.data();
      
      // Skip if already has slug
      if (company.slug) {
        console.log(`⏭️  ${company.name} already has slug: ${company.slug}`);
        skipped++;
        continue;
      }

      // Generate base slug
      let slug = slugify(company.name);
      let uniqueSlug = slug;
      let counter = 1;

      // Ensure uniqueness
      while (slugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      slugs.add(uniqueSlug);
      updates.push({
        id: doc.id,
        name: company.name,
        slug: uniqueSlug
      });

      console.log(`✅ ${company.name} → ${uniqueSlug}`);
      processed++;
    }

    // Apply updates in batches
    console.log(`\n📝 Applying ${updates.length} updates...`);
    
    for (let i = 0; i < updates.length; i += 500) {
      const batch = db.batch();
      const batchUpdates = updates.slice(i, i + 500);
      
      for (const update of batchUpdates) {
        const docRef = db.collection('companies').doc(update.id);
        batch.update(docRef, { slug: update.slug });
      }
      
      await batch.commit();
      console.log(`✓ Batch ${Math.floor(i / 500) + 1} committed (${batchUpdates.length} updates)`);
    }

    console.log('\n✅ Migration complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Processed: ${processed}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Total: ${snapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
addSlugsToCompanies();

