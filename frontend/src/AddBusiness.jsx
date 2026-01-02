// Kontrollitud.ee/frontend/src/AddBusiness.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from './AuthContext';
import { db, uploadBusinessImage } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CATEGORIES, getMainCategories, getSubcategories, getCategoryIcon } from './constants/categories';
import 'react-toastify/dist/ReactToastify.css';
import './styles/AddBusiness.scss';

// SVG placeholder for images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

function AddBusiness() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
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

        // Auto-update subcategory based on main category
        if (name === 'mainCategory') {
            const subcategories = getSubcategories(value);
            if (subcategories.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    mainCategory: value,
                    subCategory: subcategories[0]
                }));
            }
        }
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(t('please_select_image_file'));
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t('image_too_large'));
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

    const handleMainCategoryChange = (e) => {
        const newMainCategory = e.target.value;
        const subcategories = getSubcategories(newMainCategory);
        setFormData(prev => ({
            ...prev,
            mainCategory: newMainCategory,
            subCategory: subcategories[0] || '' // Set first subcategory as default
        }));
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
        console.log('🚀 Начинаю отправку формы...');
        console.log('FormData:', formData);
        console.log('User:', user);
        console.log('DB object:', db);
        
        setLoading(true);
        
        try {
            console.log('✓ Step 1: Начало try блока');
            
            // Validate that at least one description is provided
            if (!formData.descriptionEt && !formData.descriptionEn && !formData.descriptionRu) {
                console.log('❌ Validation failed: no description');
                toast.error(t('please_provide_at_least_one_description'));
                setLoading(false);
                return;
            }

            console.log('✓ Step 2: Validation passed');

            // Upload image to Cloudinary if file selected
            let imageUrl = PLACEHOLDER_IMAGE;
            
            if (imageFile) {
                setUploadingImage(true);
                toast.info(t('uploading_image'));
                try {
                    imageUrl = await uploadToCloudinary(imageFile);
                    toast.success(t('image_uploaded_success'));
                    console.log('✓ Step 3: Image uploaded to Cloudinary:', imageUrl);
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    toast.warning(t('image_upload_failed'));
                    imageUrl = PLACEHOLDER_IMAGE;
                } finally {
                    setUploadingImage(false);
                }
            } else if (formData.image && formData.image.trim() !== '') {
                // Use provided image URL if no file selected
                imageUrl = formData.image;
                console.log('✓ Step 3: Using provided image URL:', imageUrl);
            } else {
                console.log('✓ Step 3: No image provided, using placeholder');
            }
            
            console.log('✓ Step 4: Preparing data for Firestore...');
            
            // Prepare data for Firestore
            const submissionData = {
                // Basic Info
                name: formData.name,
                mainCategory: formData.mainCategory,
                subCategory: formData.subCategory,
                category: formData.subCategory, // Legacy field
                city: formData.city,
                
                // Contact Info
                email: formData.email,
                phone: formData.phone || '',
                website: formData.website || '',
                
                // Descriptions (multi-language)
                description: {
                    et: formData.descriptionEt || '',
                    en: formData.descriptionEn || '',
                    ru: formData.descriptionRu || ''
                },
                
                // Additional Info
                image: imageUrl,
                instagramUrl: formData.instagramUrl || '',
                tiktokUrl: formData.tiktokUrl || '',
                youtubeUrl: formData.youtubeUrl || '',
                
                // Status and tracking fields
                status: 'pending',
                verified: false,
                ownerId: user?.uid || null,
                ownerEmail: user?.email || formData.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            console.log('✓ Step 5: Submitting business to Firestore:', submissionData);
            console.log('Collection path:', 'pending_companies');
            console.log('About to call addDoc...');
            
            // Add to pending_companies collection
            const docRef = await addDoc(collection(db, 'pending_companies'), submissionData);
            
            console.log('✓ Step 6: addDoc completed successfully!');
            
            console.log('✅ Business submission created with ID:', docRef.id);
            
            // Show success state
            setSubmitted(true);
            toast.success(t('business_submitted_success'));
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                if (user) {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }, 3000);

        } catch (error) {
            console.log('🔴 Ошибка:', error);
            console.error('❌ Error submitting business:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            
            const errorMessage = error.message || t('business_submit_error');
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
            // setUploadingImage(false);
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
                <label htmlFor="imageFile">{t('upload_logo_or_photo')}</label>
                <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-input"
                />
                <small className="form-hint">{t('max_file_size_5mb')}</small>
                
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px', borderRadius: '8px' }} />
                    </div>
                )}
                
                {uploadingImage && (
                    <div className="uploading-indicator">
                        <span>⏳ {t('uploading_image')}...</span>
                    </div>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="image">{t('or_paste_image_url')}</label>
                <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/logo.jpg"
                    disabled={!!imageFile}
                />
                <small className="form-hint">{t('image_url_hint')}</small>
                
                {!imagePreview && formData.image && formData.image.trim() !== '' && (
                    <div className="image-preview">
                        <img src={formData.image} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px', borderRadius: '8px' }} />
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

                {/* Success State */}
                {submitted ? (
                    <div className="success-state">
                        <div className="success-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2>{t('business_submitted_success')}</h2>
                        <p className="success-message">
                            {t('status_pending_desc')}
                        </p>
                        <div className="success-actions">
                            <Link to="/" className="btn-primary">
                                <i className="fas fa-home"></i> {t('back_to_home')}
                            </Link>
                            {user && (
                                <Link to="/dashboard" className="btn-secondary">
                                    <i className="fas fa-tachometer-alt"></i> {t('my_dashboard')}
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
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
                </>
                )}
            </div>
        </div>
    );
}

export default AddBusiness;
