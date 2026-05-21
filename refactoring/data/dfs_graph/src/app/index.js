class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(v1, v2) {
    this.adjacencyList[v1].push(v2);
    this.adjacencyList[v2].push(v1);
  }

  dfsRecursive(start) {
    const result = [];
    const visited = {};
    const adjacencyList = this.adjacencyList;

    function dfs(vertex) {
      if (!vertex || !adjacencyList[vertex]) return null;
      visited[vertex] = true;
      result.push(vertex);

      adjacencyList[vertex].forEach((neighbor) => {
        if (!visited[neighbor]) {
          dfs(neighbor);
        }
      });
    }

    dfs(start);
    return result;
  }

  dfsIterative(start) {
    if (!this.adjacencyList[start]) return [];

    const stack = [start];
    const result = [];
    const visited = {};
    let currentVertex;

    visited[start] = true;

    while (stack.length) {
      currentVertex = stack.pop();
      result.push(currentVertex);

      this.adjacencyList[currentVertex].forEach((neighbor) => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      });
    }

    return result;
  }

  hasPath(start, end) {
    if (!this.adjacencyList[start] || !this.adjacencyList[end]) {
      return false;
    }

    const visited = {};
    const stack = [start];

    while (stack.length > 0) {
      const vertex = stack.pop();

      if (vertex === end) {
        return true;
      }

      if (!visited[vertex]) {
        visited[vertex] = true;

        for (const neighbor of this.adjacencyList[vertex]) {
          if (!visited[neighbor]) {
            stack.push(neighbor);
          }
        }
      }
    }

    return false;
  }
}

export default Graph;
