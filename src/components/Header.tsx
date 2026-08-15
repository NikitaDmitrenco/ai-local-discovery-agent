'use client';

import React, { useState } from 'react';
import { Compass, MapPin, Activity, Github, Sparkles } from 'lucide-react';
import { LocationModal } from './LocationModal';
import styles from './Header.module.css';

interface HeaderProps {
  currentLocation: string;
  onSelectLocation: (city: string) => void;
  onOpenTrace?: () => void;
  hasActiveSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenTrace,
  hasActiveSearch,
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
            <span className={styles.brandName}>Local Agent</span>
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
            href="https://github.com/NikitaDmitrenco/ai-local-discovery-agent"
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
