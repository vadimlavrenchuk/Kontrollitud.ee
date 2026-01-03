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

module.exports = { verifyToken, optionalAuth };
