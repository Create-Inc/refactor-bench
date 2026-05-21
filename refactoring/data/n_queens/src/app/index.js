function solveNQueens(n) {
  const results = [];
  const board = Array(n)
    .fill()
    .map(() => Array(n).fill('.'));

  function isSafe(row, col) {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }

    // Check upper-left diagonal
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }

    // Check upper-right diagonal
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }

    return true;
  }

  function backtrack(row) {
    if (row === n) {
      // Found a valid solution
      const copy = board.map((r) => r.join(''));
      results.push(copy);
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.'; // backtrack
      }
    }
  }

  backtrack(0);
  return results;
}

export default solveNQueens;
