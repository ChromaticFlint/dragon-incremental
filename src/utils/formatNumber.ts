import { Decimal } from 'decimal.js';

const suffixes = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
  'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg',
  'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OcTg', 'NoTg', 'Qag',
  'UQag', 'DQag', 'TQag', 'QaQag', 'QiQag', 'SxQag', 'SpQag', 'OcQag', 'NoQag', 'Qig',
  // Extended suffixes for very large numbers
  'UQig', 'DQig', 'TQig', 'QaQig', 'QiQig', 'SxQig', 'SpQig', 'OcQig', 'NoQig', 'Sxg',
  'USxg', 'DSxg', 'TSxg', 'QaSxg', 'QiSxg', 'SxSxg', 'SpSxg', 'OcSxg', 'NoSxg', 'Spg',
  'USpg', 'DSpg', 'TSpg', 'QaSpg', 'QiSpg', 'SxSpg', 'SpSpg', 'OcSpg', 'NoSpg', 'Ocg',
  'UOcg', 'DOcg', 'TOcg', 'QaOcg', 'QiOcg', 'SxOcg', 'SpOcg', 'OcOcg', 'NoOcg', 'Nog',
  'UNog', 'DNog', 'TNog', 'QaNog', 'QiNog', 'SxNog', 'SpNog', 'OcNog', 'NoNog', 'Ce'
];

export type NumberFormat = 'suffix' | 'scientific' | 'full' | 'engineering';

export function formatNumber(
  value: Decimal | number | string,
  format: NumberFormat | string = 'suffix',
  precision: number = 2
): string {
  const decimal = new Decimal(value);
  
  if (decimal.isNaN() || !decimal.isFinite()) {
    return '0';
  }

  // Handle extremely large numbers that would break formatting
  // Set a much higher limit - 1e10000 (way beyond any reasonable game progression)
  if (decimal.gt('1e10000')) {
    return 'Infinity';
  }

  if (decimal.lt(0)) {
    return '-' + formatNumber(decimal.abs(), format, precision);
  }

  if (decimal.lt(1000)) {
    return decimal.toFixed(precision);
  }

  switch (format) {
    case 'suffix':
      return formatWithSuffix(decimal, precision);
    case 'scientific':
      return formatScientific(decimal, precision);
    case 'engineering':
      return formatEngineering(decimal, precision);
    case 'full':
      return decimal.toFixed(0);
    default:
      return formatWithSuffix(decimal, precision);
  }
}

function formatWithSuffix(decimal: Decimal, precision: number): string {
  if (decimal.lt(1000)) {
    return decimal.toFixed(precision);
  }

  const log1000 = decimal.log(1000);
  const suffixIndex = Math.floor(log1000.toNumber());
  
  if (suffixIndex >= suffixes.length) {
    return formatScientific(decimal, precision);
  }

  const divisor = new Decimal(1000).pow(suffixIndex);
  const quotient = decimal.div(divisor);
  
  return quotient.toFixed(precision) + suffixes[suffixIndex];
}

function formatScientific(decimal: Decimal, precision: number): string {
  const exponent = decimal.log(10).floor();
  const mantissa = decimal.div(new Decimal(10).pow(exponent));

  // Handle extremely large exponents by capping them
  const exponentNumber = exponent.toNumber();
  if (exponentNumber > 10000) {
    return 'Infinity'; // For practical purposes, this is infinite
  }

  // Format exponent with suffix if it's very large
  if (exponentNumber > 1000) {
    const exponentFormatted = formatWithSuffix(exponent, 0);
    return mantissa.toFixed(precision) + 'e' + exponentFormatted;
  }

  return mantissa.toFixed(precision) + 'e' + exponent.toString();
}

function formatEngineering(decimal: Decimal, precision: number): string {
  const log10 = decimal.log(10);
  const exponent = log10.div(3).floor().mul(3);
  const mantissa = decimal.div(new Decimal(10).pow(exponent));
  
  return mantissa.toFixed(precision) + 'e' + exponent.toString();
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function formatPercentage(value: number, precision: number = 1): string {
  return (value * 100).toFixed(precision) + '%';
}

export function formatRate(value: Decimal | number, unit: string = '/sec'): string {
  return formatNumber(value) + unit;
}

export function abbreviateNumber(value: Decimal | number): string {
  return formatNumber(value, 'suffix', 1);
}

// Parse a formatted number back to Decimal
export function parseFormattedNumber(formatted: string): Decimal {
  // Remove any whitespace
  formatted = formatted.trim();
  
  // Handle scientific notation
  if (formatted.includes('e')) {
    return new Decimal(formatted);
  }
  
  // Handle suffix notation
  const suffixMatch = formatted.match(/^([\d.]+)([A-Za-z]+)$/);
  if (suffixMatch) {
    const [, numberPart, suffix] = suffixMatch;
    const suffixIndex = suffixes.indexOf(suffix);
    if (suffixIndex !== -1) {
      return new Decimal(numberPart).mul(new Decimal(1000).pow(suffixIndex));
    }
  }
  
  // Handle regular numbers
  return new Decimal(formatted);
}
