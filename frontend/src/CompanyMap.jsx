// Kontrollitud.ee/frontend/src/CompanyMap.jsx

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Default marker icon fix
if (L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

// Custom blue marker icon for verified businesses
const createVerifiedIcon = () => {
    if (!L || !L.Icon) return null;
    
    return new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiMzYjgyZjYiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNy41IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTEwIDEyLjVsMS41IDEuNSAzLTMiIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: markerShadow,
        shadowSize: [41, 41],
    });
};

// Component to handle map panning and auto-fitting bounds
const MapController = ({ selectedCompanyId, companies }) => {
    const map = useMap();
    const prevSelectedId = useRef(selectedCompanyId);
    const hasAutoFitted = useRef(false);
    
    // FlyTo ТОЛЬКО для selected company (клик), НЕ для hover
    useEffect(() => {
        // Летим к компании ТОЛЬКО при клике (selectedCompanyId)
        if (selectedCompanyId && selectedCompanyId !== prevSelectedId.current) {
            const selectedCompany = companies.find(c => (c._id || c.id) === selectedCompanyId);
            
            // Validate coordinates are valid numbers
            const lat = parseFloat(selectedCompany?.location?.lat);
            const lng = parseFloat(selectedCompany?.location?.lng);
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                // Force map to recalculate size (fixes white screen bug)
                map.invalidateSize();
                
                // Delay flyTo on mobile to allow map rendering
                const isMobile = window.innerWidth <= 1024;
                const delay = isMobile ? 150 : 0;
                
                setTimeout(() => {
                    map.flyTo([lat, lng], 14, {
                        duration: 1.5,
                        easeLinearity: 0.25
                    });
                }, delay);
            }
            prevSelectedId.current = selectedCompanyId;
        }
    }, [selectedCompanyId, companies, map]);
    
    // Auto-fit bounds to show all markers on initial load and filter changes
    useEffect(() => {
        const companiesWithCoords = companies.filter(c => {
            const lat = parseFloat(c.location?.lat);
            const lng = parseFloat(c.location?.lng);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });
        
        if (companiesWithCoords.length > 0) {
            // Ensure map size is correct before fitting bounds
            map.invalidateSize();
            
            const bounds = L.latLngBounds(
                companiesWithCoords.map(c => [
                    parseFloat(c.location.lat), 
                    parseFloat(c.location.lng)
                ])
            );
            
            // Add padding to bounds
            map.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 13,
                animate: hasAutoFitted.current // Animate after first fit
            });
            
            hasAutoFitted.current = true;
        }
    }, [companies, map]);
    
    return null;
};

