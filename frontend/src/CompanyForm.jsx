// Kontrollitud.ee/frontend/src/CompanyForm.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/CompanyList.scss';

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CompanyForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        contactEmail: '',
        category: 'Услуги',
        description: '',
        status: 'pending',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field) => (e) => {
        const value = field === 'status' ? e.target.value : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('submit_error'));
            }

            setSuccess(true);
            setTimeout(() => navigate('/'), 400);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Услуги', 'Магазин', 'Спа', 'Ресторан'];

    return (
        <div className="container">
            <div className="controls-bar" style={{ marginBottom: '20px' }}>
                <Link to="/" className="add-button">{t('back_to_list')}</Link>
            </div>

            <h2>{t('add_company')}</h2>
            <form onSubmit={handleSubmit} className="company-form">
                <div className="form-group">
                    <label htmlFor="name">{t('company_name')}:</label>
                    <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange('name')}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">{t('contact_email')}:</label>
                    <input
                        id="email"
                        type="email"
                        value={form.contactEmail}
                        onChange={handleChange('contactEmail')}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">{t('category')}:</label>
                    <select
                        id="category"
                        value={form.category}
                        onChange={handleChange('category')}
                        disabled={loading}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">{t('description')}:</label>
                    <textarea
                        id="description"
                        value={form.description}
                        onChange={handleChange('description')}
                        rows="4"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <label htmlFor="status">{t('verification_status')}:</label>
                    <select
                        id="status"
                        value={form.status}
                        onChange={handleChange('status')}
                        disabled={loading}
                    >
                        <option value="pending">{t('pending')}</option>
                        <option value="verified">{t('verified')}</option>
                        <option value="rejected">{t('rejected')}</option>
                    </select>
                </div>

                <button type="submit" className="add-button" disabled={loading}>
                    {loading ? t('submitting') : t('add_company')}
                </button>

                {error && <p className="error-message" style={{ marginTop: '10px' }}>{error}</p>}
                {success && <p className="success-message" style={{ marginTop: '10px' }}>{t('company_added')}</p>}
            </form>
        </div>
    );
}

export default CompanyForm;