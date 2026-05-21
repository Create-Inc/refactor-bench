import { describe, test, expect, beforeEach } from 'vitest';
import Graph from './app/index.js';

describe('DFS Graph Traversal', () => {
  let graph;

  beforeEach(() => {
    graph = new Graph();
  });

  test('empty graph should return empty result', () => {
    expect(graph.dfsRecursive('A')).toEqual([]);
    expect(graph.dfsIterative('A')).toEqual([]);
  });

  test('single vertex graph', () => {
    graph.addVertex('A');
    expect(graph.dfsRecursive('A')).toEqual(['A']);
    expect(graph.dfsIterative('A')).toEqual(['A']);
  });

  test('linear graph traversal', () => {
    // A - B - C - D
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addVertex('D');
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'D');

    const recursiveResult = graph.dfsRecursive('A');
    const iterativeResult = graph.dfsIterative('A');

    expect(recursiveResult).toContain('A');
    expect(recursiveResult).toContain('B');
    expect(recursiveResult).toContain('C');
    expect(recursiveResult).toContain('D');
    expect(recursiveResult.length).toBe(4);

    expect(iterativeResult).toContain('A');
    expect(iterativeResult).toContain('B');
    expect(iterativeResult).toContain('C');
    expect(iterativeResult).toContain('D');
    expect(iterativeResult.length).toBe(4);
  });

  test('complex graph traversal', () => {
    //     A
    //    / \
    //   B   C
    //   |   |\
    //   D   E F
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addVertex('D');
    graph.addVertex('E');
    graph.addVertex('F');

    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    graph.addEdge('C', 'E');
    graph.addEdge('C', 'F');

    const result = graph.dfsRecursive('A');
    expect(result).toContain('A');
    expect(result.length).toBe(6);
    expect(result[0]).toBe('A'); // Should start with A
  });

  test('hasPath should detect connected vertices', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addVertex('D');

    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');

    expect(graph.hasPath('A', 'C')).toBe(true);
    expect(graph.hasPath('A', 'D')).toBe(false);
    expect(graph.hasPath('C', 'A')).toBe(true);
  });

  test('hasPath in disconnected graph', () => {
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addVertex('D');

    graph.addEdge('A', 'B');
    graph.addEdge('C', 'D');

    expect(graph.hasPath('A', 'B')).toBe(true);
    expect(graph.hasPath('C', 'D')).toBe(true);
    expect(graph.hasPath('A', 'C')).toBe(false);
    expect(graph.hasPath('B', 'D')).toBe(false);
  });
});
