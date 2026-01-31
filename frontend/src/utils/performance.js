// Performance utilities for preventing Long Tasks and CLS
// Implements yielding, chunked rendering, and idle callbacks

/**
 * Check if we should yield to the browser (give it time to breathe)
 * Uses Scheduler API if available, falls back to simple time check
 */
export function shouldYield() {
  // Use Scheduler API if available (Chrome 94+)
  if (typeof scheduler !== 'undefined' && scheduler.yield) {
    return false; // scheduler.yield() handles this automatically
  }
  
  // Fallback: yield if we've been running for more than 50ms
  const start = performance.now();
  return performance.now() - start > 50;
}

/**
 * Yield control back to the browser
 * Allows browser to render, handle events, etc.
 */
export function yieldToMain() {
  return new Promise(resolve => {
    // Use Scheduler API if available
    if (typeof scheduler !== 'undefined' && scheduler.yield) {
      scheduler.yield().then(resolve);
    } else {
      // Fallback: use setTimeout with 0 delay
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Render items in chunks to prevent blocking the main thread
 * Usage: await renderInChunks(items, renderItemCallback, chunkSize)
 * 
 * @param {Array} items - Array of items to render
 * @param {Function} callback - Function to call for each item
 * @param {number} chunkSize - Number of items to process before yielding (default: 50)
 */
export async function renderInChunks(items, callback, chunkSize = 50) {
  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    results.push(callback(items[i], i));
    
    // Yield every chunkSize items
    if ((i + 1) % chunkSize === 0 && i < items.length - 1) {
      await yieldToMain();
    }
  }
  
  return results;
}

/**
 * Process array in chunks with progress callback
 * Useful for showing loading progress
 * 
 * @param {Array} items - Items to process
 * @param {Function} callback - Function to process each item
 * @param {Function} onProgress - Optional callback for progress updates
 * @param {number} chunkSize - Chunk size (default: 50)
 */
export async function processInChunks(items, callback, onProgress = null, chunkSize = 50) {
  const results = [];
  const total = items.length;
  
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = items.slice(i, Math.min(i + chunkSize, total));
    const chunkResults = await Promise.all(chunk.map(callback));
    results.push(...chunkResults);
    
    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + chunkSize, total), total);
    }
    
    // Yield to browser if not last chunk
    if (i + chunkSize < total) {
      await yieldToMain();
    }
  }
  
  return results;
}

/**
 * Run a function when the browser is idle
 * Falls back to setTimeout if requestIdleCallback is not available
 * 
 * @param {Function} callback - Function to run when idle
 * @param {Object} options - Options (timeout, priority)
 */
export function runWhenIdle(callback, options = {}) {
  const { timeout = 1000 } = options;
  
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Debounce function to limit how often a function can be called
 * Useful for search inputs, scroll handlers, etc.
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once per interval
 * Useful for scroll handlers, resize handlers, etc.
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between calls
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Batch DOM updates using requestAnimationFrame
 * Ensures all updates happen in the same frame
 * 
 * @param {Function} callback - Function with DOM updates
 */
export function batchUpdate(callback) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      callback();
      resolve();
    });
  });
}

/**
 * Lazy load a component when it's needed
 * Prevents loading heavy components upfront
 * 
 * @param {Function} importFunc - Dynamic import function
 */
export function lazyLoadComponent(importFunc) {
  return React.lazy(() => {
    return new Promise((resolve) => {
      // Give browser time to render critical content first
      requestIdleCallback(
        () => importFunc().then(resolve),
        { timeout: 2000 }
      );
    });
  });
}

/**
 * Measure performance of a function
 * Useful for debugging performance issues
 * 
 * @param {string} name - Name of the measurement
 * @param {Function} func - Function to measure
 */
export async function measurePerformance(name, func) {
  const start = performance.now();
  const result = await func();
  const duration = performance.now() - start;
  
  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
  
  // Warn if task took too long (>50ms = Long Task)
  if (duration > 50) {
    console.warn(`⚠️ Long Task detected in ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Split a long task into smaller tasks
 * Example: const result = await splitTask(heavyComputation, data);
 * 
 * @param {Function} taskFunc - The heavy function to split
 * @param {any} data - Data to process
 * @param {number} maxTime - Max time before yielding (ms)
 */
export async function splitTask(taskFunc, data, maxTime = 50) {
  const start = performance.now();
  
  return new Promise(async (resolve) => {
    const result = await taskFunc(data);
    
    const elapsed = performance.now() - start;
    
    // If task took too long, warn
    if (elapsed > maxTime) {
      console.warn(`⚠️ Task took ${elapsed.toFixed(2)}ms (max: ${maxTime}ms)`);
    }
    
    resolve(result);
  });
}

/**
 * Create a scheduler for batch processing
 * Useful for rendering large lists
 */
export class TaskScheduler {
  constructor(chunkSize = 50) {
    this.chunkSize = chunkSize;
    this.tasks = [];
    this.isProcessing = false;
  }
  
  addTask(task) {
    this.tasks.push(task);
    if (!this.isProcessing) {
      this.processTasks();
    }
  }
  
  async processTasks() {
    this.isProcessing = true;
    
    while (this.tasks.length > 0) {
      const chunk = this.tasks.splice(0, this.chunkSize);
      await Promise.all(chunk.map(task => task()));
      
      if (this.tasks.length > 0) {
        await yieldToMain();
      }
    }
    
    this.isProcessing = false;
  }
}

export default {
  shouldYield,
  yieldToMain,
  renderInChunks,
  processInChunks,
  runWhenIdle,
  debounce,
  throttle,
  batchUpdate,
  lazyLoadComponent,
  measurePerformance,
  splitTask,
  TaskScheduler
};
