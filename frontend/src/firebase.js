// Firebase Configuration for Kontrollitud.ee
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    FacebookAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kontrollitud-ee.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kontrollitud-ee",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kontrollitud-ee.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Set up auth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export const facebookProvider = new FacebookAuthProvider();

// Auth helper functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        
        // Save user data to Firestore if it's a new user
        try {
            await addDoc(collection(db, 'users'), {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName || '',
                plan: 'basic', // Default plan for social sign-in
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('User profile saved with plan: basic');
        } catch (firestoreError) {
            // If document already exists or other error, silently continue
            console.log('User profile may already exist or Firestore error:', firestoreError.message);
        }
        
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { user: null, error: error.message };
    }
};

export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        
        // Save user data to Firestore if it's a new user
        try {
            await addDoc(collection(db, 'users'), {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName || '',
                plan: 'basic', // Default plan for social sign-in
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('User profile saved with plan: basic');
        } catch (firestoreError) {
            // If document already exists or other error, silently continue
            console.log('User profile may already exist or Firestore error:', firestoreError.message);
        }
        
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        return { user: null, error: error.message };
    }
};

export const signUpWithEmail = async (email, password, displayName, plan = 'basic') => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        if (displayName) {
            await updateProfile(result.user, { displayName });
        }
        
        // Save user data with plan to Firestore
        try {
            await addDoc(collection(db, 'users'), {
                uid: result.user.uid,
                email: result.user.email,
                displayName: displayName || '',
                plan: plan,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('User profile saved with plan:', plan);
        } catch (firestoreError) {
            console.error('Error saving user profile to Firestore:', firestoreError);
            // Don't fail the registration if Firestore save fails
        }
        
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Email sign-up error:', error);
        return { user: null, error: error.message };
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Email sign-in error:', error);
        return { user: null, error: error.message };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        console.error('Logout error:', error);
        return { error: error.message };
    }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Upload image to Firebase Storage
export const uploadBusinessImage = async (file, businessName) => {
    try {
        // Validate file
        if (!file) {
            throw new Error('No file provided');
        }
        
        // Create a unique filename
        const timestamp = Date.now();
        const sanitizedName = businessName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileExtension = file.name.split('.').pop();
        const filename = `business-images/${sanitizedName}_${timestamp}.${fileExtension}`;
        
        console.log('Uploading image to:', filename);
        
        // Create a storage reference
        const storageRef = ref(storage, filename);
        
        // Set metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': businessName,
                'uploadDate': new Date().toISOString()
            }
        };
        
        // Upload the file with metadata
        const snapshot = await uploadBytes(storageRef, file, metadata);
        console.log('Upload successful, getting download URL...');
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Download URL obtained:', downloadURL);
        
        return { url: downloadURL, error: null };
    } catch (error) {
        console.error('Image upload error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return { url: null, error: error.message };
    }
};

export default app;
