import React from 'react';
import { Compass, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Compass size={22} color="#e6a756" />
          </div>
          <span className={styles.brandName}>Local Agent</span>
        </div>
        <div className={styles.locationBadge}>
          <MapPin size={14} color="#34d399" />
          <span>Chișinău</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.tagline}>
          <Sparkles size={14} color="#e6a756" />
          <span>AI Local Discovery Agent</span>
        </div>
        <h1 className={styles.title}>
          Tell me what kind of experience you want.
        </h1>
        <p className={styles.subtitle}>
          No need to know categories or place names. Describe your ideal vibe, activity, and timing in everyday human language.
        </p>

        <div className={styles.inputWrapper}>
          <div className={styles.inputContainer}>
            <textarea
              className={styles.textarea}
              placeholder="e.g. Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом"
              rows={3}
              readOnly
              value="Хочу вечерком воскресным отдохнуть в каком-нибудь тихом местечке где можно покататься на воде и поспать за городом"
            />
            <div className={styles.inputFooter}>
              <span className={styles.hint}>Press Enter or click Find</span>
              <button className={styles.searchButton}>
                <span>Find places</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
