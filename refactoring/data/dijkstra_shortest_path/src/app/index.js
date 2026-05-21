class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

class WeightedGraph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(vertex1, vertex2, weight) {
    this.adjacencyList[vertex1].push({ node: vertex2, weight });
    this.adjacencyList[vertex2].push({ node: vertex1, weight });
  }

  dijkstra(start, finish) {
    const nodes = new PriorityQueue();
    const distances = {};
    const previous = {};
    const path = [];
    let smallest;

    // Build up initial state
    for (const vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        nodes.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }

    // As long as there is something to visit
    while (!nodes.isEmpty()) {
      smallest = nodes.dequeue().val;

      if (smallest === finish) {
        // We are done, build up path to return
        while (previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }
        break;
      }

      if (smallest || distances[smallest] !== Infinity) {
        for (const neighbor in this.adjacencyList[smallest]) {
          // Find neighboring node
          const nextNode = this.adjacencyList[smallest][neighbor];
          // Calculate new distance to neighboring node
          const candidate = distances[smallest] + nextNode.weight;
          const nextNeighbor = nextNode.node;

          if (candidate < distances[nextNeighbor]) {
            // Updating new smallest distance to neighbor
            distances[nextNeighbor] = candidate;
            // Updating previous - How we got to neighbor
            previous[nextNeighbor] = smallest;
            // Enqueue in priority queue with new priority
            nodes.enqueue(nextNeighbor, candidate);
          }
        }
      }
    }

    return {
      path: path.concat(smallest).reverse(),
      distance: distances[finish],
    };
  }

  shortestPath(start, finish) {
    return this.dijkstra(start, finish);
  }

  getAllShortestPaths(start) {
    const nodes = new PriorityQueue();
    const distances = {};
    const previous = {};

    // Initialize distances and previous
    for (const vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        nodes.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }

    while (!nodes.isEmpty()) {
      const smallest = nodes.dequeue().val;

      if (distances[smallest] !== Infinity) {
        for (const neighbor of this.adjacencyList[smallest]) {
          const candidate = distances[smallest] + neighbor.weight;

          if (candidate < distances[neighbor.node]) {
            distances[neighbor.node] = candidate;
            previous[neighbor.node] = smallest;
            nodes.enqueue(neighbor.node, candidate);
          }
        }
      }
    }

    return { distances, previous };
  }
}

export { WeightedGraph, PriorityQueue };
