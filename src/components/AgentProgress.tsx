'use client';

import React from 'react';
import { CheckCircle2, Loader2, Circle, Sparkles, Activity } from 'lucide-react';
import styles from './AgentProgress.module.css';

export interface AgentStep {
  id: string;
  label: string;
  detail?: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
}

interface AgentProgressProps {
  steps: AgentStep[];
  currentStepId?: string;
  summaryText?: string;
}

export const AgentProgress: React.FC<AgentProgressProps> = ({
  steps,
  currentStepId,
  summaryText,
}) => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.pulseDot} />
          <span>AI is discovering and verifying places</span>
        </div>
        {summaryText && (
          <span className={styles.summaryBadge}>{summaryText}</span>
        )}
      </div>

      <div className={styles.stepsList}>
        {steps.map((step) => {
          const isCurrent = step.id === currentStepId;
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';

          return (
            <div
              key={step.id}
              className={`${styles.stepItem} ${isRunning ? styles.stepRunning : ''} ${isDone ? styles.stepDone : ''}`}
            >
              <div className={styles.iconCol}>
                {isDone && <CheckCircle2 size={16} color="#34d399" />}
                {isRunning && <Loader2 size={16} color="#e6a756" className={styles.spin} />}
                {step.status === 'pending' && <Circle size={16} color="#677282" />}
              </div>

              <div className={styles.textCol}>
                <span className={styles.stepLabel}>{step.label}</span>
                {step.detail && isRunning && (
                  <span className={styles.stepDetail}>{step.detail}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
