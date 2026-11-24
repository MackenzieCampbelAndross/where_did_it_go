import { describe, it, expect } from 'vitest';
import { InsightsGenerator } from '../src/core/insights_generator';
import { Transaction, Category, CategoryBudget, SpendingAnomaly } from '../src/types';

describe('InsightsGenerator', () => {
  const categories: Category[] = [
    { id: 'cat_dining', name: 'Dining Out', color: '#ec4899', icon: 'Coffee' }
  ];

  it('generates high priority alerts when a budget is breached or strong anomalies occur', () => {
    const transactions: Transaction[] = [
      { id: 'tx_1', type: 'EXPENSE', amount: '500.00', currency: 'USD', categoryId: 'cat_dining', description: 'Gala Dinner', date: '2026-11-10' }
    ];

    const budgets: CategoryBudget[] = [
      {
        categoryId: 'cat_dining',
        categoryName: 'Dining Out',
        month: 11,
        year: 2026,
        limitAmount: '400.00',
        spentAmount: '500.00',
        percentageUsed: 125,
        isExceeded: true
      }
    ];

    const anomalies: SpendingAnomaly[] = [
      {
        transactionId: 'tx_1',
        transactionDescription: 'Gala Dinner',
        categoryName: 'Dining Out',
        amount: '500.00',
        expectedRange: { min: '30.00', max: '80.00', mean: '50.00' },
        severity: 'HIGH',
        zScore: 3.8,
        explanation: 'Extreme spending spike'
      }
    ];

    const insights = InsightsGenerator.generateInsights(transactions, categories, budgets, anomalies, 11, 2026);
    expect(insights.length).toBeGreaterThanOrEqual(2);

    const budgetBreach = insights.find(i => i.type === 'BUDGET_WARNING');
    expect(budgetBreach).toBeDefined();
    expect(budgetBreach?.severity).toBe('ALERT');

    const anomalyAlert = insights.find(i => i.type === 'ANOMALY_ALERT');
    expect(anomalyAlert).toBeDefined();
  });
});
