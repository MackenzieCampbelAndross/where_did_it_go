/**
 * Category budget tracking and threshold monitoring for Where Did It Go.
 */

import { CategoryBudget, Transaction } from '../types';
import { DecimalMath } from './decimal_math';

export class BudgetManager {
  /**
   * Calculates actual spent amounts and status for each configured category budget.
   */
  static evaluateBudgets(
    budgets: CategoryBudget[],
    transactions: Transaction[],
    month: number,
    year: number
  ): CategoryBudget[] {
    // Filter expenses matching the target month and year
    const monthlyExpenses = transactions.filter(t => {
      if (t.type !== 'EXPENSE') return false;
      const d = new Date(t.date);
      return (d.getMonth() + 1) === month && d.getFullYear() === year;
    });

    // Sum expenses by category using DecimalMath
    const categoryTotals = new Map<string, string>();
    for (const tx of monthlyExpenses) {
      const current = categoryTotals.get(tx.categoryId) || '0.00';
      categoryTotals.set(tx.categoryId, DecimalMath.toFixed2(DecimalMath.add(current, tx.amount)));
    }

    return budgets
      .filter(b => b.month === month && b.year === year)
      .map(budget => {
        const spent = categoryTotals.get(budget.categoryId) || '0.00';
        const percentageUsed = Math.round(DecimalMath.percentageOf(spent, budget.limitAmount));
        const isExceeded = DecimalMath.greaterThan(spent, budget.limitAmount);

        return {
          ...budget,
          spentAmount: spent,
          percentageUsed,
          isExceeded
        };
      });
  }

  /**
   * Calculates overall monthly budget health.
   */
  static computeBudgetHealth(evaluatedBudgets: CategoryBudget[]): {
    totalBudgeted: string;
    totalSpent: string;
    totalRemaining: string;
    exceededCategoryCount: number;
    warningCategoryCount: number; // 80% to 100%
  } {
    const totalBudgeted = DecimalMath.toFixed2(DecimalMath.sum(evaluatedBudgets.map(b => b.limitAmount)));
    const totalSpent = DecimalMath.toFixed2(DecimalMath.sum(evaluatedBudgets.map(b => b.spentAmount || '0.00')));
    const totalRemaining = DecimalMath.toFixed2(DecimalMath.subtract(totalBudgeted, totalSpent));

    let exceededCategoryCount = 0;
    let warningCategoryCount = 0;

    for (const b of evaluatedBudgets) {
      const pct = b.percentageUsed || 0;
      if (pct > 100) {
        exceededCategoryCount++;
      } else if (pct >= 80) {
        warningCategoryCount++;
      }
    }

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      exceededCategoryCount,
      warningCategoryCount
    };
  }
}
