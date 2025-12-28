// Kontrollitud.ee/frontend/src/constants/categories.js
// Multi-level category system

export const CATEGORIES = {
    'Puhkus': {
        icon: '🏖️',
        subcategories: ['SPA', 'Hotellid', 'Camping', 'Kuurordid', 'Wellness']
    },
    'Toit': {
        icon: '🍽️',
        subcategories: ['Restoranid', 'Kohvikud', 'Kiirtoitlustus', 'Baarid', 'Kohvikud']
    },
    'Auto': {
        icon: '🚗',
        subcategories: ['Autoteenus', 'Autopesu', 'Varuosad', 'Rehviteenus', 'Autopuhastus']
    },
    'Teenused': {
        icon: '🔧',
        subcategories: ['Koristus', 'Remont', 'Õigusteenused', 'Konsultatsioonid', 'IT teenused']
    },
    'Ilu': {
        icon: '💇',
        subcategories: ['Juuksurid', 'Küünesalongid', 'Kosmeetika', 'Massaaž', 'Barbershops']
    },
    'Ostlemine': {
        icon: '🛍️',
        subcategories: ['Poed', 'Kaubanduskeskused', 'Butiigid', 'Turud', 'E-poed']
    },
    'Lapsed': {
        icon: '👶',
        subcategories: ['Mänguväljakud', 'Lasteaiad', 'Laste tegevused', 'Mänguasja poed', 'Haridus']
    },
    'Reisimine': {
        icon: '✈️',
        subcategories: ['Reisibürood', 'Ekskursioonid', 'Autorent', 'Giidid', 'Transport']
    }
};

// Helper function to get all main categories
export const getMainCategories = () => {
    return Object.keys(CATEGORIES);
};

// Helper function to get subcategories for a main category
export const getSubcategories = (mainCategory) => {
    return CATEGORIES[mainCategory]?.subcategories || [];
};

// Helper function to get category icon
export const getCategoryIcon = (mainCategory) => {
    return CATEGORIES[mainCategory]?.icon || '📋';
};

// Helper function to check if a subcategory exists in any main category
export const findMainCategoryBySubcategory = (subcategory) => {
    for (const [mainCat, data] of Object.entries(CATEGORIES)) {
        if (data.subcategories.includes(subcategory)) {
            return mainCat;
        }
    }
    return null;
};

export default CATEGORIES;
