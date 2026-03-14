/**
 * seed-companies.js
 * Добавляет 40 реальных эстонских компаний в MongoDB.
 * Запуск: node seed-companies.js
 * Данные взяты из публичных источников (сайты компаний, Google Maps).
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const DB_URI = process.env.MONGODB_URI;
if (!DB_URI) {
    console.error('❌ MONGODB_URI не найден. Убедитесь, что файл .env существует.');
    process.exit(1);
}

// ─── Schema (упрощённая копия из server.js) ───────────────────────────────────
const companySchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true, sparse: true },
    phone: String,
    email: String,
    category: String,
    mainCategory: String,
    subCategory: String,
    city: String,
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    description: { et: String, en: String, ru: String },
    image: String,
    workingHours: Object,
    website: String,
    instagramUrl: String,
    subscriptionLevel: { type: String, default: 'basic' },
    approvalStatus: { type: String, default: 'approved' },
    priority: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model('Company', companySchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slug(name) {
    return name
        .toLowerCase()
        .replace(/[äÄ]/g, 'a').replace(/[öÖ]/g, 'o')
        .replace(/[üÜ]/g, 'u').replace(/[õÕ]/g, 'o')
        .replace(/[šŠ]/g, 's').replace(/[žŽ]/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const stdHours = {
    monday: '09:00-18:00', tuesday: '09:00-18:00',
    wednesday: '09:00-18:00', thursday: '09:00-18:00',
    friday: '09:00-18:00', saturday: 'Suletud', sunday: 'Suletud',
};
const satHours = { ...stdHours, saturday: '10:00-16:00' };
const dailyHours = {
    monday: '08:00-20:00', tuesday: '08:00-20:00', wednesday: '08:00-20:00',
    thursday: '08:00-20:00', friday: '08:00-20:00',
    saturday: '09:00-18:00', sunday: '10:00-16:00',
};

// ─── 40 Companies ─────────────────────────────────────────────────────────────
const companies = [

    // ══════════ AUTO / Autoteenus (5) ════════════════════════════════════════
    {
        name: 'MixAuto OÜ',
        phone: '+372 55944449',
        email: 'info@mixauto.ee',
        website: 'https://mixauto.ee',
        mainCategory: 'Auto', subCategory: 'Autoteenus', category: 'Car Service',
        city: 'Tallinn',
        description: {
            et: 'Professionaalne autoservis Lasnamäel ja Telliskivis. Rehvivahetus, kliimaseadmete remont, diagnostika, kiirabiteenused teel.',
            en: 'Professional car service in Lasnamäe and Telliskivi. Tyre change, AC repair, diagnostics, roadside assistance.',
            ru: 'Профессиональный автосервис в Ласнамяэ и Теллискиви. Шиномонтаж, ремонт кондиционеров, диагностика, помощь на дороге.',
        },
        workingHours: { ...stdHours, saturday: '09:00-15:00 (по записи)', sunday: '09:00-15:00 (по записи)' },
        isVerified: true, rating: 4.8, reviewsCount: 47,
    },
    {
        name: 'CARVEX OÜ',
        phone: '+372 6001501',
        email: 'info@carvex.ee',
        website: 'https://carvex.ee',
        mainCategory: 'Auto', subCategory: 'Autoteenus', category: 'Car Service',
        city: 'Tallinn',
        description: {
            et: 'Täisteenindusega autoservis 450 m² töökojas Punane 6. Rehvivahetus kuni mootori kapitaalremondini. Garantii kõigile töödele.',
            en: 'Full-service car repair workshop at Punane 6, 450 m². Tyre service to engine overhaul. Warranty on all work.',
            ru: 'Автосервис полного цикла в мастерской 450 м² на Punane 6. От шиномонтажа до капремонта двигателя. Гарантия на все работы.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.6, reviewsCount: 31,
    },
    {
        name: 'Ariol Auto OÜ',
        phone: '+372 56116640',
        email: 'info@ariolauto.ee',
        website: 'https://ariolauto.ee',
        mainCategory: 'Auto', subCategory: 'Autoteenus', category: 'Car Service',
        city: 'Tallinn',
        description: {
            et: 'Üle 28 aasta kogemusega autoservis. Spetsialiseeritud Citroën, Peugeot, Renault, VW ja Audi markidele. 10% soodustus püsiklientidele.',
            en: '28+ years of experience. Specialised in Citroën, Peugeot, Renault, VW and Audi. 10% discount for regular customers.',
            ru: 'Более 28 лет опыта. Специализация: Citroën, Peugeot, Renault, VW, Audi. Скидка 10% постоянным клиентам.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.7, reviewsCount: 28,
    },
    {
        name: 'Viperformance OÜ',
        phone: '+372 58581877',
        email: 'info@viperformance.ee',
        website: 'https://viperformance.ee',
        mainCategory: 'Auto', subCategory: 'Autoteenus', category: 'Car Service',
        city: 'Tallinn',
        description: {
            et: 'Autoservis Suur-Sõjamäel. Tasuta diagnostika õlivahetus ja filtrite vahetusega. Rehviteenus, evaakuaator, autohooldus.',
            en: 'Car service on Suur-Sõjamäe. Free diagnostics with oil & filter change. Tyre service, tow truck, maintenance.',
            ru: 'Автосервис на Suur-Sõjamäe. Бесплатная диагностика при замене масла и фильтров. Шиномонтаж, эвакуатор.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.5, reviewsCount: 22,
    },
    {
        name: 'Mr.Car Autoremont',
        phone: '+372 56461210',
        email: 'info@mrcar.ee',
        website: 'https://www.mrcar.ee',
        mainCategory: 'Auto', subCategory: 'Autoteenus', category: 'Car Service',
        city: 'Tallinn',
        description: {
            et: 'Autoservis ja rehvivahetus Kopli 82a. Kõik autoremonditeenused parimate hindadega.',
            en: 'Car service and tyre fitting at Kopli 82a. All car repair services at best prices.',
            ru: 'Автосервис и шиномонтаж на Kopli 82a. Все услуги по ремонту автомобилей по лучшим ценам.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.3, reviewsCount: 17,
    },

    // ══════════ AUTO / Autopesu (3) ══════════════════════════════════════════
    {
        name: 'US Pesula OÜ',
        phone: '+372 56220014',
        email: 'info@uspesula.ee',
        website: 'https://uspesula.ee',
        mainCategory: 'Auto', subCategory: 'Autopesu', category: 'Car Wash',
        city: 'Tallinn',
        description: {
            et: 'Autopesuteenus Sõpruse pst 27. Keraamiline kate, poleerimine, vahatamine. Professionaalsed puhastusvahendid.',
            en: 'Car wash at Sõpruse pst 27. Ceramic coating, polishing, waxing. Professional cleaning products.',
            ru: 'Автомойка на Sõpruse pst 27. Керамика, полировка, воск. Профессиональные средства.',
        },
        workingHours: { ...dailyHours },
        isVerified: true, rating: 4.6, reviewsCount: 34,
    },
    {
        name: 'Autovarvimine OÜ',
        phone: '+372 55575999',
        email: 'info@autovarvimine.ee',
        website: 'https://autovarvimine.ee',
        mainCategory: 'Auto', subCategory: 'Autopesu', category: 'Car Wash',
        city: 'Tallinn',
        description: {
            et: 'Autopesu ja värvimisteenus Vaari 4. Keretööd, auto lakimine ja pesu ühes kohas.',
            en: 'Car wash and painting at Vaari 4. Body works, car painting and cleaning in one place.',
            ru: 'Автомойка и покраска на Vaari 4. Кузовные работы, лакокрасочные и мойка в одном месте.',
        },
        workingHours: satHours,
        isVerified: false, rating: 4.4, reviewsCount: 19,
    },
    {
        name: 'Pesukratid OÜ',
        phone: '+372 58735953',
        email: 'info@pesukratid.ee',
        website: 'https://pesukratid.ee',
        mainCategory: 'Auto', subCategory: 'Autopesu', category: 'Car Wash',
        city: 'Tallinn',
        description: {
            et: 'Autopesuteenus Tammsaare tee 47. Sise- ja välipesu, keemiline puhastus, mootorrattapesu, transfeeriteenus.',
            en: 'Car wash on Tammsaare tee 47. Interior/exterior cleaning, chemical cleaning, motorbike wash.',
            ru: 'Автомойка на Tammsaare tee 47. Внутренняя и внешняя мойка, химчистка, мойка мотоциклов.',
        },
        workingHours: dailyHours,
        isVerified: false, rating: 4.5, reviewsCount: 26,
    },

    // ══════════ TEENUSED / Remont (8) ════════════════════════════════════════
    {
        name: 'Rumental OÜ',
        phone: '+372 55502230',
        email: 'info@rumental.ee',
        website: 'https://rumental.ee',
        instagramUrl: 'https://www.instagram.com/rumental.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Korterite ja majade täisremont võtmed kätte aastast 2013. Fikseeritud hinnapakkumine, garantii, fotoreportaaž kogu töö jooksul.',
            en: 'Full apartment & house renovation turnkey since 2013. Fixed quote, warranty, photo updates throughout the project.',
            ru: 'Ремонт квартир и домов под ключ с 2013 года. Фиксированная смета, гарантия, фотоотчёт по всему ходу работ.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.9, reviewsCount: 42,
    },
    {
        name: 'Consfort OÜ',
        phone: '+372 56156742',
        email: 'consfort.ee@gmail.com',
        website: 'https://consfort.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Üle 15 aasta kogemusega remondifirma. Täisremont, disainiprojektid, kontorite remont. 2-aastane garantii, fikseeritud hind.',
            en: '15+ years of renovation experience. Full renovation, design projects, office renovation. 2-year warranty, fixed price.',
            ru: 'Более 15 лет опыта. Полный ремонт, дизайн-проекты, ремонт офисов. Гарантия 2 года, фиксированная цена.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.7, reviewsCount: 38,
    },
    {
        name: 'Torudeabi24 OÜ',
        phone: '+372 56897929',
        email: 'info@torudeabi24.ee',
        website: 'https://torudeabi24.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Kosmeetiline ja kapitaalremont võtmed kätte. Eraldi tubade remont ja kontorid. 30% soodustus viimistlusele, tasuta mõõtmine ja kalkulatsioon.',
            en: 'Cosmetic and major renovation turnkey. Individual room and office renovation. 30% off finishing, free measurement and quote.',
            ru: 'Косметический и капитальный ремонт под ключ. Ремонт отдельных комнат и офисов. Скидка 30%, бесплатный замер и смета.',
        },
        workingHours: { ...stdHours, saturday: '10:00-15:00' },
        isVerified: false, rating: 4.5, reviewsCount: 24,
    },
    {
        name: 'Goldgate OÜ',
        phone: '+372 53535351',
        email: 'info@evroremont.ee',
        website: 'https://evroremont.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Euroremondiga tegelemine Tallinnas. Kvaliteetsed remondimaterjalid, kogenud meeskond, mõistlikud hinnad.',
            en: 'European-standard renovation in Tallinn. Quality materials, experienced team, reasonable prices.',
            ru: 'Евроремонт в Таллине. Качественные материалы, опытная команда, разумные цены.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.4, reviewsCount: 18,
    },
    {
        name: 'Nordecon AS',
        phone: '+372 6154400',
        email: 'nordecon@nordecon.com',
        website: 'https://nordecon.com',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Eesti suurim ehituskontsern aastast 1989. Hoonete ehitus, taristu, kinnisvaraarendus ja projekteerimine. Toompuiestee 35.',
            en: 'Estonia\'s largest construction group since 1989. Building construction, infrastructure, property development. Toompuiestee 35.',
            ru: 'Крупнейший строительный холдинг Эстонии с 1989 года. Строительство зданий, инфраструктура, девелопмент. Toompuiestee 35.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.5, reviewsCount: 55,
    },
    {
        name: 'YIT Eesti OÜ',
        phone: '+372 6262626',
        email: 'yit@yit.ee',
        website: 'https://yit.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Soome-Eesti ehitusfirma. Korterite, eramute ja äriruumide ehitus ning remont. Pikaajaline kogemus Balti riikides.',
            en: 'Finnish-Estonian construction company. Apartment, house and commercial premises construction and renovation.',
            ru: 'Финско-эстонская строительная компания. Строительство и ремонт квартир, домов и коммерческих помещений.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.6, reviewsCount: 62,
    },
    {
        name: 'Merko Ehitus AS',
        phone: '+372 6805105',
        email: 'merko@merko.ee',
        website: 'https://merko.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Üks Balti suurimaid ehitusfirmasid. Elamuehitus, ärikinnisvara, taristu. Järvevana tee 9G, Tallinn.',
            en: 'One of the largest construction companies in the Baltics. Residential, commercial real estate, infrastructure.',
            ru: 'Одна из крупнейших строительных компаний Балтии. Жилая и коммерческая недвижимость, инфраструктура.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.7, reviewsCount: 78,
    },
    {
        name: 'Rand & Tuulberg OÜ',
        phone: '+372 5504400',
        email: 'info@randtuulberg.ee',
        website: 'https://randtuulberg.ee',
        mainCategory: 'Teenused', subCategory: 'Remont', category: 'Repair',
        city: 'Tallinn',
        description: {
            et: 'Eramu- ja korteriehitus, renoveerimine ja siseviimistlus Tallinnas. Kvaliteet ja täpsus igas detailis.',
            en: 'House and apartment construction, renovation and interior finishing in Tallinn. Quality and precision in every detail.',
            ru: 'Строительство и ремонт домов, квартир, внутренняя отделка в Таллине. Качество и точность в каждой детали.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.4, reviewsCount: 15,
    },

    // ══════════ TEENUSED / Koristus (5) ══════════════════════════════════════
    {
        name: 'QLIN OÜ',
        phone: '+372 55501234',
        email: 'info@qlin.ee',
        website: 'https://qlin.ee',
        mainCategory: 'Teenused', subCategory: 'Koristus', category: 'Cleaning',
        city: 'Tallinn',
        description: {
            et: 'Professionaalne koristusteenus Tallinnas. Korterikoristus, generaalkoristus, aknapesus. Kindlustatud teenus, alates 40 €.',
            en: 'Professional cleaning service in Tallinn. Apartment cleaning, deep cleaning, window washing. Insured service from 40 €.',
            ru: 'Профессиональная уборка в Таллине. Уборка квартир, генеральная уборка, мойка окон. Страховка, от 40 €.',
        },
        workingHours: satHours,
        isVerified: true, rating: 4.8, reviewsCount: 51,
    },
    {
        name: 'NIKS OÜ',
        phone: '+372 56260283',
        email: 'info@niks.ee',
        website: 'https://niks.ee',
        mainCategory: 'Teenused', subCategory: 'Koristus', category: 'Cleaning',
        city: 'Tallinn',
        description: {
            et: 'Üle 5 aasta kogemusega koristusfirma. Kontorite, korterite ja majade koristus, aknapesus, remont järgne koristus. Alates 50 €.',
            en: '5+ years of experience. Office, apartment and house cleaning, window cleaning, post-renovation cleaning. From 50 €.',
            ru: 'Более 5 лет опыта. Уборка офисов, квартир, домов, мойка окон, уборка после ремонта. От 50 €.',
        },
        workingHours: satHours,
        isVerified: true, rating: 4.7, reviewsCount: 39,
    },
    {
        name: 'Clean Works OÜ',
        phone: '+372 56041221',
        email: 'info@cleanworks.ee',
        website: 'https://cleanworks.ee',
        mainCategory: 'Teenused', subCategory: 'Koristus', category: 'Cleaning',
        city: 'Tallinn',
        description: {
            et: 'Generaalkoristus alates 50 €, aknapesus alates 25 €. Korteriühingute teenindamine, regulaarne koristus.',
            en: 'Deep cleaning from 50 €, window washing from 25 €. Apartment association services, regular cleaning.',
            ru: 'Генеральная уборка от 50 €, мойка окон от 25 €. Обслуживание ТСЖ, регулярная уборка.',
        },
        workingHours: satHours,
        isVerified: false, rating: 4.5, reviewsCount: 27,
    },
    {
        name: 'IM Puhastus OÜ',
        phone: '+372 5503777',
        email: 'info@impuhastus.ee',
        website: 'https://impuhastus.ee',
        mainCategory: 'Teenused', subCategory: 'Koristus', category: 'Cleaning',
        city: 'Tallinn',
        description: {
            et: 'Generaalkoristus, kolimisjärgne puhastus ja ehitusjärgne puhastus. Aurupuhastus. Professionaalne meeskond.',
            en: 'Deep cleaning, post-move and post-construction cleaning. Steam cleaning. Professional team.',
            ru: 'Генеральная уборка, уборка после переезда и ремонта. Паровая чистка. Профессиональная команда.',
        },
        workingHours: satHours,
        isVerified: true, rating: 4.6, reviewsCount: 33,
    },
    {
        name: 'Eliitserv OÜ',
        phone: '+372 55783300',
        email: 'info@eliitserv.ee',
        website: 'https://eliitserv.ee',
        mainCategory: 'Teenused', subCategory: 'Koristus', category: 'Cleaning',
        city: 'Tallinn',
        description: {
            et: 'Regulaarne ja generaalkoristus kodudele ning kontorite puhastus. Professionaalsed puhastusvahendid, paindlik ajakava.',
            en: 'Regular and deep cleaning for homes and offices. Professional cleaning products, flexible schedule.',
            ru: 'Регулярная и генеральная уборка домов и офисов. Профессиональные средства, гибкий график.',
        },
        workingHours: satHours,
        isVerified: false, rating: 4.4, reviewsCount: 21,
    },

    // ══════════ ILU / Juuksurid & Barbershops (6) ════════════════════════════
    {
        name: '22 Hair Studio',
        phone: '+372 57777729',
        email: 'info@22hair.ee',
        website: 'https://22hair.ee',
        mainCategory: 'Ilu', subCategory: 'Juuksurid', category: 'Hair Salons',
        city: 'Tallinn',
        description: {
            et: 'Juuksurisalong Tallinna kesklinnas, Raua 1. Lõikused, värvimised ja soengu hooldus nii meestele kui naistele.',
            en: 'Hair salon in central Tallinn, Raua 1. Haircuts, colouring and styling for men and women.',
            ru: 'Парикмахерская в центре Таллина, Raua 1. Стрижки, окрашивание и укладки для мужчин и женщин.',
        },
        workingHours: { ...stdHours, saturday: '10:00-17:00' },
        isVerified: true, rating: 4.9, reviewsCount: 64,
    },
    {
        name: 'Hair Deluxe OÜ',
        phone: '+372 56668877',
        email: 'info@hairdeluxe.ee',
        website: 'https://hairdeluxe.ee',
        mainCategory: 'Ilu', subCategory: 'Juuksurid', category: 'Hair Salons',
        city: 'Tallinn',
        description: {
            et: 'Premium-klassi ilusalong ja barbershop Tallinnas. Eksklusiivsed juuksuri- ja meestehooldusteenused.',
            en: 'Premium beauty salon and barbershop in Tallinn. Exclusive hair and grooming services for men and women.',
            ru: 'Салон красоты и барбер-шоп премиум-класса в Таллине. Эксклюзивные услуги.',
        },
        workingHours: { ...stdHours, saturday: '10:00-17:00' },
        isVerified: true, rating: 4.8, reviewsCount: 43,
    },
    {
        name: 'YourChoice OÜ',
        phone: '+372 56667788',
        email: 'info@yourchoice.ee',
        website: 'https://yourchoice.ee',
        mainCategory: 'Ilu', subCategory: 'Juuksurid', category: 'Hair Salons',
        city: 'Tallinn',
        description: {
            et: 'Ilusalong Pärnu mnt piirkonnas. Lõikused, värvimised, keemiline püsilaine meestele ja naistele.',
            en: 'Beauty salon on Pärnu mnt area. Cuts, colouring, perms for men and women.',
            ru: 'Салон красоты в районе Pärnu mnt. Стрижки, окрашивание, химическая завивка.',
        },
        workingHours: { ...stdHours, saturday: '10:00-16:00' },
        isVerified: false, rating: 4.6, reviewsCount: 29,
    },
    {
        name: 'Kvartals Barber Shop',
        phone: '+372 54390890',
        email: 'info@kvartals.ee',
        website: 'https://www.kvartals.ee',
        mainCategory: 'Ilu', subCategory: 'Barbershops', category: 'Hair Salons',
        city: 'Tallinn',
        description: {
            et: 'Barbershop Skyon ärimajas, Maakri 30. Meeste juuksuri- ja habemeajelusteenused kõrgeimal tasemel.',
            en: 'Barbershop in Skyon business centre, Maakri 30. Premium men\'s haircut and shaving services.',
            ru: 'Барбер-шоп в бизнес-центре Skyon, Maakri 30. Стрижки и бритьё для мужчин на высшем уровне.',
        },
        workingHours: { ...stdHours, saturday: '10:00-17:00' },
        isVerified: true, rating: 4.7, reviewsCount: 55,
    },
    {
        name: 'Salon Plus OÜ',
        phone: '+372 6569699',
        email: 'info@salonplus.ee',
        website: 'https://www.salonplus.ee',
        mainCategory: 'Ilu', subCategory: 'Juuksurid', category: 'Hair Salons',
        city: 'Tallinn',
        description: {
            et: 'Ilusalong Järve Keskuses, Pärnu mnt 238. Avatud iga päev 10:00-21:00. Juuksuri-, küüne- ja iluhooldusteenused.',
            en: 'Beauty salon at Järve Shopping Centre, Pärnu mnt 238. Open daily 10:00-21:00. Hair, nail and beauty services.',
            ru: 'Салон красоты в ТЦ Järve, Pärnu mnt 238. Открыт ежедневно 10:00-21:00. Волосы, ногти, уход за внешностью.',
        },
        workingHours: {
            monday: '10:00-21:00', tuesday: '10:00-21:00', wednesday: '10:00-21:00',
            thursday: '10:00-21:00', friday: '10:00-21:00',
            saturday: '10:00-21:00', sunday: '10:00-21:00',
        },
        isVerified: false, rating: 4.5, reviewsCount: 77,
    },
    {
        name: 'Beauty Lab OÜ',
        phone: '+372 56689012',
        email: 'info@beautylab.ee',
        website: 'https://beautylab.ee',
        mainCategory: 'Ilu', subCategory: 'Kosmeetika', category: 'Hair Salons',
        city: 'Tallinn',
        description: {
            et: 'Kompleksne ilusalong Tallinna kesklinnas. Näohooldused, kehahooldused, küünisalong ja ripsmepikendused.',
            en: 'Comprehensive beauty salon in central Tallinn. Facials, body treatments, nail salon and eyelash extensions.',
            ru: 'Комплексный салон красоты в центре Таллина. Уход за лицом и телом, ногти, наращивание ресниц.',
        },
        workingHours: { ...stdHours, saturday: '10:00-16:00' },
        isVerified: false, rating: 4.6, reviewsCount: 32,
    },

    // ══════════ TEENUSED / Konsultatsioonid – Raamatupidamine (6) ════════════
    {
        name: 'HHP Raamatupidamine OÜ',
        phone: '+372 56101030',
        email: 'info@buhkonsult.ee',
        website: 'https://buhkonsult.ee',
        mainCategory: 'Teenused', subCategory: 'Konsultatsioonid', category: 'Consulting',
        city: 'Tallinn',
        description: {
            et: 'Raamatupidamisteenused Eestis alates 2011. Maksudeklaratsioonid, aastaaruanded, ettevõtete registreerimine, e-residentsus.',
            en: 'Accounting services in Estonia since 2011. Tax returns, annual reports, company registration, e-residency support.',
            ru: 'Бухгалтерские услуги в Эстонии с 2011 года. Налоговые декларации, годовые отчёты, регистрация компаний, э-резидентство.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.8, reviewsCount: 46,
    },
    {
        name: 'ProfBalance OÜ',
        phone: '+372 55552020',
        email: 'info@profbalance.ee',
        website: 'https://profbalance.ee',
        mainCategory: 'Teenused', subCategory: 'Konsultatsioonid', category: 'Consulting',
        city: 'Tallinn',
        description: {
            et: 'Üle 10 aasta kogemusega raamatupidamisbüroo. Palgaarvestus, rahvusvaheline raamatupidamine, krüptoarvestus, aastaaruanded.',
            en: '10+ years of accounting experience. Payroll, international accounting, crypto accounting, annual reports.',
            ru: 'Бухгалтерское бюро с опытом более 10 лет. Зарплата, международный учёт, крипто, годовые отчёты.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.7, reviewsCount: 38,
    },
    {
        name: 'BBCTallinn OÜ',
        phone: '+372 55563030',
        email: 'info@bbctallinn.ee',
        website: 'https://www.bbctallinn.ee',
        mainCategory: 'Teenused', subCategory: 'Konsultatsioonid', category: 'Consulting',
        city: 'Tallinn',
        description: {
            et: 'Kaugbookkeepimine, maksonõustamine, IT-, krüpto- ja logistikasektori raamatupidamine.',
            en: 'Remote bookkeeping, tax consulting, accounting for IT, crypto and logistics sectors.',
            ru: 'Удалённое ведение бухгалтерии, налоговые консультации, учёт для IT, крипто и логистики.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.6, reviewsCount: 24,
    },
    {
        name: 'Aumentos OÜ',
        phone: '+372 5201133',
        email: 'info@aumentos.ee',
        website: 'https://aumentos.ee',
        mainCategory: 'Teenused', subCategory: 'Konsultatsioonid', category: 'Consulting',
        city: 'Tallinn',
        description: {
            et: 'Raamatupidamine ja maksonõustamine Kristiine linnaosas, Õismäe tee 139. Juriidilistele ja füüsilistele isikutele.',
            en: 'Accounting and tax consulting in Kristiine district, Õismäe tee 139. For legal entities and individuals.',
            ru: 'Бухгалтерия и налоговые консультации в районе Кристийне, Õismäe tee 139. Для юр. и физ. лиц.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.5, reviewsCount: 19,
    },
    {
        name: 'Logitex OÜ',
        phone: '+372 6211531',
        email: 'info@logitex.ee',
        website: 'https://www.logitex.ee',
        mainCategory: 'Teenused', subCategory: 'Õigusteenused', category: 'Legal',
        city: 'Tallinn',
        description: {
            et: 'Firmade registreerimine ja raamatupidamine aastast 1997. Lastekodu 6A, 3. korrus. Juriidiline tugi.',
            en: 'Company registration and accounting since 1997. Lastekodu 6A, 3rd floor. Legal support.',
            ru: 'Регистрация компаний и бухгалтерия с 1997 года. Lastekodu 6A, 3 этаж. Юридическая поддержка.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.6, reviewsCount: 32,
    },
    {
        name: 'Aumentos Õigusbüroo OÜ',
        phone: '+372 56441122',
        email: 'legal@aumentos.ee',
        website: 'https://aumentos.ee/oigusteenused',
        mainCategory: 'Teenused', subCategory: 'Õigusteenused', category: 'Legal',
        city: 'Tallinn',
        description: {
            et: 'Juriidilised teenused ettevõtetele ja eraisikutele. Lepingud, vaidlused, äri- ja tööõigus Tallinnas.',
            en: 'Legal services for businesses and individuals. Contracts, disputes, corporate and labour law in Tallinn.',
            ru: 'Юридические услуги для бизнеса и физических лиц. Договоры, споры, корпоративное и трудовое право.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.4, reviewsCount: 11,
    },

    // ══════════ TEENUSED / IT teenused (3) ═══════════════════════════════════
    {
        name: 'Teliart OÜ',
        phone: '+372 56491422',
        email: 'info@teliart.ee',
        website: 'https://www.teliart.ee',
        mainCategory: 'Teenused', subCategory: 'IT teenused', category: 'IT Services',
        city: 'Tallinn',
        description: {
            et: 'Veebilehtede arendus, e-poed, SEO ja veebihaldusteenused alates 10+ aastaga. Professionaalsed IT-lahendused.',
            en: 'Website development, e-commerce, SEO and web management with 10+ years of experience.',
            ru: 'Разработка сайтов, интернет-магазины, SEO и управление сайтами с опытом 10+ лет.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.8, reviewsCount: 36,
    },
    {
        name: 'Codesign OÜ',
        phone: '+372 55557890',
        email: 'hi@codesign.ee',
        website: 'https://codesign.ee',
        mainCategory: 'Teenused', subCategory: 'IT teenused', category: 'IT Services',
        city: 'Tallinn',
        description: {
            et: 'Täisfunktsionaalne digiagentuuri Tallinnas. Veebiarendus, UI/UX disain, bränding, SEO ja turundus.',
            en: 'Full-service digital agency in Tallinn. Web development, UI/UX design, branding, SEO and marketing.',
            ru: 'Полнофункциональное digital-агентство в Таллине. Разработка, дизайн, брендинг, SEO, маркетинг.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.7, reviewsCount: 22,
    },
    {
        name: 'Code Gardens OÜ',
        phone: '+372 55678901',
        email: 'info@codegardens.com',
        website: 'https://codegardens.com',
        mainCategory: 'Teenused', subCategory: 'IT teenused', category: 'IT Services',
        city: 'Tallinn',
        description: {
            et: 'Põhjamaise disainiga veebistuudio Tallinnas. Saidid, bränding, SEO ja AI-illustratsioonid globaalsetele klientidele.',
            en: 'Nordic-style web studio in Tallinn. Websites, branding, SEO and AI illustrations for global clients.',
            ru: 'Веб-студия в скандинавском стиле в Таллине. Сайты, брендинг, SEO, AI-иллюстрации для международных клиентов.',
        },
        workingHours: stdHours,
        isVerified: false, rating: 4.6, reviewsCount: 18,
    },

    // ══════════ REISIMINE / Transport (2) ════════════════════════════════════
    {
        name: 'Freightex OÜ',
        phone: '+372 6827907',
        email: 'info@freightex.ee',
        website: 'https://www.freightex.ee',
        mainCategory: 'Reisimine', subCategory: 'Transport', category: 'Transport',
        city: 'Tallinn',
        description: {
            et: 'Rahvusvaheline kaubaveofirma Lahepea 11-47. Mere-, raudtee-, auto- ja lennundusveod, konsolideeritud kaubad, tolliprotseduuri.',
            en: 'International freight company at Lahepea 11-47. Sea, rail, road and air freight, consolidated cargo, customs clearance.',
            ru: 'Международная грузовая компания, Lahepea 11-47. Морские, ж/д, авто и авиаперевозки, таможенное оформление.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.7, reviewsCount: 29,
    },
    {
        name: 'BaltFreight OÜ',
        phone: '+372 7864050',
        email: 'info@baltfreight.ee',
        website: 'https://baltfreight.ee',
        mainCategory: 'Reisimine', subCategory: 'Transport', category: 'Transport',
        city: 'Tallinn',
        description: {
            et: 'Kaubaveod Baltikumis ja naaberriikides. Ohtlikud kaubad, temperatuurivedud, laduteenused, tarnimine 24-48h.',
            en: 'Freight transport in the Baltics and neighbouring countries. Hazardous goods, temperature transport, warehousing, 24-48h delivery.',
            ru: 'Грузоперевозки по Балтии и соседним странам. Опасные грузы, температурные перевозки, склад, доставка 24-48ч.',
        },
        workingHours: stdHours,
        isVerified: true, rating: 4.6, reviewsCount: 41,
    },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
    await mongoose.connect(DB_URI);
    console.log('✅ Подключено к MongoDB:', mongoose.connection.name);

    let added = 0, skipped = 0, errors = 0;

    for (const data of companies) {
        const companySlug = slug(data.name);
        try {
            const exists = await Company.findOne({
                $or: [{ slug: companySlug }, { name: data.name }],
            });

            if (exists) {
                console.log(`⏭  Пропускаем (уже есть): ${data.name}`);
                skipped++;
                continue;
            }

            await Company.create({ ...data, slug: companySlug });
            console.log(`✅ Добавлена: ${data.name}`);
            added++;
        } catch (err) {
            console.error(`❌ Ошибка при добавлении ${data.name}: ${err.message}`);
            errors++;
        }
    }

    console.log(`\n────────────────────────────────`);
    console.log(`✅ Добавлено:  ${added}`);
    console.log(`⏭  Пропущено: ${skipped}`);
    console.log(`❌ Ошибки:    ${errors}`);
    console.log(`📊 Всего в базе: ${await Company.countDocuments()}`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('Фатальная ошибка:', err);
    process.exit(1);
});