const CompanyMap = ({ companies, selectedCompanyId, hoveredCompanyId, onMarkerClick }) => {
    const { t } = useTranslation();
    const markerRefs = useRef({});
    const verifiedIconRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInteractive, setIsInteractive] = useState(false);
    const mapRef = useRef(null);
    
    // Определяем мобильное устройство (обновляется в реальном времени)
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
    
    // Слушаем изменение размера окна
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Create verified icon once
    if (!verifiedIconRef.current) {
        verifiedIconRef.current = createVerifiedIcon();
    }
    
    // Default center: Tallinn, Estonia
    const defaultCenter = [59.4370, 24.7536];
    const defaultZoom = 7;
    
    // Filter companies that have valid coordinates
    const companiesWithCoords = companies.filter(company => {
        // Support both location.lat/lng and latitude/longitude formats
        const lat = parseFloat(company.location?.lat || company.latitude);
        const lng = parseFloat(company.location?.lng || company.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
    
    // Debug: проверяем, сколько компаний с координатами (только один раз)
    useEffect(() => {
        if (companiesWithCoords.length !== companies.length) {
            const withoutCoords = companies.filter(c => {
                const lat = parseFloat(c.location?.lat || c.latitude);
                const lng = parseFloat(c.location?.lng || c.longitude);
                return isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0;
            });
            console.warn('⚠️', withoutCoords.length, 'companies without coordinates');
        }
    }, [companies.length, companiesWithCoords.length]);
    
    // Open popup ТОЛЬКО для selected marker (клик)
    // Hover НЕ открывает popup, чтобы не конфликтовать с selected
    useEffect(() => {
        if (selectedCompanyId && markerRefs.current[selectedCompanyId]) {
            markerRefs.current[selectedCompanyId].openPopup();
        }
    }, [selectedCompanyId]);
    
    // Подсветка hovered marker (опционально, можно добавить стиль)
    
    // Включение интерактивности по клику на карту (мобилка)
    const handleMapClick = () => {
        if (isMobile && !isInteractive) {
            setIsInteractive(true);
        }
    };
    
    // Переключение развернутого состояния
    const toggleExpanded = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        // При развертывании автоматически включаем интерактивность
        if (!isExpanded && !isInteractive) {
            setIsInteractive(true);
        }
    };

    return (
        <div className={`company-map-wrapper ${isExpanded ? 'expanded' : ''}`}>
            {/* Кнопка развернуть/свернуть (только на мобилке) */}
            {isMobile && (
                <button className="map-expand-btn" onClick={toggleExpanded}>
                    {isExpanded ? '▼ ' + (t('collapse_map') || 'Свернуть карту') : '▶ ' + (t('expand_map') || 'Развернуть карту')}
                </button>
            )}
            
            {/* Подсказка по интерактивности (мобилка) - только для неразвернутой карты */}
            {isMobile && !isInteractive && !isExpanded && (
                <div className="map-tap-hint">
                    {t('tap_to_interact') || 'Нажмите для взаимодействия'}
                </div>
            )}
            
            <div 
                className="company-map-container" 
                onClick={handleMapClick}
                style={{ 
                    cursor: isMobile && !isInteractive ? 'pointer' : 'default',
                    position: 'relative'
                }}
            >
                <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                    scrollWheelZoom={isMobile ? (isInteractive || isExpanded) : true}
                    dragging={isMobile ? (isInteractive || isExpanded) : true}
                    touchZoom={isMobile ? (isInteractive || isExpanded) : true}
                    doubleClickZoom={true}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Controller component to handle map panning and auto-bounds */}
                    <MapController selectedCompanyId={selectedCompanyId} companies={companiesWithCoords} />
                
                {companiesWithCoords.map(company => {
                    // Support both coordinate formats and ensure they're numbers
                    const lat = parseFloat(company.location?.lat || company.latitude);
                    const lng = parseFloat(company.location?.lng || company.longitude);
                    const companyId = company._id || company.id;
                    const isVerified = company.verified || company.isVerified;
                    
                    // Prepare marker props
                    const markerProps = {
                        key: companyId,
                        position: [lat, lng],
                        ref: (ref) => {
                            if (ref) {
                                markerRefs.current[companyId] = ref;
                            }
                        },
                        eventHandlers: {
                            click: () => {
                                console.log('🖱️ Marker clicked:', companyId);
                                if (onMarkerClick) {
                                    onMarkerClick(companyId);
                                }
                            }
                        }
                    };
                    
                    // Only add icon prop if verified
                    const markerKey = markerProps.key;
                    delete markerProps.key;
                    
                    if (isVerified && verifiedIconRef.current) {
                        markerProps.icon = verifiedIconRef.current;
                    }
                    
                    return (
                        <Marker key={markerKey} {...markerProps}>
                            <Popup>
                                <div className="map-popup">
                                    {/* Image preview */}
                                    {company.image && (
                                        <div className="popup-image">
                                            <img 
                                                src={company.image} 
                                                alt={company.name}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '120px', 
                                                    objectFit: 'cover', 
                                                    borderRadius: '8px',
                                                    marginBottom: '8px'
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    <h3 className="popup-title">{company.name}</h3>
                                    
                                    {isVerified && (
                                        <div className="popup-verified">
                                            <i className="fas fa-shield-alt"></i>
                                            <span>{t('verified')}</span>
                                        </div>
                                    )}
                                    
                                    {company.rating && (
                                        <div className="popup-rating">
                                            <span className="rating-stars">
                                                {'⭐'.repeat(Math.floor(company.rating))}
                                            </span>
                                            <span className="rating-value">
                                                {company.rating.toFixed(1)} ({company.reviewCount || 0} {t('reviews')})
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="popup-meta">
                                        <span className="popup-category">
                                            {t(company.mainCategory || company.category) || company.category}
                                        </span>
                                        {company.city && (
                                            <>
                                                <span className="popup-separator">•</span>
                                                <span className="popup-city">{t(company.city)}</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <Link 
                                        to={`/companies/${company.slug || companyId}`} 
                                        className="popup-link"
                                    >
                                        {t('details_button')} →
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                </MapContainer>
            </div>
        </div>
    );
};

export default CompanyMap;
