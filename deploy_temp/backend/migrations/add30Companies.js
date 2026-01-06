// Add 30 real Estonian companies to Firestore
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

// 30 Real Estonian companies
const companies = [
  {
    name: 'Selver Kristiine',
    mainCategory: 'Ostlemine',
    subCategory: 'Poed',
    category: 'Poed',
    city: 'Tallinn',
    address: 'Endla 45, Tallinn 10615',
    phone: '+372 667 1800',
    email: 'info@selver.ee',
    website: 'https://www.selver.ee',
    description: {
      et: 'Selver on Eesti suurim jaekaubanduskett, mis pakub laia valikut toidukaupu ja igapäevaseid kaupu.',
      en: 'Selver is Estonia\'s largest retail chain offering a wide selection of groceries and everyday goods.',
      ru: 'Selver - крупнейшая розничная сеть Эстонии, предлагающая широкий выбор продуктов и товаров повседневного спроса.'
    },
    location: { lat: 59.4269, lng: 24.7245 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.4,
    reviewCount: 156,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Restoran Ö',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Tallinn',
    address: 'Mere pst 6e, Tallinn 10111',
    phone: '+372 661 6150',
    email: 'info@restoran-o.ee',
    website: 'https://www.restoran-o.ee',
    description: {
      et: 'Restoran Ö pakub tipptasemel Põhjamaade kööki ja ainulaadset gastronoomilist elamust.',
      en: 'Restaurant Ö offers top-level Nordic cuisine and a unique gastronomic experience.',
      ru: 'Ресторан Ö предлагает высококлассную скандинавскую кухню и уникальный гастрономический опыт.'
    },
    location: { lat: 59.4413, lng: 24.7536 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.8,
    reviewCount: 203,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Apollo Kino Solaris',
    mainCategory: 'Meelelahutus',
    subCategory: 'Kinod',
    category: 'Kinod',
    city: 'Tallinn',
    address: 'Estonia pst 9, Tallinn 10143',
    phone: '+372 680 7080',
    email: 'info@apollokino.ee',
    website: 'https://www.apollokino.ee',
    description: {
      et: 'Apollo Kino on kaasaegne kinokompleks, mis pakub viimaste filmide vaatamist kvaliteetses keskkonnas.',
      en: 'Apollo Cinema is a modern cinema complex offering the latest movies in a quality environment.',
      ru: 'Apollo Kino - современный кинокомплекс, предлагающий просмотр последних фильмов в качественной среде.'
    },
    location: { lat: 59.4277, lng: 24.7574 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.5,
    reviewCount: 187,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'MyFitness Ülemiste',
    mainCategory: 'Tervis',
    subCategory: 'Jõusaalid',
    category: 'Jõusaalid',
    city: 'Tallinn',
    address: 'Suur-Sõjamäe 4, Tallinn 11415',
    phone: '+372 600 0020',
    email: 'info@myfitness.ee',
    website: 'https://www.myfitness.ee',
    description: {
      et: 'MyFitness on Eesti suurim jõusaalide võrgustik, mis pakub treeningvõimalusi ja grupitrenne.',
      en: 'MyFitness is Estonia\'s largest gym network offering training facilities and group classes.',
      ru: 'MyFitness - крупнейшая сеть фитнес-клубов Эстонии, предлагающая тренировочные возможности и групповые занятия.'
    },
    location: { lat: 59.4231, lng: 24.8039 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.3,
    reviewCount: 142,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Stockmann',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubamajad',
    category: 'Kaubamajad',
    city: 'Tallinn',
    address: 'Liivalaia 53, Tallinn 10145',
    phone: '+372 667 9700',
    email: 'info@stockmann.ee',
    website: 'https://www.stockmann.ee',
    description: {
      et: 'Stockmann on premium kaubamaja, mis pakub laia valikut moekaupu ja kodutarbeid.',
      en: 'Stockmann is a premium department store offering a wide selection of fashion and home goods.',
      ru: 'Stockmann - премиальный универмаг, предлагающий широкий выбор модных товаров и товаров для дома.'
    },
    location: { lat: 59.4311, lng: 24.7539 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.6,
    reviewCount: 289,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Radisson Blu Hotel Olümpia',
    mainCategory: 'Puhkus',
    subCategory: 'Hotellid',
    category: 'Hotellid',
    city: 'Tallinn',
    address: 'Liivalaia 33, Tallinn 10118',
    phone: '+372 631 5333',
    email: 'info.tallinn@radissonblu.com',
    website: 'https://www.radissonhotels.com',
    description: {
      et: 'Radisson Blu Hotel Olümpia on 4-tärni hotell Tallinna kesklinnas pakub luksuslikku majutust.',
      en: 'Radisson Blu Hotel Olümpia is a 4-star hotel in central Tallinn offering luxury accommodation.',
      ru: 'Radisson Blu Hotel Olümpia - 4-звездочный отель в центре Таллинна, предлагающий роскошное размещение.'
    },
    location: { lat: 59.4315, lng: 24.7527 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 412,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Tartu Kaubamaja',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubamajad',
    category: 'Kaubamajad',
    city: 'Tartu',
    address: 'Riia 1, Tartu 51010',
    phone: '+372 730 5800',
    email: 'tartu@kaubamaja.ee',
    website: 'https://www.kaubamaja.ee',
    description: {
      et: 'Tartu Kaubamaja on Lõuna-Eesti suurim kaubamaja, mis pakub laia valikut kaupu ja teenuseid.',
      en: 'Tartu Kaubamaja is the largest department store in Southern Estonia offering a wide range of goods and services.',
      ru: 'Tartu Kaubamaja - крупнейший универмаг в Южной Эстонии, предлагающий широкий ассортимент товаров и услуг.'
    },
    location: { lat: 58.3780, lng: 26.7290 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.4,
    reviewCount: 178,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Pärnu Keskraamatukogu',
    mainCategory: 'Haridus',
    subCategory: 'Raamatukogud',
    category: 'Raamatukogud',
    city: 'Pärnu',
    address: 'Akadeemia 3, Pärnu 80011',
    phone: '+372 445 5100',
    email: 'keskraamatukogu@rib.ee',
    website: 'https://www.rib.ee',
    description: {
      et: 'Pärnu Keskraamatukogu on kaasaegne kultuurikeskus, mis pakub raamatuid ja üritusi.',
      en: 'Pärnu Central Library is a modern cultural center offering books and events.',
      ru: 'Центральная библиотека Пярну - современный культурный центр, предлагающий книги и мероприятия.'
    },
    location: { lat: 58.3859, lng: 24.4971 },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.6,
    reviewCount: 89,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Viru Keskus',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubanduskeskused',
    category: 'Kaubanduskeskused',
    city: 'Tallinn',
    address: 'Viru väljak 4-6, Tallinn 10111',
    phone: '+372 610 1400',
    email: 'info@virukeskus.com',
    website: 'https://www.virukeskus.com',
    description: {
      et: 'Viru Keskus on Tallinna südames asuv suur kaubanduskeskus poodide ja meelelahutusega.',
      en: 'Viru Keskus is a large shopping center in the heart of Tallinn with shops and entertainment.',
      ru: 'Viru Keskus - крупный торговый центр в центре Таллинна с магазинами и развлечениями.'
    },
    location: { lat: 59.4372, lng: 24.7536 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 567,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Kohvik Komeet',
    mainCategory: 'Toit',
    subCategory: 'Kohvikud',
    category: 'Kohvikud',
    city: 'Tallinn',
    address: 'Mere pst 20, Tallinn 10111',
    phone: '+372 641 1837',
    email: 'info@kohvikkomeet.ee',
    website: 'https://www.kohvikkomeet.ee',
    description: {
      et: 'Kohvik Komeet pakub värsket kohvi, koduseid kooke ja panoraamvaadet Tallinna lahele.',
      en: 'Cafe Komeet offers fresh coffee, homemade cakes and panoramic views of Tallinn Bay.',
      ru: 'Кафе Komeet предлагает свежий кофе, домашние торты и панорамный вид на Таллиннский залив.'
    },
    location: { lat: 59.4420, lng: 24.7526 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.7,
    reviewCount: 234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Äripäeva Kirjastus',
    mainCategory: 'Teenused',
    subCategory: 'Kirjastused',
    category: 'Kirjastused',
    city: 'Tallinn',
    address: 'Pärnu mnt 105, Tallinn 19094',
    phone: '+372 667 0099',
    email: 'info@aripaev.ee',
    website: 'https://www.aripaev.ee',
    description: {
      et: 'Äripäev on Eesti juhtiv ärilehe kirjastus ja uudiste portaal.',
      en: 'Äripäev is Estonia\'s leading business newspaper publisher and news portal.',
      ru: 'Äripäev - ведущее эстонское издательство деловой газеты и новостной портал.'
    },
    location: { lat: 59.4085, lng: 24.6852 },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.2,
    reviewCount: 67,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Tehnopol',
    mainCategory: 'Teenused',
    subCategory: 'Ärikeskused',
    category: 'Ärikeskused',
    city: 'Tallinn',
    address: 'Akadeemia tee 21/6, Tallinn 12618',
    phone: '+372 671 9800',
    email: 'info@tehnopol.ee',
    website: 'https://www.tehnopol.ee',
    description: {
      et: 'Tehnopol on Eesti suurim teadus- ja tehnoloogiapark, mis toetab innovatsiooni ja ettevõtlust.',
      en: 'Tehnopol is Estonia\'s largest science and technology park supporting innovation and entrepreneurship.',
      ru: 'Tehnopol - крупнейший научно-технологический парк Эстонии, поддерживающий инновации и предпринимательство.'
    },
    location: { lat: 59.3950, lng: 24.6712 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.4,
    reviewCount: 45,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Ülemiste Keskus',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubanduskeskused',
    category: 'Kaubanduskeskused',
    city: 'Tallinn',
    address: 'Suur-Sõjamäe 4, Tallinn 11415',
    phone: '+372 665 8900',
    email: 'info@ulemistekeskus.ee',
    website: 'https://www.ulemistekeskus.ee',
    description: {
      et: 'Ülemiste Keskus on Baltimaade suurim kaubanduskeskus poodide, restoranide ja meelelahutusega.',
      en: 'Ülemiste Center is the largest shopping center in the Baltics with shops, restaurants and entertainment.',
      ru: 'Ülemiste Keskus - крупнейший торговый центр в Прибалтике с магазинами, ресторанами и развлечениями.'
    },
    location: { lat: 59.4231, lng: 24.8039 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.6,
    reviewCount: 892,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Klaus Restoranid',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Tallinn',
    address: 'Vene 10, Tallinn 10123',
    phone: '+372 640 7370',
    email: 'info@klausrestoran.ee',
    website: 'https://www.klausrestoran.ee',
    description: {
      et: 'Klaus pakub Eesti traditsioonilist kööki hubases keskaegsete hoonetega vanalinnas.',
      en: 'Klaus offers traditional Estonian cuisine in a cozy medieval setting in the Old Town.',
      ru: 'Klaus предлагает традиционную эстонскую кухню в уютной средневековой обстановке Старого города.'
    },
    location: { lat: 59.4368, lng: 24.7457 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.5,
    reviewCount: 312,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Narva Kreenholm',
    mainCategory: 'Kultuur',
    subCategory: 'Muuseumid',
    category: 'Muuseumid',
    city: 'Narva',
    address: 'Joala 3, Narva 20203',
    phone: '+372 359 4074',
    email: 'info@kreenholmi.ee',
    website: 'https://www.kreenholm.ee',
    description: {
      et: 'Kreenholm on ajalooline tekstiilivabriku kompleks ja kultuuripärandi objekt.',
      en: 'Kreenholm is a historic textile factory complex and cultural heritage site.',
      ru: 'Кренгольм - исторический комплекс текстильной фабрики и объект культурного наследия.'
    },
    location: { lat: 59.3776, lng: 28.1903 },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.3,
    reviewCount: 78,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Pärnu Rannahotell',
    mainCategory: 'Puhkus',
    subCategory: 'Hotellid',
    category: 'Hotellid',
    city: 'Pärnu',
    address: 'Ranna pst 1, Pärnu 80010',
    phone: '+372 447 3888',
    email: 'info@rannahotell.ee',
    website: 'https://www.rannahotell.ee',
    description: {
      et: 'Rannahotell on luksuslik spa-hotell otse Pärnu ranna ääres.',
      en: 'Rannahotell is a luxury spa hotel right on Pärnu beach.',
      ru: 'Rannahotell - роскошный спа-отель прямо на пляже Пярну.'
    },
    location: { lat: 58.3841, lng: 24.5005 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.7,
    reviewCount: 267,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Teletorni Kohvik',
    mainCategory: 'Toit',
    subCategory: 'Kohvikud',
    category: 'Kohvikud',
    city: 'Tallinn',
    address: 'Kloostrimetsa tee 58a, Tallinn 11913',
    phone: '+372 623 3250',
    email: 'info@teletorn.ee',
    website: 'https://www.teletorn.ee',
    description: {
      et: 'Teletorni kohvik asub 170 meetri kõrgusel ja pakub suurepäraseid vaateid Tallinnale.',
      en: 'TV Tower cafe is located 170 meters high and offers great views of Tallinn.',
      ru: 'Кафе Телебашни находится на высоте 170 метров и предлагает прекрасный вид на Таллинн.'
    },
    location: { lat: 59.4698, lng: 24.8685 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.6,
    reviewCount: 189,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Lõunakeskus',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubanduskeskused',
    category: 'Kaubanduskeskused',
    city: 'Tartu',
    address: 'Ringtee 75, Tartu 50501',
    phone: '+372 730 0777',
    email: 'info@lounakeskus.ee',
    website: 'https://www.lounakeskus.ee',
    description: {
      et: 'Lõunakeskus on Lõuna-Eesti suurim kaubandus- ja meelelahutuskeskus.',
      en: 'Lõunakeskus is the largest shopping and entertainment center in Southern Estonia.',
      ru: 'Lõunakeskus - крупнейший торгово-развлекательный центр в Южной Эстонии.'
    },
    location: { lat: 58.3641, lng: 26.7001 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 445,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Burger King Viru',
    mainCategory: 'Toit',
    subCategory: 'Kiirtoitlustus',
    category: 'Kiirtoitlustus',
    city: 'Tallinn',
    address: 'Viru väljak 4, Tallinn 10111',
    phone: '+372 610 1406',
    email: 'info@burgerking.ee',
    website: 'https://www.burgerking.ee',
    description: {
      et: 'Burger King pakub grillitud burgereid ja kiirtoiduroogasid.',
      en: 'Burger King offers grilled burgers and fast food.',
      ru: 'Burger King предлагает гриль-бургеры и фастфуд.'
    },
    location: { lat: 59.4372, lng: 24.7536 },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.0,
    reviewCount: 234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'La Bottega',
    mainCategory: 'Toit',
    subCategory: 'Restoranid',
    category: 'Restoranid',
    city: 'Tallinn',
    address: 'Vene 4, Tallinn 10123',
    phone: '+372 627 6397',
    email: 'info@labottega.ee',
    website: 'https://www.labottega.ee',
    description: {
      et: 'La Bottega on autentne Itaalia restoran vanalinnas, mis pakub päris Itaalia kööki.',
      en: 'La Bottega is an authentic Italian restaurant in Old Town offering genuine Italian cuisine.',
      ru: 'La Bottega - аутентичный итальянский ресторан в Старом городе, предлагающий настоящую итальянскую кухню.'
    },
    location: { lat: 59.4365, lng: 24.7459 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.6,
    reviewCount: 278,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Tasku Keskus',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubanduskeskused',
    category: 'Kaubanduskeskused',
    city: 'Tartu',
    address: 'Turu 2, Tartu 51004',
    phone: '+372 730 5200',
    email: 'info@tasku.ee',
    website: 'https://www.tasku.ee',
    description: {
      et: 'Tasku on Tartu kesklinnas asuv kaasaegne kaubanduskeskus.',
      en: 'Tasku is a modern shopping center in the center of Tartu.',
      ru: 'Tasku - современный торговый центр в центре Тарту.'
    },
    location: { lat: 58.3806, lng: 26.7226 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.4,
    reviewCount: 312,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Eesti Kunstimuuseum',
    mainCategory: 'Kultuur',
    subCategory: 'Muuseumid',
    category: 'Muuseumid',
    city: 'Tallinn',
    address: 'Weizenbergi 34, Tallinn 10127',
    phone: '+372 606 6400',
    email: 'info@ekm.ee',
    website: 'https://www.ekm.ee',
    description: {
      et: 'Kumu kunstimuuseum on Eesti suurim ja kõige moodsamam kunstimuuseum.',
      en: 'Kumu Art Museum is Estonia\'s largest and most modern art museum.',
      ru: 'Художественный музей Kumu - крупнейший и самый современный художественный музей Эстонии.'
    },
    location: { lat: 59.4358, lng: 24.7916 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.8,
    reviewCount: 567,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Seaplane Harbour',
    mainCategory: 'Kultuur',
    subCategory: 'Muuseumid',
    category: 'Muuseumid',
    city: 'Tallinn',
    address: 'Vesilennuki 6, Tallinn 10415',
    phone: '+372 620 0550',
    email: 'info@meremuuseum.ee',
    website: 'https://www.meremuuseum.ee',
    description: {
      et: 'Lennusadam on interaktiivne meremuuseum ajalooliste laevade ja allveelaevadega.',
      en: 'Seaplane Harbour is an interactive maritime museum with historic ships and submarines.',
      ru: 'Гавань гидросамолетов - интерактивный морской музей с историческими кораблями и подводными лодками.'
    },
    location: { lat: 59.4489, lng: 24.7346 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.9,
    reviewCount: 823,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Toomemägi Park',
    mainCategory: 'Puhkus',
    subCategory: 'Pargid',
    category: 'Pargid',
    city: 'Tartu',
    address: 'Lossi 25, Tartu 51003',
    phone: '+372 744 1111',
    email: 'info@tartu.ee',
    website: 'https://www.visitestonia.com',
    description: {
      et: 'Toomemägi on Tartu südames asuv ajalooline park, mis on populaarne puhkekohaks.',
      en: 'Toome Hill is a historic park in the heart of Tartu, popular for recreation.',
      ru: 'Тоомемяги - исторический парк в центре Тарту, популярное место для отдыха.'
    },
    location: { lat: 58.3799, lng: 26.7165 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.7,
    reviewCount: 198,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Tallinna Loomaaed',
    mainCategory: 'Puhkus',
    subCategory: 'Loomaaiad',
    category: 'Loomaaiad',
    city: 'Tallinn',
    address: 'Paldiski mnt 145, Tallinn 13522',
    phone: '+372 694 3300',
    email: 'tallinna.loomaaed@tallinnlv.ee',
    website: 'https://www.tallinnzoo.ee',
    description: {
      et: 'Tallinna Loomaaed on üks põhjalikumaid loomaaede Euroopas, kus elab üle 13 000 looma.',
      en: 'Tallinn Zoo is one of the most northern zoos in Europe with over 13,000 animals.',
      ru: 'Таллиннский зоопарк - один из самых северных зоопарков в Европе с более чем 13 000 животных.'
    },
    location: { lat: 59.4207, lng: 24.6531 },
    verified: true,
    isVerified: true,
    priority: 5,
    rating: 4.5,
    reviewCount: 678,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Rakvere Linnuse',
    mainCategory: 'Kultuur',
    subCategory: 'Muuseumid',
    category: 'Muuseumid',
    city: 'Rakvere',
    address: 'Vallimägi, Rakvere 44307',
    phone: '+372 322 5545',
    email: 'info@rakverelinnus.ee',
    website: 'https://www.rakverelinnus.ee',
    description: {
      et: 'Rakvere linnus on keskaegne kindlus, kus saab kogeda ajaloolist õhkkonda.',
      en: 'Rakvere Castle is a medieval fortress where you can experience a historical atmosphere.',
      ru: 'Раквереский замок - средневековая крепость, где можно ощутить историческую атмосферу.'
    },
    location: { lat: 59.3467, lng: 26.3581 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.6,
    reviewCount: 234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Paide Vallitorn',
    mainCategory: 'Kultuur',
    subCategory: 'Muuseumid',
    category: 'Muuseumid',
    city: 'Paide',
    address: 'Vallimäe 10, Paide 72712',
    phone: '+372 385 0555',
    email: 'info@paidelinnakeskus.ee',
    website: 'https://www.paidelinnakeskus.ee',
    description: {
      et: 'Paide Vallitorn on 13. sajandist pärit keskaegsete tornide kompleks.',
      en: 'Paide Rampart Tower is a 13th-century medieval tower complex.',
      ru: 'Башня Пайде - комплекс средневековых башен 13-го века.'
    },
    location: { lat: 58.8856, lng: 25.5575 },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.4,
    reviewCount: 112,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Alexela Tankla',
    mainCategory: 'Auto',
    subCategory: 'Tankla',
    category: 'Tankla',
    city: 'Tallinn',
    address: 'Peterburi tee 46, Tallinn 11415',
    phone: '+372 687 1200',
    email: 'info@alexela.ee',
    website: 'https://www.alexela.ee',
    description: {
      et: 'Alexela on Eesti tanklakett, mis pakub kütust ja autopesu teenuseid.',
      en: 'Alexela is an Estonian gas station chain offering fuel and car wash services.',
      ru: 'Alexela - эстонская сеть заправочных станций, предлагающая топливо и услуги автомойки.'
    },
    location: { lat: 59.4275, lng: 24.8150 },
    verified: true,
    isVerified: true,
    priority: 3,
    rating: 4.2,
    reviewCount: 145,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Sikupilli Keskus',
    mainCategory: 'Ostlemine',
    subCategory: 'Kaubanduskeskused',
    category: 'Kaubanduskeskused',
    city: 'Tallinn',
    address: 'Tartu mnt 24, Tallinn 10115',
    phone: '+372 665 9800',
    email: 'info@sikupillikeskus.ee',
    website: 'https://www.sikupillikeskus.ee',
    description: {
      et: 'Sikupilli Keskus on kaasaegne kaubanduskeskus poodide ja teenustega.',
      en: 'Sikupilli Center is a modern shopping center with shops and services.',
      ru: 'Sikupilli Keskus - современный торговый центр с магазинами и услугами.'
    },
    location: { lat: 59.4241, lng: 24.7789 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.3,
    reviewCount: 267,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Bolt Food',
    mainCategory: 'Teenused',
    subCategory: 'Toidukuller',
    category: 'Toidukuller',
    city: 'Tallinn',
    address: 'Vana-Lõuna 15, Tallinn 10134',
    phone: '+372 634 0000',
    email: 'info@bolt.eu',
    website: 'https://www.bolt.eu/food',
    description: {
      et: 'Bolt Food toob toidu sinu koju kiirest ja mugavalt.',
      en: 'Bolt Food delivers food to your home quickly and conveniently.',
      ru: 'Bolt Food доставляет еду на дом быстро и удобно.'
    },
    location: { lat: 59.4256, lng: 24.7455 },
    verified: true,
    isVerified: true,
    priority: 4,
    rating: 4.3,
    reviewCount: 1234,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function add30Companies() {
  console.log('🚀 Starting to add 30 real Estonian companies to Firestore...\n');
  
  try {
    const companiesRef = db.collection('companies');
    
    // Check existing companies
    const existingSnapshot = await companiesRef.get();
    console.log(`📊 Current companies in database: ${existingSnapshot.size}`);
    console.log('─'.repeat(60));
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Add companies
    for (const company of companies) {
      // Check if company already exists by name
      const existingCompany = await companiesRef
        .where('name', '==', company.name)
        .get();
      
      if (!existingCompany.empty) {
        console.log(`⏭️  Skipping "${company.name}" - already exists`);
        skippedCount++;
        continue;
      }
      
      const docRef = await companiesRef.add(company);
      console.log(`✅ Added: ${company.name}`);
      console.log(`   📍 ${company.city} | ${company.mainCategory} > ${company.subCategory}`);
      console.log(`   ⭐ Rating: ${company.rating} | Reviews: ${company.reviewCount}`);
      addedCount++;
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Added: ${addedCount} companies`);
    console.log(`   ⏭️  Skipped: ${skippedCount} companies (already exist)`);
    
    // Show final count
    const finalSnapshot = await companiesRef.get();
    console.log(`   📚 Total companies in database: ${finalSnapshot.size}`);
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error adding companies:', error);
    process.exit(1);
  }
}

add30Companies();
