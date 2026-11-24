/**
 * CSV Import and Export engine for Where Did It Go.
 * Complies with RFC 4180 and supports multi-column bank statement mapping.
 */

import { Transaction, CSVImportResult, TransactionType } from '../types';
import { DecimalMath } from './decimal_math';

export class CSVProcessor {
  /**
   * Serializes a collection of transactions into RFC 4180 compliant CSV.
   */
  static exportToCSV(transactions: Transaction[]): string {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      this.escapeCsvField(t.categoryName || t.categoryId),
      this.escapeCsvField(t.description),
      DecimalMath.toFixed2(t.amount),
      t.currency,
      this.escapeCsvField(t.notes || '')
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }

  /**
   * Parses CSV string into structured transactions with validation.
   */
  static importFromCSV(
    csvContent: string,
    defaultCategoryId: string = 'cat_general'
  ): CSVImportResult {
    const lines = csvContent.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return { totalRows: 0, importedCount: 0, failedCount: 0, errors: [], transactions: [] };
    }

    const header = this.parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
    const dateIdx = header.findIndex(h => h.includes('date'));
    const descIdx = header.findIndex(h => h.includes('desc') || h.includes('title') || h.includes('payee') || h.includes('merchant'));
    const amountIdx = header.findIndex(h => h.includes('amount') || h.includes('cost') || h.includes('total') || h.includes('value'));
    const typeIdx = header.findIndex(h => h.includes('type'));
    const catIdx = header.findIndex(h => h.includes('category') || h.includes('cat'));

    const transactions: Transaction[] = [];
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCsvLine(lines[i]);
      if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

      try {
        const rawDate = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx].trim() : new Date().toISOString().split('T')[0];
        const dateObj = new Date(rawDate);
        const date = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const rawAmount = amountIdx !== -1 && cols[amountIdx] ? cols[amountIdx].trim() : '';
        if (!rawAmount) {
          errors.push({ row: i + 1, reason: 'Missing transaction amount' });
          continue;
        }

        const isNegative = rawAmount.startsWith('-') || rawAmount.startsWith('(');
        const sanitizedAmount = DecimalMath.toFixed2(DecimalMath.from(rawAmount).abs());
        
        let type: TransactionType = 'EXPENSE';
        if (typeIdx !== -1 && cols[typeIdx]) {
          const rawType = cols[typeIdx].trim().toUpperCase();
          if (rawType.includes('INCOME') || rawType.includes('CREDIT') || rawType.includes('DEPOSIT')) {
            type = 'INCOME';
          }
        } else if (isNegative) {
          // Negative numbers in statement often mean debit/expense
          type = 'EXPENSE';
        }

        const description = descIdx !== -1 && cols[descIdx] ? cols[descIdx].trim() : 'CSV Transaction';
        const categoryId = catIdx !== -1 && cols[catIdx] ? cols[catIdx].trim().toLowerCase().replace(/\s+/g, '_') : defaultCategoryId;

        transactions.push({
          id: `csv_tx_${Date.now()}_${i}`,
          type,
          amount: sanitizedAmount,
          currency: 'USD',
          categoryId,
          categoryName: catIdx !== -1 && cols[catIdx] ? cols[catIdx].trim() : undefined,
          description,
          date,
          notes: 'Imported from CSV'
        });
      } catch (err: any) {
        errors.push({ row: i + 1, reason: err.message || 'Malformed CSV line' });
      }
    }

    return {
      totalRows: lines.length - 1,
      importedCount: transactions.length,
      failedCount: errors.length,
      errors,
      transactions
    };
  }

  private static parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private static escapeCsvField(val: string): string {
    if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }
}
