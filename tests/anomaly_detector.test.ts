import { describe, it, expect } from 'vitest';
import { AnomalyDetector } from '../src/core/anomaly_detector';
import { Transaction } from '../src/types';

describe('AnomalyDetector', () => {
  it('detects a statistically extreme spending transaction in a category', () => {
    const transactions: Transaction[] = [
      { id: 'tx_1', type: 'EXPENSE', amount: '50.00', currency: 'USD', categoryId: 'dining', description: 'Lunch 1', date: '2026-11-01' },
      { id: 'tx_2', type: 'EXPENSE', amount: '55.00', currency: 'USD', categoryId: 'dining', description: 'Lunch 2', date: '2026-11-02' },
      { id: 'tx_3', type: 'EXPENSE', amount: '48.00', currency: 'USD', categoryId: 'dining', description: 'Lunch 3', date: '2026-11-03' },
      { id: 'tx_4', type: 'EXPENSE', amount: '52.00', currency: 'USD', categoryId: 'dining', description: 'Lunch 4', date: '2026-11-04' },
      // Extreme anomaly: 10x normal lunch
      { id: 'tx_5', type: 'EXPENSE', amount: '650.00', currency: 'USD', categoryId: 'dining', description: 'Gala Banquet', date: '2026-11-05' }
    ];

    const anomalies = AnomalyDetector.detectAnomalies(transactions);
    expect(anomalies.length).toBeGreaterThan(0);

    const topAnomaly = anomalies[0];
    expect(topAnomaly.transactionId).toBe('tx_5');
    expect(topAnomaly.severity).toBe('HIGH');
    expect(topAnomaly.zScore).toBeGreaterThan(1.75);
    expect(topAnomaly.explanation).toContain('historical spend');
  });

  it('ignores categories with fewer than minimum sample size transactions', () => {
    const transactions: Transaction[] = [
      { id: 'tx_1', type: 'EXPENSE', amount: '50.00', currency: 'USD', categoryId: 'misc', description: 'One off', date: '2026-11-01' }
    ];

    const anomalies = AnomalyDetector.detectAnomalies(transactions);
    expect(anomalies.length).toBe(0);
  });
});
