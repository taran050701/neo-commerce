import { formatCurrency } from '@/utils/currency';

describe('formatCurrency', () => {
  it('formats USD amounts with default currency', () => {
    expect(formatCurrency(199.99)).toBe('$200');
  });

  it('respects supplied currency code', () => {
    expect(formatCurrency(150, 'EUR')).toBe('€150');
  });
});
