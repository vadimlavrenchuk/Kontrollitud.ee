// Kontrollitud.ee/frontend/src/components/StatsGrid.jsx
// Analytics overview component for Admin Dashboard

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const StatsGrid = () => {
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
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'fa-users',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      id: 'businesses',
      title: 'Active Businesses',
      value: stats.activeBusinesses,
      icon: 'fa-building',
      color: 'green',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      id: 'traffic',
      title: 'Site Traffic',
      value: stats.siteTraffic.toLocaleString(),
      icon: 'fa-chart-line',
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map(card => (
        <div 
          key={card.id}
          className={`${card.bgColor} rounded-lg shadow-md p-6 transition-transform hover:scale-105 hover:shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                {card.title}
              </p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
            <div className={`${card.iconBg} w-14 h-14 rounded-full flex items-center justify-center`}>
              <i className={`fas ${card.icon} text-white text-xl`}></i>
            </div>
          </div>
          
          {/* Optional: Add trend indicator */}
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <i className="fas fa-arrow-up text-green-500 mr-1"></i>
            <span>Live data from Firestore</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
