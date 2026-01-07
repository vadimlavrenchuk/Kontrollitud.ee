// Kontrollitud.ee/frontend/src/EditCompany.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faImage } from '@fortawesome/free-solid-svg-icons';
import './styles/EditCompany.scss';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

function EditCompany() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        website: '',
        instagramUrl: '',
        tiktokUrl: '',
        youtubeUrl: '',
        descriptionEt: '',
        descriptionEn: '',
        descriptionRu: '',
        image: ''
    });

    useEffect(() => {
        if (!user) {
            toast.error(t('please_login'));
            navigate('/auth');
            return;
        }
        fetchCompanyData();
    }, [user, id]);

    const fetchCompanyData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/user/submissions?userId=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch company');
            }
            
            const submissions = await response.json();
            const company = submissions.find(c => c._id === id);
            
            if (!company) {
                toast.error(t('company_not_found'));
                navigate('/dashboard');
                return;
            }
            
            // Populate form
            setFormData({
                name: company.name || '',
                phone: company.phone || '',
                email: company.email || '',
                website: company.website || '',
                instagramUrl: company.instagramUrl || '',
                tiktokUrl: company.tiktokUrl || '',
                youtubeUrl: company.youtubeUrl || '',
                descriptionEt: company.description?.et || '',
                descriptionEn: company.description?.en || '',
                descriptionRu: company.description?.ru || '',
                image: company.image || ''
            });
            
            setImagePreview(company.image || PLACEHOLDER_IMAGE);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching company:', error);
            toast.error(t('failed_to_load_company'));
            navigate('/dashboard');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('image_too_large'));
            return;
        }
        
        setImageFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || !formData.email) {
            toast.error(t('fill_required_fields'));
            return;
        }
        
        setSaving(true);
        
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('website', formData.website);
            formDataToSend.append('instagramUrl', formData.instagramUrl);
            formDataToSend.append('tiktokUrl', formData.tiktokUrl);
            formDataToSend.append('youtubeUrl', formData.youtubeUrl);
            
            // Multi-language description
            const description = {
                et: formData.descriptionEt,
                en: formData.descriptionEn,
                ru: formData.descriptionRu
            };
            formDataToSend.append('description', JSON.stringify(description));
            
            if (imageFile) {
                formDataToSend.append('logo', imageFile);
            }
            
            const response = await fetch(`${apiUrl}/api/user/companies/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update company');
            }
            
            toast.success(t('company_updated_successfully'));
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating company:', error);
            toast.error(error.message || t('failed_to_update_company'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-company">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-company">
            <Helmet>
                <title>{t('edit_company')} - Kontrollitud.ee</title>
            </Helmet>

            <div className="edit-container">
                <Link to="/dashboard" className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>{t('back_to_dashboard')}</span>
                </Link>

                <div className="edit-header">
                    <h1>{t('edit_company')}</h1>
                    <p>{t('edit_company_description')}</p>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h2>{t('basic_information')}</h2>
                        
                        <div className="form-group">
                            <label>{t('business_name')} *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('phone')} *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>{t('email')} *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>{t('website')}</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="form-section">
                        <h2>{t('social_media')}</h2>
                        
                        <div className="form-group">
                            <label>Instagram</label>
                            <input
                                type="url"
                                name="instagramUrl"
                                value={formData.instagramUrl}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>TikTok</label>
                            <input
                                type="url"
                                name="tiktokUrl"
                                value={formData.tiktokUrl}
                                onChange={handleChange}
                                placeholder="https://tiktok.com/@..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>YouTube</label>
                            <input
                                type="url"
                                name="youtubeUrl"
                                value={formData.youtubeUrl}
                                onChange={handleChange}
                                placeholder="https://youtube.com/@..."
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-section">
                        <h2>{t('description')}</h2>
                        
                        <div className="form-group">
                            <label>{t('description_estonian')}</label>
                            <textarea
                                name="descriptionEt"
                                value={formData.descriptionEt}
                                onChange={handleChange}
                                rows="4"
                                placeholder={t('describe_business_estonian')}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>{t('description_english')}</label>
                            <textarea
                                name="descriptionEn"
                                value={formData.descriptionEn}
                                onChange={handleChange}
                                rows="4"
                                placeholder={t('describe_business_english')}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>{t('description_russian')}</label>
                            <textarea
                                name="descriptionRu"
                                value={formData.descriptionRu}
                                onChange={handleChange}
                                rows="4"
                                placeholder={t('describe_business_russian')}
                            />
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="form-section">
                        <h2>{t('company_logo')}</h2>
                        
                        <div className="image-upload-section">
                            <div className="image-preview">
                                <img src={imagePreview} alt="Logo preview" />
                            </div>
                            
                            <div className="image-upload-controls">
                                <label htmlFor="logo-upload" className="upload-button">
                                    <FontAwesomeIcon icon={faImage} />
                                    <span>{t('change_logo')}</span>
                                </label>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                                <p className="upload-hint">{t('image_upload_hint')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={saving}>
                            <FontAwesomeIcon icon={faSave} />
                            <span>{saving ? t('saving') : t('save_changes')}</span>
                        </button>
                        
                        <Link to="/dashboard" className="btn-cancel">
                            {t('cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCompany;
