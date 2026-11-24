import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import { MonthlySummary } from '../types';
import { DecimalMath } from '../core/decimal_math';

interface MetricCardsProps {
  summary: MonthlySummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  const isSavingsPositive = DecimalMath.greaterThanOrEqualTo(summary.netSavings, 0);

  return (
    <div className="metric-cards-grid">
      <div className="metric-card income">
        <div className="metric-card-header">
          <span className="metric-label">Total Income</span>
          <div className="metric-icon-badge income"><TrendingUp size={18} /></div>
        </div>
        <div className="metric-value">{DecimalMath.formatCurrency(summary.totalIncome)}</div>
        <div className="metric-footer text-muted">Earned inflows this month</div>
      </div>

      <div className="metric-card expense">
        <div className="metric-card-header">
          <span className="metric-label">Total Expenses</span>
          <div className="metric-icon-badge expense"><TrendingDown size={18} /></div>
        </div>
        <div className="metric-value">{DecimalMath.formatCurrency(summary.totalExpense)}</div>
        <div className="metric-footer text-muted">Outflows and category debits</div>
      </div>

      <div className={`metric-card savings ${isSavingsPositive ? 'positive' : 'negative'}`}>
        <div className="metric-card-header">
          <span className="metric-label">Net Savings</span>
          <div className={`metric-icon-badge ${isSavingsPositive ? 'positive' : 'negative'}`}><PiggyBank size={18} /></div>
        </div>
        <div className="metric-value">{DecimalMath.formatCurrency(summary.netSavings)}</div>
        <div className="metric-footer text-muted">{isSavingsPositive ? 'Retained cash surplus' : 'Deficit drawn from reserves'}</div>
      </div>

      <div className="metric-card rate">
        <div className="metric-card-header">
          <span className="metric-label">Savings Rate</span>
          <div className="metric-icon-badge rate"><Percent size={18} /></div>
        </div>
        <div className="metric-value">{summary.savingsRatePercentage}%</div>
        <div className="metric-footer text-muted">Target: 20%+ monthly savings</div>
      </div>
    </div>
  );
};
