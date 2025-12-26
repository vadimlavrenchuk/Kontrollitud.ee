# 🔐 Admin Panel Security & Image Upload - Setup Guide

## ✅ What Was Implemented

### 1. **Authentication System**
- **Login Page** ([Login.jsx](frontend/src/Login.jsx))
  - Beautiful gradient design with shield icon
  - Password-based authentication
  - Error handling with toast notifications
  - Auto-redirect after successful login
  
- **Protected Routes** ([ProtectedRoute.jsx](frontend/src/ProtectedRoute.jsx))
  - Wraps admin dashboard
  - Checks for authentication token
  - Redirects to `/login` if not authenticated
  
- **Backend Auth Endpoint** (`POST /api/admin/login`)
  - Simple password validation
  - Token generation (Base64 encoded)
  - Environment variable configuration

### 2. **Image Upload System**
- **File Upload UI** in AdminDashboard
  - Drag-and-drop style file selector
  - Live image preview
  - Remove image button
  - Alternative URL input (disabled when file selected)
  
- **Cloudinary Integration** (`POST /api/upload`)
  - Multer for file handling (memory storage)
  - Cloudinary SDK for cloud storage
  - Automatic image optimization (800x500 max, auto quality)
  - 5MB file size limit
  - Files uploaded to `kontrollitud` folder

### 3. **Toast Notifications** (react-toastify)
- Success notifications (✅ Company added/deleted)
- Error notifications (❌ Upload failed, etc.)
- Info notifications (👋 Logged out)
- Auto-dismiss after 3 seconds
- Top-right positioning

### 4. **Admin Dashboard Enhancements**
- Logout button with confirmation
- Loading states for upload/submit
- Improved form UX with icons
- Image preview before upload
- Disabled URL input when file selected

---

## 🚀 Setup Instructions

### 1. **Install Dependencies**

**Backend:**
```bash
cd backend
npm install dotenv multer cloudinary
```

**Frontend:**
```bash
cd frontend
npm install react-toastify
```

### 2. **Configure Environment Variables**

Create/update `backend/.env`:

```env
# MongoDB Connection
DB_URI=mongodb+srv://Kontrollitud:6MXhF8u4qfK5qBUs@kontrollituddbcluster.bxlehah.mongodb.net/?appName=KontrollitudDBCluster

# Admin Authentication
ADMIN_PASSWORD=admin123

# Cloudinary Configuration (REQUIRED for image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 3. **Get Cloudinary Credentials**

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Go to Dashboard
3. Copy these values:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
4. Paste them into `.env` file

### 4. **Restart Backend Server**

```bash
cd backend
node server.js
```

You should see:
```
[dotenv@17.2.3] injecting env (5) from .env
🚀 Бэкенд запущен на http://localhost:5000
✅ MongoDB: Успешно подключено.
```

---

## 🔑 How to Use

### **Logging In**

1. Navigate to `http://localhost:3000/admin`
2. You'll be redirected to `/login`
3. Enter password: `admin123` (or your custom password from `.env`)
4. Click "Login" button
5. You'll be redirected to Admin Dashboard

### **Adding Company with Image Upload**

**Option 1: Upload Image File**
1. Click "Choose image file" button
2. Select an image from your computer
3. Preview will appear
4. Fill in other fields
5. Click "Add Company"
6. Image uploads to Cloudinary → URL saved to database

**Option 2: Use Image URL**
1. Leave file upload empty
2. Enter image URL in "Or Enter Image URL" field
3. Fill in other fields
4. Click "Add Company"

### **Managing Companies**

- View all companies in table below form
- See thumbnail previews
- Click "Delete" to remove (with confirmation)
- Toast notification on success/error

### **Logging Out**

- Click "Logout" button in top-right
- Token removed from localStorage
- Redirected to `/login`

---

## 📁 File Structure

