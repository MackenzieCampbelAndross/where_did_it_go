import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { DecimalMath } from '../core/decimal_math';
import { Repeat, Paperclip, Trash2, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
  onViewReceipt?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
  onViewReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const filtered = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (selectedCategory !== 'ALL' && t.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCat = (t.categoryName || categoryMap.get(t.categoryId)?.name || '').toLowerCase().includes(q);
      const matchNotes = (t.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="transactions-section">
      <div className="section-header-inline">
        <div>
          <h3 className="section-title">Transaction Ledger</h3>
          <p className="section-subtitle">Real-time journal of financial activities</p>
        </div>

        <div className="tx-controls">
          <div className="search-box">
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Filter transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="ALL">All Flows</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Income Only</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-tx-state">No matching transactions found.</div>
      ) : (
        <div className="table-responsive">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Flags</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => {
                const isIncome = tx.type === 'INCOME';
                const cat = categoryMap.get(tx.categoryId);

                return (
                  <tr key={tx.id} className="tx-row">
                    <td className="tx-date-cell">{tx.date}</td>
                    <td className="tx-desc-cell">
                      <div className="tx-desc-wrapper">
                        <div className={`tx-flow-icon ${isIncome ? 'income' : 'expense'}`}>
                          {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        </div>
                        <div>
                          <div className="tx-title">{tx.description}</div>
                          {tx.notes && <div className="tx-notes text-muted">{tx.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="category-pill"
                        style={{
                          backgroundColor: `${cat?.color || '#64748b'}20`,
                          color: cat?.color || '#94a3b8',
                          borderColor: `${cat?.color || '#64748b'}40`
                        }}
                      >
                        {cat?.name || tx.categoryName || 'General'}
                      </span>
                    </td>
                    <td>
                      <div className="tx-flags">
                        {tx.isRecurring && (
                          <span className="badge badge-subtle" title="Recurring Automated Flow">
                            <Repeat size={12} /> Auto
                          </span>
                        )}
                        {tx.receiptAttachment && (
                          <button
                            className="badge badge-subtle clickable"
                            onClick={() => onViewReceipt && onViewReceipt(tx)}
                            title={`Receipt: ${tx.receiptAttachment.fileName}`}
                          >
                            <Paperclip size={12} /> Receipt
                          </button>
                        )}
                        {tx.isOfflineSync && (
                          <span className="badge badge-warning" title="Saved locally offline">Offline</span>
                        )}
                      </div>
                    </td>
                    <td className={`text-right tx-amount-cell ${isIncome ? 'income' : 'expense'}`}>
                      {isIncome ? '+' : '-'}{DecimalMath.formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn-icon danger"
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
