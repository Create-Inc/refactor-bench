import { describe, test, expect } from 'vitest';
import {
  binarySearchRecursive,
  binarySearchIterative,
  findFirstOccurrence,
  findLastOccurrence,
  searchRange,
} from './app/index.js';

describe('Binary Search', () => {
  const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const arrayWithDuplicates = [1, 2, 2, 2, 3, 4, 4, 5, 6, 7];

  describe('binarySearchRecursive', () => {
    test('should find existing element', () => {
      expect(binarySearchRecursive(sortedArray, 7)).toBe(3);
      expect(binarySearchRecursive(sortedArray, 1)).toBe(0);
      expect(binarySearchRecursive(sortedArray, 19)).toBe(9);
    });

    test('should return -1 for non-existing element', () => {
      expect(binarySearchRecursive(sortedArray, 0)).toBe(-1);
      expect(binarySearchRecursive(sortedArray, 8)).toBe(-1);
      expect(binarySearchRecursive(sortedArray, 20)).toBe(-1);
    });

    test('should handle empty array', () => {
      expect(binarySearchRecursive([], 5)).toBe(-1);
    });

    test('should handle single element array', () => {
      expect(binarySearchRecursive([5], 5)).toBe(0);
      expect(binarySearchRecursive([5], 3)).toBe(-1);
    });
  });

  describe('binarySearchIterative', () => {
    test('should find existing element', () => {
      expect(binarySearchIterative(sortedArray, 7)).toBe(3);
      expect(binarySearchIterative(sortedArray, 1)).toBe(0);
      expect(binarySearchIterative(sortedArray, 19)).toBe(9);
    });

    test('should return -1 for non-existing element', () => {
      expect(binarySearchIterative(sortedArray, 0)).toBe(-1);
      expect(binarySearchIterative(sortedArray, 8)).toBe(-1);
      expect(binarySearchIterative(sortedArray, 20)).toBe(-1);
    });

    test('should handle empty array', () => {
      expect(binarySearchIterative([], 5)).toBe(-1);
    });

    test('should handle single element array', () => {
      expect(binarySearchIterative([5], 5)).toBe(0);
      expect(binarySearchIterative([5], 3)).toBe(-1);
    });
  });

  describe('findFirstOccurrence', () => {
    test('should find first occurrence of duplicate elements', () => {
      expect(findFirstOccurrence(arrayWithDuplicates, 2)).toBe(1);
      expect(findFirstOccurrence(arrayWithDuplicates, 4)).toBe(5);
    });

    test('should find single occurrence', () => {
      expect(findFirstOccurrence(arrayWithDuplicates, 1)).toBe(0);
      expect(findFirstOccurrence(arrayWithDuplicates, 7)).toBe(9);
    });

    test('should return -1 for non-existing element', () => {
      expect(findFirstOccurrence(arrayWithDuplicates, 0)).toBe(-1);
      expect(findFirstOccurrence(arrayWithDuplicates, 8)).toBe(-1);
    });
  });

  describe('findLastOccurrence', () => {
    test('should find last occurrence of duplicate elements', () => {
      expect(findLastOccurrence(arrayWithDuplicates, 2)).toBe(3);
      expect(findLastOccurrence(arrayWithDuplicates, 4)).toBe(6);
    });

    test('should find single occurrence', () => {
      expect(findLastOccurrence(arrayWithDuplicates, 1)).toBe(0);
      expect(findLastOccurrence(arrayWithDuplicates, 7)).toBe(9);
    });

    test('should return -1 for non-existing element', () => {
      expect(findLastOccurrence(arrayWithDuplicates, 0)).toBe(-1);
      expect(findLastOccurrence(arrayWithDuplicates, 8)).toBe(-1);
    });
  });

  describe('searchRange', () => {
    test('should find range of duplicate elements', () => {
      expect(searchRange(arrayWithDuplicates, 2)).toEqual([1, 3]);
      expect(searchRange(arrayWithDuplicates, 4)).toEqual([5, 6]);
    });

    test('should find range of single element', () => {
      expect(searchRange(arrayWithDuplicates, 1)).toEqual([0, 0]);
      expect(searchRange(arrayWithDuplicates, 7)).toEqual([9, 9]);
    });

    test('should return [-1, -1] for non-existing element', () => {
      expect(searchRange(arrayWithDuplicates, 0)).toEqual([-1, -1]);
      expect(searchRange(arrayWithDuplicates, 8)).toEqual([-1, -1]);
    });

    test('should handle empty array', () => {
      expect(searchRange([], 5)).toEqual([-1, -1]);
    });
  });

  describe('both implementations should give same results', () => {
    test('recursive and iterative should match', () => {
      const testCases = [1, 5, 7, 11, 15, 19, 0, 8, 20];

      testCases.forEach((target) => {
        const recursiveResult = binarySearchRecursive(sortedArray, target);
        const iterativeResult = binarySearchIterative(sortedArray, target);
        expect(recursiveResult).toBe(iterativeResult);
      });
    });
  });
});
