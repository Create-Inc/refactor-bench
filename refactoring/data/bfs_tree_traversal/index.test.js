import { describe, test, expect } from 'vitest';
import { TreeNode, bfsTraversal, bfsLevelOrder } from './app/index.js';

describe('BFS Tree Traversal', () => {
  test('empty tree should return empty array', () => {
    expect(bfsTraversal(null)).toEqual([]);
    expect(bfsLevelOrder(null)).toEqual([]);
  });

  test('single node tree', () => {
    const root = new TreeNode(1);
    expect(bfsTraversal(root)).toEqual([1]);
    expect(bfsLevelOrder(root)).toEqual([[1]]);
  });

  test('complete binary tree', () => {
    //       3
    //      / \
    //     9   20
    //        /  \
    //       15   7
    const root = new TreeNode(3);
    root.left = new TreeNode(9);
    root.right = new TreeNode(20);
    root.right.left = new TreeNode(15);
    root.right.right = new TreeNode(7);

    expect(bfsTraversal(root)).toEqual([3, 9, 20, 15, 7]);
    expect(bfsLevelOrder(root)).toEqual([[3], [9, 20], [15, 7]]);
  });

  test('unbalanced tree', () => {
    //     1
    //    /
    //   2
    //  /
    // 3
    const root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.left.left = new TreeNode(3);

    expect(bfsTraversal(root)).toEqual([1, 2, 3]);
    expect(bfsLevelOrder(root)).toEqual([[1], [2], [3]]);
  });

  test('larger tree', () => {
    //       1
    //      / \
    //     2   3
    //    / \   \
    //   4   5   6
    //  /
    // 7
    const root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.left.left = new TreeNode(4);
    root.left.right = new TreeNode(5);
    root.right.right = new TreeNode(6);
    root.left.left.left = new TreeNode(7);

    expect(bfsTraversal(root)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(bfsLevelOrder(root)).toEqual([[1], [2, 3], [4, 5, 6], [7]]);
  });
});
