// Kontrollitud.ee/frontend/src/utils/analytics.js
// Utility functions for site analytics tracking

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Initialize stats document in Firestore
 * Run this once to create the stats/global document
 */
export const initializeStats = async () => {
  try {
    const statsDocRef = doc(db, 'stats', 'global');
    const statsDoc = await getDoc(statsDocRef);
    
    if (!statsDoc.exists()) {
      await setDoc(statsDocRef, {
        visits: 0,
        uniqueVisitors: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      console.log('✅ Stats document initialized');
      return true;
    } else {
      console.log('ℹ️ Stats document already exists');
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing stats:', error);
    throw error;
  }
};

/**
 * Increment site visit counter
 * Call this on app load or page views
 */
export const trackVisit = async () => {
  try {
    const statsDocRef = doc(db, 'stats', 'global');
    
    // Check if document exists
    const statsDoc = await getDoc(statsDocRef);
    
    if (!statsDoc.exists()) {
      // Create document if doesn't exist
      await initializeStats();
    }
    
    // Increment visits counter
    await updateDoc(statsDocRef, {
      visits: increment(1),
      lastUpdated: new Date().toISOString()
    });
    
    console.log('📊 Visit tracked');
  } catch (error) {
    console.error('❌ Error tracking visit:', error);
    // Don't throw error to prevent app crashes
  }
};

/**
 * Track unique visitor (based on localStorage)
 * Call this once per session
 */
export const trackUniqueVisitor = async () => {
  try {
    // Check if visitor was already tracked
    const hasVisited = localStorage.getItem('kontrollitud_visited');
    
    if (!hasVisited) {
      const statsDocRef = doc(db, 'stats', 'global');
      
      await updateDoc(statsDocRef, {
        uniqueVisitors: increment(1),
        lastUpdated: new Date().toISOString()
      });
      
      // Mark visitor as tracked
      localStorage.setItem('kontrollitud_visited', 'true');
      console.log('👤 Unique visitor tracked');
    }
  } catch (error) {
    console.error('❌ Error tracking unique visitor:', error);
  }
};

/**
 * Get current stats
 */
export const getStats = async () => {
  try {
    const statsDocRef = doc(db, 'stats', 'global');
    const statsDoc = await getDoc(statsDocRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    
    return {
      visits: 0,
      uniqueVisitors: 0
    };
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return {
      visits: 0,
      uniqueVisitors: 0
    };
  }
};
