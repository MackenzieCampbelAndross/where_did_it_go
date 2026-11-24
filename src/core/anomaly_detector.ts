/**
 * Statistical spending anomaly detection engine for Where Did It Go.
 * Implements Boris Iglewicz and David Hoaglin's Modified Z-Score using Median Absolute Deviation (MAD),
 * preventing outlier masking in financial transaction distributions.
 */

import { Transaction, SpendingAnomaly, AnomalySeverity } from '../types';
import { DecimalMath } from './decimal_math';

export class AnomalyDetector {
  private static MIN_SAMPLE_SIZE = 3;
  private static LOW_THRESHOLD_Z = 2.5;
  private static MEDIUM_THRESHOLD_Z = 4.0;
  private static HIGH_THRESHOLD_Z = 6.0;

  /**
   * Evaluates a set of transactions and returns detected spending anomalies using Modified Z-Score.
   */
  static detectAnomalies(
    transactions: Transaction[],
    targetCategoryIds?: string[]
  ): SpendingAnomaly[] {
    const expenseTx = transactions.filter(t => t.type === 'EXPENSE');
    
    // Group historical expenses by category
    const categoryGroups = new Map<string, Transaction[]>();
    for (const tx of expenseTx) {
      if (targetCategoryIds && !targetCategoryIds.includes(tx.categoryId)) continue;
      const list = categoryGroups.get(tx.categoryId) || [];
      list.push(tx);
      categoryGroups.set(tx.categoryId, list);
    }

    const anomalies: SpendingAnomaly[] = [];

    categoryGroups.forEach((items, categoryId) => {
      if (items.length < this.MIN_SAMPLE_SIZE) return;

      const amounts = items.map(i => DecimalMath.from(i.amount).toNumber()).sort((a, b) => a - b);
      const median = this.computeMedian(amounts);

      // Compute absolute deviations from median
      const deviations = amounts.map(val => Math.abs(val - median)).sort((a, b) => a - b);
      const mad = this.computeMedian(deviations);

      // If MAD is 0 (or near zero, e.g. identical bills), calculate mean absolute deviation floor
      const effectiveMad = mad > 0 ? mad : (deviations.reduce((a, b) => a + b, 0) / deviations.length || 1.0);

      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const minExpected = Math.max(0, median - (2.0 * effectiveMad));
      const maxExpected = median + (2.5 * effectiveMad);

      for (const tx of items) {
        const val = DecimalMath.from(tx.amount).toNumber();
        if (val > median) {
          // Modified Z-Score formula: 0.6745 * (x - median) / MAD
          const modifiedZ = (0.6745 * (val - median)) / effectiveMad;

          if (modifiedZ >= this.LOW_THRESHOLD_Z) {
            let severity: AnomalySeverity = 'LOW';
            if (modifiedZ >= this.HIGH_THRESHOLD_Z) {
              severity = 'HIGH';
            } else if (modifiedZ >= this.MEDIUM_THRESHOLD_Z) {
              severity = 'MEDIUM';
            }

            const multiplier = (val / median).toFixed(1);
            anomalies.push({
              transactionId: tx.id,
              transactionDescription: tx.description,
              categoryName: tx.categoryName || categoryId,
              amount: DecimalMath.toFixed2(tx.amount),
              expectedRange: {
                min: DecimalMath.toFixed2(minExpected),
                max: DecimalMath.toFixed2(maxExpected),
                mean: DecimalMath.toFixed2(mean)
              },
              severity,
              zScore: parseFloat(modifiedZ.toFixed(2)),
              explanation: `This expense of ${DecimalMath.formatCurrency(val, tx.currency)} is ${multiplier}x the median historical spend (${DecimalMath.formatCurrency(median, tx.currency)}).`
            });
          }
        }
      }
    });

    // Sort by severity (HIGH first) then z-score descending
    return anomalies.sort((a, b) => b.zScore - a.zScore);
  }

  private static computeMedian(sortedNumbers: number[]): number {
    const len = sortedNumbers.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    return len % 2 !== 0 ? sortedNumbers[mid] : (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
  }
}
