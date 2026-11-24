/**
 * High-precision decimal arithmetic engine for financial calculations.
 * Eliminates IEEE 754 floating point inaccuracies using Decimal.js with 28-digit precision.
 */

import Decimal from 'decimal.js';

// Configure global Decimal precision and rounding mode (ROUND_HALF_UP standard for finance)
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class DecimalMath {
  /**
   * Safe parser returning a validated Decimal instance.
   */
  static from(val: string | number | Decimal): Decimal {
    if (val instanceof Decimal) return val;
    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) return new Decimal(0);
      return new Decimal(val);
    }
    const sanitized = String(val).replace(/[^0-9.-]/g, '');
    if (!sanitized || sanitized === '-' || sanitized === '.') return new Decimal(0);
    try {
      return new Decimal(sanitized);
    } catch {
      return new Decimal(0);
    }
  }

  static add(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return this.from(a).plus(this.from(b));
  }

  static subtract(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return this.from(a).minus(this.from(b));
  }

  static multiply(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return this.from(a).times(this.from(b));
  }

  static divide(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    const divisor = this.from(b);
    if (divisor.isZero()) return new Decimal(0);
    return this.from(a).dividedBy(divisor);
  }

  static sum(values: Array<string | number | Decimal>): Decimal {
    return values.reduce<Decimal>((acc, cur) => acc.plus(this.from(cur)), new Decimal(0));
  }

  static equals(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return this.from(a).equals(this.from(b));
  }

  static greaterThan(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return this.from(a).greaterThan(this.from(b));
  }

  static greaterThanOrEqualTo(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return this.from(a).greaterThanOrEqualTo(this.from(b));
  }

  static lessThan(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return this.from(a).lessThan(this.from(b));
  }

  static lessThanOrEqualTo(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return this.from(a).lessThanOrEqualTo(this.from(b));
  }

  static toFixed2(val: string | number | Decimal): string {
    return this.from(val).toFixed(2);
  }

  static percentageOf(part: string | number | Decimal, total: string | number | Decimal): number {
    const tot = this.from(total);
    if (tot.isZero()) return 0;
    return this.from(part).dividedBy(tot).times(100).toNumber();
  }

  static formatCurrency(val: string | number | Decimal, currency: string = 'USD'): string {
    const amount = this.toFixed2(val);
    const parts = amount.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalPart = parts[1] || '00';
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
    return `${symbol}${integerPart}.${decimalPart}`;
  }
}
