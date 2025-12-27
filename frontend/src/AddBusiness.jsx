// Kontrollitud.ee/frontend/src/AddBusiness.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from './AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './styles/AddBusiness.scss';

const API_BASE_URL = 'http://localhost:5000/api/business-submission';

function AddBusiness() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        name: '',
        category: 'SPA',
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

    const categories = ['SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services'];
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

    const handleNextStep = () => {
        // Validate current step
        if (currentStep === 1) {
            if (!formData.name) {
                toast.error('Please enter business name');
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.email) {
                toast.error('Please enter email address');
                return;
            }
        } else if (currentStep === 3) {
            if (!formData.descriptionEt || !formData.descriptionEn || !formData.descriptionRu) {
                toast.error('Please provide descriptions in all languages');
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
            // Format description as object
            const submissionData = {
                ...formData,
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
                throw new Error(data.error || 'Failed to submit business');
            }

            toast.success('✅ Business submitted successfully! It will appear after admin approval.');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            toast.error(`❌ ${error.message}`);
        } finally {
            setLoading(false);
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
                <label htmlFor="category">{t('category')} *</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{t(cat)}</option>
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
            <p className="step-hint">{t('descriptions_all_languages')}</p>
            
            <div className="form-group">
                <label htmlFor="descriptionEt">{t('description_estonian')} *</label>
                <textarea
                    id="descriptionEt"
                    name="descriptionEt"
                    value={formData.descriptionEt}
                    onChange={handleInputChange}
                    required
                    className="form-textarea"
                    rows="4"
                    placeholder={t('description_placeholder_et')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="descriptionEn">{t('description_english')} *</label>
                <textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={handleInputChange}
                    required
                    className="form-textarea"
                    rows="4"
                    placeholder={t('description_placeholder_en')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="descriptionRu">{t('description_russian')} *</label>
                <textarea
                    id="descriptionRu"
                    name="descriptionRu"
                    value={formData.descriptionRu}
                    onChange={handleInputChange}
                    required
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
                <label htmlFor="image">{t('business_image_url')}</label>
                <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('image_url_placeholder')}
                />
                <small className="form-hint">{t('image_url_hint')}</small>
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
