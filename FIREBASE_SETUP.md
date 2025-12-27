# Firebase Authentication Setup Guide

## Overview
This application uses Firebase Authentication for user management with support for:
- Google Sign-In (recommended for Estonian users)
- Facebook Login
- Email/Password authentication

## Prerequisites
- Google account for Firebase Console access
- Node.js and npm installed
- Backend and frontend running locally

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. **Project name**: `kontrollitud-ee` (or your preferred name)
4. **Google Analytics**: Optional (you can disable for development)
5. Click "Create project" and wait for setup to complete

---

## Step 2: Enable Authentication Methods

1. In Firebase Console, click on your project
2. In the left sidebar, click **"Authentication"**
3. Click **"Get started"** (if first time)
4. Go to **"Sign-in method"** tab

### Enable Email/Password:
1. Click on "Email/Password" provider
2. Toggle **"Enable"** switch to ON
3. Keep "Email link (passwordless sign-in)" disabled for now
4. Click **"Save"**

### Enable Google Sign-In:
1. Click on "Google" provider
2. Toggle **"Enable"** switch to ON
3. **Project support email**: Select your email from dropdown
4. Click **"Save"**

### Enable Facebook Login:
1. First, create a Facebook App:
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Click "My Apps" → "Create App"
   - Select "Consumer" → "Next"
   - **App name**: "Kontrollitud.ee"
   - Click "Create App"
   - In left sidebar, click "Add Product" → Find "Facebook Login" → "Set Up"
   - **Valid OAuth Redirect URIs**: (copy from Firebase Console later)

2. Back in Firebase Console:
   - Click on "Facebook" provider
   - Toggle **"Enable"** switch to ON
   - **App ID**: Copy from Facebook App Dashboard
   - **App secret**: Copy from Facebook App Dashboard → Settings → Basic
   - Copy the **OAuth redirect URI** from Firebase
   - Go back to Facebook App → Facebook Login → Settings
   - Paste the OAuth redirect URI into "Valid OAuth Redirect URIs"
   - Click **"Save Changes"** in both Facebook and Firebase

---

## Step 3: Get Firebase Configuration (Frontend)

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to "Your apps"
4. Click the **Web icon** `</>` to add a web app
5. **App nickname**: `kontrollitud-frontend`
6. **Firebase Hosting**: Leave unchecked for now
7. Click **"Register app"**
8. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "kontrollitud-ee.firebaseapp.com",
  projectId: "kontrollitud-ee",
  storageBucket: "kontrollitud-ee.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

9. Create `frontend/.env` file and add:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=kontrollitud-ee.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kontrollitud-ee
VITE_FIREBASE_STORAGE_BUCKET=kontrollitud-ee.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_ADMIN_EMAIL=admin@kontrollitud.ee
```

⚠️ **Important**: 
- Replace values with your actual Firebase config values!
- Vite requires `VITE_` prefix for environment variables (not `REACT_APP_`)

---

## Step 4: Get Firebase Admin SDK Credentials (Backend)

1. In Firebase Console → Project settings (gear icon)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Confirm by clicking **"Generate key"**
5. A JSON file will download automatically
6. **Keep this file secure!** It contains sensitive credentials

7. Create `backend/.env` file (or add to existing):

```env
# MongoDB (existing)
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Firebase Admin SDK (new)
FIREBASE_PROJECT_ID=kontrollitud-ee
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kontrollitud-ee.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important Notes**:
- `FIREBASE_PROJECT_ID`: Copy from the JSON file (`project_id` field)
- `FIREBASE_CLIENT_EMAIL`: Copy from the JSON file (`client_email` field)
- `FIREBASE_PRIVATE_KEY`: Copy from the JSON file (`private_key` field)
  - **Must be wrapped in double quotes**
  - Keep the `\n` characters (they represent line breaks)
  - Should look like: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

---

## Step 5: Configure Authorized Domains

1. In Firebase Console → Authentication
2. Go to **"Settings"** tab
3. Scroll to **"Authorized domains"**
4. Add these domains for development and production:
   - `localhost` (already included)
   - `kontrollitud.ee` (your production domain)
   - Add any other domains where your app will be hosted

---

## Step 6: Test Authentication

### Start the servers:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Test each authentication method:

1. **Email/Password Registration**:
   - Go to `http://localhost:5173/auth`
   - Click "Create an account"
   - Fill in name, email, password
   - Submit and verify you're logged in

2. **Google Sign-In**:
   - Click "Continue with Google"
   - Select your Google account
   - Verify you're redirected back and logged in

3. **Facebook Login**:
   - Click "Continue with Facebook"
   - Log in with Facebook (if not already)
   - Verify you're redirected back and logged in

4. **Protected Routes**:
   - Log out
   - Try to access `/add-business`
   - You should be redirected to `/auth`
   - Log in and verify you're redirected back to `/add-business`

5. **User Dashboard**:
   - While logged in, submit a business
   - Go to `/dashboard`
   - Verify you see your submission

---

## Step 7: Security Best Practices

### Frontend (.env):
- ✅ API keys can be exposed (Firebase designed for this)
- ✅ Commit `.env.example` to git with placeholder values
- ❌ **DO NOT** commit `.env` with real values

### Backend (.env):
- ❌ **NEVER** commit `.env` file to git
- ❌ **NEVER** expose `FIREBASE_PRIVATE_KEY` publicly
- ✅ Use environment variables in production (Heroku, Vercel, etc.)
- ✅ Keep service account JSON file outside of git repository

### Firestore Security Rules (if using Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Troubleshooting

### Error: "Firebase Admin initialization error"
- Check that all environment variables are set correctly
- Verify `FIREBASE_PRIVATE_KEY` has double quotes and `\n` characters
- Restart the backend server after updating `.env`

### Error: "No authentication token provided"
- User is not logged in
- Check that Firebase is initialized in frontend (`firebase.js`)
- Verify token is being sent in Authorization header

### Error: "Token expired"
- Token is valid for 1 hour by default
- User needs to log out and log back in
- Consider implementing token refresh logic

### Google Sign-In not working:
- Verify Google provider is enabled in Firebase Console
- Check that `authDomain` in frontend `.env` is correct
- Ensure `localhost` is in Authorized domains

### Facebook Login not working:
- Verify Facebook App is in "Live" mode (not Development)
- Check OAuth redirect URI matches exactly
- Verify App ID and App Secret are correct

---

## Production Deployment

### Frontend (Vercel/Netlify):
1. Add environment variables in hosting dashboard
2. Deploy frontend
3. Add production domain to Firebase Authorized domains

### Backend (Heroku/Railway):
1. Add all environment variables in hosting dashboard
2. For `FIREBASE_PRIVATE_KEY`:
   - Keep the quotes and `\n` characters
   - Some platforms require escaping: `"-----BEGIN PRIVATE KEY-----\\n..."`
3. Deploy backend
4. Update CORS settings in `server.js` to allow frontend domain

---

## Support & Documentation

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)
- [Facebook Login Setup](https://firebase.google.com/docs/auth/web/facebook-login)

---

## Admin User Setup

The admin user is determined by email address:
1. Set `REACT_APP_ADMIN_EMAIL=admin@kontrollitud.ee` in frontend `.env`
2. Create an account with that email address
3. Log in with that account
4. You'll see "Admin Dashboard" option in user dropdown

To change admin email:
1. Update `REACT_APP_ADMIN_EMAIL` in frontend `.env`
2. Restart frontend dev server
3. Rebuild for production deployment
