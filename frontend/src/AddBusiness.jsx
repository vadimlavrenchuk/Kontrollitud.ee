// Kontrollitud.ee/frontend/src/AddBusiness.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from './AuthContext';
import { uploadBusinessImage } from './firebase';
import { CATEGORIES, getMainCategories, getSubcategories, getCategoryIcon } from './constants/categories';
import 'react-toastify/dist/ReactToastify.css';
import './styles/AddBusiness.scss';

const API_BASE_URL = 'http://localhost:5000/api/business-submission';

function AddBusiness() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        name: '',
        mainCategory: 'Puhkus',
        subCategory: 'SPA',
        city: 'Tallinn',
        
        // Step 2: Contact Info
        email: '',
        phone: '',
        website: '',
        
        // Step 3: Description
        descriptionEt: '',
        descriptionEn: '',
        descriptionRu: '',
        
        // Step 4: Additional Info
        image: '',
        instagramUrl: '',
        tiktokUrl: '',
        youtubeUrl: ''
    });

    const mainCategories = getMainCategories();
    const cities = [
        'Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 
        'Maardu', 'Rakvere', 'Kuressaare', 'Sillamäe', 'Valga', 'Võru', 
        'Jõhvi', 'Haapsalu', 'Keila', 'Paide'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMainCategoryChange = (e) => {
        const newMainCategory = e.target.value;
        const subcategories = getSubcategories(newMainCategory);
        setFormData(prev => ({
            ...prev,
            mainCategory: newMainCategory,
            subCategory: subcategories[0] || '' // Set first subcategory as default
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            
            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNextStep = () => {
        // Validate current step
        if (currentStep === 1) {
            if (!formData.name) {
                toast.error(t('please_enter_business_name'));
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.email) {
                toast.error(t('please_enter_email'));
                return;
            }
        } else if (currentStep === 3) {
            // Require at least one description (preferably Estonian)
            if (!formData.descriptionEt && !formData.descriptionEn && !formData.descriptionRu) {
                toast.error(t('please_provide_at_least_one_description'));
                return;
            }
        }
        
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        
        try {
            // Upload image if one was selected
            let imageUrl = formData.image;
            if (imageFile) {
                setUploadingImage(true);
                toast.info(t('uploading_image'));
                
                const { url, error } = await uploadBusinessImage(imageFile, formData.name);
                
                if (error) {
                    setUploadingImage(false);
                    toast.error(t('image_upload_error'));
                    throw new Error(t('image_upload_error'));
                }
                
                imageUrl = url;
                setUploadingImage(false);
                toast.success(t('image_uploaded_success'));
            }
            
            // Format description as object
            const submissionData = {
                ...formData,
                image: imageUrl,
                category: formData.subCategory, // Legacy field for backward compatibility
                userId: user?.uid, // Add Firebase user ID
                userEmail: user?.email, // Add user email for tracking
                description: {
                    et: formData.descriptionEt,
                    en: formData.descriptionEn,
                    ru: formData.descriptionRu
                }
            };
            
            // Remove individual description fields
            delete submissionData.descriptionEt;
            delete submissionData.descriptionEn;
            delete submissionData.descriptionRu;
            
            // Get Firebase auth token
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Check for duplicate business name error
                if (response.status === 400 || (data.error && (data.error.includes('11000') || data.error.includes('duplicate')))) {
                    throw new Error(t('business_name_exists'));
                }
                throw new Error(data.error || t('business_submit_error'));
            }

            toast.success(t('business_submitted_success'));
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            // Show user-friendly error message
            const errorMessage = error.message || t('business_submit_error');
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    const renderStepIndicator = () => {
        return (
            <div className="step-indicator">
                {[1, 2, 3, 4].map(step => (
                    <div 
                        key={step} 
                        className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
                    >
                        <div className="step-number">{step}</div>
                        <div className="step-label">
                            {step === 1 && t('step_basic_info')}
                            {step === 2 && t('step_contact')}
                            {step === 3 && t('step_description')}
                            {step === 4 && t('step_additional')}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="form-step">
            <h2>{t('basic_information')}</h2>
            
            <div className="form-group">
                <label htmlFor="name">{t('business_name')} *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t('enter_business_name')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="city">{t('city_linn')} *</label>
                <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                >
                    {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="mainCategory">{t('main_category')} *</label>
                <select
                    id="mainCategory"
                    name="mainCategory"
                    value={formData.mainCategory}
                    onChange={handleMainCategoryChange}
                    required
                    className="form-select"
                >
                    {mainCategories.map(cat => (
                        <option key={cat} value={cat}>
                            {getCategoryIcon(cat)} {t(cat)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="subCategory">{t('sub_category')} *</label>
                <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                >
                    {getSubcategories(formData.mainCategory).map(subCat => (
                        <option key={subCat} value={subCat}>{t(subCat)}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="form-step">
            <h2>{t('contact_information')}</h2>
            
            <div className="form-group">
                <label htmlFor="email">{t('email_address')} *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t('email_placeholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="phone">{t('phone_number')}</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('phone_placeholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="website">{t('website_url')}</label>
                <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('website_placeholder')}
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="form-step">
            <h2>{t('business_description')}</h2>
            <p className="step-hint">{t('at_least_one_description_required')}</p>
            
            <div className="form-group">
                <label htmlFor="descriptionEt">{t('description_estonian')}</label>
                <textarea
                    id="descriptionEt"
                    name="descriptionEt"
                    value={formData.descriptionEt}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder={t('description_placeholder_et')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="descriptionEn">{t('description_english')}</label>
                <textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder={t('description_placeholder_en')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="descriptionRu">{t('description_russian')}</label>
                <textarea
                    id="descriptionRu"
                    name="descriptionRu"
                    value={formData.descriptionRu}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder={t('description_placeholder_ru')}
                />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="form-step">
            <h2>{t('additional_information')}</h2>
            
            <div className="form-group">
                <label htmlFor="imageFile">{t('business_image')}</label>
                <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-input"
                />
                <small className="form-hint">{t('image_upload_hint')}</small>
                
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px', borderRadius: '8px' }} />
                    </div>
                )}
            </div>

            <h3 className="section-subtitle">{t('social_media_optional')}</h3>
            
            <div className="form-group">
                <label htmlFor="instagramUrl">{t('instagram_url')}</label>
                <input
                    type="url"
                    id="instagramUrl"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('instagram_placeholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="tiktokUrl">{t('tiktok_url')}</label>
                <input
                    type="url"
                    id="tiktokUrl"
                    name="tiktokUrl"
                    value={formData.tiktokUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('tiktok_placeholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="youtubeUrl">{t('youtube_url')}</label>
                <input
                    type="url"
                    id="youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('youtube_placeholder')}
                />
            </div>
        </div>
    );

    return (
        <div className="add-business-page">
            <Helmet>
                <title>{t('add_business_page_title')} | Kontrollitud.ee</title>
                <meta name="description" content={t('add_business_subtitle')} />
            </Helmet>
            
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
            />
            
            <div className="add-business-container">
                <div className="page-header">
                    <Link to="/" className="back-link">
                        <i className="fas fa-arrow-left"></i> {t('back_to_home')}
                    </Link>
                    <h1>{t('add_business_page_title')}</h1>
                    <p className="page-subtitle">
                        {t('add_business_subtitle')}
                    </p>
                </div>

                {renderStepIndicator()}

                <div className="form-container">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </div>

                <div className="form-actions">
                    {currentStep > 1 && (
                        <button 
                            type="button"
                            onClick={handlePrevStep}
                            className="btn-secondary"
                        >
                            <i className="fas fa-arrow-left"></i> {t('btn_previous')}
                        </button>
                    )}
                    
                    {currentStep < 4 ? (
                        <button 
                            type="button"
                            onClick={handleNextStep}
                            className="btn-primary"
                        >
                            {t('btn_next')} <i className="fas fa-arrow-right"></i>
                        </button>
                    ) : (
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-submit"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> {t('submitting')}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i> {t('btn_submit')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddBusiness;
