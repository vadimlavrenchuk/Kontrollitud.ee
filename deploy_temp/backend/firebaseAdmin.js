/**
 * Firebase Admin SDK initialization
 * Used for backend token verification and user management
 */

// Load environment variables from root .env file
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
    try {
        // Try to use service account JSON file first
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            // Use JSON file if it exists
            const serviceAccount = require('./firebase-service-account.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin SDK initialized from JSON file');
        } else {
            // Fall back to environment variables
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('✅ Firebase Admin SDK initialized from .env');
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        console.error('⚠️  Please add firebase-service-account.json to backend folder');
    }
} else {
    console.log('ℹ️  Firebase Admin SDK already initialized');
}

module.exports = admin;
