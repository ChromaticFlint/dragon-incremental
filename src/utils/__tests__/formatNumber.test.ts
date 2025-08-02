import { describe, it, expect } from 'vitest';
import { Decimal } from 'decimal.js';
import { 
  formatNumber, 
  formatTime, 
  formatPercentage, 
  formatRate, 
  abbreviateNumber,
  parseFormattedNumber 
} from '../formatNumber';

describe('formatNumber', () => {
  describe('suffix format', () => {
    it('should format small numbers without suffix', () => {
      expect(formatNumber(123, 'suffix')).toBe('123.00');
      expect(formatNumber(999, 'suffix')).toBe('999.00');
    });

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000, 'suffix')).toBe('1.00K');
      expect(formatNumber(1500, 'suffix')).toBe('1.50K');
      expect(formatNumber(999999, 'suffix')).toBe('1000.00K');
    });

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000, 'suffix')).toBe('1.00M');
      expect(formatNumber(1500000, 'suffix')).toBe('1.50M');
    });

    it('should handle Decimal objects', () => {
      expect(formatNumber(new Decimal(1000), 'suffix')).toBe('1.00K');
      expect(formatNumber(new Decimal('1e6'), 'suffix')).toBe('1.00M');
    });

    it('should handle very large numbers', () => {
      expect(formatNumber(new Decimal('1e15'), 'suffix')).toBe('1.00Qa');
    });
  });

  describe('scientific format', () => {
    it('should format numbers in scientific notation', () => {
      expect(formatNumber(1000, 'scientific')).toBe('1.00e3');
      expect(formatNumber(1500000, 'scientific')).toBe('1.50e6');
    });

    it('should handle very large numbers', () => {
      expect(formatNumber(new Decimal('1e100'), 'scientific')).toBe('1.00e100');
    });
  });

  describe('engineering format', () => {
    it('should format numbers in engineering notation', () => {
      expect(formatNumber(1000, 'engineering')).toBe('1.00e3');
      expect(formatNumber(1500000, 'engineering')).toBe('1.50e6');
    });
  });

  describe('full format', () => {
    it('should display full numbers without formatting', () => {
      expect(formatNumber(1234567, 'full')).toBe('1234567');
    });
  });

  describe('negative numbers', () => {
    it('should handle negative numbers correctly', () => {
      expect(formatNumber(-1000, 'suffix')).toBe('-1.00K');
      expect(formatNumber(-1500000, 'scientific')).toBe('-1.50e6');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatNumber(0, 'suffix')).toBe('0.00');
    });

    it('should handle NaN', () => {
      expect(formatNumber(NaN, 'suffix')).toBe('0');
    });

    it('should handle Infinity', () => {
      expect(formatNumber(Infinity, 'suffix')).toBe('0');
    });
  });
});

describe('formatTime', () => {
  it('should format seconds', () => {
    expect(formatTime(30)).toBe('30s');
    expect(formatTime(59)).toBe('59s');
  });

  it('should format minutes and seconds', () => {
    expect(formatTime(60)).toBe('1m 0s');
    expect(formatTime(90)).toBe('1m 30s');
    expect(formatTime(3599)).toBe('59m 59s');
  });

  it('should format hours and minutes', () => {
    expect(formatTime(3600)).toBe('1h 0m');
    expect(formatTime(3660)).toBe('1h 1m');
    expect(formatTime(86399)).toBe('23h 59m');
  });

  it('should format days and hours', () => {
    expect(formatTime(86400)).toBe('1d 0h');
    expect(formatTime(90000)).toBe('1d 1h');
  });
});

describe('formatPercentage', () => {
  it('should format percentages correctly', () => {
    expect(formatPercentage(0.5)).toBe('50.0%');
    expect(formatPercentage(0.123)).toBe('12.3%');
    expect(formatPercentage(1.5)).toBe('150.0%');
  });

  it('should respect precision parameter', () => {
    expect(formatPercentage(0.12345, 2)).toBe('12.35%');
    expect(formatPercentage(0.12345, 0)).toBe('12%');
  });
});

describe('formatRate', () => {
  it('should format rates with default unit', () => {
    expect(formatRate(100)).toBe('100.00/sec');
    expect(formatRate(new Decimal(1000))).toBe('1.00K/sec');
  });

  it('should format rates with custom unit', () => {
    expect(formatRate(100, '/min')).toBe('100.00/min');
  });
});

describe('abbreviateNumber', () => {
  it('should abbreviate numbers with 1 decimal precision', () => {
    expect(abbreviateNumber(1234)).toBe('1.2K');
    expect(abbreviateNumber(1000000)).toBe('1.0M');
  });
});

describe('parseFormattedNumber', () => {
  it('should parse suffix notation back to Decimal', () => {
    expect(parseFormattedNumber('1.5K')).toEqual(new Decimal(1500));
    expect(parseFormattedNumber('2.0M')).toEqual(new Decimal(2000000));
  });

  it('should parse scientific notation', () => {
    expect(parseFormattedNumber('1.5e3')).toEqual(new Decimal(1500));
    expect(parseFormattedNumber('2.0e6')).toEqual(new Decimal(2000000));
  });

  it('should parse regular numbers', () => {
    expect(parseFormattedNumber('1234')).toEqual(new Decimal(1234));
    expect(parseFormattedNumber('1234.56')).toEqual(new Decimal(1234.56));
  });

  it('should handle whitespace', () => {
    expect(parseFormattedNumber('  1.5K  ')).toEqual(new Decimal(1500));
  });
});
