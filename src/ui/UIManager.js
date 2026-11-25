/**
 * UIManager.js
 * Manages all HUD overlays, menus, modals, educational algorithm overlays, 2D minimap,
 * level select, settings, and victory/defeat screens.
 */

import { gameState, GAME_MODE } from '../game/GameState.js';
import { soundManager } from '../audio/SoundManager.js';
import { ALGORITHMS, ALGORITHM_INFO, Pathfinder } from '../ai/Pathfinding.js';
import { CELL_TYPES } from '../ai/Grid.js';

export class UIManager {
  constructor(gameApp) {
    this.app = gameApp;

    // DOM Elements
    this.hudElement = document.getElementById('hud');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.modalBriefing = document.getElementById('modal-briefing');
    this.modalEdu = document.getElementById('modal-edu');
    this.modalPause = document.getElementById('modal-pause');
    this.modalResults = document.getElementById('modal-results');
    this.screenHome = document.getElementById('screen-home');
    this.screenLevelSelect = document.getElementById('screen-level-select');

    this.bindEvents();
  }

  bindEvents() {
    // Mode Toggle Button (Manual vs Autonomous)
    const btnMode = document.getElementById('btn-mode-toggle');
    if (btnMode) {
      btnMode.addEventListener('click', () => {
        soundManager.playClick();
        const newMode = gameState.mode === GAME_MODE.MANUAL ? GAME_MODE.AUTONOMOUS : GAME_MODE.MANUAL;
        this.app.setGameMode(newMode);
      });
    }

    // Pause Button
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        soundManager.playClick();
        this.app.pauseGame();
      });
    }

    // Educational Overlay Toggle Button
    const btnEdu = document.getElementById('btn-edu-toggle');
    if (btnEdu) {
      btnEdu.addEventListener('click', () => {
        soundManager.playClick();
        this.toggleEduOverlay();
      });
    }

    // Briefing Start Button
    const btnStartMission = document.getElementById('btn-start-mission');
    if (btnStartMission) {
      btnStartMission.addEventListener('click', () => {
        soundManager.playClick();
        this.modalBriefing.classList.add('hidden');
        this.app.startMission();
      });
    }

    // Resume Button
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        soundManager.playClick();
        this.app.resumeGame();
      });
    }

    // Restart Level Button
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        soundManager.playClick();
        this.modalPause.classList.add('hidden');
        this.modalResults.classList.add('hidden');
        this.app.loadLevel(gameState.currentLevelIndex);
      });
    }

    // Home Screen Play Button
    const btnHomePlay = document.getElementById('btn-home-play');
    if (btnHomePlay) {
      btnHomePlay.addEventListener('click', () => {
        soundManager.playClick();
        this.showScreen('game');
        this.app.loadLevel(gameState.unlockedLevels - 1);
      });
    }

    // Home Screen Level Select Button
    const btnHomeLevels = document.getElementById('btn-home-levels');
    if (btnHomeLevels) {
      btnHomeLevels.addEventListener('click', () => {
        soundManager.playClick();
        this.showLevelSelectScreen();
      });
    }

    // Home Screen Tutorial Button
    const btnHomeTutorial = document.getElementById('btn-home-tutorial');
    if (btnHomeTutorial) {
      btnHomeTutorial.addEventListener('click', () => {
        soundManager.playClick();
        this.showTutorialModal();
      });
    }

    // Next Level Button (Results screen)
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        soundManager.playClick();
        this.modalResults.classList.add('hidden');
        if (gameState.currentLevelIndex + 1 < this.app.levelManager.levels.length) {
          this.app.loadLevel(gameState.currentLevelIndex + 1);
        } else {
          this.showScreen('home');
        }
      });
    }

    // Algorithm Selector in HUD / Edu modal
    const selectAlgo = document.getElementById('select-algorithm');
    if (selectAlgo) {
      selectAlgo.addEventListener('change', (e) => {
        soundManager.playClick();
        gameState.selectedAlgorithm = e.target.value;
        this.app.onAlgorithmChanged(e.target.value);
      });
    }

    // Sound toggle in settings
    const chkSound = document.getElementById('chk-sound');
    if (chkSound) {
      chkSound.checked = soundManager.enabled;
      chkSound.addEventListener('change', (e) => {
        soundManager.setMuted(!e.target.checked);
        gameState.saveSettings(e.target.checked, soundManager.volume);
      });
    }

    // Run Comparison Button in Edu Overlay
    const btnRunCompare = document.getElementById('btn-run-compare');
    if (btnRunCompare) {
      btnRunCompare.addEventListener('click', () => {
        soundManager.playClick();
        this.app.runAlgorithmComparison();
      });
    }
  }

  showScreen(screenName) {
    this.screenHome.classList.add('hidden');
    this.screenLevelSelect.classList.add('hidden');
    this.hudElement.classList.add('hidden');

    if (screenName === 'home') {
      this.screenHome.classList.remove('hidden');
    } else if (screenName === 'levelSelect') {
      this.screenLevelSelect.classList.remove('hidden');
    } else if (screenName === 'game') {
      this.hudElement.classList.remove('hidden');
    }
  }

  showBriefingModal(levelConfig) {
    document.getElementById('briefing-title').textContent = `Level ${levelConfig.id}: ${levelConfig.title}`;
    document.getElementById('briefing-subtitle').textContent = levelConfig.subtitle;
    document.getElementById('briefing-story').textContent = levelConfig.story;

    // Objectives list
    const objList = document.getElementById('briefing-objectives');
    objList.innerHTML = '';
    
    if (levelConfig.packages && levelConfig.packages.length > 0) {
      const li = document.createElement('li');
      li.innerHTML = `📦 <strong>Packages to Deliver:</strong> ${levelConfig.packages.length}`;
      objList.appendChild(li);
    }
    if (levelConfig.workers && levelConfig.workers.length > 0) {
      const li = document.createElement('li');
      li.innerHTML = `🚨 <strong>Workers to Rescue:</strong> ${levelConfig.workers.length}`;
      objList.appendChild(li);
    }
    const liBatt = document.createElement('li');
    liBatt.innerHTML = `⚡ <strong>Initial Battery:</strong> ${levelConfig.initialBattery}%`;
    objList.appendChild(liBatt);

    document.getElementById('briefing-algo-recommended').textContent = levelConfig.recommendedAlgorithm;

    this.modalBriefing.classList.remove('hidden');
  }

  updateHUD(levelConfig) {
    document.getElementById('hud-level-id').textContent = `Level ${levelConfig.id}`;
    document.getElementById('hud-level-title').textContent = levelConfig.title;

    // Mode button styling
    const btnMode = document.getElementById('btn-mode-toggle');
    if (btnMode) {
      if (gameState.mode === GAME_MODE.MANUAL) {
        btnMode.innerHTML = `<span class="icon">🎮</span> MANUAL MODE`;
        btnMode.className = 'hud-badge mode-manual';
      } else {
        btnMode.innerHTML = `<span class="icon">🤖</span> AI AUTONOMOUS`;
        btnMode.className = 'hud-badge mode-auto';
      }
    }

    // Score & Timer
    document.getElementById('hud-score').textContent = gameState.score;
    const mins = Math.floor(gameState.timeRemaining / 60);
    const secs = Math.floor(gameState.timeRemaining % 60);
    document.getElementById('hud-timer').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Battery Bar
    const battPct = Math.max(0, Math.round(gameState.battery));
    const battFill = document.getElementById('hud-battery-fill');
    const battText = document.getElementById('hud-battery-text');
    if (battFill && battText) {
      battFill.style.width = `${battPct}%`;
      battText.textContent = `${battPct}%`;

      if (battPct > 50) {
        battFill.style.backgroundColor = '#22c55e';
      } else if (battPct > 20) {
        battFill.style.backgroundColor = '#eab308';
      } else {
        battFill.style.backgroundColor = '#ef4444';
      }
    }

    // Targets progress
    const pkgText = `${gameState.packagesDelivered}/${gameState.targetPackages}`;
    const wrkText = `${gameState.workersRescued}/${gameState.targetWorkers}`;
    document.getElementById('hud-targets-pkg').textContent = pkgText;
    document.getElementById('hud-targets-wrk').textContent = wrkText;
  }

  toggleEduOverlay() {
    this.modalEdu.classList.toggle('hidden');
  }

  updateEduMetrics(result) {
    if (!result) return;
    const info = ALGORITHM_INFO[result.algorithm] || { formula: '', description: '' };

    document.getElementById('edu-algo-name').textContent = result.algorithm;
    document.getElementById('edu-algo-formula').textContent = info.formula;
    document.getElementById('edu-algo-desc').textContent = info.description;

    document.getElementById('edu-stat-nodes').textContent = result.nodesExpanded;
    document.getElementById('edu-stat-open').textContent = result.frontier ? result.frontier.length : 0;
    document.getElementById('edu-stat-length').textContent = result.path ? result.path.length : 0;
    document.getElementById('edu-stat-cost').textContent = result.cost !== Infinity ? result.cost : 'Unreachable';
    document.getElementById('edu-stat-time').textContent = `${(result.executionTime || 0).toFixed(2)} ms`;
  }

  updateComparisonTable(comparisonResults) {
    const tbody = document.getElementById('edu-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (const [key, res] of Object.entries(comparisonResults)) {
      const tr = document.createElement('tr');
      const isSelected = res.algorithm === gameState.selectedAlgorithm;
      if (isSelected) tr.className = 'table-row-selected';

      tr.innerHTML = `
        <td><strong>${res.algorithm}</strong></td>
        <td>${res.nodesExpanded}</td>
        <td>${res.cost !== Infinity ? res.cost : 'N/A'}</td>
        <td>${(res.executionTime || 0).toFixed(2)} ms</td>
        <td>${res.found ? '✅ Optimal' : '❌ Failed'}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  renderMinimap(grid, robotCell, pathCells, packages, workers, deliveryZones, rescueZones, forklifts) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cellW = w / grid.cols;
    const cellH = h / grid.rows;

    // Grid cells
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const type = grid.getCell(r, c);
        const x = c * cellW;
        const y = r * cellH;

        if (type === CELL_TYPES.OBSTACLE) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        } else if (type === CELL_TYPES.HAZARD_OIL) {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x, y, cellW, cellH);
        } else if (type === CELL_TYPES.HAZARD_ELEC) {
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x, y, cellW, cellH);
        } else if (type === CELL_TYPES.CHARGING_STATION) {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x, y, cellW, cellH);
        }
      }
    }

    // Delivery Zones & Rescue Zones
    if (deliveryZones) {
      ctx.fillStyle = '#06b6d4';
      deliveryZones.forEach(dz => {
        ctx.fillRect(dz.col * cellW, dz.row * cellH, cellW, cellH);
      });
    }
    if (rescueZones) {
      ctx.fillStyle = '#10b981';
      rescueZones.forEach(rz => {
        ctx.fillRect(rz.col * cellW, rz.row * cellH, cellW, cellH);
      });
    }

    // Packages & Workers
    if (packages) {
      ctx.fillStyle = '#3b82f6';
      packages.forEach(p => {
        if (!p.collected) {
          ctx.beginPath();
          ctx.arc((p.col + 0.5) * cellW, (p.row + 0.5) * cellH, cellW * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
    if (workers) {
      ctx.fillStyle = '#f97316';
      workers.forEach(wrk => {
        if (!wrk.rescued) {
          ctx.beginPath();
          ctx.arc((wrk.col + 0.5) * cellW, (wrk.row + 0.5) * cellH, cellW * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Path Line
    if (pathCells && pathCells.length > 1) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      pathCells.forEach((c, idx) => {
        const px = (c.col + 0.5) * cellW;
        const py = (c.row + 0.5) * cellH;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Moving Forklifts
    if (forklifts) {
      ctx.fillStyle = '#ef4444';
      forklifts.forEach(f => {
        const cell = f.getCurrentGridCell();
        ctx.fillRect(cell.col * cellW, cell.row * cellH, cellW, cellH);
      });
    }

    // Robot Indicator (Cyan Arrow / Circle)
    if (robotCell) {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc((robotCell.col + 0.5) * cellW, (robotCell.row + 0.5) * cellH, cellW * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  showLevelSelectScreen() {
    const container = document.getElementById('level-cards-grid');
    if (!container) return;
    container.innerHTML = '';

    this.app.levelManager.levels.forEach((lvl, idx) => {
      const isUnlocked = idx + 1 <= gameState.unlockedLevels;
      const stars = gameState.levelStars[lvl.id] || 0;
      const highScore = gameState.highScores[lvl.id] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="level-card-number">Level ${lvl.id}</div>
        <div class="level-card-title">${lvl.title}</div>
        <div class="level-card-sub">${lvl.subtitle}</div>
        <div class="level-card-stars">
          ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}
        </div>
        ${isUnlocked ? `<div class="level-card-score">Best: ${highScore}</div>` : '<div class="level-card-lock">🔒 Locked</div>'}
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          soundManager.playClick();
          this.showScreen('game');
          this.app.loadLevel(idx);
        });
      }

      container.appendChild(card);
    });

    this.showScreen('levelSelect');
  }

  showResultsModal(win, score, stars, reason = '') {
    const title = document.getElementById('results-title');
    const starsContainer = document.getElementById('results-stars');
    const scoreVal = document.getElementById('results-score');
    const details = document.getElementById('results-details');

    if (win) {
      soundManager.playVictory();
      title.textContent = '🎉 MISSION ACCOMPLISHED!';
      title.className = 'results-title-win';
      starsContainer.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
      scoreVal.textContent = `Score: ${score}`;
      details.innerHTML = `
        <p>✅ All packages delivered and workers rescued!</p>
        <p>⚡ Battery Remaining: ${Math.round(gameState.battery)}%</p>
        <p>⏱️ Time Remaining: ${Math.round(gameState.timeRemaining)}s</p>
      `;
      document.getElementById('btn-next-level').classList.remove('hidden');
    } else {
      soundManager.playFail();
      title.textContent = '⚠️ MISSION FAILED!';
      title.className = 'results-title-fail';
      starsContainer.textContent = '☆☆☆';
      scoreVal.textContent = `Score: ${score}`;
      details.innerHTML = `<p>❌ Failure Reason: ${reason || 'Out of Battery or Time'}</p>`;
      document.getElementById('btn-next-level').classList.add('hidden');
    }

    this.modalResults.classList.remove('hidden');
  }

  showTutorialModal() {
    alert(`🎮 CONTROLS & HOW TO PLAY:
• WASD / Arrow Keys: Drive hover robot in Manual Mode.
• Mouse Drag & Wheel: Orbit camera around warehouse & Zoom.
• Click "AI AUTONOMOUS": Robot uses real-time graph search (A*, BFS, DFS, UCS, GBFS) to navigate!
• Educational Overlay: View live algorithm comparison metrics & step-by-step search visualization.
• Pick up items: Drive over packages or trapped workers.
• Deliver & Rescue: Bring packages to Cyan Delivery Pads and workers to Green Rescue Pads.
• Charge Battery: Drive onto Golden Charging Pads to recharge power!`);
  }
}
