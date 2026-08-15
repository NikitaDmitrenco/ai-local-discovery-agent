'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, DollarSign, Trees, Waves, Bed, Heart, Send } from 'lucide-react';
import styles from './RefinementBar.module.css';

interface RefinementBarProps {
  activeRefinement: string | null;
  onSelectRefinement: (refinementKey: string, label: string) => void;
  onConversationalRefine: (text: string) => void;
  isLoading: boolean;
}

const DYNAMIC_REFINEMENTS = [
  { key: 'closer', label: '📍 Ближе', icon: MapPin, desc: 'Prioritize minimal driving time' },
  { key: 'quieter', label: '🌲 Тише', icon: Trees, desc: 'Prioritize silence and secluded nature' },
  { key: 'cheaper', label: '💰 Подешевле', icon: DollarSign, desc: 'Prioritize budget-friendly accommodations' },
  { key: 'more_activities', label: '🏄 Больше активностей', icon: Waves, desc: 'Prioritize intense water sport options' },
  { key: 'better_overnight', label: '🛏 Лучше для ночёвки', icon: Bed, desc: 'Prioritize high-comfort villas and cottages' },
  { key: 'couples_vibe', label: '👫 Для двоих', icon: Heart, desc: 'Prioritize romantic sunset vibes' },
];

export const RefinementBar: React.FC<RefinementBarProps> = ({
  activeRefinement,
  onSelectRefinement,
  onConversationalRefine,
  isLoading,
}) => {
  const [convoText, setConvoText] = useState('');

  const handleConvoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (convoText.trim() && !isLoading) {
      onConversationalRefine(convoText.trim());
      setConvoText('');
    }
  };

  return (
    <section className={styles.refinementContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Sparkles size={15} color="#e6a756" />
          <span className={styles.title}>Dynamic AI Search Refinements</span>
        </div>
        <span className={styles.subtitle}>
          Click a direction or refine naturally to re-orchestrate the agent
        </span>
      </div>

      {/* Dynamic Contextual Chips */}
      <div className={styles.chipsRow}>
        {DYNAMIC_REFINEMENTS.map((item) => {
          const isActive = activeRefinement === item.key;
          return (
            <button
              key={item.key}
              className={`${styles.chip} ${isActive ? styles.activeChip : ''}`}
              onClick={() => onSelectRefinement(item.key, item.label)}
              disabled={isLoading}
              title={item.desc}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Natural Conversational Refinement Input */}
      <form onSubmit={handleConvoSubmit} className={styles.convoForm}>
        <input
          type="text"
          placeholder='Or ask in conversation: "А есть что-нибудь романтичнее?" or "А без ночёвки?"'
          value={convoText}
          onChange={(e) => setConvoText(e.target.value)}
          className={styles.convoInput}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.convoSendBtn}
          disabled={!convoText.trim() || isLoading}
          aria-label="Send conversational refinement"
        >
          <Send size={15} />
        </button>
      </form>
    </section>
  );
};
