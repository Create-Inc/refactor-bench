import { describe, test, expect } from 'vitest';
import { WeightedGraph, PriorityQueue } from './app/index.js';

describe('Dijkstra Shortest Path', () => {
  describe('PriorityQueue', () => {
    test('should enqueue and dequeue in priority order', () => {
      const pq = new PriorityQueue();
      pq.enqueue('A', 3);
      pq.enqueue('B', 1);
      pq.enqueue('C', 2);

      expect(pq.dequeue().val).toBe('B');
      expect(pq.dequeue().val).toBe('C');
      expect(pq.dequeue().val).toBe('A');
    });

    test('should handle empty queue', () => {
      const pq = new PriorityQueue();
      expect(pq.isEmpty()).toBe(true);
      expect(pq.dequeue()).toBeUndefined();
    });
  });

  describe('WeightedGraph', () => {
    let graph;

    beforeEach(() => {
      graph = new WeightedGraph();
    });

    test('should add vertices and edges', () => {
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B', 5);

      expect(graph.adjacencyList['A']).toEqual([{ node: 'B', weight: 5 }]);
      expect(graph.adjacencyList['B']).toEqual([{ node: 'A', weight: 5 }]);
    });

    test('should find shortest path in simple graph', () => {
      // A --5-- B --2-- C
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B', 5);
      graph.addEdge('B', 'C', 2);

      const result = graph.shortestPath('A', 'C');
      expect(result.path).toEqual(['A', 'B', 'C']);
      expect(result.distance).toBe(7);
    });

    test('should find shortest path with multiple routes', () => {
      //     B
      //   /2 \3
      //  A    D
      //   \6 /1
      //     C
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addVertex('D');

      graph.addEdge('A', 'B', 2);
      graph.addEdge('A', 'C', 6);
      graph.addEdge('B', 'D', 3);
      graph.addEdge('C', 'D', 1);

      const result = graph.shortestPath('A', 'D');
      expect(result.path).toEqual(['A', 'B', 'D']);
      expect(result.distance).toBe(5);
    });

    test('should handle complex graph', () => {
      //     4     2
      //  A --- B --- C
      //  |     |     |
      //  |2    |1    |3
      //  |     |     |
      //  D --- E --- F
      //     3     1
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addVertex('D');
      graph.addVertex('E');
      graph.addVertex('F');

      graph.addEdge('A', 'B', 4);
      graph.addEdge('A', 'D', 2);
      graph.addEdge('B', 'C', 2);
      graph.addEdge('B', 'E', 1);
      graph.addEdge('C', 'F', 3);
      graph.addEdge('D', 'E', 3);
      graph.addEdge('E', 'F', 1);

      const result = graph.shortestPath('A', 'F');
      expect(result.distance).toBe(6);
      // Path should be A -> D -> E -> F or A -> B -> E -> F
      expect(result.path.length).toBe(4);
      expect(result.path[0]).toBe('A');
      expect(result.path[3]).toBe('F');
    });

    test('should return infinite distance for unreachable nodes', () => {
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B', 1);
      // C is not connected

      const result = graph.shortestPath('A', 'C');
      expect(result.distance).toBe(Infinity);
    });

    test('should handle single vertex', () => {
      graph.addVertex('A');
      const result = graph.shortestPath('A', 'A');
      expect(result.path).toEqual(['A']);
      expect(result.distance).toBe(0);
    });

    test('getAllShortestPaths should return distances to all vertices', () => {
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B', 4);
      graph.addEdge('B', 'C', 2);
      graph.addEdge('A', 'C', 10);

      const result = graph.getAllShortestPaths('A');
      expect(result.distances['A']).toBe(0);
      expect(result.distances['B']).toBe(4);
      expect(result.distances['C']).toBe(6); // A -> B -> C is shorter than A -> C
    });
  });
});
