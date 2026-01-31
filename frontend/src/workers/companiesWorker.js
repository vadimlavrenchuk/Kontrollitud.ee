// Web Worker для обработки данных компаний
// Освобождает Main Thread от тяжелых операций парсинга и сортировки

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch(type) {
    case 'SORT_COMPANIES':
      const sorted = sortCompanies(data);
      self.postMessage({ type: 'SORTED', data: sorted });
      break;
      
    case 'FILTER_COMPANIES':
      const filtered = filterCompanies(data.companies, data.filters);
      self.postMessage({ type: 'FILTERED', data: filtered });
      break;
      
    case 'PROCESS_FIRESTORE_DATA':
      // Обработка сырых данных из Firestore
      const processed = processFirestoreData(data);
      self.postMessage({ type: 'PROCESSED', data: processed });
      break;
      
    default:
      console.warn('Unknown worker message type:', type);
  }
};

/**
 * Сортировка компаний (тяжелая операция)
 * Verified → Priority → Date
 */
function sortCompanies(companies) {
  return companies.sort((a, b) => {
    const isVerifiedA = a.verified || a.isVerified;
    const isVerifiedB = b.verified || b.isVerified;
    
    if (isVerifiedA !== isVerifiedB) {
      return isVerifiedB ? 1 : -1;
    }
    
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // Handle Firestore Timestamp
    const dateA = a.createdAt?.seconds 
      ? new Date(a.createdAt.seconds * 1000) 
      : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.seconds 
      ? new Date(b.createdAt.seconds * 1000) 
      : new Date(b.createdAt || 0);
    
    return dateB - dateA;
  });
}

/**
 * Фильтрация компаний
 */
function filterCompanies(companies, filters) {
  let result = [...companies];
  
  // Search filter
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    result = result.filter(company => {
      const nameMatch = company.name?.toLowerCase().includes(searchLower);
      const descMatch = company.description?.et?.toLowerCase().includes(searchLower) ||
                       company.description?.en?.toLowerCase().includes(searchLower) ||
                       company.description?.ru?.toLowerCase().includes(searchLower);
      return nameMatch || descMatch;
    });
  }
  
  // Main category filter
  if (filters.mainCategory && filters.mainCategory !== 'Все') {
    result = result.filter(c => c.mainCategory === filters.mainCategory);
  }
  
  // Subcategory filter
  if (filters.subCategory && filters.subCategory !== 'Все') {
    result = result.filter(c => 
      c.subCategory === filters.subCategory || c.category === filters.subCategory
    );
  }
  
  // City filter
  if (filters.city && filters.city !== 'Все') {
    result = result.filter(c => c.city === filters.city);
  }
  
  // Verified only filter
  if (filters.isVerifiedOnly) {
    result = result.filter(c => c.verified || c.isVerified);
  }
  
  return result;
}

/**
 * Обработка сырых данных из Firestore
 * Преобразование Timestamp, нормализация полей
 */
function processFirestoreData(rawDocs) {
  return rawDocs.map(doc => {
    // Преобразуем Firestore Timestamp в обычную дату
    if (doc.createdAt && doc.createdAt.seconds) {
      doc.createdAt = new Date(doc.createdAt.seconds * 1000);
    }
    
    // Нормализация ID
    if (!doc._id && doc.id) {
      doc._id = doc.id;
    }
    
    return doc;
  });
}

// Сообщаем, что Worker готов
self.postMessage({ type: 'READY' });
