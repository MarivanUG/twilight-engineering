import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatDate } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should ignore conditional false/null/undefined values', () => {
      expect(cn('class1', false && 'class2', null, undefined, 'class3')).toBe('class1 class3');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('should format numbers to UGX currency', () => {
      // Note: The exact output might depend on the locale environment (non-breaking space vs space),
      // so we might need to be flexible or check for specific parts.
      // UGX often formats as "UGX 1,000" or similar.
      const formatted = formatPrice(1000);
      expect(formatted).toContain('UGX');
      expect(formatted).toContain('1,000');
    });

    it('should format 0 correctly', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('UGX');
      expect(formatted).toContain('0');
    });
  });

  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const date = '2023-01-01';
      // "January 1, 2023"
      expect(formatDate(date)).toBe('January 1, 2023');
    });

    it('should return empty string for missing date', () => {
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });
  });
});
