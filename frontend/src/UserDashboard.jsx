// Kontrollitud.ee/frontend/src/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClipboardList, 
    faMapMarkerAlt, 
    faEdit, 
    faCheckCircle, 
    faHourglassHalf, 
    faTimesCircle,
    faCalendarAlt,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import './styles/UserDashboard.scss';

function UserDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            toast.error(t('please_login'));
            navigate('/auth');
            return;
        }
        fetchUserSubmissions();
    }, [user, navigate, t]);

    const fetchUserSubmissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/user/submissions?userId=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }
            
            const data = await response.json();
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching user submissions:', error);
            toast.error(t('failed_to_load_submissions'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'status-pending',
                    icon: faHourglassHalf,
                    text: t('status_pending'),
                    description: t('status_pending_desc')
                };
            case 'approved':
                return {
                    color: 'status-approved',
                    icon: faCheckCircle,
                    text: t('status_approved'),
                    description: t('status_approved_desc')
                };
            case 'rejected':
                return {
                    color: 'status-rejected',
                    icon: faTimesCircle,
                    text: t('status_rejected'),
                    description: t('status_rejected_desc')
                };
            default:
                return {
                    color: 'status-pending',
                    icon: faHourglassHalf,
                    text: status,
                    description: ''
                };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(t('locale_code'), {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewOnMap = (companyId) => {
        navigate(`/companies/${companyId}`);
    };

    const handleEdit = (companyId) => {
        // Navigate to edit page (to be implemented)
        navigate(`/edit-business/${companyId}`);
    };

    if (loading) {
        return (
            <div className="user-dashboard">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <Helmet>
                <title>{t('my_dashboard')} - Kontrollitud.ee</title>
                <meta name="description" content={t('dashboard_description')} />
            </Helmet>

            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <Link to="/" className="back-button">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>{t('back_to_home')}</span>
                    </Link>
                    <div className="header-content">
                        <FontAwesomeIcon icon={faClipboardList} className="header-icon" />
                        <div>
                            <h1>{t('my_dashboard')}</h1>
                            <p className="user-email">{user?.email}</p>
                        </div>
                    </div>
                    <div className="submissions-count">
                        <span className="count-number">{submissions.length}</span>
                        <span className="count-label">{t('my_submissions')}</span>
                    </div>
                </div>

                {/* Submissions Grid */}
                {submissions.length === 0 ? (
                    <div className="empty-submissions">
                        <FontAwesomeIcon icon={faClipboardList} className="empty-icon" />
                        <h3>{t('no_submissions_yet')}</h3>
                        <p>{t('no_submissions_description')}</p>
                        <Link to="/add-business" className="btn-add-business">
                            {t('add_your_first_business')}
                        </Link>
                    </div>
                ) : (
                    <div className="submissions-grid">
                        {submissions.map((submission) => {
                            const statusConfig = getStatusConfig(submission.approvalStatus);
                            return (
                                <div key={submission._id} className="submission-card">
                                    {/* Card Image */}
                                    <div className="card-image-section">
                                        <img 
                                            src={submission.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
                                            alt={submission.name}
                                            className="submission-image"
                                        />
                                        <div className={`status-badge ${statusConfig.color}`}>
                                            <FontAwesomeIcon icon={statusConfig.icon} />
                                            <span>{statusConfig.text}</span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="card-content-section">
                                        <h3 className="submission-name">{submission.name}</h3>
                                        
                                        <div className="submission-meta">
                                            <span className="meta-item">
                                                <FontAwesomeIcon icon={faCalendarAlt} />
                                                {formatDate(submission.createdAt)}
                                            </span>
                                            <span className="meta-category">{submission.category}</span>
                                            <span className="meta-city">{submission.city}</span>
                                        </div>

                                        <p className="status-description">
                                            {statusConfig.description}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="card-actions">
                                            {submission.approvalStatus === 'approved' && (
                                                <button 
                                                    onClick={() => handleViewOnMap(submission._id)}
                                                    className="btn-action btn-view"
                                                >
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                    {t('view_on_map')}
                                                </button>
                                            )}
                                            
                                            {submission.approvalStatus === 'rejected' && (
                                                <button 
                                                    onClick={() => handleEdit(submission._id)}
                                                    className="btn-action btn-resubmit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                    {t('resubmit')}
                                                </button>
                                            )}
                                            
                                            {submission.approvalStatus === 'pending' && (
                                                <div className="pending-info">
                                                    <p>{t('pending_review_info')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;
