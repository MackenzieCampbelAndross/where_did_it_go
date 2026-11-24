import React from 'react';
import { MonthlySummary } from '../types';
import { DecimalMath } from '../core/decimal_math';

interface SpendingChartsProps {
  summary: MonthlySummary;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({ summary }) => {
  const breakdown = summary.categoryBreakdown;

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3 className="section-title">Expense Allocation by Category</h3>
        <p className="section-subtitle">Real-time breakdown of where capital is deployed</p>

        {breakdown.length === 0 ? (
          <div className="empty-chart-state">No category expenditures recorded for this billing cycle.</div>
        ) : (
          <div className="category-bars-list">
            {breakdown.map(cat => (
              <div key={cat.categoryId} className="category-bar-row">
                <div className="category-bar-meta">
                  <span className="category-name">{cat.categoryName}</span>
                  <span className="category-amount">
                    {DecimalMath.formatCurrency(cat.amount)} ({cat.percentageOfTotal}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, cat.percentageOfTotal)}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
