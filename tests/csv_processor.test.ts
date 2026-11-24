import { describe, it, expect } from 'vitest';
import { CSVProcessor } from '../src/core/csv_processor';
import { Transaction } from '../src/types';

describe('CSVProcessor', () => {
  it('exports transactions to valid RFC 4180 CSV string', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        date: '2026-11-01',
        type: 'EXPENSE',
        categoryId: 'housing',
        categoryName: 'Housing',
        description: 'Rent, Apt #402',
        amount: '1850.00',
        currency: 'USD',
        notes: 'November payment'
      }
    ];

    const csv = CSVProcessor.exportToCSV(transactions);
    expect(csv).toContain('ID,Date,Type,Category,Description,Amount,Currency,Notes');
    expect(csv).toContain('"Rent, Apt #402"'); // Properly escaped with quotes
    expect(csv).toContain('1850.00');
  });

  it('imports bank statement CSV and parses rows into typed transactions', () => {
    const csvContent = `Date,Description,Amount,Category,Type
2026-11-01,Direct Deposit,5400.00,Income,INCOME
2026-11-02,Grocery Store,124.50,Food,EXPENSE
2026-11-03,Utility Bill,85.00,Utilities,EXPENSE`;

    const result = CSVProcessor.importFromCSV(csvContent);
    expect(result.importedCount).toBe(3);
    expect(result.failedCount).toBe(0);
    expect(result.transactions[0].type).toBe('INCOME');
    expect(result.transactions[0].amount).toBe('5400.00');
    expect(result.transactions[1].description).toBe('Grocery Store');
  });

  it('safely handles empty or malformed CSV rows', () => {
    const invalidCsv = `Date,Description,Amount\n2026-11-01,Broken row,`;
    const result = CSVProcessor.importFromCSV(invalidCsv);
    expect(result.importedCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(result.errors[0].reason).toContain('Missing transaction amount');
  });
});
