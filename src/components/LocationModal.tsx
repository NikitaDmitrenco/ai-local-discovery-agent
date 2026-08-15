'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import styles from './LocationModal.module.css';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (city: string) => void;
}

const POPULAR_LOCATIONS = [
  'Chișinău, Moldova',
  'Orhei / Orheiul Vechi',
  'Vadul lui Vodă',
  'Ialoveni / Costești',
  'Tiraspol / Bender',
  'Bălți, Moldova',
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [customCity, setCustomCity] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseBrowserGeo = () => {
    setIsDetecting(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        // Default to detected region for Chișinău vicinity
        onSelectLocation('Chișinău (Current GPS)');
        onClose();
      },
      (error) => {
        setIsDetecting(false);
        setErrorMsg('Location access was denied. Please select a city manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      onSelectLocation(customCity.trim());
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <MapPin size={20} color="#e6a756" />
            <h3 className={styles.title}>Select Your Location</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p className={styles.subtitle}>
          The AI discovers places and calculates driving distances relative to your chosen area.
        </p>

        <button
          className={styles.geoButton}
          onClick={handleUseBrowserGeo}
          disabled={isDetecting}
        >
          <Navigation size={16} className={isDetecting ? styles.spin : ''} />
          <span>{isDetecting ? 'Detecting GPS coordinates...' : 'Use exact GPS location'}</span>
        </button>

        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

        <div className={styles.divider}>
          <span>or choose region</span>
        </div>

        <div className={styles.popularList}>
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc}
              className={`${styles.locItem} ${currentLocation.includes(loc.split(',')[0]) ? styles.activeLoc : ''}`}
              onClick={() => {
                onSelectLocation(loc);
                onClose();
              }}
            >
              <span>{loc}</span>
              {currentLocation.includes(loc.split(',')[0]) && <Check size={16} color="#34d399" />}
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className={styles.customForm}>
          <input
            type="text"
            placeholder="Type any city or village..."
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            className={styles.customInput}
          />
          <button type="submit" className={styles.customSubmitBtn} disabled={!customCity.trim()}>
            Set
          </button>
        </form>
      </div>
    </div>
  );
};
