import { describe, test, expect } from 'vitest';
import {
  fibonacciRecursive,
  fibonacciMemoized,
  fibonacciTabulated,
  fibonacciOptimized,
  fibonacciSequence,
  fibonacciMatrix,
  isFibonacci,
} from './app/index.js';

describe('Fibonacci Implementations', () => {
  const expectedValues = [
    { n: 0, result: 0 },
    { n: 1, result: 1 },
    { n: 2, result: 1 },
    { n: 3, result: 2 },
    { n: 4, result: 3 },
    { n: 5, result: 5 },
    { n: 6, result: 8 },
    { n: 7, result: 13 },
    { n: 8, result: 21 },
    { n: 9, result: 34 },
    { n: 10, result: 55 },
  ];

  describe('fibonacciRecursive', () => {
    test('should calculate fibonacci numbers correctly', () => {
      // Test only small values due to exponential time complexity
      const smallValues = expectedValues.slice(0, 8);
      smallValues.forEach(({ n, result }) => {
        expect(fibonacciRecursive(n)).toBe(result);
      });
    });
  });

  describe('fibonacciMemoized', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expectedValues.forEach(({ n, result }) => {
        expect(fibonacciMemoized(n)).toBe(result);
      });
    });

    test('should handle larger numbers efficiently', () => {
      expect(fibonacciMemoized(20)).toBe(6765);
      expect(fibonacciMemoized(30)).toBe(832040);
    });

    test('should reuse memo object', () => {
      const memo = {};
      fibonacciMemoized(10, memo);
      expect(Object.keys(memo).length).toBeGreaterThan(0);

      // Should use existing memo
      const result = fibonacciMemoized(8, memo);
      expect(result).toBe(21);
    });
  });

  describe('fibonacciTabulated', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expectedValues.forEach(({ n, result }) => {
        expect(fibonacciTabulated(n)).toBe(result);
      });
    });

    test('should handle larger numbers efficiently', () => {
      expect(fibonacciTabulated(20)).toBe(6765);
      expect(fibonacciTabulated(30)).toBe(832040);
    });
  });

  describe('fibonacciOptimized', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expectedValues.forEach(({ n, result }) => {
        expect(fibonacciOptimized(n)).toBe(result);
      });
    });

    test('should handle larger numbers efficiently', () => {
      expect(fibonacciOptimized(20)).toBe(6765);
      expect(fibonacciOptimized(30)).toBe(832040);
      expect(fibonacciOptimized(50)).toBe(12586269025);
    });
  });

  describe('fibonacciMatrix', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expectedValues.forEach(({ n, result }) => {
        expect(fibonacciMatrix(n)).toBe(result);
      });
    });

    test('should handle larger numbers efficiently', () => {
      expect(fibonacciMatrix(20)).toBe(6765);
      expect(fibonacciMatrix(30)).toBe(832040);
    });
  });

  describe('fibonacciSequence', () => {
    test('should generate correct fibonacci sequence', () => {
      expect(fibonacciSequence(0)).toEqual([]);
      expect(fibonacciSequence(1)).toEqual([0]);
      expect(fibonacciSequence(2)).toEqual([0, 1]);
      expect(fibonacciSequence(5)).toEqual([0, 1, 1, 2, 3]);
      expect(fibonacciSequence(10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
    });

    test('should handle edge cases', () => {
      expect(fibonacciSequence(-1)).toEqual([]);
      expect(fibonacciSequence(0)).toEqual([]);
    });
  });

  describe('isFibonacci', () => {
    test('should identify fibonacci numbers', () => {
      const fibNumbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
      fibNumbers.forEach((num) => {
        expect(isFibonacci(num)).toBe(true);
      });
    });

    test('should identify non-fibonacci numbers', () => {
      const nonFibNumbers = [4, 6, 7, 9, 10, 11, 12, 14, 15, 16];
      nonFibNumbers.forEach((num) => {
        expect(isFibonacci(num)).toBe(false);
      });
    });

    test('should handle edge cases', () => {
      expect(isFibonacci(-1)).toBe(false);
      expect(isFibonacci(-5)).toBe(false);
      expect(isFibonacci(0)).toBe(true);
    });

    test('should handle larger fibonacci numbers', () => {
      expect(isFibonacci(6765)).toBe(true); // F(20)
      expect(isFibonacci(6766)).toBe(false);
    });
  });

  describe('all implementations should give same results', () => {
    test('all methods should produce identical results for small inputs', () => {
      for (let i = 0; i <= 10; i++) {
        const recursive = i <= 7 ? fibonacciRecursive(i) : null; // Skip large values for recursive
        const memoized = fibonacciMemoized(i);
        const tabulated = fibonacciTabulated(i);
        const optimized = fibonacciOptimized(i);
        const matrix = fibonacciMatrix(i);

        expect(memoized).toBe(tabulated);
        expect(tabulated).toBe(optimized);
        expect(optimized).toBe(matrix);

        if (recursive !== null) {
          expect(memoized).toBe(recursive);
        }
      }
    });
  });
});
