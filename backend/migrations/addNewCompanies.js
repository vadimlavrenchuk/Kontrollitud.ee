// Add new Estonian companies to Firestore
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

// New companies to add
const companies = [
  // Tallinn
  {
    name: 'City Clinic',
    mainCategory: 'Tervis',
    subCategory: 'Meditsiinikliinikud',
    category: 'Meditsiinikliinikud',
    city: 'Tallinn',
    address: 'Veerenni 53a, Tallinn 10138',
    phone: '+372 634 7000',
    email: 'info@cityclinic.ee',
    website: 'https://www.cityclinic.ee',
    description: {
      et: 'City Clinic on kaasaegne meditsiinikeskus Tallinna kesklinnas, pakkudes laia valikut meditsiiniteenuseid.',
      en: 'City Clinic is a modern medical center in downtown Tallinn offering a wide range of medical services.',
      ru: 'City Clinic - современный медицинский центр в центре Таллинна, предлагающий широкий спектр медицинских услуг.'
    },
    location: { lat: 59.4280, lng: 24.7574 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.6,
    reviewCount: 89,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Tallinna Pesumaja',
    mainCategory: 'Teenused',
    subCategory: 'Keemilispuhastus',
    category: 'Keemilispuhastus',
    city: 'Tallinn',
    address: 'Pärnu mnt 154, Tallinn 11624',
    phone: '+372 656 7890',
    email: 'info@pesumaja.ee',
    website: 'https://www.pesumaja.ee',
    description: {
      et: 'Professionaalne keemilispuhastus ja pesula teenus Tallinnas.',
      en: 'Professional dry cleaning and laundry service in Tallinn.',
      ru: 'Профессиональная химчистка и прачечная в Таллинне.'
    },
    location: { lat: 59.4085, lng: 24.7014 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.5,
    reviewCount: 67,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'AutoExpert Lasnamäe',
    mainCategory: 'Auto',
    subCategory: 'Autohooldus',
    category: 'Autohooldus',
    city: 'Tallinn',
    address: 'Peterburi tee 47, Tallinn 11415',
    phone: '+372 655 4321',
    email: 'info@autoexpert.ee',
    website: 'https://www.autoexpert.ee',
    description: {
      et: 'Veermiku remont ja tehniline hooldus. Professionaalsed autohoolduse teenused.',
      en: 'Suspension repair and technical maintenance. Professional auto service.',
      ru: 'Ремонт ходовой части и техническое обслуживание. Профессиональные автосервисные услуги.'
    },
    location: { lat: 59.4380, lng: 24.8240 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.7,
    reviewCount: 124,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'EcoCleaning OÜ',
    mainCategory: 'Teenused',
    subCategory: 'Koristus',
    category: 'Koristus',
    city: 'Tallinn',
    address: 'Mustamäe tee 16, Tallinn 10617',
    phone: '+372 678 9012',
    email: 'info@ecocleaning.ee',
    website: 'https://www.ecocleaning.ee',
    description: {
      et: 'Kontorite ja eluruumide koristamine ökoloogiliste vahenditega.',
      en: 'Office and residential cleaning with ecological products.',
      ru: 'Уборка офисов и жилых помещений экологичными средствами.'
    },
    location: { lat: 59.3998, lng: 24.6708 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.8,
    reviewCount: 56,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Restoran Olde Hansa',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Tallinn',
    address: 'Vana turg 1, Tallinn 10140',
    phone: '+372 627 9020',
    email: 'info@oldehansa.ee',
    website: 'https://www.oldehansa.ee',
    description: {
      et: 'Tuntud keskaegne restoran Vanalinnas, pakkudes autentset hansaaegset kogemust.',
      en: 'Famous medieval restaurant in Old Town offering an authentic Hanseatic experience.',
      ru: 'Известный средневековый ресторан в Старом городе, предлагающий аутентичные ганзейские блюда.'
    },
    location: { lat: 59.4379, lng: 24.7453 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.6,
    reviewCount: 487,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'IT-Abi',
    mainCategory: 'Teenused',
    subCategory: 'IT-teenused',
    category: 'IT-teenused',
    city: 'Tallinn',
    address: 'Narva mnt 13, Tallinn 10151',
    phone: '+372 688 5555',
    email: 'info@it-abi.ee',
    website: 'https://www.it-abi.ee',
    description: {
      et: 'Arvutite remont ja võrkude seadistamine. Kiire ja professionaalne IT-abi.',
      en: 'Computer repair and network setup. Fast and professional IT assistance.',
      ru: 'Ремонт компьютеров и настройка сетей. Быстрая и профессиональная IT-помощь.'
    },
    location: { lat: 59.4361, lng: 24.7535 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.5,
    reviewCount: 78,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // Tartu
  {
    name: 'Tartu Ülikooli Kohvik',
    mainCategory: 'Toit',
    subCategory: 'Kohvikud',
    category: 'Kohvikud',
    city: 'Tartu',
    address: 'Ülikooli 18, Tartu 50090',
    phone: '+372 737 5555',
    email: 'kohvik@ut.ee',
    website: 'https://www.ut.ee/kohvik',
    description: {
      et: 'Ajalooline kohvik hubases atmosfääris Tartu ülikooli südames.',
      en: 'Historic café with cozy atmosphere in the heart of University of Tartu.',
      ru: 'Историческое кафе с уютной атмосферой в сердце Тартуского университета.'
    },
    location: { lat: 58.3800, lng: 26.7210 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.7,
    reviewCount: 145,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Lõunakeskus Dental',
    mainCategory: 'Tervis',
    subCategory: 'Hambaarstid',
    category: 'Hambaarstid',
    city: 'Tartu',
    address: 'Ringtee 75, Tartu 50501',
    phone: '+372 730 0900',
    email: 'dental@lounakeskus.ee',
    website: 'https://www.lounakeskus.ee/dental',
    description: {
      et: 'Hambaarstikliinik Lõunakeskuses, pakkudes kaasaegseid hambaarstiteenuseid.',
      en: 'Dental clinic in Lõunakeskus shopping center offering modern dental services.',
      ru: 'Стоматологическая клиника в торговом центре Lõunakeskus, предлагающая современные стоматологические услуги.'
    },
    location: { lat: 58.3640, lng: 26.6893 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.6,
    reviewCount: 92,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Emajõe Paadirent',
    mainCategory: 'Puhkus',
    subCategory: 'Veesport',
    category: 'Veesport',
    city: 'Tartu',
    address: 'Soola 4, Tartu 51013',
    phone: '+372 520 3456',
    email: 'info@paadirent.ee',
    website: 'https://www.paadirent.ee',
    description: {
      et: 'Paatide rent ja jalutuskäigud Emajõel. Nautige Tartut veeperspektiivist.',
      en: 'Boat rental and river tours on Emajõgi. Enjoy Tartu from water perspective.',
      ru: 'Прокат лодок и прогулки по реке Эмайыги. Наслаждайтесь Тарту с водной перспективы.'
    },
    location: { lat: 58.3776, lng: 26.7290 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.8,
    reviewCount: 67,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Nutikas Remont',
    mainCategory: 'Teenused',
    subCategory: 'Elektroonika',
    category: 'Elektroonika',
    city: 'Tartu',
    address: 'Riia 2, Tartu 51010',
    phone: '+372 742 8888',
    email: 'info@nutikasremont.ee',
    website: 'https://www.nutikasremont.ee',
    description: {
      et: 'Kiire nutitelefonide ja tahvelarvutite remont. Professionaalne ja usaldusväärne teenus.',
      en: 'Fast smartphone and tablet repair. Professional and reliable service.',
      ru: 'Быстрый ремонт смартфонов и планшетов. Профессиональный и надежный сервис.'
    },
    location: { lat: 58.3780, lng: 26.7280 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.7,
    reviewCount: 134,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Tartu Hotell',
    mainCategory: 'Majutus',
    subCategory: 'Hotellid',
    category: 'Hotellid',
    city: 'Tartu',
    address: 'Soola 3, Tartu 51013',
    phone: '+372 731 4300',
    email: 'info@tartuhotell.ee',
    website: 'https://www.tartuhotell.ee',
    description: {
      et: 'Hotell ülikooli linna südames. Mugav majutus ja hea asukoht.',
      en: 'Hotel in the heart of the university city. Comfortable accommodation and great location.',
      ru: 'Отель в самом сердце университетского города. Комфортное размещение и отличное расположение.'
    },
    location: { lat: 58.3785, lng: 26.7295 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // Pärnu
  {
    name: 'Spa Tervis',
    mainCategory: 'Puhkus',
    subCategory: 'Spaa',
    category: 'Spaa',
    city: 'Pärnu',
    address: 'Side 14, Pärnu 80012',
    phone: '+372 447 9600',
    email: 'tervis@tervisegrupp.ee',
    website: 'https://www.tervisegrupp.ee',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    description: {
      et: 'Üks suurimaid kuurortlikke spaa-keskusi Pärnus. Täielik lõõgastumine ja tervendamine.',
      en: 'One of the largest resort spa centers in Pärnu. Complete relaxation and wellness.',
      ru: 'Один из крупнейших курортных спа-центров в Пярну. Полное расслабление и оздоровление.'
    },
    location: { lat: 58.3870, lng: 24.4970 },
    verified: true,
    isVerified: true,
    tier: 'Enterprise',
    subscriptionLevel: 'enterprise',
    priority: 10,
    rating: 4.6,
    reviewCount: 312,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Pärnu Surfiaed',
    mainCategory: 'Puhkus',
    subCategory: 'Veesport',
    category: 'Veesport',
    city: 'Pärnu',
    address: 'Ranna pst 1, Pärnu 80010',
    phone: '+372 523 4567',
    email: 'info@surfiaed.ee',
    website: 'https://www.surfiaed.ee',
    description: {
      et: 'Surfingu õpetamine ja varustuse rent Pärnu rannas. Suveseiklused mereääres.',
      en: 'Surfing lessons and equipment rental on Pärnu beach. Summer adventures by the sea.',
      ru: 'Обучение серфингу и аренда оборудования на пляже Пярну. Летние приключения у моря.'
    },
    location: { lat: 58.3835, lng: 24.5015 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.9,
    reviewCount: 89,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Kalamajaka Söögituba',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Pärnu',
    address: 'Suur-Sepa 16, Pärnu 80098',
    phone: '+372 443 0930',
    email: 'info@kalamajaka.ee',
    website: 'https://www.kalamajaka.ee',
    description: {
      et: 'Kalarestoran värskemate mereandidega. Kohalik ja värskelt püütud kala.',
      en: 'Fish restaurant with the freshest seafood. Local and freshly caught fish.',
      ru: 'Рыбный ресторан с самыми свежими морепродуктами. Местная и свежевыловленная рыба.'
    },
    location: { lat: 58.3850, lng: 24.4980 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.7,
    reviewCount: 178,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Suveauto',
    mainCategory: 'Auto',
    subCategory: 'Autorent',
    category: 'Autorent',
    city: 'Pärnu',
    address: 'Riia mnt 142, Pärnu 80042',
    phone: '+372 445 7890',
    email: 'info@suveauto.ee',
    website: 'https://www.suveauto.ee',
    description: {
      et: 'Kabriolettide ja sõiduautode rent turistidele. Naudi Pärnumaad vabaduses.',
      en: 'Convertible and car rental for tourists. Enjoy Pärnu region in freedom.',
      ru: 'Аренда кабриолетов и легковых машин для туристов. Наслаждайтесь Пярнумаа на свободе.'
    },
    location: { lat: 58.3690, lng: 24.5145 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.8,
    reviewCount: 102,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // Narva
  {
    name: 'Narva Kindluse Restoran',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Narva',
    address: 'Peterburi mnt 2, Narva 20308',
    phone: '+372 359 2300',
    email: 'info@narva-kindlus.ee',
    website: 'https://www.narva-museum.ee',
    description: {
      et: 'Restoran vaatega linnusele ja piirile. Unikaalne ajaloolik kogemus.',
      en: 'Restaurant with a view of the castle and border. Unique historical experience.',
      ru: 'Ресторан с видом на замок и границу. Уникальный исторический опыт.'
    },
    location: { lat: 59.3753, lng: 28.2010 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 123,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Astri Keskus Shop',
    mainCategory: 'Ostlemine',
    subCategory: 'Poed',
    category: 'Poed',
    city: 'Narva',
    address: 'Tallinna mnt 41, Narva 21006',
    phone: '+372 357 0000',
    email: 'info@astri.ee',
    website: 'https://www.astri.ee',
    description: {
      et: 'Suur elektroonika ja kodukaupade pood. Lai valik tehnikat ja koduseadmeid.',
      en: 'Large electronics and home goods store. Wide selection of technology and appliances.',
      ru: 'Крупный магазин электроники и товаров для дома. Широкий выбор техники и бытовых приборов.'
    },
    location: { lat: 59.3717, lng: 28.1925 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.4,
    reviewCount: 167,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Border Logistics',
    mainCategory: 'Teenused',
    subCategory: 'Transport',
    category: 'Transport',
    city: 'Narva',
    address: 'Kerese 4, Narva 20203',
    phone: '+372 356 8900',
    email: 'info@borderlogistics.ee',
    website: 'https://www.borderlogistics.ee',
    description: {
      et: 'Tolliformaalsused ja transpordi vedude teenused. Professionaalne piiriülene logistika.',
      en: 'Customs clearance and transport services. Professional cross-border logistics.',
      ru: 'Таможенное оформление и транспортные перевозки. Профессиональная трансграничная логистика.'
    },
    location: { lat: 59.3810, lng: 28.1870 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.6,
    reviewCount: 78,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // Rakvere
  {
    name: 'Aqva Spa Rakvere',
    mainCategory: 'Puhkus',
    subCategory: 'Spaa',
    category: 'Spaa',
    city: 'Rakvere',
    address: 'Parkali 4, Rakvere 44310',
    phone: '+372 322 3900',
    email: 'info@aqvaspa.ee',
    website: 'https://www.aqvaspa.ee',
    description: {
      et: 'Populaarne akvapark ja sauna kompleks. Lõbu kogu perele.',
      en: 'Popular water park and sauna complex. Fun for the whole family.',
      ru: 'Популярный аквапарк и банный комплекс. Развлечения для всей семьи.'
    },
    location: { lat: 59.3480, lng: 26.3550 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.7,
    reviewCount: 289,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // Viljandi
  {
    name: 'Viljandi Pärimusmuusika Ait',
    mainCategory: 'Kultuur',
    subCategory: 'Kontserdid',
    category: 'Kontserdid',
    city: 'Viljandi',
    address: 'Tasuja pst 6, Viljandi 71020',
    phone: '+372 433 0377',
    email: 'info@folk.ee',
    website: 'https://www.folk.ee',
    description: {
      et: 'Kontserdisaal ja rahvamuusika keskus. Pärimuskultuuri säilitamine ja edendamine.',
      en: 'Concert hall and folk music center. Preserving and promoting traditional culture.',
      ru: 'Концертный зал и центр народной музыки. Сохранение и продвижение традиционной культуры.'
    },
    location: { lat: 58.3640, lng: 25.5900 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.9,
    reviewCount: 156,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addCompanies() {
  try {
    console.log(`🚀 Starting to add ${companies.length} companies...`);
    
    for (const company of companies) {
      try {
        // Check if company already exists
        const existingCompany = await db.collection('companies')
          .where('name', '==', company.name)
          .limit(1)
          .get();
        
        if (!existingCompany.empty) {
          console.log(`⚠️  "${company.name}" already exists, skipping...`);
          continue;
        }
        
        // Add company
        const docRef = await db.collection('companies').add(company);
        console.log(`✅ Added: ${company.name} (ID: ${docRef.id})`);
        
      } catch (error) {
        console.error(`❌ Error adding ${company.name}:`, error.message);
      }
    }
    
    console.log('\n✨ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addCompanies();
