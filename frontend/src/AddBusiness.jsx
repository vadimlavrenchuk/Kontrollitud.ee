// Kontrollitud.ee/frontend/src/AddBusiness.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from './AuthContext';
import { db, uploadBusinessImage } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
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
        
        // Step 4: Plan Selection
        plan: 'basic',
        
        // Step 5: Additional Info (only for pro/enterprise)
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
        } else if (currentStep === 4) {
            // Step 4 is plan selection - no validation needed, plan has default value
            // If basic plan, skip to submission (no step 5)
            if (formData.plan === 'basic') {
                return; // Stay on step 4, show submit button
            }
        }
        
        // Move to next step
        // Max step is 5 if pro/enterprise, 4 if basic
        const maxStep = formData.plan === 'basic' ? 4 : 5;
        if (currentStep < maxStep) {
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

            // Upload image to Cloudinary if file selected and plan is not basic
            let imageUrl = PLACEHOLDER_IMAGE;
            
            // Only handle image upload for pro and enterprise plans
            if (formData.plan !== 'basic') {
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
            } else {
                // For basic plan, always use placeholder (category icon will be shown)
                console.log('✓ Step 3: Basic plan - using placeholder image');
            }
            
            console.log('✓ Step 4: Preparing data for Firestore...');
            
            // Use plan from form instead of fetching from user profile
            const selectedPlan = formData.plan || 'basic';
            console.log('✓ Selected plan from form:', selectedPlan);
            
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
                instagramUrl: formData.plan !== 'basic' ? (formData.instagramUrl || '') : '',
                tiktokUrl: formData.plan !== 'basic' ? (formData.tiktokUrl || '') : '',
                youtubeUrl: formData.plan !== 'basic' ? (formData.youtubeUrl || '') : '',
                
                // Subscription Level (from form selection)
                subscriptionLevel: selectedPlan,
                
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
        // Show 5 steps for pro/enterprise, 4 for basic
        const totalSteps = formData.plan === 'basic' ? 4 : 5;
        const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
        
        return (
            <div className="step-indicator">
                {steps.map(step => (
                    <div 
                        key={step} 
                        className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
                    >
                        <div className="step-number">{step}</div>
                        <div className="step-label">
                            {step === 1 && t('step_basic_info')}
                            {step === 2 && t('step_contact')}
                            {step === 3 && t('step_description')}
                            {step === 4 && (t('step_plan') || 'План')}
                            {step === 5 && (t('step_additional') || 'Дополнительно')}
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
            <h2>{t('choose_plan') || 'Выберите тарифный план'}</h2>
            <p className="step-hint">{t('plan_preview_hint') || 'Посмотрите, как будет выглядеть ваша карточка бизнеса'}</p>
            
            <div className="plan-selection-form">
                <div className="plan-preview-grid">
                    {/* BASIC PLAN PREVIEW */}
                    <label className={`plan-preview-card basic-preview ${formData.plan === 'basic' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="plan"
                            value="basic"
                            checked={formData.plan === 'basic'}
                            onChange={handleInputChange}
                        />
                        <div className="preview-header">
                            <span className="plan-badge">📄 Basic</span>
                            <span className="plan-price-tag">{t('free') || 'Бесплатно'}</span>
                        </div>
                        <div className="business-card-preview">
                            {/* Image placeholder with icon */}
                            <div className="preview-image basic-image">
                                <i className="fas fa-building" style={{ fontSize: '3rem', color: '#9ca3af' }}></i>
                            </div>
                            {/* Content */}
                            <div className="preview-content">
                                <h3 className="preview-business-name">Ваш Бизнес</h3>
                                <div className="preview-meta">
                                    <span className="preview-category">Категория</span>
                                    <span className="preview-city">Город</span>
                                </div>
                                <p className="preview-description">
                                    Краткое описание вашего бизнеса будет отображаться здесь...
                                </p>
                            </div>
                        </div>
                        <div className="preview-footer">
                            <small>✗ Без фото • ✗ Без рейтинга • ✗ Без соцсетей</small>
                        </div>
                    </label>

                    {/* PRO PLAN PREVIEW */}
                    <label className={`plan-preview-card pro-preview ${formData.plan === 'pro' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="plan"
                            value="pro"
                            checked={formData.plan === 'pro'}
                            onChange={handleInputChange}
                        />
                        <div className="preview-header">
                            <span className="plan-badge pro-badge">⚡ Pro</span>
                            <span className="plan-price-tag">€29/{t('month') || 'мес'}</span>
                        </div>
                        <div className="business-card-preview verified-preview">
                            {/* Image with verified badge */}
                            <div className="preview-image pro-image">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%233b82f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EВаше фото%3C/text%3E%3C/svg%3E" alt="Preview" />
                                <div className="preview-verified-badge">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Verified</span>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="preview-content">
                                <h3 className="preview-business-name">
                                    Ваш Бизнес <span className="pro-checkmark">✔️</span>
                                </h3>
                                <div className="preview-meta">
                                    <span className="preview-category">Категория</span>
                                    <span className="preview-city">Город</span>
                                </div>
                                {/* Rating */}
                                <div className="preview-rating">
                                    <span className="stars">★★★★★</span>
                                    <span className="rating-text">5.0 (10 отзывов)</span>
                                </div>
                                <p className="preview-description">
                                    Ваше описание с приоритетом в поиске...
                                </p>
                                {/* Social icons */}
                                <div className="preview-social">
                                    <span className="social-icon instagram"><i className="fab fa-instagram"></i></span>
                                    <span className="social-icon tiktok"><i className="fab fa-tiktok"></i></span>
                                    <span className="social-icon youtube"><i className="fab fa-youtube"></i></span>
                                </div>
                            </div>
                        </div>
                        <div className="preview-footer">
                            <small>✓ Фото • ✓ Рейтинг • ✓ Соцсети • ✓ Синяя галочка</small>
                        </div>
                    </label>

                    {/* ENTERPRISE PLAN PREVIEW */}
                    <label className={`plan-preview-card enterprise-preview ${formData.plan === 'enterprise' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="plan"
                            value="enterprise"
                            checked={formData.plan === 'enterprise'}
                            onChange={handleInputChange}
                        />
                        <div className="preview-header">
                            <span className="plan-badge enterprise-badge">💎 Enterprise</span>
                            <span className="plan-price-tag">€50/{t('month') || 'мес'}</span>
                        </div>
                        <div className="business-card-preview enterprise-card">
                            <div className="top-priority-badge">
                                <i className="fas fa-crown"></i> TOP Priority
                            </div>
                            {/* Image */}
                            <div className="preview-image enterprise-image">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Cdefs%3E%3ClinearGradient id='gold' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fbbf24'/%3E%3Cstop offset='100%25' style='stop-color:%23f59e0b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='200' fill='url(%23gold)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='white' font-weight='bold'%3EПРЕМИУМ БАННЕР%3C/text%3E%3C/svg%3E" alt="Premium" />
                            </div>
                            {/* Content */}
                            <div className="preview-content">
                                <h3 className="preview-business-name">
                                    Ваш Бизнес <span className="enterprise-crown">🏆</span>
                                </h3>
                                <div className="preview-meta">
                                    <span className="preview-category">Категория</span>
                                    <span className="preview-city">Город</span>
                                </div>
                                {/* Rating */}
                                <div className="preview-rating">
                                    <span className="stars gold-stars">★★★★★</span>
                                    <span className="rating-text">5.0 (50+ отзывов)</span>
                                </div>
                                <p className="preview-description">
                                    Премиум описание с максимальным охватом и топовым размещением...
                                </p>
                                {/* Social icons */}
                                <div className="preview-social">
                                    <span className="social-icon instagram"><i className="fab fa-instagram"></i></span>
                                    <span className="social-icon tiktok"><i className="fab fa-tiktok"></i></span>
                                    <span className="social-icon youtube"><i className="fab fa-youtube"></i></span>
                                </div>
                                {/* Blog button */}
                                <button className="preview-blog-button" type="button">
                                    📰 Читать обзор в блоге
                                </button>
                            </div>
                        </div>
                        <div className="preview-footer">
                            <small>✓ Все из Pro • ✓ Золотая рамка • ✓ Блог • ✓ ТОП-1</small>
                        </div>
                    </label>
                </div>
                
                {formData.plan === 'basic' && (
                    <div className="plan-notice">
                        <i className="fas fa-info-circle"></i>
                        <p>{t('basic_plan_notice') || 'С планом Basic ваш бизнес будет отображаться с иконкой категории вместо фото'}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="form-step">
            <h2>{t('additional_information')}</h2>
            <p className="step-hint">{t('upload_photo_and_social_links')}</p>
            
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
                            {currentStep === 5 && renderStep5()}
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
                    
                    {/* Show Next button for steps 1-3, and step 4 only if pro/enterprise */}
                    {(currentStep < 4 || (currentStep === 4 && formData.plan !== 'basic')) ? (
                        <button 
                            type="button"
                            onClick={handleNextStep}
                            className="btn-primary"
                        >
                            {t('btn_next')} <i className="fas fa-arrow-right"></i>
                        </button>
                    ) : (
                        /* Show Submit button on step 4 for basic, or step 5 for pro/enterprise */
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
