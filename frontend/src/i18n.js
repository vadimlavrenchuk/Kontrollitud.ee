import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Файлы с переводами (будем расширять по мере работы)
const resources = {
  ru: { // Русский
    translation: {
      "app_title": "Kontrollitud.ee EE",
      "slogan": "Каталог проверенных компаний",
      "details_button": "Подробнее",
      "add_company": "+ Добавить компанию",
      "loading": "Загрузка...",
      "company_name": "Название компании",
      "contact_email": "Email для связи",
      "error": "Ошибка:",
      "fetch_error": "Не удалось загрузить данные",
      "company_catalog_title": "Каталог компаний",
      "search_placeholder": "Поиск по названию или описанию...",
      "reset_button": "Сброс",
      "reset_filters_tooltip": "Сбросить все фильтры",
      "all": "Все",
      
      // 🟢 СТАТУСЫ ВЕРИФИКАЦИИ КОМПАНИЙ
      "status_filter_label": "Статус верификации",
      "status_verified": "Проверено",
      "status_pending": "Ожидает проверки",
      "status_rejected": "Отклонено",
      
      "verified": "Проверено",
      "pending": "Ожидает",
      "rejected": "Отклонено",
      "verification_status": "Статус верификации",
      "description": "Описание",
      "verified_status": "Проверено",
      "company_added": "Компания добавлена",
      "back_to_list": "Назад к списку",
      "submit_error": "Не удалось сохранить компанию",
       // 🟢 НОВЫЕ КЛЮЧИ:
      "company_not_found": "Компания не найдена",
      "no_company_data": "Нет данных о компании",
      "reviews": "отзывов",
      "customer_reviews": "Отзывы клиентов",
      "add_your_review": "Оставить отзыв",
      "your_name": "Ваше имя",
      "anonymous_placeholder": "Анонимно (если пусто)",
      "rating": "Оценка",
      "stars": "звезд",
      "comment": "Комментарий",
      "submit_review": "Отправить отзыв",
      "submitting": "Отправка...",
      "review_submit_error": "Не удалось отправить отзыв",
      "review_submitted_success": "Спасибо! Ваш отзыв отправлен.",
      "reviews_load_error": "Не удалось загрузить отзывы.",
      "no_reviews_yet": "Отзывов пока нет. Будьте первым!",
      "category": "Категория" // Добавляем, если не было
    }
  },
  et: { // Эстонский
    translation: {
      // ... (переводы на эстонский)
      "app_title": "Kontrollitud.ee EE",
      "slogan": "Kontrollitud ettevõtete kataloog", // 🟢 Убедись, что этот ключ есть
      "details_button": "Vaata lähemalt", // 🟢 Убедись, что этот ключ есть
      "add_company": "+ Lisa ettevõte",
      "loading": "Laadimine...", // 🟢 Убедись, что этот ключ есть
      "company_name": "Ettevõtte nimi",
      "contact_email": "Kontakti e-post",
      "error": "Viga:",
      "fetch_error": "Andmete laadimine ebaõnnestus",
      // 🟢 ПРОВЕРЬТЕ ЭТИ КЛЮЧИ:
      "company_catalog_title": "Ettevõtete kataloog",
      "search_placeholder": "Otsi nime või kirjelduse järgi...",
      "reset_button": "Lähtesta",
      "reset_filters_tooltip": "Kõik filtrid lähtestada",
      "all": "Kõik",
      
      // 🟢 СТАТУСЫ ВЕРИФИКАЦИИ КОМПАНИЙ
      "status_filter_label": "Kontrollimise staatus",
      "status_verified": "Kontrollitud",
      "status_pending": "Kontrolli ootamine",
      "status_rejected": "Tagasi lükatud",
      
      "verified": "Kontrollitud",
      "pending": "Ootab",
      "rejected": "Tagasi lükatud",
      "verification_status": "Kontrollimise staatus",
      "description": "Kirjeldus",
      "verified_status": "Kontrollitud",
      "company_added": "Ettevõte lisatud",
      "back_to_list": "Tagasi nimekirja",
      "submit_error": "Ettevõtet ei õnnestunud salvestada",
      "customer_reviews": "Klientide arvustused",
      "add_your_review": "Lisa oma arvustus",
      "your_name": "Sinu nimi",
      "anonymous_placeholder": "Anonüümselt (kui tühi)",
      "rating": "Hinne",
      "stars": "tähte",
      "comment": "Kommentaar",
      "submit_review": "Saada arvustus",
      "submitting": "Saatmine...",
      "review_submit_error": "Arvustust ei õnnestunud saata",
      "review_submitted_success": "Aitäh! Arvustus saadetud.",
      "reviews_load_error": "Arvustusi ei õnnestunud laadida.",
      "no_reviews_yet": "Arvustusi veel pole. Ole esimene!",
      "company_not_found": "Ettevõtet ei leitud",
      "no_company_data": "Andmeid pole",
      "reviews": "arvustust"
    }
  },
  // ... (английский)
  en: { // Английский
    translation: {
      "app_title": "Kontrollitud.ee EE",
      "slogan": "Verified companies directory",
      "details_button": "View details",
      "add_company": "+ Add company",
      "loading": "Loading...",
      "company_name": "Company name",
      "contact_email": "Contact Email",
      "error": "Error:",
      "fetch_error": "Failed to load data",
      "company_catalog_title": "Company catalog",
      "search_placeholder": "Search by name or description...",
      "reset_button": "Reset",
      "reset_filters_tooltip": "Clear all filters",
      "all": "All",
      
      // 🟢 COMPANY VERIFICATION STATUSES
      "status_filter_label": "Verification status",
      "status_verified": "Verified",
      "status_pending": "Pending verification",
      "status_rejected": "Rejected",
      
      "verified": "Verified",
      "pending": "Pending",
      "rejected": "Rejected",
      "verification_status": "Verification status",
      "description": "Description",
      "verified_status": "Verified",
      "company_added": "Company added",
      "back_to_list": "Back to list",
      "submit_error": "Could not save company",
      "company_not_found": "Company not found",
      "no_company_data": "No company data",
      "reviews": "reviews",
      "customer_reviews": "Customer reviews",
      "add_your_review": "Add your review",
      "your_name": "Your name",
      "anonymous_placeholder": "Anonymous (if empty)",
      "rating": "Rating",
      "stars": "stars",
      "comment": "Comment",
      "submit_review": "Submit review",
      "submitting": "Submitting...",
      "review_submit_error": "Could not submit review",
      "review_submitted_success": "Thanks! Your review was sent.",
      "reviews_load_error": "Could not load reviews.",
      "no_reviews_yet": "No reviews yet. Be the first!"
      }
    }
};

i18n
  .use(LanguageDetector) // Автоматически определяет язык браузера/сохраненный язык
  .use(initReactI18next) // Передает i18n в React
  .init({
    resources,
    // fallbackLng: 'et', // Язык по умолчанию, если выбранный не найден
    detection: {
      order: ['localStorage', 'navigator'], // Приоритет обнаружения: сначала localStorage, потом браузер
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false // React уже защищает от XSS
    }
  });

export default i18n;