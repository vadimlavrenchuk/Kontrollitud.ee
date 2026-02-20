// Kontrollitud.ee/frontend/src/components/StatsGrid.jsx
// Analytics overview component for Admin Dashboard

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';
import './StatsGrid.scss';

const StatsGrid = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBusinesses: 0,
    siteTraffic: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total users count
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      // Fetch active businesses count
      const companiesRef = collection(db, 'companies');
      const companiesSnapshot = await getDocs(companiesRef);
      const activeBusinesses = companiesSnapshot.size;

      // Fetch site traffic from stats/global document
      const statsDocRef = doc(db, 'stats', 'global');
      const statsDoc = await getDoc(statsDocRef);
      
      let siteTraffic = 0;
      if (statsDoc.exists()) {
        siteTraffic = statsDoc.data().visits || 0;
      } else {
        // Create initial stats document if doesn't exist
        await setDoc(statsDocRef, { 
          visits: 0,
          lastUpdated: new Date().toISOString()
        });
      }

      setStats({
        totalUsers,
        activeBusinesses,
        siteTraffic,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      id: 'users',
      title: t('total_users'),
      value: stats.totalUsers,
      icon: 'fa-users',
      color: 'blue',
      description: t('registered_accounts'),
      trend: '+12%'
    },
    {
      id: 'businesses',
      title: t('active_businesses'),
      value: stats.activeBusinesses,
      icon: 'fa-building',
      color: 'green',
      description: t('verified_companies'),
      trend: '+8%'
    },
    {
      id: 'traffic',
      title: t('site_traffic'),
      value: stats.siteTraffic.toLocaleString(),
      icon: 'fa-chart-line',
      color: 'purple',
      description: t('total_visits'),
      trend: '+15%'
    }
  ];

  if (stats.loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="stat-card loading">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-number"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {statCards.map(card => (
        <div 
          key={card.id}
          className={`stat-card stat-card-${card.color}`}
        >
          <div className="stat-icon">
            <i className={`fas ${card.icon}`}></i>
          </div>
          
          <div className="stat-content">
            <h3 className="stat-title">{card.title}</h3>
            <p className="stat-value">{card.value}</p>
            <p className="stat-description">{card.description}</p>
          </div>
          
          <div className="stat-footer">
            <span className="stat-trend">
              <i className="fas fa-arrow-up"></i>
              {card.trend}
            </span>
            <span className="stat-period">{t('vs_last_month')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
