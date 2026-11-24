import { describe, it, expect } from 'vitest';
import { DecimalMath } from '../src/core/decimal_math';

describe('DecimalMath', () => {
  it('eliminates standard floating point rounding bugs (0.1 + 0.2 === 0.3)', () => {
    // Standard JS gives 0.30000000000000004
    const res = DecimalMath.add('0.1', '0.2');
    expect(res.toString()).toBe('0.3');
    expect(DecimalMath.toFixed2(res)).toBe('0.30');
  });

  it('performs high precision decimal arithmetic across operations', () => {
    const sum = DecimalMath.add('1045.55', '2050.45');
    expect(DecimalMath.toFixed2(sum)).toBe('3096.00');

    const diff = DecimalMath.subtract('5000.00', '1850.75');
    expect(DecimalMath.toFixed2(diff)).toBe('3149.25');

    const product = DecimalMath.multiply('12.50', '3');
    expect(DecimalMath.toFixed2(product)).toBe('37.50');

    const quotient = DecimalMath.divide('100.00', '3');
    expect(DecimalMath.toFixed2(quotient)).toBe('33.33');
  });

  it('handles zero divisions safely without crashing', () => {
    const res = DecimalMath.divide('150.00', '0');
    expect(res.toString()).toBe('0');
  });

  it('calculates exact sums and percentages of totals', () => {
    const values = ['100.50', '250.25', '149.25'];
    const total = DecimalMath.sum(values);
    expect(DecimalMath.toFixed2(total)).toBe('500.00');

    const pct = DecimalMath.percentageOf('250.00', '500.00');
    expect(pct).toBe(50);
  });

  it('formats currency with commas and currency symbols', () => {
    expect(DecimalMath.formatCurrency('1250000.50', 'USD')).toBe('$1,250,000.50');
    expect(DecimalMath.formatCurrency('42.00', 'EUR')).toBe('€42.00');
  });
});
