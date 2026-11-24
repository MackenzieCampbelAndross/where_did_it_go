import { describe, it, expect } from 'vitest';
import { BudgetManager } from '../src/core/budget_manager';
import { CategoryBudget, Transaction } from '../src/types';

describe('BudgetManager', () => {
  it('evaluates monthly budgets, flags exceeded limits and computes utilization %', () => {
    const budgets: CategoryBudget[] = [
      { categoryId: 'groceries', categoryName: 'Groceries', month: 11, year: 2026, limitAmount: '500.00' },
      { categoryId: 'dining', categoryName: 'Dining Out', month: 11, year: 2026, limitAmount: '300.00' }
    ];

    const transactions: Transaction[] = [
      { id: 'tx_1', type: 'EXPENSE', amount: '250.00', currency: 'USD', categoryId: 'groceries', description: 'Groceries 1', date: '2026-11-05' },
      { id: 'tx_2', type: 'EXPENSE', amount: '200.00', currency: 'USD', categoryId: 'groceries', description: 'Groceries 2', date: '2026-11-12' },
      { id: 'tx_3', type: 'EXPENSE', amount: '350.00', currency: 'USD', categoryId: 'dining', description: 'Fancy Dinners', date: '2026-11-10' }
    ];

    const evaluated = BudgetManager.evaluateBudgets(budgets, transactions, 11, 2026);
    expect(evaluated.length).toBe(2);

    const groceryBudget = evaluated.find(b => b.categoryId === 'groceries')!;
    expect(groceryBudget.spentAmount).toBe('450.00');
    expect(groceryBudget.percentageUsed).toBe(90);
    expect(groceryBudget.isExceeded).toBe(false);

    const diningBudget = evaluated.find(b => b.categoryId === 'dining')!;
    expect(diningBudget.spentAmount).toBe('350.00');
    expect(diningBudget.percentageUsed).toBe(117);
    expect(diningBudget.isExceeded).toBe(true);

    const health = BudgetManager.computeBudgetHealth(evaluated);
    expect(health.totalBudgeted).toBe('800.00');
    expect(health.totalSpent).toBe('800.00');
    expect(health.exceededCategoryCount).toBe(1);
    expect(health.warningCategoryCount).toBe(1); // Groceries at 90% is in warning
  });
});
