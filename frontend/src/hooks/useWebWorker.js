// Hook для работы с Web Worker
// Автоматически создает и переиспользует Worker

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook для работы с Web Worker
 * Автоматически управляет жизненным циклом Worker
 * 
 * @param {string} workerPath - Путь к Worker файлу
 * @returns {Object} - { postMessage, isReady, terminate }
 */
export function useWebWorker(workerPath) {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const messageHandlersRef = useRef(new Map());

  useEffect(() => {
    // Проверяем поддержку Web Workers
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not supported in this browser');
      setError('Web Workers not supported');
      return;
    }

    try {
      // Создаем Worker
      workerRef.current = new Worker(
        new URL(workerPath, import.meta.url),
        { type: 'module' }
      );

      // Обработчик сообщений от Worker
      workerRef.current.onmessage = (e) => {
        const { type, data } = e.data;

        // Worker готов
        if (type === 'READY') {
          setIsReady(true);
          console.log('✅ Web Worker ready');
          return;
        }

        // Вызываем соответствующий handler
        const handler = messageHandlersRef.current.get(type);
        if (handler) {
          handler(data);
        }
      };

      // Обработчик ошибок
      workerRef.current.onerror = (error) => {
        console.error('❌ Web Worker error:', error);
        setError(error.message);
      };

    } catch (err) {
      console.error('❌ Failed to create Web Worker:', err);
      setError(err.message);
    }

    // Cleanup при размонтировании
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        console.log('🔴 Web Worker terminated');
      }
    };
  }, [workerPath]);

  /**
   * Отправить сообщение в Worker
   * @param {string} type - Тип сообщения
   * @param {any} data - Данные
   * @param {Function} callback - Callback для ответа
   */
  const postMessage = (type, data, callback) => {
    if (!workerRef.current) {
      console.error('Worker not initialized');
      return;
    }

    if (!isReady) {
      console.warn('Worker not ready yet');
      return;
    }

    // Регистрируем callback для ответа
    if (callback) {
      messageHandlersRef.current.set(type.replace('_', 'ED'), callback);
    }

    // Отправляем сообщение
    workerRef.current.postMessage({ type, data });
  };

  /**
   * Завершить Worker вручную
   */
  const terminate = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
    }
  };

  return {
    postMessage,
    isReady,
    error,
    terminate
  };
}

/**
 * Hook специально для обработки компаний
 * Обертка над useWebWorker с удобными методами
 */
export function useCompaniesWorker() {
  const { postMessage, isReady, error } = useWebWorker('../workers/companiesWorker.js');

  /**
   * Сортировать компании в Worker
   */
  const sortCompanies = (companies) => {
    return new Promise((resolve) => {
      postMessage('SORT_COMPANIES', companies, resolve);
    });
  };

  /**
   * Фильтровать компании в Worker
   */
  const filterCompanies = (companies, filters) => {
    return new Promise((resolve) => {
      postMessage('FILTER_COMPANIES', { companies, filters }, resolve);
    });
  };

  /**
   * Обработать сырые данные из Firestore
   */
  const processFirestoreData = (rawDocs) => {
    return new Promise((resolve) => {
      postMessage('PROCESS_FIRESTORE_DATA', rawDocs, resolve);
    });
  };

  return {
    sortCompanies,
    filterCompanies,
    processFirestoreData,
    isReady,
    error
  };
}

export default useWebWorker;
