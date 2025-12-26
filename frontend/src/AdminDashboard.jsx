// Kontrollitud.ee/frontend/src/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/AdminDashboard.scss';

const API_BASE_URL = 'http://localhost:5000/api/companies';
const UPLOAD_URL = 'http://localhost:5000/api/upload';

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
        isVerified: false
    });
    
    // Image upload state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Companies list state
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all companies on component mount
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();
            setCompanies(data);
        } catch (err) {
            console.error('Error fetching companies:', err);
            toast.error('Failed to fetch companies');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
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
                isVerified: false
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
            const response = await fetch(`${API_BASE_URL}/${companyId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete company');
            }

            toast.success('🗑️ Company deleted successfully!');
            fetchCompanies();

        } catch (err) {
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

                {/* Add Company Form */}
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
                                        <tr key={company._id}>
                                            <td className="company-name">
                                                {company.image && (
                                                    <img 
                                                        src={company.image} 
                                                        alt={company.name}
                                                        className="company-thumb"
                                                    />
                                                )}
                                                {company.name}
                                            </td>
                                            <td>{company.category}</td>
                                            <td>{company.city}</td>
                                            <td>{(company.rating || 0).toFixed(1)} ⭐</td>
                                            <td>{company.reviewsCount || 0}</td>
                                            <td>
                                                {company.isVerified ? (
                                                    <span className="badge badge-verified">✓ Verified</span>
                                                ) : (
                                                    <span className="badge badge-pending">Pending</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(company._id)}
                                                    className="btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
