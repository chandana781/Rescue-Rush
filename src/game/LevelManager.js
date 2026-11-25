/**
 * LevelManager.js
 * Defines 8 progressive levels with layouts, objectives, hazards, forklifts,
 * charging stations, package pickups, worker rescue points, and recommended algorithms.
 */

import { CELL_TYPES } from '../ai/Grid.js';
import { ALGORITHMS } from '../ai/Pathfinding.js';

export const LEVELS = [
  // --- Level 1 ---
  {
    id: 1,
    title: 'Robot Academy',
    subtitle: 'Basic Manual & Hover Controls',
    story: 'Welcome to the CyberWarehouse Academy! Practice operating the RoboHover X-1. Master WASD driving, pick up the cargo crate, deliver it to the loading bay, and recharge your anti-gravity core.',
    recommendedAlgorithm: ALGORITHMS.BFS,
    gridCols: 14,
    gridRows: 14,
    timeLimit: 120,
    initialBattery: 100,
    batteryDrainRate: 0.8,
    startPos: { row: 12, col: 1 },
    chargingStations: [{ row: 12, col: 12 }],
    packages: [{ id: 'p1', row: 2, col: 2, label: 'Crate A', type: 'standard' }],
    workers: [],
    deliveryZones: [{ id: 'd1', row: 2, col: 11, label: 'Bay 1' }],
    rescueZones: [],
    hazards: [],
    forklifts: [],
    dynamicEvents: false,
    obstacles: [
      { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 },
      { row: 6, col: 7 }, { row: 6, col: 8 }, { row: 6, col: 9 }, { row: 6, col: 10 }
    ],
    hints: ['Use WASD or Arrow Keys to drive', 'Drive onto glowing items to pick them up', 'Drive to yellow station to charge battery']
  },

  // --- Level 2 ---
  {
    id: 2,
    title: 'Maze Runner',
    subtitle: 'BFS vs DFS Maze Exploration',
    story: 'High-density shelving has turned Section 4 into a labyrinth! Use autonomous pathfinding (BFS or DFS) to navigate through the tall storage racks to retrieve trapped medical supplies.',
    recommendedAlgorithm: ALGORITHMS.BFS,
    gridCols: 16,
    gridRows: 16,
    timeLimit: 150,
    initialBattery: 100,
    batteryDrainRate: 1.0,
    startPos: { row: 14, col: 1 },
    chargingStations: [{ row: 1, col: 1 }],
    packages: [
      { id: 'p1', row: 1, col: 14, label: 'Meds', type: 'medical' },
      { id: 'p2', row: 8, col: 8, label: 'Crate B', type: 'standard' }
    ],
    workers: [],
    deliveryZones: [{ id: 'd1', row: 14, col: 14, label: 'Main Dock' }],
    rescueZones: [],
    hazards: [],
    forklifts: [],
    dynamicEvents: false,
    obstacles: [
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 }, { row: 3, col: 8 }, { row: 3, col: 9 }, { row: 3, col: 10 }, { row: 3, col: 11 }, { row: 3, col: 12 },
      { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 },
      { row: 9, col: 1 }, { row: 9, col: 2 }, { row: 9, col: 3 }, { row: 9, col: 4 }, { row: 9, col: 5 }, { row: 9, col: 6 }, { row: 9, col: 7 }, { row: 9, col: 9 }, { row: 9, col: 10 }, { row: 9, col: 11 },
      { row: 12, col: 4 }, { row: 12, col: 5 }, { row: 12, col: 6 }, { row: 12, col: 7 }, { row: 12, col: 8 }, { row: 12, col: 9 }, { row: 12, col: 10 }, { row: 12, col: 11 }, { row: 12, col: 12 }, { row: 12, col: 13 }
    ],
    hints: ['Compare BFS vs DFS in the Educational Overlay', 'BFS finds the shortest step count; DFS can loop deep!']
  },

  // --- Level 3 ---
  {
    id: 3,
    title: 'Last-Mile Rush',
    subtitle: 'Uniform Cost Search & Terrain Hazards',
    story: 'An oil line burst in Bay 7! Slick oil spills make direct routes slow and risky. Run Uniform Cost Search (UCS / Dijkstra) to find the cheapest path around high-cost oil hazards.',
    recommendedAlgorithm: ALGORITHMS.UCS,
    gridCols: 18,
    gridRows: 18,
    timeLimit: 140,
    initialBattery: 100,
    batteryDrainRate: 1.2,
    startPos: { row: 16, col: 2 },
    chargingStations: [{ row: 16, col: 15 }],
    packages: [
      { id: 'p1', row: 2, col: 2, label: 'Bio Crate', type: 'biohazard' },
      { id: 'p2', row: 2, col: 15, label: 'Heavy Engine', type: 'heavy' }
    ],
    workers: [],
    deliveryZones: [{ id: 'd1', row: 9, col: 9, label: 'Express Hub' }],
    rescueZones: [],
    hazards: [
      { row: 5, col: 4, type: CELL_TYPES.HAZARD_OIL }, { row: 5, col: 5, type: CELL_TYPES.HAZARD_OIL }, { row: 5, col: 6, type: CELL_TYPES.HAZARD_OIL },
      { row: 6, col: 4, type: CELL_TYPES.HAZARD_OIL }, { row: 6, col: 5, type: CELL_TYPES.HAZARD_OIL }, { row: 6, col: 6, type: CELL_TYPES.HAZARD_OIL },
      { row: 7, col: 4, type: CELL_TYPES.HAZARD_OIL }, { row: 7, col: 5, type: CELL_TYPES.HAZARD_OIL }, { row: 7, col: 6, type: CELL_TYPES.HAZARD_OIL },
      { row: 12, col: 10, type: CELL_TYPES.HAZARD_ELEC }, { row: 12, col: 11, type: CELL_TYPES.HAZARD_ELEC }, { row: 12, col: 12, type: CELL_TYPES.HAZARD_ELEC }
    ],
    forklifts: [],
    dynamicEvents: false,
    obstacles: [
      { row: 4, col: 8 }, { row: 4, col: 9 }, { row: 4, col: 10 },
      { row: 13, col: 2 }, { row: 13, col: 3 }, { row: 13, col: 4 }, { row: 13, col: 5 },
      { row: 10, col: 14 }, { row: 11, col: 14 }, { row: 12, col: 14 }
    ],
    hints: ['Oil spills increase movement cost (3x)', 'UCS calculates actual path cost g(n) to find the cheapest route']
  },

  // --- Level 4 ---
  {
    id: 4,
    title: 'A* Intelligence Lab',
    subtitle: 'Greedy Best-First vs A* Search',
    story: 'Welcome to the AI Testing Grounds. Compare how Greedy Best-First Search rushes directly toward the goal vs how A* Search balances heuristic distance h(n) with path cost g(n).',
    recommendedAlgorithm: ALGORITHMS.ASTAR,
    gridCols: 18,
    gridRows: 18,
    timeLimit: 160,
    initialBattery: 100,
    batteryDrainRate: 1.0,
    startPos: { row: 16, col: 1 },
    chargingStations: [{ row: 1, col: 1 }],
    packages: [
      { id: 'p1', row: 1, col: 16, label: 'Core Alpha', type: 'biohazard' },
      { id: 'p2', row: 9, col: 16, label: 'Core Beta', type: 'standard' },
      { id: 'p3', row: 9, col: 1, label: 'Core Gamma', type: 'heavy' }
    ],
    workers: [],
    deliveryZones: [{ id: 'd1', row: 16, col: 16, label: 'Lab Vault' }],
    rescueZones: [],
    hazards: [
      { row: 5, col: 9, type: CELL_TYPES.HAZARD_OIL }, { row: 6, col: 9, type: CELL_TYPES.HAZARD_OIL }, { row: 7, col: 9, type: CELL_TYPES.HAZARD_OIL }
    ],
    forklifts: [],
    dynamicEvents: false,
    obstacles: [
      { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 12 },
      { row: 8, col: 13 }, { row: 8, col: 14 }, { row: 8, col: 15 },
      { row: 12, col: 6 }, { row: 13, col: 6 }, { row: 14, col: 6 }, { row: 15, col: 6 }
    ],
    hints: ['Greedy Search uses only h(n) and can get stuck in U-traps', 'A* uses f(n) = g(n) + h(n) for optimal navigation']
  },

  // --- Level 5 ---
  {
    id: 5,
    title: 'Rescue Mission',
    subtitle: 'Worker Rescue & Moving Forklifts',
    story: 'EMERGENCY! Two warehouse technicians are stranded in Section 9 due to automated forklift malfunctions. Dodge the moving forklifts, pick up both workers safely, and carry them to the Emergency Rescue Zone!',
    recommendedAlgorithm: ALGORITHMS.ASTAR,
    gridCols: 20,
    gridRows: 20,
    timeLimit: 180,
    initialBattery: 100,
    batteryDrainRate: 1.2,
    startPos: { row: 18, col: 2 },
    chargingStations: [{ row: 18, col: 17 }],
    packages: [],
    workers: [
      { id: 'w1', row: 2, col: 2, name: 'Tech Alex', status: 'trapped' },
      { id: 'w2', row: 2, col: 17, name: 'Tech Sam', status: 'trapped' }
    ],
    deliveryZones: [],
    rescueZones: [{ id: 'r1', row: 18, col: 10, label: 'Safety Bay' }],
    hazards: [],
    forklifts: [
      { id: 'f1', path: [{ row: 6, col: 2 }, { row: 6, col: 17 }], speed: 1.5, axis: 'horizontal' },
      { id: 'f2', path: [{ row: 12, col: 17 }, { row: 12, col: 2 }], speed: 1.5, axis: 'horizontal' }
    ],
    dynamicEvents: false,
    obstacles: [
      { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 }, { row: 4, col: 9 }, { row: 4, col: 10 }, { row: 4, col: 11 }, { row: 4, col: 12 },
      { row: 14, col: 5 }, { row: 14, col: 6 }, { row: 14, col: 7 }, { row: 14, col: 8 }, { row: 14, col: 9 }, { row: 14, col: 10 }, { row: 14, col: 11 }, { row: 14, col: 12 }
    ],
    hints: ['Watch out for moving forklifts on patrol lanes!', 'Pick up workers by hovering over them and bring them to the Green Rescue Zone']
  },

  // --- Level 6 ---
  {
    id: 6,
    title: 'Changing Warehouse',
    subtitle: 'Dynamic Obstacle Detection & Dynamic Replanning',
    story: 'Active loading operations are underway. Storage crates occasionally fall into main aisles, blocking active paths! Observe how the RoboHover X-1 dynamically detects blockages and recalculates new A* routes on the fly.',
    recommendedAlgorithm: ALGORITHMS.ASTAR,
    gridCols: 20,
    gridRows: 20,
    timeLimit: 180,
    initialBattery: 100,
    batteryDrainRate: 1.2,
    startPos: { row: 18, col: 1 },
    chargingStations: [{ row: 1, col: 1 }],
    packages: [
      { id: 'p1', row: 1, col: 18, label: 'Priority Freight', type: 'standard' }
    ],
    workers: [
      { id: 'w1', row: 10, col: 18, name: 'Supervisor Chris', status: 'stranded' }
    ],
    deliveryZones: [{ id: 'd1', row: 18, col: 18, label: 'Dock Alpha' }],
    rescueZones: [{ id: 'r1', row: 18, col: 10, label: 'Safety Bay' }],
    hazards: [],
    forklifts: [
      { id: 'f1', path: [{ row: 10, col: 1 }, { row: 10, col: 15 }], speed: 2.0, axis: 'horizontal' }
    ],
    dynamicEvents: true,
    dynamicBlockages: [
      { triggerTimeSec: 8, row: 9, col: 9 },
      { triggerTimeSec: 16, row: 14, col: 10 }
    ],
    obstacles: [
      { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 5, col: 12 }, { row: 5, col: 13 }, { row: 5, col: 14 }, { row: 5, col: 15 },
      { row: 14, col: 4 }, { row: 14, col: 5 }, { row: 14, col: 6 }, { row: 14, col: 7 }, { row: 14, col: 8 }, { row: 14, col: 9 }, { row: 14, col: 11 }, { row: 14, col: 12 }, { row: 14, col: 13 }, { row: 14, col: 14 }, { row: 14, col: 15 }, { row: 14, col: 16 }, { row: 14, col: 17 }, { row: 14, col: 18 }
    ],
    hints: ['Dynamic obstacles block paths mid-route', 'The AI automatically triggers A* dynamic path recalculation']
  },

  // --- Level 7 ---
  {
    id: 7,
    title: 'Battery Survival',
    subtitle: 'Limited Power & Multi-Station Routing',
    story: 'Critical Power Warning! The hover thrusters are running on emergency power cells (50% max capacity). You must strategically navigate through intermediate Charging Stations to complete long-range deliveries.',
    recommendedAlgorithm: ALGORITHMS.ASTAR,
    gridCols: 22,
    gridRows: 22,
    timeLimit: 200,
    initialBattery: 50,
    batteryDrainRate: 2.2,
    startPos: { row: 20, col: 1 },
    chargingStations: [
      { row: 14, col: 7 },
      { row: 7, col: 14 }
    ],
    packages: [
      { id: 'p1', row: 1, col: 20, label: 'Reactor Core', type: 'biohazard' }
    ],
    workers: [
      { id: 'w1', row: 10, col: 1, name: 'Engineer Morgan', status: 'stranded' }
    ],
    deliveryZones: [{ id: 'd1', row: 20, col: 20, label: 'Vault 7' }],
    rescueZones: [{ id: 'r1', row: 20, col: 10, label: 'Safety Hub' }],
    hazards: [
      { row: 11, col: 10, type: CELL_TYPES.HAZARD_ELEC }, { row: 11, col: 11, type: CELL_TYPES.HAZARD_ELEC }
    ],
    forklifts: [],
    dynamicEvents: false,
    obstacles: [
      { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 5, col: 12 }, { row: 5, col: 13 }, { row: 5, col: 14 }, { row: 5, col: 15 }, { row: 5, col: 16 }, { row: 5, col: 17 }, { row: 5, col: 18 },
      { row: 16, col: 4 }, { row: 16, col: 5 }, { row: 16, col: 6 }, { row: 16, col: 7 }, { row: 16, col: 8 }, { row: 16, col: 9 }, { row: 16, col: 10 }, { row: 16, col: 11 }, { row: 16, col: 12 }, { row: 16, col: 13 }, { row: 16, col: 14 }, { row: 16, col: 15 }, { row: 16, col: 16 }, { row: 16, col: 17 }, { row: 16, col: 18 }, { row: 16, col: 19 }
    ],
    hints: ['Battery capacity is capped at 50%', 'Plan routes that visit Charging Stations before power runs out']
  },

  // --- Level 8 ---
  {
    id: 8,
    title: 'Warehouse Rescue Rush',
    subtitle: 'Final Master Challenge',
    story: 'FINAL MISSION! A seismic storm has damaged Facility Omega. 3 workers are trapped, 2 vital cargo crates must be evacuated, 3 automated forklifts are moving frantically, and oil leaks cover main thoroughfares. Select your best AI pathfinding algorithm, save the team, and complete the ultimate rescue operation!',
    recommendedAlgorithm: ALGORITHMS.ASTAR,
    gridCols: 24,
    gridRows: 24,
    timeLimit: 240,
    initialBattery: 100,
    batteryDrainRate: 1.5,
    startPos: { row: 22, col: 2 },
    chargingStations: [
      { row: 22, col: 21 },
      { row: 2, col: 2 },
      { row: 12, col: 12 }
    ],
    packages: [
      { id: 'p1', row: 2, col: 21, label: 'Evac Cargo A', type: 'biohazard' },
      { id: 'p2', row: 12, col: 2, label: 'Evac Cargo B', type: 'heavy' }
    ],
    workers: [
      { id: 'w1', row: 2, col: 10, name: 'Dr. Evelyn', status: 'trapped' },
      { id: 'w2', row: 22, col: 10, name: 'Chief Ryan', status: 'trapped' },
      { id: 'w3', row: 12, col: 21, name: 'Operator Leo', status: 'trapped' }
    ],
    deliveryZones: [{ id: 'd1', row: 22, col: 22, label: 'Evac Dock' }],
    rescueZones: [{ id: 'r1', row: 12, col: 11, label: 'Central Bunker' }],
    hazards: [
      { row: 7, col: 6, type: CELL_TYPES.HAZARD_OIL }, { row: 7, col: 7, type: CELL_TYPES.HAZARD_OIL }, { row: 7, col: 8, type: CELL_TYPES.HAZARD_OIL },
      { row: 17, col: 14, type: CELL_TYPES.HAZARD_ELEC }, { row: 17, col: 15, type: CELL_TYPES.HAZARD_ELEC }
    ],
    forklifts: [
      { id: 'f1', path: [{ row: 6, col: 2 }, { row: 6, col: 21 }], speed: 2.0, axis: 'horizontal' },
      { id: 'f2', path: [{ row: 18, col: 21 }, { row: 18, col: 2 }], speed: 2.0, axis: 'horizontal' },
      { id: 'f3', path: [{ row: 2, col: 16 }, { row: 22, col: 16 }], speed: 2.2, axis: 'vertical' }
    ],
    dynamicEvents: true,
    dynamicBlockages: [
      { triggerTimeSec: 15, row: 11, col: 12 },
      { triggerTimeSec: 30, row: 16, col: 8 }
    ],
    obstacles: [
      { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 }, { row: 4, col: 12 }, { row: 4, col: 13 }, { row: 4, col: 14 }, { row: 4, col: 15 }, { row: 4, col: 19 }, { row: 4, col: 20 },
      { row: 10, col: 4 }, { row: 10, col: 5 }, { row: 10, col: 6 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 14 }, { row: 10, col: 15 }, { row: 10, col: 19 }, { row: 10, col: 20 },
      { row: 14, col: 4 }, { row: 14, col: 5 }, { row: 14, col: 6 }, { row: 14, col: 7 }, { row: 14, col: 8 }, { row: 14, col: 14 }, { row: 14, col: 15 }, { row: 14, col: 19 }, { row: 14, col: 20 },
      { row: 20, col: 4 }, { row: 20, col: 5 }, { row: 20, col: 6 }, { row: 20, col: 7 }, { row: 20, col: 8 }, { row: 20, col: 12 }, { row: 20, col: 13 }, { row: 20, col: 14 }, { row: 20, col: 15 }, { row: 20, col: 19 }, { row: 20, col: 20 }
    ],
    hints: ['Multi-objective emergency operation!', 'Use AI Pathfinding to calculate optimal sequences for packages and rescues']
  }
];

export class LevelManager {
  constructor() {
    this.levels = LEVELS;
  }

  getLevel(index) {
    return this.levels[index] || this.levels[0];
  }
}
