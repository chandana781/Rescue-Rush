/**
 * Pathfinding.js
 * Implements 5 graph search algorithms 100% from scratch for warehouse grid navigation:
 * 1. BFS (Breadth-First Search) - Unweighted Queue (FIFO)
 * 2. DFS (Depth-First Search) - Unweighted Stack (LIFO)
 * 3. UCS (Uniform Cost Search / Dijkstra) - Priority Queue on g(n)
 * 4. GBFS (Greedy Best-First Search) - Priority Queue on h(n)
 * 5. A* Search - Priority Queue on f(n) = g(n) + h(n)
 */

export const ALGORITHMS = {
  BFS: 'BFS (Breadth-First Search)',
  DFS: 'DFS (Depth-First Search)',
  UCS: 'UCS (Uniform Cost / Dijkstra)',
  GBFS: 'Greedy Best-First Search',
  ASTAR: 'A* Search'
};

export const ALGORITHM_INFO = {
  [ALGORITHMS.BFS]: {
    name: 'Breadth-First Search (BFS)',
    short: 'BFS',
    formula: 'Unweighted FIFO Queue',
    description: 'Explores nodes level by level in all directions. Guarantees the shortest path in terms of steps, but ignores terrain movement costs.',
    guaranteesOptimal: 'Shortest Steps Only (Unweighted)'
  },
  [ALGORITHMS.DFS]: {
    name: 'Depth-First Search (DFS)',
    short: 'DFS',
    formula: 'Unweighted LIFO Stack',
    description: 'Explores as far as possible along each branch before backtracking. Does NOT guarantee shortest path and can take erratic long routes.',
    guaranteesOptimal: 'No'
  },
  [ALGORITHMS.UCS]: {
    name: 'Uniform Cost Search (UCS / Dijkstra)',
    short: 'UCS',
    formula: 'Priority Queue on g(n)',
    description: 'Expands the node with the lowest cumulative path cost g(n). Guarantees the lowest-cost path on weighted grids with hazards.',
    guaranteesOptimal: 'Yes (Lowest Cost)'
  },
  [ALGORITHMS.GBFS]: {
    name: 'Greedy Best-First Search (GBFS)',
    short: 'GBFS',
    formula: 'Priority Queue on h(n)',
    description: 'Expands the node closest to the goal using heuristic h(n) (Manhattan distance). Very fast, but can be tricked by obstacles into non-optimal paths.',
    guaranteesOptimal: 'No (Heuristic Only)'
  },
  [ALGORITHMS.ASTAR]: {
    name: 'A* Search',
    short: 'A*',
    formula: 'f(n) = g(n) + h(n)',
    description: 'Combines actual path cost g(n) with estimated distance to goal h(n). Guarantees optimal path while minimizing expanded nodes.',
    guaranteesOptimal: 'Yes (Optimal & Efficient)'
  }
};

// Priority Queue implementation from scratch
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift()?.element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  size() {
    return this.elements.length;
  }
}

// Manhattan distance heuristic
function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Reconstruct path from parent pointer map
function reconstructPath(cameFrom, current) {
  const path = [current];
  let currKey = `${current.row},${current.col}`;
  while (cameFrom.has(currKey)) {
    const parent = cameFrom.get(currKey);
    path.unshift(parent);
    currKey = `${parent.row},${parent.col}`;
  }
  return path;
}

export class Pathfinder {
  static solve(grid, start, goal, algorithmName = ALGORITHMS.ASTAR, options = {}) {
    const startTime = performance.now();

    if (!grid.isWalkable(start.row, start.col) || !grid.isWalkable(goal.row, goal.col)) {
      return {
        path: [],
        explored: [],
        frontier: [],
        cost: Infinity,
        nodesExpanded: 0,
        executionTime: 0,
        found: false,
        algorithm: algorithmName,
        steps: []
      };
    }

    switch (algorithmName) {
      case ALGORITHMS.BFS:
        return this.bfs(grid, start, goal, startTime, options);
      case ALGORITHMS.DFS:
        return this.dfs(grid, start, goal, startTime, options);
      case ALGORITHMS.UCS:
        return this.ucs(grid, start, goal, startTime, options);
      case ALGORITHMS.GBFS:
        return this.gbfs(grid, start, goal, startTime, options);
      case ALGORITHMS.ASTAR:
      default:
        return this.astar(grid, start, goal, startTime, options);
    }
  }

