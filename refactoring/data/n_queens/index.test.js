import { describe, test, expect } from 'vitest';
import solveNQueens from './app/index.js';

describe('solveNQueens', () => {
  test('n = 1 should return one solution', () => {
    const result = solveNQueens(1);
    expect(result).toEqual([['Q']]);
  });

  test('n = 2 should return no solutions', () => {
    const result = solveNQueens(2);
    expect(result).toEqual([]);
  });

  test('n = 3 should return no solutions', () => {
    const result = solveNQueens(3);
    expect(result).toEqual([]);
  });

  test('n = 4 should return 2 solutions', () => {
    const result = solveNQueens(4);
    expect(result.length).toBe(2);

    // Check each board has 4 queens
    result.forEach((board) => {
      const queens = board.reduce(
        (acc, row) => acc + (row.match(/Q/g) || []).length,
        0
      );
      expect(queens).toBe(4);
    });
  });

  test('n = 5 should return 10 solutions', () => {
    const result = solveNQueens(5);
    expect(result.length).toBe(10);
  });

  test('n = 6 should return 4 solutions', () => {
    const result = solveNQueens(6);
    expect(result.length).toBe(4);
  });

  test('n = 7 should return 40 solutions', () => {
    const result = solveNQueens(7);
    expect(result.length).toBe(40);
  });

  test('n = 8 should return 92 solutions', () => {
    const result = solveNQueens(8);
    expect(result.length).toBe(92);
  });

  test('n = 9 should return 352 solutions', () => {
    const result = solveNQueens(9);
    expect(result.length).toBe(352);
  });
});
