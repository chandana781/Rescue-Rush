/**
 * Grid.js
 * Represents the 2D grid overlay for the 3D warehouse environment.
 * Handles cell types, terrain movement costs, bounds checking, and neighbor generation.
 */

export const CELL_TYPES = {
  EMPTY: 0,
  OBSTACLE: 1, // Storage shelf, rack, pillar
  HAZARD_OIL: 2, // Oil spill (Cost = 3)
  HAZARD_ELEC: 3, // Electrical hazard (Cost = 4, battery damage)
  CHARGING_STATION: 4, // Recharges battery (Cost = 1)
  PACKAGE: 5, // Package pickup point
  WORKER: 6, // Stranded worker rescue point
  DELIVERY_ZONE: 7, // Package drop zone
  RESCUE_ZONE: 8, // Worker rescue safe zone
  DYNAMIC_OBSTACLE: 9 // Moving forklift or fallen box
};

export const CELL_COSTS = {
  [CELL_TYPES.EMPTY]: 1,
  [CELL_TYPES.OBSTACLE]: Infinity,
  [CELL_TYPES.HAZARD_OIL]: 3,
  [CELL_TYPES.HAZARD_ELEC]: 4,
  [CELL_TYPES.CHARGING_STATION]: 1,
  [CELL_TYPES.PACKAGE]: 1,
  [CELL_TYPES.WORKER]: 1,
  [CELL_TYPES.DELIVERY_ZONE]: 1,
  [CELL_TYPES.RESCUE_ZONE]: 1,
  [CELL_TYPES.DYNAMIC_OBSTACLE]: Infinity
};

export class WarehouseGrid {
  constructor(cols = 20, rows = 20, cellSize = 2.0) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    // Origin centered in 3D world: (0,0) cell corresponds to (-width/2, -height/2)
    this.width = cols * cellSize;
    this.height = rows * cellSize;

    // 2D Array [row][col]
    this.cells = Array.from({ length: rows }, () => new Array(cols).fill(CELL_TYPES.EMPTY));
    this.customCosts = Array.from({ length: rows }, () => new Array(cols).fill(null));
    this.dynamicObstacles = new Set(); // Stores "r,c" strings for active dynamic blockages
  }

  reset() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c] = CELL_TYPES.EMPTY;
        this.customCosts[r][c] = null;
      }
    }
    this.dynamicObstacles.clear();
  }

  setCell(row, col, type) {
    if (this.isValid(row, col)) {
      this.cells[row][col] = type;
    }
  }

  getCell(row, col) {
    if (!this.isValid(row, col)) return CELL_TYPES.OBSTACLE;
    if (this.dynamicObstacles.has(`${row},${col}`)) return CELL_TYPES.DYNAMIC_OBSTACLE;
    return this.cells[row][col];
  }

  setDynamicObstacle(row, col, active) {
    if (!this.isValid(row, col)) return;
    const key = `${row},${col}`;
    if (active) {
      this.dynamicObstacles.add(key);
    } else {
      this.dynamicObstacles.delete(key);
    }
  }

  isValid(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  isWalkable(row, col) {
    if (!this.isValid(row, col)) return false;
    const type = this.getCell(row, col);
    return type !== CELL_TYPES.OBSTACLE && type !== CELL_TYPES.DYNAMIC_OBSTACLE;
  }

  getCost(row, col) {
    if (!this.isValid(row, col)) return Infinity;
    if (this.customCosts[row][col] !== null) return this.customCosts[row][col];
    const type = this.getCell(row, col);
    return CELL_COSTS[type] !== undefined ? CELL_COSTS[type] : 1;
  }

  // Converts grid cell (row, col) to 3D world position (X, Z)
  gridToWorld(row, col) {
    const x = (col + 0.5) * this.cellSize - this.width / 2;
    const z = (row + 0.5) * this.cellSize - this.height / 2;
    return { x, z };
  }

  // Converts 3D world position (X, Z) to grid cell (row, col)
  worldToGrid(x, z) {
    const col = Math.floor((x + this.width / 2) / this.cellSize);
    const row = Math.floor((z + this.height / 2) / this.cellSize);
    return {
      row: Math.max(0, Math.min(this.rows - 1, row)),
      col: Math.max(0, Math.min(this.cols - 1, col))
    };
  }

  // Get 4-directional cardinal neighbors
  getNeighbors(row, col, allowDiagonal = false) {
    const neighbors = [];
    const dirs = [
      { r: -1, c: 0 }, // Up
      { r: 1, c: 0 },  // Down
      { r: 0, c: -1 }, // Left
      { r: 0, c: 1 }   // Right
    ];

    if (allowDiagonal) {
      dirs.push(
        { r: -1, c: -1 }, { r: -1, c: 1 },
        { r: 1, c: -1 },  { r: 1, c: 1 }
      );
    }

    for (const d of dirs) {
      const nr = row + d.r;
      const nc = col + d.c;
      if (this.isWalkable(nr, nc)) {
        neighbors.push({ row: nr, col: nc });
      }
    }
    return neighbors;
  }
}
