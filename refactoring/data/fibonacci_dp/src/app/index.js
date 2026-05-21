// Naive recursive approach (exponential time complexity)
function fibonacciRecursive(n) {
  if (n <= 1) return n;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// Memoized recursive approach (top-down dynamic programming)
function fibonacciMemoized(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;

  memo[n] = fibonacciMemoized(n - 1, memo) + fibonacciMemoized(n - 2, memo);
  return memo[n];
}

// Iterative approach with tabulation (bottom-up dynamic programming)
function fibonacciTabulated(n) {
  if (n <= 1) return n;

  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// Space-optimized iterative approach
function fibonacciOptimized(n) {
  if (n <= 1) return n;

  let prev2 = 0;
  let prev1 = 1;
  let current;

  for (let i = 2; i <= n; i++) {
    current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return current;
}

// Generate fibonacci sequence up to n terms
function fibonacciSequence(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];

  const sequence = [0, 1];

  for (let i = 2; i < n; i++) {
    sequence[i] = sequence[i - 1] + sequence[i - 2];
  }

  return sequence;
}

// Matrix exponentiation approach (logarithmic time complexity)
function fibonacciMatrix(n) {
  if (n <= 1) return n;

  function matrixMultiply(a, b) {
    return [
      [
        a[0][0] * b[0][0] + a[0][1] * b[1][0],
        a[0][0] * b[0][1] + a[0][1] * b[1][1],
      ],
      [
        a[1][0] * b[0][0] + a[1][1] * b[1][0],
        a[1][0] * b[0][1] + a[1][1] * b[1][1],
      ],
    ];
  }

  function matrixPower(matrix, power) {
    if (power === 1) return matrix;
    if (power % 2 === 0) {
      const half = matrixPower(matrix, power / 2);
      return matrixMultiply(half, half);
    } else {
      return matrixMultiply(matrix, matrixPower(matrix, power - 1));
    }
  }

  const baseMatrix = [
    [1, 1],
    [1, 0],
  ];
  const resultMatrix = matrixPower(baseMatrix, n);
  return resultMatrix[0][1];
}

// Check if a number is a fibonacci number
function isFibonacci(num) {
  if (num < 0) return false;

  let a = 0,
    b = 1;

  if (num === a || num === b) return true;

  let c = a + b;
  while (c <= num) {
    if (c === num) return true;
    a = b;
    b = c;
    c = a + b;
  }

  return false;
}

export {
  fibonacciRecursive,
  fibonacciMemoized,
  fibonacciTabulated,
  fibonacciOptimized,
  fibonacciSequence,
  fibonacciMatrix,
  isFibonacci,
};
