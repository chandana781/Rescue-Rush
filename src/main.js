/**
 * main.js
 * Central Application Controller for Warehouse Rescue Rush.
 * Coordinates 3D Graphics, Physics, AI Pathfinding, Sound, Gameplay Loop, and UI.
 */

import * as THREE from 'three';
import { Scene3D } from './graphics/Scene3D.js';
import { WarehouseBuilder } from './graphics/WarehouseBuilder.js';
import { RobotModel } from './graphics/RobotModel.js';
import { WorkerModel } from './graphics/WorkerModel.js';
import { ForkliftModel } from './graphics/ForkliftModel.js';
import { PathVisualizer } from './graphics/PathVisualizer.js';
import { WarehouseGrid, CELL_TYPES } from './ai/Grid.js';
import { Pathfinder, ALGORITHMS } from './ai/Pathfinding.js';
import { LevelManager } from './game/LevelManager.js';
import { gameState, GAME_MODE } from './game/GameState.js';
import { soundManager } from './audio/SoundManager.js';
import { UIManager } from './ui/UIManager.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('webgl-container');

    // 1. Initialize 3D Engine
    this.scene3d = new Scene3D(this.container);

    // 2. Managers & Components
    this.levelManager = new LevelManager();
    this.uiManager = new UIManager(this);

    // Active Level Objects
    this.grid = null;
    this.builder = null;
    this.robot = null;
    this.pathVisualizer = null;
    this.packages3D = [];
    this.workers3D = [];
    this.forklifts3D = [];

    // Autonomous AI Navigation state
    this.aiPath = [];
    this.aiCurrentWaypointIdx = 0;
    this.aiTargetCell = null;
    this.aiResult = null;

    // Input Keys state
    this.keys = { w: false, a: false, s: false, d: false, space: false };
    this.setupKeyboardInput();

    // Loop Timing
    this.clock = new THREE.Clock();
    this.levelTimeAccumulator = 0;

    // Make accessible globally
    window.gameApp = this;
    window.gameState = gameState;

    // Start loop
    this.animate();
  }

  setupKeyboardInput() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = true;
      if (k === 'a' || k === 'arrowleft') this.keys.a = true;
      if (k === 's' || k === 'arrowdown') this.keys.s = true;
      if (k === 'd' || k === 'arrowright') this.keys.d = true;
      if (e.code === 'Space') this.keys.space = true;
      if (k === 'escape') this.pauseGame();
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = false;
      if (k === 'a' || k === 'arrowleft') this.keys.a = false;
      if (k === 's' || k === 'arrowdown') this.keys.s = false;
      if (k === 'd' || k === 'arrowright') this.keys.d = false;
      if (e.code === 'Space') this.keys.space = false;
    });
  }

  loadLevel(levelIndex) {
    gameState.currentLevelIndex = levelIndex;
    const config = this.levelManager.getLevel(levelIndex);
    if (!config) return;

    // Clear 3D Scene
    this.scene3d.clearScene();
    this.packages3D = [];
    this.workers3D = [];
    this.forklifts3D = [];
    this.aiPath = [];

    // Initialize Grid & Builders
    this.grid = new WarehouseGrid(config.gridCols, config.gridRows, 2.0);
    
    // Load obstacles and hazards into grid
    config.obstacles.forEach(o => this.grid.setCell(o.row, o.col, CELL_TYPES.OBSTACLE));
    if (config.hazards) {
      config.hazards.forEach(h => this.grid.setCell(h.row, h.col, h.type));
    }

    this.builder = new WarehouseBuilder(this.scene3d.scene, this.grid);
    this.builder.buildWarehouse(config);

    this.pathVisualizer = new PathVisualizer(this.scene3d.scene, this.grid);

    // Spawn Robot
    const startWorld = this.grid.gridToWorld(config.startPos.row, config.startPos.col);
    this.robot = new RobotModel(this.scene3d.scene);
    this.robot.position.set(startWorld.x, 0.8, startWorld.z);
    this.robot.mesh.position.copy(this.robot.position);

    // Spawn 3D Packages
    if (config.packages) {
      config.packages.forEach(p => {
        const pos = this.grid.gridToWorld(p.row, p.col);
        const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const mat = new THREE.MeshStandardMaterial({
          color: p.type === 'biohazard' ? 0x06b6d4 : (p.type === 'heavy' ? 0x64748b : 0x3b82f6),
          roughness: 0.4
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos.x, 0.4, pos.z);
        mesh.castShadow = true;
        this.scene3d.scene.add(mesh);

        this.packages3D.push({
          id: p.id,
          row: p.row,
          col: p.col,
          label: p.label,
          mesh,
          collected: false
        });
      });
    }

    // Spawn 3D Workers
    if (config.workers) {
      config.workers.forEach(w => {
        const pos = this.grid.gridToWorld(w.row, w.col);
        const workerModel = new WorkerModel(w.id, w.name, pos.x, pos.z);
        this.scene3d.scene.add(workerModel.mesh);

        this.workers3D.push({
          id: w.id,
          row: w.row,
          col: w.col,
          name: w.name,
          model: workerModel,
          rescued: false
        });
      });
    }

    // Spawn 3D Forklifts
    if (config.forklifts) {
      config.forklifts.forEach(f => {
        const forklift = new ForkliftModel(f, this.grid);
        this.scene3d.scene.add(forklift.mesh);
        this.forklifts3D.push(forklift);
      });
    }

    // Reset Game State & HUD
    gameState.resetLevelState(config);
    this.uiManager.updateHUD(config);
    this.uiManager.showBriefingModal(config);

    soundManager.startEngine();
  }

  startMission() {
    gameState.isPaused = false;
    this.recalculateAIPath();
  }

  setGameMode(newMode) {
    gameState.mode = newMode;
    this.uiManager.updateHUD(this.levelManager.getLevel(gameState.currentLevelIndex));
    if (newMode === GAME_MODE.AUTONOMOUS) {
      this.recalculateAIPath();
    }
  }

  onAlgorithmChanged(algorithmName) {
    this.recalculateAIPath();
  }

  recalculateAIPath() {
    if (!this.grid || !this.robot) return;
    const currentRobotCell = this.grid.worldToGrid(this.robot.position.x, this.robot.position.z);
    
    // Determine active target (Package, Worker, Delivery Zone, Rescue Zone, or Charging Station)
    const levelConfig = this.levelManager.getLevel(gameState.currentLevelIndex);
    let targetCell = null;

    if (gameState.carryingPackage && levelConfig.deliveryZones && levelConfig.deliveryZones.length > 0) {
      targetCell = levelConfig.deliveryZones[0];
    } else if (gameState.carryingWorker && levelConfig.rescueZones && levelConfig.rescueZones.length > 0) {
      targetCell = levelConfig.rescueZones[0];
    } else {
      // Find nearest uncollected package or worker
      const activePkg = this.packages3D.find(p => !p.collected);
      if (activePkg) {
        targetCell = { row: activePkg.row, col: activePkg.col };
      } else {
        const activeWrk = this.workers3D.find(w => !w.rescued);
        if (activeWrk) {
          targetCell = { row: activeWrk.row, col: activeWrk.col };
        } else if (levelConfig.deliveryZones && levelConfig.deliveryZones.length > 0) {
          targetCell = levelConfig.deliveryZones[0];
        }
      }
    }

    if (!targetCell) return;
    this.aiTargetCell = targetCell;

    // Run scratch search algorithm!
    const result = Pathfinder.solve(this.grid, currentRobotCell, targetCell, gameState.selectedAlgorithm, { recordSteps: true });
    this.aiResult = result;
    this.aiPath = result.path;
    this.aiCurrentWaypointIdx = 0;

    // Render 3D path visualization
    if (this.pathVisualizer) {
      this.pathVisualizer.renderExplored(result.explored);
      this.pathVisualizer.renderFrontier(result.frontier);
      this.pathVisualizer.renderPath(result.path);
    }

    // Update Educational Overlay metrics
    this.uiManager.updateEduMetrics(result);
  }

  runAlgorithmComparison() {
    if (!this.grid || !this.robot || !this.aiTargetCell) return;
    const currentRobotCell = this.grid.worldToGrid(this.robot.position.x, this.robot.position.z);
    const comparison = Pathfinder.compareAll(this.grid, currentRobotCell, this.aiTargetCell);
    this.uiManager.updateComparisonTable(comparison);
  }

  pauseGame() {
    gameState.isPaused = !gameState.isPaused;
    const modalPause = document.getElementById('modal-pause');
    if (modalPause) {
      modalPause.classList.toggle('hidden', !gameState.isPaused);
    }
  }

  resumeGame() {
    gameState.isPaused = false;
    document.getElementById('modal-pause').classList.add('hidden');
  }

  updatePhysics(deltaTime, time) {
    if (gameState.isPaused || gameState.isGameOver || gameState.isLevelComplete) return;

    const levelConfig = this.levelManager.getLevel(gameState.currentLevelIndex);
    this.levelTimeAccumulator += deltaTime;

    // Timer update
    if (this.levelTimeAccumulator >= 1.0) {
      this.levelTimeAccumulator = 0;
      gameState.timeRemaining--;
      if (gameState.timeRemaining <= 0) {
        gameState.isGameOver = true;
        this.uiManager.showResultsModal(false, gameState.score, 0, 'Time Expired!');
        return;
      }

      // Dynamic Event triggers (falling crates)
      if (levelConfig.dynamicBlockages) {
        levelConfig.dynamicBlockages.forEach(db => {
          if (Math.floor(levelConfig.timeLimit - gameState.timeRemaining) === db.triggerTimeSec) {
            this.grid.setDynamicObstacle(db.row, db.col, true);
            const pos = this.grid.gridToWorld(db.row, db.col);
            this.builder.addDynamicBox(pos.x, pos.z, this.grid.cellSize);
            soundManager.playHazard();

            // Trigger real-time dynamic AI replanning!
            if (gameState.mode === GAME_MODE.AUTONOMOUS) {
              this.recalculateAIPath();
            }
          }
        });
      }
    }

    // Battery Drain
    const isMoving = this.robot.velocity.length() > 0.1;
    const drainRate = isMoving ? gameState.batteryDrainRate : gameState.hoverDrainRate;
    gameState.drainBattery(drainRate * deltaTime);
    this.robot.updateBatteryVisual(gameState.battery);

    if (gameState.isGameOver) {
      this.uiManager.showResultsModal(false, gameState.score, 0, 'Battery Depleted!');
      return;
    }

    // Update 3D Workers & Forklifts
    this.workers3D.forEach(w => w.model.update(time));
    this.forklifts3D.forEach(f => f.update(deltaTime, time));

    // Forklift Collision Check
    const robotCell = this.grid.worldToGrid(this.robot.position.x, this.robot.position.z);
    for (const f of this.forklifts3D) {
      const fCell = f.getCurrentGridCell();
      if (fCell.row === robotCell.row && fCell.col === robotCell.col) {
        soundManager.playHazard();
        gameState.drainBattery(15); // Hit by forklift penalty
      }
    }

    // --- Movement Physics & Controls ---
    if (gameState.mode === GAME_MODE.MANUAL) {
      // Manual WASD Driving
      let moveZ = 0;
      let moveX = 0;
      if (this.keys.w) moveZ -= 1;
      if (this.keys.s) moveZ += 1;
      if (this.keys.a) moveX -= 1;
      if (this.keys.d) moveX += 1;

      const inputDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
      if (inputDir.length() > 0) {
        const speed = 7.0;
        this.robot.velocity.copy(inputDir.multiplyScalar(speed));
        this.robot.targetRotation = Math.atan2(inputDir.x, inputDir.z);

        // Next position with collision check
        const nextX = this.robot.position.x + this.robot.velocity.x * deltaTime;
        const nextZ = this.robot.position.z + this.robot.velocity.z * deltaTime;
        const nextCell = this.grid.worldToGrid(nextX, nextZ);

        if (this.grid.isWalkable(nextCell.row, nextCell.col)) {
          this.robot.position.x = nextX;
          this.robot.position.z = nextZ;
        }
      } else {
        this.robot.velocity.set(0, 0, 0);
      }
    } else {
      // Autonomous AI Path Navigation
      if (this.aiPath && this.aiPath.length > 0 && this.aiCurrentWaypointIdx < this.aiPath.length) {
        const targetCell = this.aiPath[this.aiCurrentWaypointIdx];

        // Check if next waypoint cell is suddenly blocked by a dynamic forklift or fallen box
        if (!this.grid.isWalkable(targetCell.row, targetCell.col)) {
          // Dynamic obstacle detected! Trigger instant dynamic replanning!
          this.recalculateAIPath();
          return;
        }

        const targetWorld = this.grid.gridToWorld(targetCell.row, targetCell.col);
        const targetPos = new THREE.Vector3(targetWorld.x, 0.8, targetWorld.z);

        const dist = this.robot.position.distanceTo(targetPos);
        if (dist < 0.25) {
          this.aiCurrentWaypointIdx++;
          if (this.aiCurrentWaypointIdx >= this.aiPath.length) {
            this.robot.velocity.set(0, 0, 0);
          }
        } else {
          const dir = new THREE.Vector3().subVectors(targetPos, this.robot.position).normalize();
          const autoSpeed = 6.5;
          this.robot.velocity.copy(dir.multiplyScalar(autoSpeed));
          this.robot.position.addScaledVector(dir, autoSpeed * deltaTime);
          this.robot.targetRotation = Math.atan2(dir.x, dir.z);
        }
      } else {
        this.robot.velocity.set(0, 0, 0);
      }
    }

    this.robot.mesh.position.copy(this.robot.position);

    // --- Interactive Collisions & Objectives ---
    // 1. Package Pickup
    this.packages3D.forEach(p => {
      if (!p.collected && p.row === robotCell.row && p.col === robotCell.col && !gameState.carryingPackage) {
        p.collected = true;
        p.mesh.visible = false;
        gameState.carryingPackage = p;
        this.robot.setCarriedObject(p.mesh);
        soundManager.playPickup();
        gameState.addScore(250);

        if (gameState.mode === GAME_MODE.AUTONOMOUS) {
          this.recalculateAIPath();
        }
      }
    });

    // 2. Package Delivery Drop
    if (gameState.carryingPackage && levelConfig.deliveryZones) {
      levelConfig.deliveryZones.forEach(dz => {
        if (dz.row === robotCell.row && dz.col === robotCell.col) {
          soundManager.playDelivery();
          gameState.addScore(500);
          gameState.packagesDelivered++;
          gameState.carryingPackage = null;
          this.robot.setCarriedObject(null);

          if (gameState.mode === GAME_MODE.AUTONOMOUS) {
            this.recalculateAIPath();
          }
        }
      });
    }

    // 3. Worker Rescue Pickup
    this.workers3D.forEach(w => {
      if (!w.rescued && w.row === robotCell.row && w.col === robotCell.col && !gameState.carryingWorker) {
        w.rescued = true;
        w.model.mesh.visible = false;
        gameState.carryingWorker = w;
        this.robot.setCarriedObject(w.model.mesh);
        soundManager.playRescue();
        gameState.addScore(350);

        if (gameState.mode === GAME_MODE.AUTONOMOUS) {
          this.recalculateAIPath();
        }
      }
    });

    // 4. Worker Rescue Drop
    if (gameState.carryingWorker && levelConfig.rescueZones) {
      levelConfig.rescueZones.forEach(rz => {
        if (rz.row === robotCell.row && rz.col === robotCell.col) {
          soundManager.playDelivery();
          gameState.addScore(700);
          gameState.workersRescued++;
          gameState.carryingWorker = null;
          this.robot.setCarriedObject(null);

          if (gameState.mode === GAME_MODE.AUTONOMOUS) {
            this.recalculateAIPath();
          }
        }
      });
    }

    // 5. Charging Station Pad
    const currentCellType = this.grid.getCell(robotCell.row, robotCell.col);
    if (currentCellType === CELL_TYPES.CHARGING_STATION) {
      if (gameState.battery < gameState.maxBattery) {
        gameState.rechargeBattery(35.0 * deltaTime); // Fast recharge!
        soundManager.playCharge();
      }
    }

    // Check Level Completion Condition
    if (gameState.packagesDelivered >= gameState.targetPackages && gameState.workersRescued >= gameState.targetWorkers) {
      gameState.isLevelComplete = true;
      const stars = gameState.battery > 50 ? 3 : (gameState.battery > 20 ? 2 : 1);
      const totalScore = gameState.score + Math.round(gameState.battery * 10) + Math.round(gameState.timeRemaining * 5);
      gameState.saveProgress(levelConfig.id, totalScore, stars);
      this.uiManager.showResultsModal(true, totalScore, stars);
    }

    // Update HUD & Minimap
    this.uiManager.updateHUD(levelConfig);
    this.uiManager.renderMinimap(
      this.grid,
      robotCell,
      this.aiPath,
      this.packages3D,
      this.workers3D,
      levelConfig.deliveryZones,
      levelConfig.rescueZones,
      this.forklifts3D
    );
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = Math.min(0.1, this.clock.getDelta());
    const elapsedTime = this.clock.getElapsedTime();

    if (this.robot && this.scene3d) {
      this.robot.update(elapsedTime, deltaTime);
      this.scene3d.updateCameraFollow(this.robot.position, deltaTime);
    }

    if (this.builder) {
      this.builder.update(elapsedTime);
    }

    if (this.pathVisualizer) {
      this.pathVisualizer.update(deltaTime);
    }

    this.updatePhysics(deltaTime, elapsedTime);
    this.scene3d.render();
  }

  showScreen(screenName) {
    this.uiManager.showScreen(screenName);
  }
}

// Launch App on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
