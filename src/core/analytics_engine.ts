/**
 * Comprehensive financial analytics and month-over-month comparison engine.
 */

import { Transaction, MonthlySummary, Category } from '../types';
import { DecimalMath } from './decimal_math';

export interface MonthComparisonResult {
  currentMonth: { month: number; year: number; totalExpense: string; totalIncome: string; netSavings: string };
  previousMonth: { month: number; year: number; totalExpense: string; totalIncome: string; netSavings: string };
  expenseDelta: string;
  expenseDeltaPercent: number;
  incomeDelta: string;
  incomeDeltaPercent: number;
  categoryShifts: Array<{
    categoryId: string;
    categoryName: string;
    currentAmount: string;
    previousAmount: string;
    delta: string;
    percentageChange: number;
  }>;
}

export class AnalyticsEngine {
  /**
   * Generates a monthly summary with totals and category allocations.
   */
  static generateMonthlySummary(
    transactions: Transaction[],
    categories: Category[],
    month: number,
    year: number
  ): MonthlySummary {
    const monthlyTx = transactions.filter(t => {
      const d = new Date(t.date);
      return (d.getMonth() + 1) === month && d.getFullYear() === year;
    });

    const incomeTx = monthlyTx.filter(t => t.type === 'INCOME');
    const expenseTx = monthlyTx.filter(t => t.type === 'EXPENSE');

    const totalIncome = DecimalMath.toFixed2(DecimalMath.sum(incomeTx.map(t => t.amount)));
    const totalExpense = DecimalMath.toFixed2(DecimalMath.sum(expenseTx.map(t => t.amount)));
    const netSavings = DecimalMath.toFixed2(DecimalMath.subtract(totalIncome, totalExpense));

    const savingsRatePercentage = DecimalMath.greaterThan(totalIncome, 0)
      ? Math.max(0, Math.round(DecimalMath.percentageOf(netSavings, totalIncome)))
      : 0;

    // Category breakdown
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const expenseByCategory = new Map<string, string>();

    for (const tx of expenseTx) {
      const current = expenseByCategory.get(tx.categoryId) || '0.00';
      expenseByCategory.set(tx.categoryId, DecimalMath.toFixed2(DecimalMath.add(current, tx.amount)));
    }

    const categoryBreakdown: MonthlySummary['categoryBreakdown'] = [];
    expenseByCategory.forEach((amount, categoryId) => {
      const cat = categoryMap.get(categoryId);
      const percentage = DecimalMath.greaterThan(totalExpense, 0)
        ? parseFloat(DecimalMath.percentageOf(amount, totalExpense).toFixed(1))
        : 0;

      categoryBreakdown.push({
        categoryId,
        categoryName: cat ? cat.name : 'Uncategorized',
        color: cat ? cat.color : '#94a3b8',
        amount,
        percentageOfTotal: percentage
      });
    });

    // Sort by largest expense first
    categoryBreakdown.sort((a, b) => DecimalMath.from(b.amount).minus(DecimalMath.from(a.amount)).toNumber());

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatePercentage,
      categoryBreakdown
    };
  }

  /**
   * Compares two months and evaluates spending shifts.
   */
  static compareMonths(
    transactions: Transaction[],
    categories: Category[],
    currMonth: number,
    currYear: number,
    prevMonth: number,
    prevYear: number
  ): MonthComparisonResult {
    const current = this.generateMonthlySummary(transactions, categories, currMonth, currYear);
    const previous = this.generateMonthlySummary(transactions, categories, prevMonth, prevYear);

    const expenseDelta = DecimalMath.toFixed2(DecimalMath.subtract(current.totalExpense, previous.totalExpense));
    const expenseDeltaPercent = DecimalMath.greaterThan(previous.totalExpense, 0)
      ? parseFloat(DecimalMath.from(expenseDelta).dividedBy(DecimalMath.from(previous.totalExpense)).times(100).toFixed(1))
      : 0;

    const incomeDelta = DecimalMath.toFixed2(DecimalMath.subtract(current.totalIncome, previous.totalIncome));
    const incomeDeltaPercent = DecimalMath.greaterThan(previous.totalIncome, 0)
      ? parseFloat(DecimalMath.from(incomeDelta).dividedBy(DecimalMath.from(previous.totalIncome)).times(100).toFixed(1))
      : 0;

    const categoryShifts: MonthComparisonResult['categoryShifts'] = [];
    const prevCategoryMap = new Map(previous.categoryBreakdown.map(c => [c.categoryId, c.amount]));
    const currCategoryMap = new Map(current.categoryBreakdown.map(c => [c.categoryId, c.amount]));
    const allCatIds = new Set([...prevCategoryMap.keys(), ...currCategoryMap.keys()]);
    const catNameMap = new Map(categories.map(c => [c.id, c.name]));

    allCatIds.forEach(catId => {
      const curAmt = currCategoryMap.get(catId) || '0.00';
      const prevAmt = prevCategoryMap.get(catId) || '0.00';
      const delta = DecimalMath.toFixed2(DecimalMath.subtract(curAmt, prevAmt));
      const percentageChange = DecimalMath.greaterThan(prevAmt, 0)
        ? parseFloat(DecimalMath.from(delta).dividedBy(DecimalMath.from(prevAmt)).times(100).toFixed(1))
        : DecimalMath.greaterThan(curAmt, 0) ? 100 : 0;

      categoryShifts.push({
        categoryId: catId,
        categoryName: catNameMap.get(catId) || 'Uncategorized',
        currentAmount: curAmt,
        previousAmount: prevAmt,
        delta,
        percentageChange
      });
    });

    categoryShifts.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));

    return {
      currentMonth: {
        month: currMonth,
        year: currYear,
        totalExpense: current.totalExpense,
        totalIncome: current.totalIncome,
        netSavings: current.netSavings
      },
      previousMonth: {
        month: prevMonth,
        year: prevYear,
        totalExpense: previous.totalExpense,
        totalIncome: previous.totalIncome,
        netSavings: previous.netSavings
      },
      expenseDelta,
      expenseDeltaPercent,
      incomeDelta,
      incomeDeltaPercent,
      categoryShifts
    };
  }
}
