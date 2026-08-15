'use client';

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Clock, Bed, CheckCircle, AlertTriangle, ShieldCheck, ArrowUpRight, Compass } from 'lucide-react';
import { MockPlace } from '../data/mockPlaces';
import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  place: MockPlace;
  rankIndex: number;
  onSelect: (place: MockPlace) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  rankIndex,
  onSelect,
}) => {
  const heroPhoto = place.photos[0];

  return (
    <article className={styles.card}>
      {/* Top Banner: Rank & Match Score */}
      <div className={styles.headerBar}>
        <div className={styles.rankBadge}>
          <span>#{rankIndex + 1} Best Match</span>
        </div>
        <div className={styles.matchScoreBadge}>
          <span className={styles.matchScoreNumber}>{place.matchScore}%</span>
          <span className={styles.matchScoreLabel}>intent match</span>
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
            <span className={styles.ratingValue}>{place.rating}</span>
            <span className={styles.reviewCount}>({place.reviewCount})</span>
          </div>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <MapPin size={14} color="#9da7b3" />
            <span>{place.distance} ({place.travelTime})</span>
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
          <p className={styles.reasonText}>{place.matchReason}</p>
        </div>

        {/* Reputation Snippets (Pros / Cons) */}
        <div className={styles.reputationBox}>
          <div className={styles.prosList}>
            {place.reputation.pros.slice(0, 2).map((pro, idx) => (
              <div key={idx} className={styles.proItem}>
                <CheckCircle size={13} color="#34d399" className={styles.bulletIcon} />
                <span>{pro}</span>
              </div>
            ))}
          </div>

          {place.potentialDownside && (
            <div className={styles.downsideItem}>
              <AlertTriangle size={13} color="#fb7185" className={styles.bulletIcon} />
              <span>{place.potentialDownside}</span>
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
