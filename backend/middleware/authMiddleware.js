const admin = require('../firebaseAdmin');

/**
 * Middleware to verify Firebase authentication token
 * Extracts and verifies the JWT token from the Authorization header
 * Adds decoded user info to req.user
 */
const verifyToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'No authentication token provided' 
            });
        }
        
        const token = authHeader.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'Invalid token format' 
            });
        }
        
        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Add user info to request object
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name,
            emailVerified: decodedToken.email_verified
        };
        
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ 
                error: 'Token expired',
                message: 'Your session has expired. Please log in again.' 
            });
        }
        
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'The authentication token is invalid.' 
            });
        }
        
        return res.status(401).json({ 
            error: 'Authentication failed',
            message: 'Could not verify authentication token' 
        });
    }
};

/**
 * Optional middleware - verifies token if present, but allows request to continue if not
 * Useful for endpoints that work for both authenticated and anonymous users
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue as anonymous user
            req.user = null;
            return next();
        }
        
        const token = authHeader.split('Bearer ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }
        
        // Try to verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name,
            emailVerified: decodedToken.email_verified
        };
        
        next();
    } catch (error) {
        // Token verification failed - continue as anonymous user
        console.warn('Optional auth failed:', error.message);
        req.user = null;
        next();
    }
};

/**
 * Admin-only middleware.
 * 1. Verifies Firebase ID token (same as verifyToken).
 * 2. Checks that the authenticated email is in ADMIN_EMAILS env var.
 * Rejects with 403 if the user is not an admin.
 */
const requireAdmin = async (req, res, next) => {
    // Reuse verifyToken logic inline so we get req.user populated
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized', message: 'No authentication token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token format' });
    }

    try {
        const admin = require('../firebaseAdmin');
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name,
            emailVerified: decodedToken.email_verified,
        };

        // Check admin email list from .env (comma-separated)
        const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (!adminEmails.includes(req.user.email?.toLowerCase())) {
            return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error.message);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Token expired', message: 'Your session has expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Authentication failed', message: 'Could not verify token' });
    }
};

module.exports = { verifyToken, optionalAuth, requireAdmin };
