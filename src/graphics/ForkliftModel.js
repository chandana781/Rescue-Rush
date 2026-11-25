/**
 * ForkliftModel.js
 * Procedurally creates an autonomous industrial forklift with flashing orange warning light.
 * Moves dynamically along patrol routes as moving hazards.
 */

import * as THREE from 'three';

export class ForkliftModel {
  constructor(config, grid) {
    this.id = config.id;
    this.path = config.path; // Waypoints array: [{row, col}, ...]
    this.speed = config.speed || 1.5;
    this.grid = grid;

    this.currentWaypointIdx = 0;
    this.forward = true;

    this.mesh = new THREE.Group();
    this.buildForkliftMesh();

    // Initial position
    const startCell = this.path[0];
    const pos = this.grid.gridToWorld(startCell.row, startCell.col);
    this.mesh.position.set(pos.x, 0, pos.z);

    this.targetPos = new THREE.Vector3(pos.x, 0, pos.z);
  }

  buildForkliftMesh() {
    // Body Chassis
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.7, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Industrial safety yellow
      metalness: 0.5,
      roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.45;
    body.castShadow = true;
    this.mesh.add(body);

    // Operator Cage
    const cageGeo = new THREE.BoxGeometry(1.0, 1.2, 1.0);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    cage.position.set(0, 1.4, -0.2);
    this.mesh.add(cage);

    // Front Forks Assembly
    const forkMastGeo = new THREE.BoxGeometry(0.8, 1.6, 0.1);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const mast = new THREE.Mesh(forkMastGeo, mastMat);
    mast.position.set(0, 0.8, 0.95);
    this.mesh.add(mast);

    const prongGeo = new THREE.BoxGeometry(0.12, 0.06, 0.8);
    const prongMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const p1 = new THREE.Mesh(prongGeo, prongMat);
    p1.position.set(-0.25, 0.12, 1.3);
    const p2 = new THREE.Mesh(prongGeo, prongMat);
    p2.position.set(0.25, 0.12, 1.3);
    this.mesh.add(p1);
    this.mesh.add(p2);

    // Flashing Orange Strobe Light on top
    const lightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 12);
    this.strobeMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const strobe = new THREE.Mesh(lightGeo, this.strobeMat);
    strobe.position.set(0, 2.1, -0.2);
    this.mesh.add(strobe);

    this.pointLight = new THREE.PointLight(0xf97316, 2.0, 6);
    this.pointLight.position.set(0, 2.1, -0.2);
    this.mesh.add(this.pointLight);
  }

  getCurrentGridCell() {
    return this.grid.worldToGrid(this.mesh.position.x, this.mesh.position.z);
  }

  update(deltaTime, time) {
    // Strobe light animation
    const flash = Math.sin(time * 12) > 0;
    this.strobeMat.color.setHex(flash ? 0xffa500 : 0x552200);
    this.pointLight.intensity = flash ? 3.0 : 0.2;

    // Movement along waypoints
    const targetWaypoint = this.path[this.currentWaypointIdx];
    const targetWorld = this.grid.gridToWorld(targetWaypoint.row, targetWaypoint.col);
    this.targetPos.set(targetWorld.x, 0, targetWorld.z);

    const dist = this.mesh.position.distanceTo(this.targetPos);
    if (dist < 0.2) {
      // Advance to next waypoint in path
      if (this.forward) {
        this.currentWaypointIdx++;
        if (this.currentWaypointIdx >= this.path.length) {
          this.currentWaypointIdx = this.path.length - 2;
          this.forward = false;
        }
      } else {
        this.currentWaypointIdx--;
        if (this.currentWaypointIdx < 0) {
          this.currentWaypointIdx = 1;
          this.forward = true;
        }
      }
    } else {
      // Move towards target
      const dir = new THREE.Vector3().subVectors(this.targetPos, this.mesh.position).normalize();
      this.mesh.position.addScaledVector(dir, this.speed * deltaTime * 2.0);

      // Rotate towards movement direction
      const angle = Math.atan2(dir.x, dir.z);
      this.mesh.rotation.y = angle;
    }
  }
}
