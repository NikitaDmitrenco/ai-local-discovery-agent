'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Bed,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Navigation,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { PlaceCandidate } from '../domain/types';
import styles from './PlaceDetailsModal.module.css';

interface PlaceDetailsModalProps {
  place: PlaceCandidate | null;
  onClose: () => void;
  userQuery?: string;
  isSaved?: boolean;
  onToggleSave?: (place: PlaceCandidate) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  onClose,
  userQuery,
  isSaved = false,
  onToggleSave,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!place) return null;

  const currentPhoto = place.photos[activePhotoIdx] || place.photos[0];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : place.photos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < place.photos.length - 1 ? prev + 1 : 0));
  };

  const openNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.categoryBadge}>{place.category}</span>
            <div className={styles.matchPill}>
              <Sparkles size={13} color="#e6a756" />
              <span>{place.intentMatch.score}% Intent Match</span>
            </div>
          </div>

          <div className={styles.topBarRight}>
            {onToggleSave && (
              <button
                className={`${styles.navActionBtn} ${isSaved ? styles.savedActiveBtn : ''}`}
                onClick={() => onToggleSave(place)}
                title={isSaved ? 'Remove from trip' : 'Save to trip'}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={14} color="#34d399" />
                    <span>Saved in Trip</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={14} />
                    <span>Save to Trip</span>
                  </>
                )}
              </button>
            )}

            <button className={styles.navActionBtn} onClick={openNavigation}>
              <Navigation size={14} />
              <span>Directions</span>
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close details">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.scrollBody}>
          {/* Photo Gallery Section */}
          {place.photos.length > 0 ? (
            <div className={styles.gallery}>
              <div className={styles.mainPhotoWrapper}>
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || place.name}
                  className={styles.mainPhoto}
                />
                {place.photos.length > 1 && (
                  <>
                    <button className={`${styles.photoNavBtn} ${styles.prevBtn}`} onClick={handlePrevPhoto}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className={`${styles.photoNavBtn} ${styles.nextBtn}`} onClick={handleNextPhoto}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div className={styles.photoCaptionBar}>
                  <span className={styles.photoCaptionText}>{currentPhoto.caption || place.name}</span>
                  <span className={styles.photoCounter}>
                    {activePhotoIdx + 1} / {place.photos.length}
                  </span>
                </div>
              </div>

              {place.photos.length > 1 && (
                <div className={styles.thumbsRow}>
                  {place.photos.map((p, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbBtn} ${idx === activePhotoIdx ? styles.activeThumb : ''}`}
                      onClick={() => setActivePhotoIdx(idx)}
                    >
                      <img src={p.url} alt={p.caption} className={styles.thumbImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noPhotoNotice}>
              <span>No verified photos available for this location</span>
            </div>
          )}

          {/* Place Title & Quick Metrics */}
          <div className={styles.headerInfo}>
            <h2 className={styles.placeTitle}>{place.name}</h2>
            <div className={styles.ratingLocationRow}>
              <div className={styles.ratingBox}>
                <Star size={15} fill="#e6a756" color="#e6a756" />
                <span className={styles.ratingScore}>{place.reviewSummary.rating}</span>
                <span className={styles.reviewTotal}>({place.reviewSummary.reviewCount} reviews)</span>
              </div>
              <span className={styles.dotSeparator}>•</span>
              <div className={styles.locBox}>
                <MapPin size={15} color="#9da7b3" />
                <span>{place.address}</span>
              </div>
              <span className={styles.dotSeparator}>•</span>
              <span className={styles.distHighlight}>{place.distanceKm} km ({place.travelTimeMinutes} min drive)</span>
            </div>
          </div>

          {/* Why AI Picked It (Intent Grounding) */}
          <div className={styles.sectionCardAI}>
            <div className={styles.sectionHeading}>
              <Sparkles size={16} color="#e6a756" />
              <h3>Why AI Picked It For Your Experience</h3>
            </div>
            {userQuery && (
              <div className={styles.userContextBox}>
                <span className={styles.userContextLabel}>Based on your request:</span>
                <p className={styles.userContextQuery}>&quot;{userQuery}&quot;</p>
              </div>
            )}
            <p className={styles.aiExplanation}>{place.intentMatch.explanation}</p>
          </div>

          {/* Overview Description */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            <p className={styles.descriptionText}>{place.description}</p>
          </div>

          {/* What You Can Do (Activities) */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>What You Can Do (Activities)</h3>
            <div className={styles.activityGrid}>
              {place.activities.map((act, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <CheckCircle2 size={16} color="#38bdf8" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stay & Overnight Availability */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.sectionTitle}>Stay & Overnight Options</h3>
              {place.accommodation.verified && (
                <span className={styles.verifiedBadge}>
                  <ShieldCheck size={13} /> Verified Available
                </span>
              )}
            </div>
            <div className={styles.accommodationBox}>
              <div className={styles.accType}>
                <Bed size={18} color="#34d399" />
                <strong>{place.accommodation.type}</strong>
              </div>
              <p className={styles.accDetails}>{place.accommodation.details}</p>
            </div>
          </div>

          {/* Reviews & Reputation Analysis */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Visitor Reputation & Sentiment</h3>
            <p className={styles.reputationSummary}>{place.reviewSummary.summary}</p>

            <div className={styles.reputationSplit}>
              <div className={styles.repPros}>
                <span className={styles.repListTitle}>People Love:</span>
                {place.reviewSummary.positiveThemes.map((pro, idx) => (
                  <div key={idx} className={styles.repListItem}>
                    <CheckCircle2 size={14} color="#34d399" />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>

              {place.intentMatch.potentialDownside && (
                <div className={styles.repCons}>
                  <span className={styles.repListTitle}>Keep In Mind:</span>
                  <div className={styles.repListItemCaution}>
                    <AlertTriangle size={14} color="#fb7185" />
                    <span>{place.intentMatch.potentialDownside}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hours & Schedule */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Hours & Schedule</h3>
            <div className={styles.hoursItem}>
              <Clock size={16} color="#e6a756" />
              <span>{place.openingHours}</span>
            </div>
          </div>

          {/* Verified Sources Grounding */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Source Transparency & Verification</h3>
            <div className={styles.sourcesList}>
              {place.sources.map((src, idx) => (
                <div key={idx} className={styles.sourceItem}>
                  <div className={styles.sourceHeader}>
                    <strong>{src.name}</strong>
                    {src.url && <ExternalLink size={12} />}
                  </div>
                  <span className={styles.sourceClaim}>{src.claim}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.footerCloseBtn} onClick={onClose}>
            Back to results
          </button>
          <button className={styles.footerActionBtn} onClick={openNavigation}>
            <Navigation size={16} />
            <span>Open in Google Maps / Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
