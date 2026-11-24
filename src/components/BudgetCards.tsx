import React from 'react';
import { CategoryBudget } from '../types';
import { DecimalMath } from '../core/decimal_math';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetCardsProps {
  budgets: CategoryBudget[];
  onSetBudget?: () => void;
}

export const BudgetCards: React.FC<BudgetCardsProps> = ({ budgets }) => {
  return (
    <div className="budgets-container">
      <div className="section-header-inline">
        <div>
          <h3 className="section-title">Category Budgets & Limits</h3>
          <p className="section-subtitle">Monthly ceiling thresholds and consumption pace</p>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="empty-budget-state">No category budgets established for this month.</div>
      ) : (
        <div className="budget-cards-grid">
          {budgets.map(b => {
            const pct = b.percentageUsed || 0;
            const isExceeded = b.isExceeded;
            const isWarning = pct >= 80 && !isExceeded;

            let statusClass = 'normal';
            if (isExceeded) statusClass = 'exceeded';
            else if (isWarning) statusClass = 'warning';

            return (
              <div key={b.categoryId} className={`budget-item-card ${statusClass}`}>
                <div className="budget-item-header">
                  <span className="budget-category-title">{b.categoryName}</span>
                  {isExceeded ? (
                    <span className="badge badge-danger"><AlertCircle size={12} /> Over Limit</span>
                  ) : isWarning ? (
                    <span className="badge badge-warning">Caution</span>
                  ) : (
                    <span className="badge badge-success"><CheckCircle2 size={12} /> On Track</span>
                  )}
                </div>

                <div className="budget-values-row">
                  <span className="budget-spent-val">{DecimalMath.formatCurrency(b.spentAmount || '0.00')}</span>
                  <span className="budget-limit-val">of {DecimalMath.formatCurrency(b.limitAmount)}</span>
                </div>

                <div className="budget-progress-bar">
                  <div
                    className={`budget-progress-fill ${statusClass}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="budget-footer-row">
                  <span>{pct}% utilized</span>
                  <span>
                    {isExceeded
                      ? `${DecimalMath.formatCurrency(DecimalMath.subtract(b.spentAmount || '0.00', b.limitAmount))} over`
                      : `${DecimalMath.formatCurrency(DecimalMath.subtract(b.limitAmount, b.spentAmount || '0.00'))} remaining`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
