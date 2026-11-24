/**
 * Recurring transaction and cashflow projection engine for Where Did It Go.
 * Calculates next execution dates, detects overdue occurrences, and builds projected spending curves.
 */

import { RecurringRule, Transaction, RecurrenceCadence } from '../types';
import { DecimalMath } from './decimal_math';

export interface ProjectedTransaction {
  date: string;
  ruleId: string;
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
}

export class RecurringEngine {
  /**
   * Calculates the subsequent occurrence date after a given reference date based on cadence.
   */
  static getNextDate(fromDate: Date, cadence: RecurrenceCadence): Date {
    const next = new Date(fromDate.getTime());
    switch (cadence) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  /**
   * Generates prospective future occurrences between startDate and horizonDays.
   */
  static projectFutureOccurrences(
    rules: RecurringRule[],
    horizonDays: number = 30,
    referenceDate: Date = new Date()
  ): ProjectedTransaction[] {
    const activeRules = rules.filter(r => r.isActive);
    const horizonEnd = new Date(referenceDate.getTime() + horizonDays * 24 * 60 * 60 * 1000);
    const projections: ProjectedTransaction[] = [];

    for (const rule of activeRules) {
      const ruleStart = new Date(rule.startDate);
      const ruleEnd = rule.endDate ? new Date(rule.endDate) : null;

      let cursor = rule.lastRunDate ? this.getNextDate(new Date(rule.lastRunDate), rule.cadence) : ruleStart;

      // Fast forward cursor to reference date if it's lagging far in the past
      while (cursor < referenceDate) {
        cursor = this.getNextDate(cursor, rule.cadence);
      }

      while (cursor <= horizonEnd) {
        if (ruleEnd && cursor > ruleEnd) break;

        projections.push({
          date: cursor.toISOString().split('T')[0],
          ruleId: rule.id,
          description: rule.description,
          amount: DecimalMath.toFixed2(rule.amount),
          type: rule.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
          categoryId: rule.categoryId
        });

        cursor = this.getNextDate(cursor, rule.cadence);
      }
    }

    // Sort chronologically
    return projections.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Instantiates a concrete Transaction from a recurring rule.
   */
  static instantiateTransaction(rule: RecurringRule, executionDate: string = new Date().toISOString().split('T')[0]): Transaction {
    return {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: rule.type,
      amount: DecimalMath.toFixed2(rule.amount),
      currency: 'USD',
      categoryId: rule.categoryId,
      description: rule.description,
      date: executionDate,
      isRecurring: true,
      recurringRuleId: rule.id,
      notes: `Automated recurrence execution [${rule.cadence}]`
    };
  }
}
