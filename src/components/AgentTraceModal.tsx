'use client';

import React from 'react';
import { X, Activity, CheckCircle2, Search, Filter, ShieldCheck, Layers, ArrowRight } from 'lucide-react';
import { AgentExecutionTrace } from '../domain/types';
import styles from './AgentTraceModal.module.css';

interface AgentTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  trace: AgentExecutionTrace | null;
}

export const AgentTraceModal: React.FC<AgentTraceModalProps> = ({
  isOpen,
  onClose,
  trace,
}) => {
  if (!isOpen || !trace) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Activity size={20} color="#38bdf8" />
            <h3 className={styles.title}>High-Level Agent Execution Trace ({trace.executionTimeMs}ms)</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close trace">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {/* 1. Intent Extraction */}
          <div className={styles.traceBlock}>
            <div className={styles.blockHeading}>
              <CheckCircle2 size={16} color="#34d399" />
              <span>1. Structured Intent Extraction</span>
            </div>
            <div className={styles.jsonBox}>
              <pre>{JSON.stringify(trace.extractedIntent, null, 2)}</pre>
            </div>
          </div>

          {/* 2. Semantic Query Expansion */}
          <div className={styles.traceBlock}>
            <div className={styles.blockHeading}>
              <Search size={16} color="#e6a756" />
              <span>2. Semantic Query Expansion ({trace.searchHypotheses.length} hypotheses generated)</span>
            </div>
            <div className={styles.hypothesesList}>
              {trace.searchHypotheses.map((hypo, idx) => (
                <div key={idx} className={styles.hypoItem}>
                  <ArrowRight size={13} color="#e6a756" />
                  <span>{hypo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Candidate Discovery & Deduplication Funnel */}
          <div className={styles.traceBlock}>
            <div className={styles.blockHeading}>
              <Filter size={16} color="#38bdf8" />
              <span>3. Candidate Discovery & Deduplication Funnel</span>
            </div>
            <div className={styles.funnelStats}>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>{trace.candidateCount}</span>
                <span className={styles.statLabel}>Raw Candidates</span>
              </div>
              <span className={styles.funnelArrow}>→</span>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>{trace.deduplicatedCount}</span>
                <span className={styles.statLabel}>Unique Places</span>
              </div>
              <span className={styles.funnelArrow}>→</span>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>{trace.verifiedCount}</span>
                <span className={styles.statLabel}>Verified Qualified</span>
              </div>
              <span className={styles.funnelArrow}>→</span>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>{trace.rejectedCount}</span>
                <span className={styles.statLabel}>Discarded</span>
              </div>
            </div>
          </div>

          {/* 4. Discarded Candidates Rationale */}
          {trace.rejections.length > 0 && (
            <div className={styles.traceBlock}>
              <div className={styles.blockHeading}>
                <ShieldCheck size={16} color="#fb7185" />
                <span>4. Quality Filter & Rejection Reasons</span>
              </div>
              <div className={styles.rejectionsList}>
                {trace.rejections.map((rej, idx) => (
                  <div key={idx} className={styles.rejectionItem}>
                    <strong>{rej.placeName}:</strong>
                    <span>{rej.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Tool Activity Log */}
          <div className={styles.traceBlock}>
            <div className={styles.blockHeading}>
              <Layers size={16} color="#9da7b3" />
              <span>5. Tool Execution Lifecycle</span>
            </div>
            <div className={styles.toolList}>
              {trace.toolInvocations.map((t, idx) => (
                <div key={idx} className={styles.toolItem}>
                  <span className={styles.toolName}>{t.tool}</span>
                  <span className={styles.toolDuration}>{t.durationMs}ms</span>
                  <span className={styles.toolStatus}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
