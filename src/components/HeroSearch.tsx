'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import styles from './HeroSearch.module.css';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const PRESET_QUERIES = [
  {
    label: 'Primary Demo (Water + Overnight + Quiet)',
    text: 'Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом',
    badge: 'Core Scenario',
  },
  {
    label: 'Romantic River Glamping',
    text: 'Уютное уединённое место на берегу реки для двоих с красивым закатом и ночёвкой',
    badge: 'Romantic',
  },
  {
    label: 'Fast Wake & Active Watersports',
    text: 'Где можно активно покататься на вейкборде или сапах с друзьями на озере?',
    badge: 'Active Sports',
  },
  {
    label: 'Scenic Lakeside Family Cabin',
    text: 'Спокойное место у озера за городом с беседкой, рыбалкой и тёплым домиком на ночь',
    badge: 'Getaway',
  },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  isLoading,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setQuery(presetText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.tagline}>
        <Sparkles size={14} color="#e6a756" />
        <span>AI-Native Experience Discovery</span>
      </div>

      <h1 className={styles.headline}>
        What are you in the mood for?
      </h1>

      <p className={styles.subheadline}>
        Describe your dream vibe, desired activity, and timing in natural language. The AI agent semantically expands, discovers, and verifies real local places for you.
      </p>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={`${styles.inputBox} ${isLoading ? styles.loadingBorder : ''}`}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Describe what you want to do. I'll find the right places..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isLoading}
          />

          <div className={styles.inputFooter}>
            <div className={styles.shortcuts}>
              <span className={styles.shortcutText}>
                <CornerDownLeft size={13} /> Press <strong>Enter</strong> to search
              </span>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className={styles.spin} />
                  <span>Agent discovering...</span>
                </>
              ) : (
                <>
                  <span>Find places</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className={styles.presetsWrapper}>
        <span className={styles.presetsTitle}>Try natural language prompts:</span>
        <div className={styles.presetsList}>
          {PRESET_QUERIES.map((preset, index) => (
            <button
              key={index}
              className={`${styles.presetChip} ${query === preset.text ? styles.activePreset : ''}`}
              onClick={() => handleSelectPreset(preset.text)}
              type="button"
            >
              <span className={styles.presetBadge}>{preset.badge}</span>
              <span className={styles.presetSnippet}>&quot;{preset.text}&quot;</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
