/**
 * Financial insights and intelligence recommendations generator for Where Did It Go.
 */

import { FinancialInsight, Transaction, CategoryBudget, SpendingAnomaly, Category } from '../types';
import { AnalyticsEngine } from './analytics_engine';
import { DecimalMath } from './decimal_math';

export class InsightsGenerator {
  static generateInsights(
    transactions: Transaction[],
    categories: Category[],
    budgets: CategoryBudget[],
    anomalies: SpendingAnomaly[],
    currentMonth: number,
    currentYear: number
  ): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const summary = AnalyticsEngine.generateMonthlySummary(transactions, categories, currentMonth, currentYear);

    // 1. Budget Warnings
    for (const b of budgets) {
      if (b.month === currentMonth && b.year === currentYear) {
        if (b.isExceeded) {
          const overspent = DecimalMath.toFixed2(DecimalMath.subtract(b.spentAmount || '0.00', b.limitAmount));
          insights.push({
            id: `insight_budget_breach_${b.categoryId}`,
            type: 'BUDGET_WARNING',
            title: `Budget Exceeded: ${b.categoryName}`,
            description: `You have spent $${b.spentAmount} against your $${b.limitAmount} budget for ${b.categoryName}.`,
            impactAmount: `$${overspent}`,
            severity: 'ALERT',
            actionableStep: `Pause discretionary expenditures in ${b.categoryName} until next billing cycle.`
          });
        } else if ((b.percentageUsed || 0) >= 85) {
          insights.push({
            id: `insight_budget_warn_${b.categoryId}`,
            type: 'BUDGET_WARNING',
            title: `Approaching Budget Limit: ${b.categoryName}`,
            description: `You have utilized ${b.percentageUsed}% of your ${b.categoryName} budget.`,
            severity: 'WARNING',
            actionableStep: `Track daily purchases closely to stay within the remaining $${DecimalMath.toFixed2(DecimalMath.subtract(b.limitAmount, b.spentAmount || '0.00'))}.`
          });
        }
      }
    }

    // 2. High Anomaly Alerts
    const highAnomalies = anomalies.filter(a => a.severity === 'HIGH');
    for (const a of highAnomalies.slice(0, 2)) {
      insights.push({
        id: `insight_anomaly_${a.transactionId}`,
        type: 'ANOMALY_ALERT',
        title: `Spike Detected: ${a.transactionDescription}`,
        description: a.explanation,
        impactAmount: `$${a.amount}`,
        severity: 'ALERT',
        actionableStep: 'Verify receipt details and verify if this was an irregular one-off purchase.'
      });
    }

    // 3. Savings Rate Evaluation
    if (summary.savingsRatePercentage >= 20) {
      insights.push({
        id: `insight_savings_positive_${currentMonth}_${currentYear}`,
        type: 'TREND_POSITIVE',
        title: 'Strong Savings Rate',
        description: `Your net savings rate this month is ${summary.savingsRatePercentage}%, beating the standard 20% benchmark.`,
        impactAmount: `$${summary.netSavings}`,
        severity: 'INFO',
        actionableStep: 'Consider transferring excess cash reserve to high-yield savings or investment allocations.'
      });
    } else if (DecimalMath.lessThan(summary.netSavings, 0)) {
      insights.push({
        id: `insight_negative_savings_${currentMonth}_${currentYear}`,
        type: 'SAVINGS_OPPORTUNITY',
        title: 'Negative Cash Flow Alert',
        description: `Total monthly expenses ($${summary.totalExpense}) exceed total income ($${summary.totalIncome}) by $${DecimalMath.toFixed2(DecimalMath.from(summary.netSavings).abs())}.`,
        impactAmount: `$${DecimalMath.toFixed2(DecimalMath.from(summary.netSavings).abs())}`,
        severity: 'ALERT',
        actionableStep: 'Audit non-essential categories to prevent drawdown on reserve balances.'
      });
    }

    // 4. Dominant Category Opportunity
    if (summary.categoryBreakdown.length > 0) {
      const topCat = summary.categoryBreakdown[0];
      if (topCat.percentageOfTotal > 40) {
        insights.push({
          id: `insight_dominant_category_${topCat.categoryId}`,
          type: 'SAVINGS_OPPORTUNITY',
          title: `Concentrated Outflow: ${topCat.categoryName}`,
          description: `${topCat.categoryName} represents ${topCat.percentageOfTotal}% ($${topCat.amount}) of your total monthly expenditures.`,
          severity: 'WARNING',
          actionableStep: `Look for vendor consolidation or subscription audits within ${topCat.categoryName}.`
        });
      }
    }

    return insights;
  }
}
