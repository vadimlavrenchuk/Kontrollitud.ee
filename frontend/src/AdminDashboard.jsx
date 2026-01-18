// Kontrollitud.ee/frontend/src/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import { getCategoryIcon } from './constants/categories';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import 'react-toastify/dist/ReactToastify.css';
import './styles/AdminDashboard.scss';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api/companies`;
const UPLOAD_URL = `${import.meta.env.VITE_API_URL || ''}/api/upload`;

function AdminDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        city: 'Tallinn',
        category: 'SPA',
        descriptionEt: '',
        descriptionEn: '',
        descriptionRu: '',
        image: '',
        isVerified: false,
        tiktokUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        reviewerName: '',
        blogArticleUrl: ''
    });
    
    // Image upload state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Companies list state
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'requests'
    const [pendingRequests, setPendingRequests] = useState([]);
    
    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploadingCloudinary, setUploadingCloudinary] = useState(false);

    // Fetch all companies on component mount
    useEffect(() => {
        fetchCompanies();
        fetchPendingRequests();
    }, []);

    const fetchCompanies = async () => {
        try {
            console.log('📥 Fetching approved companies from Firestore...');
            const companiesRef = collection(db, 'companies');
            const snapshot = await getDocs(companiesRef);
            
            const companiesList = [];
            snapshot.forEach((doc) => {
                companiesList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('✅ Fetched companies:', companiesList.length);
            setCompanies(companiesList);
        } catch (err) {
            console.error('❌ Error fetching companies:', err);
            toast.error('Failed to fetch companies: ' + err.message);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            console.log('📥 Fetching pending requests from Firestore...');
            const pendingRef = collection(db, 'pending_companies');
            const snapshot = await getDocs(pendingRef);
            
            const requests = [];
            snapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('✅ Fetched pending requests:', requests.length);
            setPendingRequests(requests);
        } catch (err) {
            console.error('❌ Error fetching pending requests:', err);
            toast.error('Failed to fetch pending requests: ' + err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        
        // Dispatch custom event to notify App component
        window.dispatchEvent(new Event('authChange'));
        
        toast.info('👋 Logged out successfully');
        navigate('/login');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data.url;
        } catch (err) {
            toast.error(`Upload failed: ${err.message}`);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Upload image to Cloudinary
    const uploadToCloudinary = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        console.log('📸 Cloudinary Upload Config:', {
            cloudName,
            uploadPreset,
            hasCloudName: !!cloudName,
            hasUploadPreset: !!uploadPreset
        });
        
        if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary configuration missing. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        // Note: Do NOT append api_key, timestamp, or signature for unsigned uploads
        // folder is configured in upload preset settings on Cloudinary dashboard
        
        console.log('🚀 Uploading to Cloudinary...');
        console.log('URL:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            const data = await response.json();
            console.log('📊 Cloudinary Response:', { status: response.status, data });
            
            if (!response.ok) {
                throw new Error(data.error?.message || data.message || 'Upload failed');
            }
            
            console.log('✅ Upload successful! URL:', data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error('❌ Cloudinary upload error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image;

            // Upload image if file selected
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    setLoading(false);
                    return; // Upload failed
                }
            }

            const payload = {
                name: formData.name,
                city: formData.city,
                category: formData.category,
                description: {
                    et: formData.descriptionEt,
                    en: formData.descriptionEn,
                    ru: formData.descriptionRu
                },
                image: imageUrl,
                isVerified: formData.isVerified
            };

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to add company');
            }

            const newCompany = await response.json();
            toast.success('✅ Company added successfully!');
            
            // Reset form
            setFormData({
                name: '',
                city: 'Tallinn',
                category: 'SPA',
                descriptionEt: '',
                descriptionEn: '',
                descriptionRu: '',
                image: '',
                isVerified: false,
                tiktokUrl: '',
                instagramUrl: '',
                youtubeUrl: '',
                reviewerName: '',
                blogArticleUrl: ''
            });
            setImageFile(null);
            setImagePreview(null);

            // Refresh companies list
            fetchCompanies();

        } catch (err) {
            toast.error(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (companyId) => {
        if (!window.confirm('Are you sure you want to delete this company?')) {
            return;
        }

        try {
            console.log('🗑️ Deleting company:', companyId);
            
            // Delete from Firestore companies collection
            await deleteDoc(doc(db, 'companies', companyId));
            
            toast.success('🗑️ Company deleted successfully!');
            fetchCompanies();

        } catch (err) {
            console.error('❌ Error deleting company:', err);
            toast.error(`❌ ${err.message}`);
        }
    };

    // Open edit modal with company data
    const handleEdit = (company) => {
        setEditMode(true);
        setEditingCompanyId(company.id);
        setFormData({
            name: company.name || '',
            city: company.city || 'Tallinn',
            category: company.category || company.subCategory || 'SPA',
            descriptionEt: company.description?.et || '',
            descriptionEn: company.description?.en || '',
            descriptionRu: company.description?.ru || '',
            image: company.image || '',
            isVerified: company.verified || company.isVerified || false,
            tiktokUrl: company.tiktokUrl || '',
            instagramUrl: company.instagramUrl || '',
            youtubeUrl: company.youtubeUrl || '',
            reviewerName: company.reviewerName || '',
            blogArticleUrl: company.blogArticleUrl || ''
        });
        setImagePreview(company.image || null);
        setShowEditModal(true);
    };

    // Update company in Firestore
    const handleUpdateCompany = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image;

            // Upload new image to Cloudinary if file selected
            if (imageFile) {
                setUploadingCloudinary(true);
                toast.info('Uploading image to Cloudinary...');
                try {
                    imageUrl = await uploadToCloudinary(imageFile);
                    toast.success('Image uploaded successfully!');
                } catch (uploadError) {
                    console.error('Cloudinary upload failed:', uploadError);
                    toast.error('Image upload failed: ' + uploadError.message);
                    setLoading(false);
                    setUploadingCloudinary(false);
                    return;
                } finally {
                    setUploadingCloudinary(false);
                }
            }

            // Prepare update data
            const updateData = {
                name: formData.name,
                city: formData.city,
                category: formData.category,
                subCategory: formData.category,
                description: {
                    et: formData.descriptionEt,
                    en: formData.descriptionEn,
                    ru: formData.descriptionRu
                },
                image: imageUrl,
                verified: formData.isVerified,
                isVerified: formData.isVerified,
                tiktokUrl: formData.tiktokUrl || '',
                instagramUrl: formData.instagramUrl || '',
                youtubeUrl: formData.youtubeUrl || '',
                updatedAt: serverTimestamp()
            };

            // Update in Firestore
            const companyRef = doc(db, 'companies', editingCompanyId);
            await updateDoc(companyRef, updateData);

            toast.success('✅ Company updated successfully!');
            
            // Reset and close modal
            setShowEditModal(false);
            setEditMode(false);
            setEditingCompanyId(null);
            setImageFile(null);
            setImagePreview(null);
            
            // Refresh companies list
            fetchCompanies();

        } catch (err) {
            console.error('❌ Error updating company:', err);
            toast.error(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditMode(false);
        setEditingCompanyId(null);
        setImageFile(null);
        setImagePreview(null);
        setFormData({
            name: '',
            city: 'Tallinn',
            category: 'SPA',
            descriptionEt: '',
            descriptionEn: '',
            descriptionRu: '',
            image: '',
            isVerified: false,
            tiktokUrl: '',
            instagramUrl: '',
            youtubeUrl: '',
            reviewerName: ''
        });
    };

    const handleApproveRequest = async (requestId, subscriptionLevel = null) => {
        try {
            console.log('✅ Approving request:', requestId);
            
            // Get the pending request data
            const pendingRequest = pendingRequests.find(req => req.id === requestId);
            if (!pendingRequest) {
                throw new Error('Request not found');
            }
            
            console.log('📋 Pending request data:', pendingRequest);
            
            // Use subscription level from request if not provided, or fall back to basic
            const finalSubscriptionLevel = subscriptionLevel || pendingRequest.subscriptionLevel || 'basic';
            
            // Create approved company in companies collection
            const companyData = {
                ...pendingRequest,
                status: 'approved',
                verified: true,
                isVerified: true, // Добавляем оба поля для совместимости
                subscriptionLevel: finalSubscriptionLevel,
                approvedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            // Remove the id field as it will be auto-generated
            delete companyData.id;
            
            console.log('💾 Saving company data to Firestore:', companyData);
            
            // Add to companies collection
            const docRef = await addDoc(collection(db, 'companies'), companyData);
            console.log('✅ Company added with ID:', docRef.id);
            
            // Delete from pending_companies
            await deleteDoc(doc(db, 'pending_companies', requestId));
            console.log('🗑️ Deleted from pending_companies');
            
            toast.success(`✅ Business approved as ${finalSubscriptionLevel}!`);
            fetchPendingRequests();
            fetchCompanies();
            
        } catch (err) {
            console.error('❌ Error approving request:', err);
            toast.error(`❌ ${err.message}`);
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject and delete this business submission?')) {
            return;
        }

        try {
            console.log('🗑️ Rejecting request:', requestId);
            
            // Delete from pending_companies
            await deleteDoc(doc(db, 'pending_companies', requestId));
            
            toast.success('🗑️ Business submission rejected and deleted');
            fetchPendingRequests();
            
        } catch (err) {
            console.error('❌ Error rejecting request:', err);
            toast.error(`❌ ${err.message}`);
        }
    };

    const cities = ['Tallinn', 'Tartu', 'Pärnu', 'Narva'];
    const categories = ['SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services'];

    return (
        <div className="admin-dashboard">
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <div className="admin-container">
                <div className="admin-header-bar">
                    <div>
                        <h1 className="admin-title">Admin Dashboard</h1>
                        <p className="admin-subtitle">Manage companies and businesses</p>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        <i className="fas fa-plus-circle"></i> Add Company
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <i className="fas fa-inbox"></i> Pending Requests
                        {pendingRequests.length > 0 && (
                            <span className="badge">{pendingRequests.length}</span>
                        )}
                    </button>
                </div>

                {/* Add Company Form */}
                {activeTab === 'add' && (
                <>
                <div className="admin-card">
                    <h2 className="section-title">Add New Company</h2>

                    <form onSubmit={handleSubmit} className="admin-form">
                        {/* Name */}
                        <div className="form-group">
                            <label htmlFor="name">Company Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder="Enter company name"
                            />
                        </div>

                        {/* City and Category Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city">City *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    className="form-select"
                                >
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="form-select"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="form-group">
                            <label htmlFor="imageFile">Upload Image (or enter URL below)</label>
                            <div className="image-upload-container">
                                <input
                                    type="file"
                                    id="imageFile"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-input"
                                />
                                <label htmlFor="imageFile" className="file-label">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    {imageFile ? imageFile.name : 'Choose image file'}
                                </label>
                            </div>
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="btn-remove-image"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Image URL (alternative) */}
                        <div className="form-group">
                            <label htmlFor="image">Or Enter Image URL</label>
                            <input
                                type="url"
                                id="image"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="https://example.com/image.jpg"
                                disabled={!!imageFile}
                            />
                        </div>

                        {/* Description - Estonian */}
                        <div className="form-group">
                            <label htmlFor="descriptionEt">Description (Estonian) *</label>
                            <textarea
                                id="descriptionEt"
                                name="descriptionEt"
                                value={formData.descriptionEt}
                                onChange={handleInputChange}
                                required
                                className="form-textarea"
                                rows="3"
                                placeholder="Ettevõtte kirjeldus eesti keeles..."
                            />
                        </div>

                        {/* Description - English */}
                        <div className="form-group">
                            <label htmlFor="descriptionEn">Description (English) *</label>
                            <textarea
                                id="descriptionEn"
                                name="descriptionEn"
                                value={formData.descriptionEn}
                                onChange={handleInputChange}
                                required
                                className="form-textarea"
                                rows="3"
                                placeholder="Company description in English..."
                            />
                        </div>

                        {/* Description - Russian */}
                        <div className="form-group">
                            <label htmlFor="descriptionRu">Description (Russian) *</label>
                            <textarea
                                id="descriptionRu"
                                name="descriptionRu"
                                value={formData.descriptionRu}
                                onChange={handleInputChange}
                                required
                                className="form-textarea"
                                rows="3"
                                placeholder="Описание компании на русском языке..."
                            />
                        </div>

                        {/* Social Media URLs Section */}
                        <div className="form-section">
                            <h3 className="section-subtitle">Social Media Links</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="instagramUrl">
                                        <i className="fab fa-instagram"></i> Instagram URL
                                    </label>
                                    <input
                                        type="url"
                                        id="instagramUrl"
                                        name="instagramUrl"
                                        value={formData.instagramUrl}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://instagram.com/username"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tiktokUrl">
                                        <i className="fab fa-tiktok"></i> TikTok URL
                                    </label>
                                    <input
                                        type="url"
                                        id="tiktokUrl"
                                        name="tiktokUrl"
                                        value={formData.tiktokUrl}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://tiktok.com/@username"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="youtubeUrl">
                                    <i className="fab fa-youtube"></i> YouTube URL
                                </label>
                                <input
                                    type="url"
                                    id="youtubeUrl"
                                    name="youtubeUrl"
                                    value={formData.youtubeUrl}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="https://youtube.com/@channel"
                                />
                            </div>
                        </div>

                        {/* Reviewer Name */}
                        <div className="form-group">
                            <label htmlFor="reviewerName">
                                <i className="fas fa-user-check"></i> Reviewer Name
                            </label>
                            <input
                                type="text"
                                id="reviewerName"
                                name="reviewerName"
                                value={formData.reviewerName}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Name of the person who verified this business"
                            />
                            <small className="form-hint">Optional: Add the name of who checked/verified this company</small>
                        </div>

                        {/* Blog Article URL (for Enterprise tier) */}
                        <div className="form-group">
                            <label htmlFor="blogArticleUrl">
                                <i className="fas fa-newspaper"></i> Blog Article URL (Enterprise Only)
                            </label>
                            <input
                                type="url"
                                id="blogArticleUrl"
                                name="blogArticleUrl"
                                value={formData.blogArticleUrl || ''}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="https://example.com/blog/company-review"
                            />
                            <small className="form-hint">Optional: Link to a blog article review (shown only for Enterprise tier)</small>
                        </div>

                        {/* Verified Checkbox */}
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isVerified"
                                    checked={formData.isVerified}
                                    onChange={handleInputChange}
                                    className="form-checkbox"
                                />
                                <span>Verified Business</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={loading || uploading} className="btn-primary">
                            {uploading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Uploading Image...
                                </>
                            ) : loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Adding...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus-circle"></i> Add Company
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Companies Management List */}
                <div className="admin-card">
                    <h2 className="section-title">Manage Companies ({companies.length})</h2>
                    
                    {companies.length === 0 ? (
                        <p className="no-data">No companies found. Add your first company above!</p>
                    ) : (
                        <div className="companies-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>City</th>
                                        <th>Rating</th>
                                        <th>Reviews</th>
                                        <th>Verified</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map(company => (
                                        <tr key={company.id}>
                                            <td className="company-name">
                                                {company.image ? (
                                                    <img 
                                                        src={company.image} 
                                                        alt={company.name}
                                                        className="company-thumb"
                                                    />
                                                ) : (
                                                    <span className="company-icon-thumb">
                                                        {getCategoryIcon(company.mainCategory || 'Teenused')}
                                                    </span>
                                                )}
                                                {company.name}
                                            </td>
                                            <td>{company.category}</td>
                                            <td>{company.city}</td>
                                            <td>{(company.rating || 0).toFixed(1)} ⭐</td>
                                            <td>{company.reviewsCount || 0}</td>
                                            <td>
                                                {company.verified || company.isVerified ? (
                                                    <span className="badge badge-verified">✓ Verified</span>
                                                ) : (
                                                    <span className="badge badge-pending">Pending</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleEdit(company)}
                                                        className="btn-edit"
                                                        title="Edit company"
                                                    >
                                                        <i className="fas fa-edit"></i> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(company.id)}
                                                        className="btn-delete"
                                                        title="Delete company"
                                                    >
                                                        <i className="fas fa-trash"></i> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                </>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'requests' && (
                <div className="admin-card">
                    <h2 className="section-title">
                        <i className="fas fa-inbox"></i> Pending Business Requests ({pendingRequests.length})
                    </h2>
                    
                    {pendingRequests.length === 0 ? (
                        <div className="no-requests">
                            <i className="fas fa-check-circle"></i>
                            <p>No pending requests at the moment!</p>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {pendingRequests.map(request => (
                                <div key={request.id} className="request-card">
                                    <div className="request-header">
                                        {request.image && (
                                            <img 
                                                src={request.image} 
                                                alt={request.name}
                                                className="request-image"
                                            />
                                        )}
                                        <div className="request-info">
                                            <h3>{request.name}</h3>
                                            <div className="request-meta">
                                                <span className="badge category-badge">{request.subCategory || request.category}</span>
                                                <span className="badge city-badge">{request.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="request-details">
                                        {request.email && (
                                            <p><i className="fas fa-envelope"></i> {request.email}</p>
                                        )}
                                        {request.phone && (
                                            <p><i className="fas fa-phone"></i> {request.phone}</p>
                                        )}
                                        {request.website && (
                                            <p><i className="fas fa-globe"></i> {request.website}</p>
                                        )}
                                        {request.description && request.description.en && (
                                            <p className="request-description">
                                                {request.description.en.substring(0, 150)}...
                                            </p>
                                        )}
                                        <p className="request-date">
                                            <i className="fas fa-calendar"></i> 
                                            {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                        </p>
                                        {request.subscriptionLevel && (
                                            <p className="request-plan">
                                                <i className="fas fa-tag"></i> 
                                                <strong>Выбранный план:</strong> 
                                                <span className={`plan-badge plan-${request.subscriptionLevel}`}>
                                                    {request.subscriptionLevel === 'basic' && '📄 Basic (Free)'}
                                                    {request.subscriptionLevel === 'pro' && '⚡ Pro (€29)'}
                                                    {request.subscriptionLevel === 'enterprise' && '💎 Enterprise (€50)'}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="request-actions">
                                        {/* Show Approve buttons only for pending/pending_payment requests */}
                                        {request.approvalStatus !== 'approved' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApproveRequest(request.id)}
                                                    className="btn-approve-main"
                                                >
                                                    <i className="fas fa-check"></i> Approve ({request.subscriptionLevel || 'basic'})
                                                </button>
                                                
                                                {/* Show plan change buttons only if not already in that plan */}
                                                {request.subscriptionLevel !== 'basic' && (
                                                    <button 
                                                        onClick={() => handleApproveRequest(request.id, 'basic')}
                                                        className="btn-approve-free"
                                                    >
                                                        <i className="fas fa-arrow-down"></i> Downgrade to Basic
                                                    </button>
                                                )}
                                                {request.subscriptionLevel !== 'pro' && (
                                                    <button 
                                                        onClick={() => handleApproveRequest(request.id, 'pro')}
                                                        className="btn-approve-medium"
                                                    >
                                                        <i className="fas fa-star"></i> Change to Pro (€29)
                                                    </button>
                                                )}
                                                {request.subscriptionLevel !== 'enterprise' && (
                                                    <button 
                                                        onClick={() => handleApproveRequest(request.id, 'enterprise')}
                                                        className="btn-approve-strong"
                                                    >
                                                        <i className="fas fa-crown"></i> Upgrade to Enterprise (€50)
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Show approved badge if already approved */}
                                        {request.approvalStatus === 'approved' && (
                                            <div className="approved-badge">
                                                <i className="fas fa-check-circle"></i> Already Approved
                                            </div>
                                        )}
                                        
                                        {/* Ban/Block button always available */}
                                        <button 
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="btn-reject"
                                            title={request.approvalStatus === 'approved' ? 'Block/Ban this company' : 'Reject this request'}
                                        >
                                            <i className="fas fa-ban"></i> {request.approvalStatus === 'approved' ? 'Ban/Block' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Edit Company Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={handleCloseEditModal}>
                    <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><i className="fas fa-edit"></i> Edit Company</h2>
                            <button onClick={handleCloseEditModal} className="modal-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateCompany} className="edit-form">
                            <div className="form-grid">
                                {/* Company Name */}
                                <div className="form-group">
                                    <label htmlFor="name">Company Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                {/* City */}
                                <div className="form-group">
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                {/* Category */}
                                <div className="form-group">
                                    <label htmlFor="category">Category *</label>
                                    <input
                                        type="text"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                {/* Verified */}
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isVerified"
                                            checked={formData.isVerified}
                                            onChange={handleInputChange}
                                            className="form-checkbox"
                                        />
                                        <span>Verified Business</span>
                                    </label>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label htmlFor="imageFile">Upload New Image (Cloudinary)</label>
                                <input
                                    type="file"
                                    id="imageFile"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                                toast.error('Image size must be less than 5 MB');
                                                return;
                                            }
                                            setImageFile(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => setImagePreview(reader.result);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="form-input"
                                />
                                <small className="form-hint">Max 5MB. New image will replace current one.</small>
                                
                                {imagePreview && (
                                    <div className="image-preview" style={{ marginTop: '10px' }}>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            style={{ 
                                                maxWidth: '300px', 
                                                borderRadius: '8px',
                                                border: '2px solid #e5e7eb'
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Descriptions */}
                            <div className="form-group">
                                <label htmlFor="descriptionEt">Description (Estonian)</label>
                                <textarea
                                    id="descriptionEt"
                                    name="descriptionEt"
                                    value={formData.descriptionEt}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="descriptionEn">Description (English)</label>
                                <textarea
                                    id="descriptionEn"
                                    name="descriptionEn"
                                    value={formData.descriptionEn}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="descriptionRu">Description (Russian)</label>
                                <textarea
                                    id="descriptionRu"
                                    name="descriptionRu"
                                    value={formData.descriptionRu}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="form-textarea"
                                />
                            </div>

                            {/* Social Media */}
                            <div className="form-group">
                                <label htmlFor="instagramUrl">Instagram URL</label>
                                <input
                                    type="url"
                                    id="instagramUrl"
                                    name="instagramUrl"
                                    value={formData.instagramUrl}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tiktokUrl">TikTok URL</label>
                                <input
                                    type="url"
                                    id="tiktokUrl"
                                    name="tiktokUrl"
                                    value={formData.tiktokUrl}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="https://tiktok.com/@..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="youtubeUrl">YouTube URL</label>
                                <input
                                    type="url"
                                    id="youtubeUrl"
                                    name="youtubeUrl"
                                    value={formData.youtubeUrl}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="https://youtube.com/@..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    onClick={handleCloseEditModal}
                                    className="btn-secondary"
                                    disabled={loading || uploadingCloudinary}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={loading || uploadingCloudinary}
                                >
                                    {uploadingCloudinary ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Uploading...
                                        </>
                                    ) : loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
