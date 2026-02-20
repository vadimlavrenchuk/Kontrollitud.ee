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
    faArrowLeft,
    faEye,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import TrialStatusBadge from './components/TrialStatusBadge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './styles/UserDashboard.scss';

// SVG placeholder for images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

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
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/user/submissions?userId=${user.uid}`, {
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
            case 'pending_payment':
                return {
                    color: 'status-pending',
                    icon: faHourglassHalf,
                    text: t('status_pending_payment'),
                    description: t('status_pending_payment_desc')
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

    const handleDelete = async (companyId, companyName) => {
        if (!window.confirm(`${t('confirm_delete_company')} "${companyName}"?`)) {
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/user/companies/${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete company');
            }
            
            toast.success(t('company_deleted_successfully'));
            // Refresh submissions list
            fetchUserSubmissions();
        } catch (error) {
            console.error('Error deleting company:', error);
            toast.error(t('failed_to_delete_company'));
        }
    };

    const getWeeklyViews = (weeklyViews) => {
        if (!weeklyViews || weeklyViews.length === 0) return 0;
        return weeklyViews.reduce((sum, entry) => sum + (entry.count || 0), 0);
    };

    const getTotalViews = () => {
        return submissions.reduce((total, submission) => {
            return total + getWeeklyViews(submission.weeklyViews);
        }, 0);
    };

    // Format weeklyViews data for Recharts
    const formatChartData = (weeklyViews) => {
        if (!weeklyViews || weeklyViews.length === 0) {
            // Return last 7 days with 0 views if no data
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last7Days.push({
                    date: date.toLocaleDateString(t('locale_code'), { month: 'short', day: 'numeric' }),
                    views: 0
                });
            }
            return last7Days;
        }

        // Sort by date and take last 7 entries
        const sortedViews = [...weeklyViews]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-7);

        return sortedViews.map(entry => ({
            date: new Date(entry.date).toLocaleDateString(t('locale_code'), { month: 'short', day: 'numeric' }),
            views: entry.count || 0
        }));
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="tooltip-date">{payload[0].payload.date}</p>
                    <p className="tooltip-value">
                        <FontAwesomeIcon icon={faEye} /> {payload[0].value} {t('views')}
                    </p>
                </div>
            );
        }
        return null;
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
                    <div className="header-stats">
                        <div className="stat-box">
                            <span className="count-number">{submissions.length}</span>
                            <span className="count-label">{t('my_submissions')}</span>
                        </div>
                        <div className="stat-box views-stat-box">
                            <FontAwesomeIcon icon={faEye} className="stat-icon" />
                            <div>
                                <span className="count-number">{getTotalViews()}</span>
                                <span className="count-label">{t('total_views')}</span>
                            </div>
                        </div>
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
                                            src={submission.image || PLACEHOLDER_IMAGE} 
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

                                        {/* Views Statistics - Счетчик кипиша */}
                                        {submission.approvalStatus === 'approved' && (
                                            <div className="views-stats">
                                                <div className="views-header">
                                                    <FontAwesomeIcon icon={faEye} className="views-icon" />
                                                    <div className="views-info">
                                                        <span className="views-count">{getWeeklyViews(submission.weeklyViews)}</span>
                                                        <span className="views-label">{t('views_this_week')}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Views Chart */}
                                                <div className="views-chart-container">
                                                    <ResponsiveContainer width="100%" height={120}>
                                                        <AreaChart 
                                                            data={formatChartData(submission.weeklyViews)}
                                                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                                        >
                                                            <defs>
                                                                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis 
                                                                dataKey="date" 
                                                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                            />
                                                            <YAxis 
                                                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                width={30}
                                                            />
                                                            <Tooltip content={<CustomTooltip />} />
                                                            <Area 
                                                                type="monotone" 
                                                                dataKey="views" 
                                                                stroke="#3b82f6" 
                                                                strokeWidth={2}
                                                                fill="url(#viewsGradient)"
                                                                animationDuration={1000}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                    <p className="chart-label">{t('views_trend_last_7_days')}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Trial Status Badge */}
                                        {submission.trialActive && <TrialStatusBadge company={submission} />}

                                        <p className="status-description">
                                            {statusConfig.description}
                                        </p>

                                        {/* Pending review info text */}
                                        {submission.approvalStatus === 'pending' && (
                                            <div className="pending-info">
                                                <p>{t('pending_review_info')}</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="card-actions">
                                            {submission.approvalStatus === 'approved' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleViewOnMap(submission._id)}
                                                        className="btn-action btn-view"
                                                    >
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                        {t('view_on_map')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(submission._id)}
                                                        className="btn-action btn-edit"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        {t('edit')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(submission._id, submission.name)}
                                                        className="btn-action btn-delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        {t('delete')}
                                                    </button>
                                                </>
                                            )}
                                            
                                            {submission.approvalStatus === 'pending_payment' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleEdit(submission._id)}
                                                        className="btn-action btn-upgrade"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        {t('edit_company_and_plan')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(submission._id, submission.name)}
                                                        className="btn-action btn-delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        {t('delete')}
                                                    </button>
                                                </>
                                            )}
                                            
                                            {submission.approvalStatus === 'rejected' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleEdit(submission._id)}
                                                        className="btn-action btn-resubmit"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        {t('resubmit')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(submission._id, submission.name)}
                                                        className="btn-action btn-delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        {t('delete')}
                                                    </button>
                                                </>
                                            )}
                                            
                                            {submission.approvalStatus === 'pending' && (
                                                <button 
                                                    onClick={() => handleDelete(submission._id, submission.name)}
                                                    className="btn-action btn-delete"
                                                    style={{ flex: '0 1 auto', marginLeft: 'auto' }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {t('delete')}
                                                </button>
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
