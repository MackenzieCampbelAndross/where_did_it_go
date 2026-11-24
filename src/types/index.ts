/**
 * Core domain types and interfaces for Where Did It Go (Personal Expense Intelligence Platform).
 */

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type RecurrenceCadence = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string; // Serialized high-precision decimal string
  currency: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  date: string; // ISO 8601 YYYY-MM-DD
  isRecurring?: boolean;
  recurringRuleId?: string;
  receiptAttachment?: ReceiptAttachment;
  notes?: string;
  isOfflineSync?: boolean;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  createdAt?: number;
}

export interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  month: number; // 1 - 12
  year: number;
  limitAmount: string; // Decimal string
  spentAmount?: string; // Decimal string
  percentageUsed?: number;
  isExceeded?: boolean;
}

export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: string;
  categoryId: string;
  description: string;
  cadence: RecurrenceCadence;
  startDate: string;
  endDate?: string;
  lastRunDate?: string;
  isActive: boolean;
}

export interface ReceiptAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  dataBase64?: string;
  uploadedAt: string;
}

export interface SpendingAnomaly {
  transactionId: string;
  transactionDescription: string;
  categoryName: string;
  amount: string;
  expectedRange: {
    min: string;
    max: string;
    mean: string;
  };
  severity: AnomalySeverity;
  zScore: number;
  explanation: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: string;
  totalExpense: string;
  netSavings: string;
  savingsRatePercentage: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
    amount: string;
    percentageOfTotal: number;
  }>;
}

export interface FinancialInsight {
  id: string;
  type: 'SAVINGS_OPPORTUNITY' | 'BUDGET_WARNING' | 'ANOMALY_ALERT' | 'TREND_POSITIVE' | 'RECURRING_DRIFT';
  title: string;
  description: string;
  impactAmount?: string;
  severity: 'INFO' | 'WARNING' | 'ALERT';
  actionableStep?: string;
}

export interface CSVImportResult {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: Array<{ row: number; reason: string }>;
  transactions: Transaction[];
}
