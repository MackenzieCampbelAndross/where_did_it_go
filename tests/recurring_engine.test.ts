import { describe, it, expect } from 'vitest';
import { RecurringEngine } from '../src/core/recurring_engine';
import { RecurringRule } from '../src/types';

describe('RecurringEngine', () => {
  it('correctly calculates next occurrence date for various cadences', () => {
    const base = new Date('2026-11-01T00:00:00Z');

    const nextDaily = RecurringEngine.getNextDate(base, 'DAILY');
    expect(nextDaily.toISOString().split('T')[0]).toBe('2026-11-02');

    const nextWeekly = RecurringEngine.getNextDate(base, 'WEEKLY');
    expect(nextWeekly.toISOString().split('T')[0]).toBe('2026-11-08');

    const nextBiweekly = RecurringEngine.getNextDate(base, 'BIWEEKLY');
    expect(nextBiweekly.toISOString().split('T')[0]).toBe('2026-11-15');

    const nextMonthly = RecurringEngine.getNextDate(base, 'MONTHLY');
    expect(nextMonthly.toISOString().split('T')[0]).toBe('2026-12-01');
  });

  it('projects future occurrences across horizon horizon window', () => {
    const rules: RecurringRule[] = [
      {
        id: 'rule_rent',
        type: 'EXPENSE',
        amount: '1850.00',
        categoryId: 'housing',
        description: 'Rent',
        cadence: 'MONTHLY',
        startDate: '2026-11-01',
        isActive: true
      },
      {
        id: 'rule_weekly_sub',
        type: 'EXPENSE',
        amount: '15.00',
        categoryId: 'sub',
        description: 'Weekly Box',
        cadence: 'WEEKLY',
        startDate: '2026-11-01',
        isActive: true
      }
    ];

    const ref = new Date('2026-11-01T00:00:00Z');
    const projections = RecurringEngine.projectFutureOccurrences(rules, 30, ref);
    expect(projections.length).toBeGreaterThanOrEqual(4);
    expect(projections[0].description).toBeDefined();
  });
});
