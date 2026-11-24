import React from 'react';
import { SpendingAnomaly } from '../types';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { DecimalMath } from '../core/decimal_math';

interface AnomalyAlertsProps {
  anomalies: SpendingAnomaly[];
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ anomalies }) => {
  if (anomalies.length === 0) return null;

  return (
    <div className="anomalies-section">
      <div className="anomalies-header">
        <div className="anomalies-title-group">
          <AlertTriangle size={20} color="#f59e0b" />
          <h3 className="section-title">Spending Anomalies Detected</h3>
        </div>
        <span className="badge badge-warning">{anomalies.length} Anomaly{anomalies.length > 1 ? 'ies' : ''} Flagged</span>
      </div>

      <div className="anomalies-grid">
        {anomalies.map((a, idx) => {
          const isHigh = a.severity === 'HIGH';
          return (
            <div key={`${a.transactionId}_${idx}`} className={`anomaly-card ${a.severity.toLowerCase()}`}>
              <div className="anomaly-card-top">
                <div className="anomaly-desc-group">
                  {isHigh ? <AlertOctagon size={16} color="#ef4444" /> : <Info size={16} color="#f59e0b" />}
                  <span className="anomaly-desc">{a.transactionDescription}</span>
                </div>
                <span className="anomaly-amount">{DecimalMath.formatCurrency(a.amount)}</span>
              </div>

              <p className="anomaly-explanation">{a.explanation}</p>

              <div className="anomaly-meta-footer">
                <span>Category: <strong>{a.categoryName}</strong></span>
                <span>Z-Score: <strong>+{a.zScore}σ</strong></span>
                <span>Expected: <strong>${a.expectedRange.min} - ${a.expectedRange.max}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
