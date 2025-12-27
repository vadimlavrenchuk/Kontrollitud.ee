/**
 * Firebase Admin SDK initialization
 * Used for backend token verification and user management
 */

const admin = require('firebase-admin');

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
    try {
        // Initialize Firebase Admin with service account credentials from environment variables
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
        
        console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        console.error('⚠️  Please check your FIREBASE_* environment variables in .env file');
        console.error('⚠️  Authentication endpoints will not work until Firebase is configured');
        
        // Don't throw error to allow server to start (but auth will fail)
        // This allows developers to set up environment variables without crashing
    }
} else {
    console.log('ℹ️  Firebase Admin SDK already initialized');
}

module.exports = admin;