  // --- 1. BFS ---
  static bfs(grid, start, goal, startTime, options) {
    const queue = [start];
    const visited = new Set([`${start.row},${start.col}`]);
    const cameFrom = new Map();
    const explored = [];
    const steps = [];

    while (queue.length > 0) {
      const current = queue.shift();
      explored.push(current);

      if (options.recordSteps) {
        steps.push({
          current,
          explored: [...explored],
          frontier: queue.map(c => ({ row: c.row, col: c.col }))
        });
      }

      if (current.row === goal.row && current.col === goal.col) {
        const path = reconstructPath(cameFrom, current);
        const cost = this.calculatePathCost(grid, path);
        const executionTime = performance.now() - startTime;
        return {
          path,
          explored,
          frontier: queue,
          cost,
          nodesExpanded: explored.length,
          executionTime,
          found: true,
          algorithm: ALGORITHMS.BFS,
          steps
        };
      }

      const neighbors = grid.getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(key)) {
          visited.add(key);
          cameFrom.set(key, current);
          queue.push(neighbor);
        }
      }
    }

    return {
      path: [],
      explored,
      frontier: [],
      cost: Infinity,
      nodesExpanded: explored.length,
      executionTime: performance.now() - startTime,
      found: false,
      algorithm: ALGORITHMS.BFS,
      steps
    };
  }

  // --- 2. DFS ---
  static dfs(grid, start, goal, startTime, options) {
    const stack = [start];
    const visited = new Set([`${start.row},${start.col}`]);
    const cameFrom = new Map();
    const explored = [];
    const steps = [];

    while (stack.length > 0) {
      const current = stack.pop();
      explored.push(current);

      if (options.recordSteps) {
        steps.push({
          current,
          explored: [...explored],
          frontier: stack.map(c => ({ row: c.row, col: c.col }))
        });
      }

      if (current.row === goal.row && current.col === goal.col) {
        const path = reconstructPath(cameFrom, current);
        const cost = this.calculatePathCost(grid, path);
        const executionTime = performance.now() - startTime;
        return {
          path,
          explored,
          frontier: stack,
          cost,
          nodesExpanded: explored.length,
          executionTime,
          found: true,
          algorithm: ALGORITHMS.DFS,
          steps
        };
      }

      const neighbors = grid.getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(key)) {
          visited.add(key);
          cameFrom.set(key, current);
          stack.push(neighbor);
        }
      }
    }

    return {
      path: [],
      explored,
      frontier: [],
      cost: Infinity,
      nodesExpanded: explored.length,
      executionTime: performance.now() - startTime,
      found: false,
      algorithm: ALGORITHMS.DFS,
      steps
    };
  }

  // --- 3. UCS (Uniform Cost Search) ---
  static ucs(grid, start, goal, startTime, options) {
    const pq = new PriorityQueue();
    pq.enqueue(start, 0);

    const gScore = new Map();
    gScore.set(`${start.row},${start.col}`, 0);

    const cameFrom = new Map();
    const explored = [];
    const visited = new Set();
    const steps = [];

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      const currKey = `${current.row},${current.col}`;

      if (visited.has(currKey)) continue;
      visited.add(currKey);
      explored.push(current);

      if (options.recordSteps) {
        steps.push({
          current,
          explored: [...explored],
          frontier: pq.elements.map(e => e.element)
        });
      }

      if (current.row === goal.row && current.col === goal.col) {
        const path = reconstructPath(cameFrom, current);
        const cost = gScore.get(currKey);
        const executionTime = performance.now() - startTime;
        return {
          path,
          explored,
          frontier: pq.elements.map(e => e.element),
          cost,
          nodesExpanded: explored.length,
          executionTime,
          found: true,
          algorithm: ALGORITHMS.UCS,
          steps
        };
      }

      const neighbors = grid.getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        const stepCost = grid.getCost(neighbor.row, neighbor.col);
        const tentativeG = gScore.get(currKey) + stepCost;

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          gScore.set(neighborKey, tentativeG);
          cameFrom.set(neighborKey, current);
          pq.enqueue(neighbor, tentativeG);
        }
      }
    }

    return {
      path: [],
      explored,
      frontier: [],
      cost: Infinity,
      nodesExpanded: explored.length,
      executionTime: performance.now() - startTime,
      found: false,
      algorithm: ALGORITHMS.UCS,
      steps
    };
  }

  // --- 4. GBFS (Greedy Best-First Search) ---
  static gbfs(grid, start, goal, startTime, options) {
    const pq = new PriorityQueue();
    pq.enqueue(start, heuristic(start, goal));

    const visited = new Set();
    const cameFrom = new Map();
    const explored = [];
    const steps = [];

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      const currKey = `${current.row},${current.col}`;

      if (visited.has(currKey)) continue;
      visited.add(currKey);
      explored.push(current);

      if (options.recordSteps) {
        steps.push({
          current,
          explored: [...explored],
          frontier: pq.elements.map(e => e.element)
        });
      }

      if (current.row === goal.row && current.col === goal.col) {
        const path = reconstructPath(cameFrom, current);
        const cost = this.calculatePathCost(grid, path);
        const executionTime = performance.now() - startTime;
        return {
          path,
          explored,
          frontier: pq.elements.map(e => e.element),
          cost,
          nodesExpanded: explored.length,
          executionTime,
          found: true,
          algorithm: ALGORITHMS.GBFS,
          steps
        };
      }

      const neighbors = grid.getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          const h = heuristic(neighbor, goal);
          pq.enqueue(neighbor, h);
        }
      }
    }

    return {
      path: [],
      explored,
      frontier: [],
      cost: Infinity,
      nodesExpanded: explored.length,
      executionTime: performance.now() - startTime,
      found: false,
      algorithm: ALGORITHMS.GBFS,
      steps
    };
  }

  // --- 5. A* Search ---
  static astar(grid, start, goal, startTime, options) {
    const pq = new PriorityQueue();
    pq.enqueue(start, heuristic(start, goal));

    const gScore = new Map();
    gScore.set(`${start.row},${start.col}`, 0);

    const fScore = new Map();
    fScore.set(`${start.row},${start.col}`, heuristic(start, goal));

    const cameFrom = new Map();
    const explored = [];
    const visited = new Set();
    const steps = [];

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      const currKey = `${current.row},${current.col}`;

      if (visited.has(currKey)) continue;
      visited.add(currKey);
      explored.push(current);

      if (options.recordSteps) {
        steps.push({
          current,
          explored: [...explored],
          frontier: pq.elements.map(e => e.element)
        });
      }

      if (current.row === goal.row && current.col === goal.col) {
        const path = reconstructPath(cameFrom, current);
        const cost = gScore.get(currKey);
        const executionTime = performance.now() - startTime;
        return {
          path,
          explored,
          frontier: pq.elements.map(e => e.element),
          cost,
          nodesExpanded: explored.length,
          executionTime,
          found: true,
          algorithm: ALGORITHMS.ASTAR,
          steps
        };
      }

      const neighbors = grid.getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        const stepCost = grid.getCost(neighbor.row, neighbor.col);
        const tentativeG = gScore.get(currKey) + stepCost;

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          gScore.set(neighborKey, tentativeG);
          const f = tentativeG + heuristic(neighbor, goal);
          fScore.set(neighborKey, f);
          cameFrom.set(neighborKey, current);
          pq.enqueue(neighbor, f);
        }
      }
    }

    return {
      path: [],
      explored,
      frontier: [],
      cost: Infinity,
      nodesExpanded: explored.length,
      executionTime: performance.now() - startTime,
      found: false,
      algorithm: ALGORITHMS.ASTAR,
      steps
    };
  }

  // Calculate actual total cost of a path
  static calculatePathCost(grid, path) {
    if (!path || path.length <= 1) return 0;
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      cost += grid.getCost(path[i].row, path[i].col);
    }
    return cost;
  }

  // Run all 5 algorithms on the current grid to generate live educational metrics comparison!
  static compareAll(grid, start, goal) {
    const results = {};
    for (const [key, name] of Object.entries(ALGORITHMS)) {
      results[key] = this.solve(grid, start, goal, name);
    }
    return results;
  }
}
