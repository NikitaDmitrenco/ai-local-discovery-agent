'use client';

import React, { useState } from 'react';
import { Compass, MapPin, Activity, Github, Sparkles, Bookmark } from 'lucide-react';
import { LocationModal } from './LocationModal';
import styles from './Header.module.css';

interface HeaderProps {
  currentLocation: string;
  onSelectLocation: (city: string) => void;
  onOpenTrace?: () => void;
  hasActiveSearch?: boolean;
  savedCount?: number;
  onOpenItinerary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenTrace,
  hasActiveSearch,
  savedCount = 0,
  onOpenItinerary,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Compass size={22} color="#e6a756" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>Aura</span>
            <span className={styles.brandBadge}>AI DISCOVERY</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.locationButton}
            onClick={() => setIsLocationModalOpen(true)}
            aria-label="Change location"
          >
            <MapPin size={15} color="#34d399" />
            <span className={styles.locationText}>{currentLocation}</span>
          </button>

          {onOpenItinerary && (
            <button
              className={styles.traceButton}
              onClick={onOpenItinerary}
              title="Open Saved Trip Itinerary"
            >
              <Bookmark size={15} color={savedCount > 0 ? "#34d399" : "#94a3b8"} />
              <span className={styles.traceText}>
                My Trip {savedCount > 0 && `(${savedCount})`}
              </span>
            </button>
          )}

          {hasActiveSearch && onOpenTrace && (
            <button
              className={styles.traceButton}
              onClick={onOpenTrace}
              title="Inspect AI Agent Execution Trace"
            >
              <Activity size={15} color="#38bdf8" />
              <span className={styles.traceText}>Agent Trace</span>
            </button>
          )}

          <a
            href="https://github.com/NikitaDmitrenco/aura"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="GitHub Repository"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={onSelectLocation}
      />
    </>
  );
};
