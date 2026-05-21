import { describe, test, expect } from 'vitest';
import { mergeSort, mergeSortInPlace, merge } from './app/index.js';

describe('Merge Sort', () => {
  describe('merge function', () => {
    test('should merge two sorted arrays', () => {
      expect(merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should handle empty arrays', () => {
      expect(merge([], [1, 2, 3])).toEqual([1, 2, 3]);
      expect(merge([1, 2, 3], [])).toEqual([1, 2, 3]);
      expect(merge([], [])).toEqual([]);
    });

    test('should handle arrays of different lengths', () => {
      expect(merge([1, 5], [2, 3, 4, 6, 7])).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('mergeSort function', () => {
    test('should sort empty array', () => {
      expect(mergeSort([])).toEqual([]);
    });

    test('should sort single element array', () => {
      expect(mergeSort([1])).toEqual([1]);
    });

    test('should sort already sorted array', () => {
      expect(mergeSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    test('should sort reverse sorted array', () => {
      expect(mergeSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    test('should sort random array', () => {
      expect(mergeSort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([
        1, 1, 2, 3, 4, 5, 6, 9,
      ]);
    });

    test('should handle duplicates', () => {
      expect(mergeSort([3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3]);
    });

    test('should handle negative numbers', () => {
      expect(mergeSort([-3, -1, -4, -1, -5])).toEqual([-5, -4, -3, -1, -1]);
    });

    test('should not modify original array', () => {
      const original = [3, 1, 4, 1, 5];
      const sorted = mergeSort(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
      expect(sorted).toEqual([1, 1, 3, 4, 5]);
    });
  });

  describe('mergeSortInPlace function', () => {
    test('should sort array in place', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6];
      mergeSortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
    });

    test('should handle empty array', () => {
      const arr = [];
      mergeSortInPlace(arr);
      expect(arr).toEqual([]);
    });

    test('should handle single element', () => {
      const arr = [42];
      mergeSortInPlace(arr);
      expect(arr).toEqual([42]);
    });

    test('should handle already sorted array', () => {
      const arr = [1, 2, 3, 4, 5];
      mergeSortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
