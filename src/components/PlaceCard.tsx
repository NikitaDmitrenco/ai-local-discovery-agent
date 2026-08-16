'use client';

import React from 'react';
import { Star, MapPin, Bed, CheckCircle, AlertTriangle, ShieldCheck, ArrowUpRight, Compass, Bookmark, BookmarkCheck } from 'lucide-react';
import { PlaceCandidate } from '../domain/types';
import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  place: PlaceCandidate;
  rankIndex: number;
  onSelect: (place: PlaceCandidate) => void;
  isSaved?: boolean;
  onToggleSave?: (place: PlaceCandidate) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  rankIndex,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  const heroPhoto = place.photos[0];

  return (
    <article className={styles.card}>
      {/* Top Banner: Rank, Match Score & Save Button */}
      <div className={styles.headerBar}>
        <div className={styles.rankBadge}>
          <span>#{rankIndex + 1} Best Match</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(place);
              }}
              className={`${styles.saveBtn} ${isSaved ? styles.savedActive : ''}`}
              title={isSaved ? 'Remove from trip plan' : 'Save to trip plan'}
              aria-label="Save to Trip"
            >
              {isSaved ? (
                <BookmarkCheck size={16} color="#34d399" />
              ) : (
                <Bookmark size={16} color="#94a3b8" />
              )}
            </button>
          )}

          <div className={styles.matchScoreBadge}>
            <span className={styles.matchScoreNumber}>{place.intentMatch.score}%</span>
            <span className={styles.matchScoreLabel}>intent match</span>
          </div>
        </div>
      </div>

      {/* Visual Media Section */}
      <div className={styles.mediaContainer} onClick={() => onSelect(place)}>
        {heroPhoto ? (
          <div className={styles.imageWrapper}>
            <img
              src={heroPhoto.url}
              alt={place.name}
              className={styles.image}
              loading="lazy"
            />
            {heroPhoto.verified && (
              <div className={styles.photoVerifiedBadge}>
                <ShieldCheck size={13} color="#34d399" />
                <span>Verified Place Photo</span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.placeholderMedia}>
            <Compass size={32} color="#677282" />
            <span>No verified photo available</span>
          </div>
        )}
      </div>

      {/* Main Content Info */}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div>
            <span className={styles.category}>{place.category}</span>
            <h3 className={styles.placeName} onClick={() => onSelect(place)}>
              {place.name}
            </h3>
          </div>
          <div className={styles.ratingBadge}>
            <Star size={14} fill="#e6a756" color="#e6a756" />
            <span className={styles.ratingValue}>{place.reviewSummary.rating}</span>
            <span className={styles.reviewCount}>({place.reviewSummary.reviewCount})</span>
          </div>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <MapPin size={14} color="#9da7b3" />
            <span>{place.distanceKm} km ({place.travelTimeMinutes} min drive)</span>
          </div>
          {place.accommodation.available && (
            <div className={styles.metaItemHighlight}>
              <Bed size={14} color="#38bdf8" />
              <span>Overnight Stay Available</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className={styles.description}>{place.description}</p>

        {/* Activities Tags */}
        <div className={styles.activitiesList}>
          {place.activities.map((activity, idx) => (
            <span key={idx} className={styles.activityTag}>
              {activity}
            </span>
          ))}
        </div>

        {/* Why it matches (AI Rationale) */}
        <div className={styles.matchReasonBox}>
          <div className={styles.reasonHeader}>
            <div className={styles.reasonDot} />
            <span className={styles.reasonTitle}>Why AI picked this:</span>
          </div>
          <p className={styles.reasonText}>{place.intentMatch.explanation}</p>
        </div>

        {/* Reputation Snippets (Pros / Cons) */}
        <div className={styles.reputationBox}>
          <div className={styles.prosList}>
            {place.reviewSummary.positiveThemes.slice(0, 2).map((pro, idx) => (
              <div key={idx} className={styles.proItem}>
                <CheckCircle size={13} color="#34d399" className={styles.bulletIcon} />
                <span>{pro}</span>
              </div>
            ))}
          </div>

          {place.intentMatch.potentialDownside && (
            <div className={styles.downsideItem}>
              <AlertTriangle size={13} color="#fb7185" className={styles.bulletIcon} />
              <span>{place.intentMatch.potentialDownside}</span>
            </div>
          )}
        </div>

        {/* Footer actions & source reference */}
        <div className={styles.cardFooter}>
          <span className={styles.sourceText}>
            Source: {place.sources[0]?.name || 'Place Listing'}
          </span>

          <button className={styles.detailsBtn} onClick={() => onSelect(place)}>
            <span>View place details</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
};
