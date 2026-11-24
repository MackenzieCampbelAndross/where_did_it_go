import React from 'react';
import { DollarSign, Wifi, WifiOff, FileSpreadsheet, PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  isOnline: boolean;
  onOpenNewTx: () => void;
  onOpenCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  isOnline,
  onOpenNewTx,
  onOpenCSV
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="logo-icon">
          <DollarSign size={24} color="#ffffff" />
        </div>
        <div>
          <h1 className="header-title">Where Did It Go?</h1>
          <p className="header-subtitle">Personal Expense Intelligence Platform</p>
        </div>
      </div>

      <div className="month-selector">
        <button className="btn-icon" onClick={handlePrevMonth} title="Previous Month">←</button>
        <span className="current-month-label">{monthNames[currentMonth - 1]} {currentYear}</span>
        <button className="btn-icon" onClick={handleNextMonth} title="Next Month">→</button>
      </div>

      <div className="header-actions">
        <div className={`status-pill ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online - Changes Synced' : 'Offline Mode - Locally Cached'}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isOnline ? 'Live' : 'Offline'}</span>
        </div>

        <button className="btn btn-secondary" onClick={onOpenCSV}>
          <FileSpreadsheet size={16} />
          <span>CSV Data</span>
        </button>

        <button className="btn btn-primary" onClick={onOpenNewTx}>
          <PlusCircle size={16} />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
};
