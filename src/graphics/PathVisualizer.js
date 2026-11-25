/**
 * PathVisualizer.js
 * Renders 3D visualization of AI search processes:
 * - Glowing neon path tube line connecting waypoints
 * - Semi-transparent explored node floor markers (Cyan/Blue)
 * - Frontier open list node markers (Yellow)
 * - Animated energy pulse travelling along the calculated path
 */

import * as THREE from 'three';

export class PathVisualizer {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;

    this.pathGroup = new THREE.Group();
    this.exploredGroup = new THREE.Group();
    this.frontierGroup = new THREE.Group();

    this.scene.add(this.pathGroup);
    this.scene.add(this.exploredGroup);
    this.scene.add(this.frontierGroup);

    // Glowing Neon Tube Material
    this.pathMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x22d3ee,
      emissiveIntensity: 2.0,

      roughness: 0.1
    });

    // Explored Nodes Material (Cyan translucent tile)
    this.exploredMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    // Frontier Nodes Material (Yellow wireframe tile)
    this.frontierMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
      side: THREE.DoubleSide
    });

    // Animated Energy Pulse Mesh
    const pulseGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    this.pulseMesh.visible = false;
    this.scene.add(this.pulseMesh);

    this.currentPathPoints = [];
    this.pulseProgress = 0;
  }

  clearAll() {
    while (this.pathGroup.children.length > 0) this.pathGroup.remove(this.pathGroup.children[0]);
    while (this.exploredGroup.children.length > 0) this.exploredGroup.remove(this.exploredGroup.children[0]);
    while (this.frontierGroup.children.length > 0) this.frontierGroup.remove(this.frontierGroup.children[0]);
    this.pulseMesh.visible = false;
    this.currentPathPoints = [];
  }

  renderExplored(exploredCells) {
    while (this.exploredGroup.children.length > 0) this.exploredGroup.remove(this.exploredGroup.children[0]);
    if (!exploredCells) return;

    const tileSize = this.grid.cellSize * 0.85;
    const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize);

    exploredCells.forEach(cell => {
      const pos = this.grid.gridToWorld(cell.row, cell.col);
      const mesh = new THREE.Mesh(tileGeo, this.exploredMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(pos.x, 0.04, pos.z);
      this.exploredGroup.add(mesh);
    });
  }

  renderFrontier(frontierCells) {
    while (this.frontierGroup.children.length > 0) this.frontierGroup.remove(this.frontierGroup.children[0]);
    if (!frontierCells) return;

    const tileSize = this.grid.cellSize * 0.9;
    const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize);

    frontierCells.forEach(cell => {
      const pos = this.grid.gridToWorld(cell.row, cell.col);
      const mesh = new THREE.Mesh(tileGeo, this.frontierMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(pos.x, 0.05, pos.z);
      this.frontierGroup.add(mesh);
    });
  }

  renderPath(pathCells) {
    while (this.pathGroup.children.length > 0) this.pathGroup.remove(this.pathGroup.children[0]);
    if (!pathCells || pathCells.length < 2) {
      this.pulseMesh.visible = false;
      return;
    }

    const points = pathCells.map(c => {
      const pos = this.grid.gridToWorld(c.row, c.col);
      return new THREE.Vector3(pos.x, 0.25, pos.z);
    });

    this.currentPathPoints = points;

    // Create 3D Tube Geometry along path
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    const tubeGeo = new THREE.TubeGeometry(curve, points.length * 8, 0.08, 8, false);
    const tube = new THREE.Mesh(tubeGeo, this.pathMat);
    this.pathGroup.add(tube);

    // Node waypoint spheres along path
    const sphereGeo = new THREE.SphereGeometry(0.18, 12, 12);
    points.forEach(p => {
      const node = new THREE.Mesh(sphereGeo, this.pathMat);
      node.position.copy(p);
      this.pathGroup.add(node);
    });

    this.pulseMesh.visible = true;
    this.pulseProgress = 0;
  }

  update(deltaTime) {
    if (this.pulseMesh.visible && this.currentPathPoints.length >= 2) {
      this.pulseProgress += deltaTime * 2.5;
      if (this.pulseProgress >= this.currentPathPoints.length - 1) {
        this.pulseProgress = 0;
      }

      const idx = Math.floor(this.pulseProgress);
      const nextIdx = Math.min(this.currentPathPoints.length - 1, idx + 1);
      const alpha = this.pulseProgress - idx;

      const p1 = this.currentPathPoints[idx];
      const p2 = this.currentPathPoints[nextIdx];

      this.pulseMesh.position.lerpVectors(p1, p2, alpha);
    }
  }
}