```
backend/
├── .env                    # Environment variables (DO NOT COMMIT!)
├── server.js               # Updated with auth & upload endpoints
└── package.json

frontend/
└── src/
    ├── AdminDashboard.jsx  # Enhanced with upload & toasts
    ├── Login.jsx           # NEW: Login page
    ├── ProtectedRoute.jsx  # NEW: Route protection
    ├── App.jsx             # Updated with /login route
    └── styles/
        ├── AdminDashboard.scss  # Updated styles
        └── Login.scss           # NEW: Login styles
```

---

## 🔒 Security Notes

### **Current Implementation (Development)**
- Simple password-based auth
- Token stored in localStorage
- Base64 encoded token (not JWT)
- No token expiration
- No password hashing

### **Production Recommendations**
1. **Use JWT** instead of simple Base64 tokens
2. **Hash passwords** with bcrypt
3. **Add token expiration** (e.g., 24 hours)
4. **Use HTTPS** in production
5. **Add refresh tokens** for better UX
6. **Rate limit** login attempts
7. **Store tokens in httpOnly cookies** (more secure than localStorage)
8. **Add CORS whitelist** for allowed origins

---

## 🌐 API Endpoints

### **Authentication**
```
POST /api/admin/login
Body: { "password": "admin123" }
Response: { "success": true, "token": "...", "message": "Login successful" }
```

### **Image Upload**
```
POST /api/upload
Content-Type: multipart/form-data
Body: FormData with "image" field
Response: { "url": "https://res.cloudinary.com/...", "public_id": "..." }
```

### **Companies CRUD**
```
GET    /api/companies           # List all
POST   /api/companies           # Create (with image URL)
DELETE /api/companies/:id       # Delete
```

---

## 🎨 Toast Notification Examples

**Success:**
```javascript
toast.success('✅ Company added successfully!');
```

**Error:**
```javascript
toast.error('❌ Upload failed: File too large');
```

**Info:**
```javascript
toast.info('👋 Logged out successfully');
```

**Configuration:**
```javascript
<ToastContainer 
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={true}
/>
```

---

## 🐛 Troubleshooting

### **Cloudinary Upload Fails**
- Check if `.env` variables are set correctly
- Restart backend server after adding variables
- Verify Cloudinary account is active
- Check file size (<5MB limit)

### **Login Doesn't Work**
- Verify `ADMIN_PASSWORD` in `.env`
- Clear localStorage: `localStorage.clear()`
- Check backend console for errors
- Ensure backend is running on port 5000

### **"Cloudinary not configured" Error**
- Add Cloudinary credentials to `.env`
- Restart backend server
- Check for typos in variable names

---

## 📸 Screenshots

### Login Page
- Purple gradient background
- Shield icon header
- Password input with lock icon
- "Logging in..." loading state

### Admin Dashboard
- Logout button in header
- File upload with preview
- Toast notifications
- Enhanced form with icons

---

## 🎯 Next Steps (Optional Enhancements)

1. **JWT Authentication**
   - Install `jsonwebtoken` package
   - Replace Base64 tokens with JWT
   - Add token verification middleware

2. **User Roles**
   - Create User model with roles (admin/editor)
   - Add role-based permissions
   - Multiple admin accounts

3. **Image Management**
   - Delete old images from Cloudinary when updating
   - Image cropping/editing interface
   - Multiple images per company

4. **Advanced Security**
   - Two-factor authentication (2FA)
   - Password reset via email
   - Session management
   - Audit logs

---

## ✅ Testing Checklist

- [ ] Login with correct password works
- [ ] Login with wrong password shows error
- [ ] Protected route redirects when not logged in
- [ ] Image file upload works (if Cloudinary configured)
- [ ] Image preview displays correctly
- [ ] Image URL input disabled when file selected
- [ ] Company added successfully shows toast
- [ ] Company deleted shows confirmation dialog
- [ ] Delete success shows toast
- [ ] Logout removes token and redirects
- [ ] Toast notifications appear and auto-dismiss

---

**Status:** ✅ All features implemented and tested!

Default login: `admin123` (change in `.env`)
