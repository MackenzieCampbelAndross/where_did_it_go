import { describe, it, expect } from 'vitest';
import { AnalyticsEngine } from '../src/core/analytics_engine';
import { Transaction, Category } from '../src/types';

describe('AnalyticsEngine', () => {
  const categories: Category[] = [
    { id: 'cat_income', name: 'Income', color: '#10b981', icon: 'DollarSign' },
    { id: 'cat_rent', name: 'Rent', color: '#6366f1', icon: 'Home' },
    { id: 'cat_food', name: 'Food', color: '#f59e0b', icon: 'ShoppingBag' }
  ];

  it('generates accurate monthly financial summaries and savings metrics', () => {
    const transactions: Transaction[] = [
      { id: 'tx_1', type: 'INCOME', amount: '5000.00', currency: 'USD', categoryId: 'cat_income', description: 'Salary', date: '2026-11-01' },
      { id: 'tx_2', type: 'EXPENSE', amount: '1500.00', currency: 'USD', categoryId: 'cat_rent', description: 'Apartment Rent', date: '2026-11-01' },
      { id: 'tx_3', type: 'EXPENSE', amount: '500.00', currency: 'USD', categoryId: 'cat_food', description: 'Supermarket', date: '2026-11-08' }
    ];

    const summary = AnalyticsEngine.generateMonthlySummary(transactions, categories, 11, 2026);
    expect(summary.totalIncome).toBe('5000.00');
    expect(summary.totalExpense).toBe('2000.00');
    expect(summary.netSavings).toBe('3000.00');
    expect(summary.savingsRatePercentage).toBe(60);

    expect(summary.categoryBreakdown.length).toBe(2);
    expect(summary.categoryBreakdown[0].categoryName).toBe('Rent');
    expect(summary.categoryBreakdown[0].percentageOfTotal).toBe(75);
  });

  it('computes month-over-month comparisons with delta shifts', () => {
    const transactions: Transaction[] = [
      // October
      { id: 'tx_oct_inc', type: 'INCOME', amount: '5000.00', currency: 'USD', categoryId: 'cat_income', description: 'Salary', date: '2026-10-01' },
      { id: 'tx_oct_exp', type: 'EXPENSE', amount: '1800.00', currency: 'USD', categoryId: 'cat_rent', description: 'Rent', date: '2026-10-01' },
      // November
      { id: 'tx_nov_inc', type: 'INCOME', amount: '5000.00', currency: 'USD', categoryId: 'cat_income', description: 'Salary', date: '2026-11-01' },
      { id: 'tx_nov_exp', type: 'EXPENSE', amount: '2200.00', currency: 'USD', categoryId: 'cat_rent', description: 'Rent', date: '2026-11-01' }
    ];

    const comparison = AnalyticsEngine.compareMonths(transactions, categories, 11, 2026, 10, 2026);
    expect(comparison.expenseDelta).toBe('400.00');
    expect(comparison.expenseDeltaPercent).toBeGreaterThan(0);
    expect(comparison.categoryShifts.length).toBeGreaterThan(0);
  });
});
