// Kontrollitud.ee/frontend/src/CompanyMap.jsx

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom blue marker icon for verified businesses
const verifiedIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiMzYjgyZjYiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNy41IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTEwIDEyLjVsMS41IDEuNSAzLTMiIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
});

// Component to handle map panning when selected company changes
const MapController = ({ selectedCompanyId, companies }) => {
    const map = useMap();
    
    useEffect(() => {
        if (selectedCompanyId) {
            const selectedCompany = companies.find(c => c._id === selectedCompanyId);
            if (selectedCompany && selectedCompany.latitude && selectedCompany.longitude) {
                map.flyTo([selectedCompany.latitude, selectedCompany.longitude], 13, {
                    duration: 1
                });
            }
        }
    }, [selectedCompanyId, companies, map]);
    
    return null;
};

const CompanyMap = ({ companies, selectedCompanyId, onMarkerClick }) => {
    const { t } = useTranslation();
    const markerRefs = useRef({});
    
    // Default center: Tallinn, Estonia
    const defaultCenter = [59.4370, 24.7536];
    const defaultZoom = 7;
    
    // Filter companies that have coordinates
    const companiesWithCoords = companies.filter(
        company => company.latitude && company.longitude
    );
    
    // Open popup for selected marker
    useEffect(() => {
        if (selectedCompanyId && markerRefs.current[selectedCompanyId]) {
            markerRefs.current[selectedCompanyId].openPopup();
        }
    }, [selectedCompanyId]);

    return (
        <div className="company-map-container">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Controller component to handle map panning */}
                <MapController selectedCompanyId={selectedCompanyId} companies={companies} />
                
                {companiesWithCoords.map(company => (
                    <Marker
                        key={company._id}
                        position={[company.latitude, company.longitude]}
                        icon={company.isVerified ? verifiedIcon : undefined}
                        ref={(ref) => {
                            if (ref) {
                                markerRefs.current[company._id] = ref;
                            }
                        }}
                        eventHandlers={{
                            click: () => {
                                if (onMarkerClick) {
                                    onMarkerClick(company._id);
                                }
                            }
                        }}
                    >
                        <Popup>
                            <div className="map-popup">
                                <h3 className="popup-title">{company.name}</h3>
                                
                                {company.isVerified && (
                                    <div className="popup-verified">
                                        <i className="fas fa-shield-alt"></i>
                                        <span>{t('verified')}</span>
                                    </div>
                                )}
                                
                                <div className="popup-rating">
                                    <span className="rating-stars">
                                        {'⭐'.repeat(Math.floor(company.rating || 0))}
                                    </span>
                                    <span className="rating-value">
                                        {(company.rating || 0).toFixed(1)} ({company.reviewsCount || 0} {t('reviews')})
                                    </span>
                                </div>
                                
                                <div className="popup-meta">
                                    <span className="popup-category">{t(company.category)}</span>
                                    {company.city && (
                                        <>
                                            <span className="popup-separator">•</span>
                                            <span className="popup-city">{t(company.city)}</span>
                                        </>
                                    )}
                                </div>
                                
                                <Link to={`/companies/${company.slug || company._id}`} className="popup-link">
                                    {t('details_button')} →
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default CompanyMap;
