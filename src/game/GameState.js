/**
 * GameState.js
 * Central state store for game statistics, battery, timer, score, inventory,
 * level status, and local storage persistence.
 */

export const GAME_MODE = {
  MANUAL: 'MANUAL',
  AUTONOMOUS: 'AUTONOMOUS'
};

class GameState {
  constructor() {
    this.currentLevelIndex = 0;
    this.mode = GAME_MODE.MANUAL;
    this.selectedAlgorithm = 'A* Search';
    
    // Level runtime variables
    this.score = 0;
    this.timeRemaining = 120;
    this.battery = 100.0;
    this.maxBattery = 100.0;
    this.batteryDrainRate = 1.2; // % per second when moving
    this.hoverDrainRate = 0.3;   // % per second when idle hover
    
    // Inventory state
    this.carryingPackage = null;
    this.carryingWorker = null;
    this.packagesDelivered = 0;
    this.workersRescued = 0;
    this.targetPackages = 0;
    this.targetWorkers = 0;

    // Game loop flags
    this.isPaused = false;
    this.isGameOver = false;
    this.isLevelComplete = false;
    this.isTutorialActive = false;

    // Persistent storage data
    this.unlockedLevels = parseInt(localStorage.getItem('wrr_unlocked') || '1', 10);
    this.levelStars = JSON.parse(localStorage.getItem('wrr_stars') || '{}');
    this.highScores = JSON.parse(localStorage.getItem('wrr_scores') || '{}');
    this.settings = JSON.parse(localStorage.getItem('wrr_settings') || '{"sound":true,"volume":0.5}');
  }

  resetLevelState(levelConfig) {
    this.score = 0;
    this.timeRemaining = levelConfig.timeLimit || 120;
    this.battery = levelConfig.initialBattery || 100.0;
    this.maxBattery = levelConfig.initialBattery || 100.0;
    this.batteryDrainRate = levelConfig.batteryDrainRate || 1.2;
    
    this.carryingPackage = null;
    this.carryingWorker = null;
    this.packagesDelivered = 0;
    this.workersRescued = 0;
    this.targetPackages = levelConfig.packages ? levelConfig.packages.length : 0;
    this.targetWorkers = levelConfig.workers ? levelConfig.workers.length : 0;

    this.isPaused = false;
    this.isGameOver = false;
    this.isLevelComplete = false;
  }

  drainBattery(amount) {
    this.battery = Math.max(0, this.battery - amount);
    if (this.battery <= 0 && !this.isGameOver && !this.isLevelComplete) {
      this.isGameOver = true;
    }
  }

  rechargeBattery(amount) {
    this.battery = Math.min(this.maxBattery, this.battery + amount);
  }

  addScore(points) {
    this.score += points;
  }

  saveProgress(levelId, score, stars) {
    if (this.currentLevelIndex + 2 > this.unlockedLevels) {
      this.unlockedLevels = Math.min(8, this.currentLevelIndex + 2);
      localStorage.setItem('wrr_unlocked', this.unlockedLevels.toString());
    }

    const currentStars = this.levelStars[levelId] || 0;
    if (stars > currentStars) {
      this.levelStars[levelId] = stars;
      localStorage.setItem('wrr_stars', JSON.stringify(this.levelStars));
    }

    const currentHigh = this.highScores[levelId] || 0;
    if (score > currentHigh) {
      this.highScores[levelId] = score;
      localStorage.setItem('wrr_scores', JSON.stringify(this.highScores));
    }
  }

  saveSettings(soundEnabled, volume) {
    this.settings = { sound: soundEnabled, volume };
    localStorage.setItem('wrr_settings', JSON.stringify(this.settings));
  }
}

export const gameState = new GameState();
