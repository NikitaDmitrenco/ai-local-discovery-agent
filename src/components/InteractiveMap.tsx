'use client';

import React, { useEffect, useRef } from 'react';
import { PlaceCandidate } from '../domain/types';
import styles from './InteractiveMap.module.css';

interface InteractiveMapProps {
  places: PlaceCandidate[];
  userLocationName: string;
  selectedPlaceId?: string | null;
  onSelectPlace: (place: PlaceCandidate) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  userLocationName,
  selectedPlaceId,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let isMounted = true;

    // Dynamically load Leaflet on the client
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Import Leaflet CSS dynamically if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Initialize map instance if not already created
      if (!mapInstanceRef.current) {
        const initialCenter: [number, number] = places.length > 0
          ? [places[0].coordinates.lat, places[0].coordinates.lng]
          : [47.0105, 28.8638]; // Default: Chișinău

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 11,
          zoomControl: false,
        });

        // Add Zoom Control in top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Add sleek dark theme tile layer (CartoDB Dark Matter / Voyager)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear previous markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      if (places.length === 0) return;

      const bounds = L.latLngBounds([]);

      // Add markers for all places
      places.forEach((place) => {
        const isSelected = place.id === selectedPlaceId;
        const latLng: [number, number] = [place.coordinates.lat, place.coordinates.lng];
        bounds.extend(latLng);

        // Custom HTML Pin with score badge
        const matchScore = place.intentMatch?.score || 90;
        const iconHtml = `
          <div class="${styles.customMarker} ${isSelected ? styles.selectedMarker : ''}">
            <div class="${styles.markerBadge}">${matchScore}%</div>
            <div class="${styles.markerPin}">
              <div class="${styles.markerDot}"></div>
            </div>
            <div class="${styles.markerLabel}">${place.name}</div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: styles.markerContainer,
          html: iconHtml,
          iconSize: [120, 50],
          iconAnchor: [60, 48],
          popupAnchor: [0, -48],
        });

        const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

        // Popup with rich information
        const popupContent = `
          <div class="${styles.popupCard}">
            <div class="${styles.popupHeader}">
              <span class="${styles.popupCategory}">${place.category}</span>
              <span class="${styles.popupScore}">⭐ ${place.reviewSummary.rating} (${place.reviewSummary.reviewCount})</span>
            </div>
            <h4 class="${styles.popupTitle}">${place.name}</h4>
            <p class="${styles.popupAddress}">📍 ${place.distanceKm} km · ${place.travelTimeMinutes} min drive</p>
            <p class="${styles.popupWhy}">✓ ${place.intentMatch.explanation}</p>
            <button class="${styles.popupBtn}" id="popup-btn-${place.id}">
              View Place Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: styles.leafletPopupCustom,
          maxWidth: 280,
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-${place.id}`);
          if (btn) {
            btn.onclick = () => onSelectPlace(place);
          }
        });

        marker.on('click', () => {
          onSelectPlace(place);
        });

        markersRef.current.set(place.id, marker);
      });

      // Fit bounds with comfortable padding
      if (places.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [places, selectedPlaceId, onSelectPlace]);

  // If a place is selected from the list, pan to it
  useEffect(() => {
    if (!selectedPlaceId || !mapInstanceRef.current) return;
    const targetPlace = places.find((p) => p.id === selectedPlaceId);
    if (targetPlace) {
      mapInstanceRef.current.panTo([targetPlace.coordinates.lat, targetPlace.coordinates.lng], {
        animate: true,
        duration: 0.8,
      });
      const marker = markersRef.current.get(selectedPlaceId);
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedPlaceId, places]);

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainerRef} className={styles.mapContainer} />
      <div className={styles.mapOverlayInfo}>
        <span>📍 Exploring around <strong>{userLocationName}</strong></span>
        <span>• {places.length} verified venues found</span>
      </div>
    </div>
  );
};
