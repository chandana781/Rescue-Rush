/**
 * WarehouseBuilder.js
 * Procedurally constructs the 3D industrial warehouse environment:
 * - High-tech concrete/metal floor with custom canvas texture, markings & hazard grids
 * - Multi-level storage racks, shelves, pallets, wooden crates, barrels
 * - Charging stations with glowing golden power rings
 * - Delivery zones & Worker rescue zones with glowing holographic targets
 * - Hazard spill pools (oil/electrical)
 * - Structural factory pillars, overhead trusses & industrial LED strip lights
 */

import * as THREE from 'three';
import { CELL_TYPES } from '../ai/Grid.js';

export class WarehouseBuilder {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;

    // Reusable Materials
    this.shelfFrameMat = new THREE.MeshStandardMaterial({
      color: 0x2c3545,
      metalness: 0.8,
      roughness: 0.3
    });

    this.shelfBeamMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Industrial amber/orange safety beam
      metalness: 0.5,
      roughness: 0.4
    });

    this.boxMats = [
      new THREE.MeshStandardMaterial({ color: 0xc27838, roughness: 0.7 }), // Cardboard brown
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 }), // Blue crate
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 }), // Green crate
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })  // Red crate
    ];

    this.barrelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2
    });

    this.chargingMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    this.animatedObjects = [];
  }

  buildWarehouse(levelConfig) {
    this.animatedObjects = [];
    const width = this.grid.width;
    const height = this.grid.height;
    const cellSize = this.grid.cellSize;

    // 1. Procedural Floor Texture
    const floorGeo = new THREE.PlaneGeometry(width + 10, height + 10);
    const floorTex = this.createFloorTexture();
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set((width + 10) / cellSize / 2, (height + 10) / cellSize / 2);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.3,
      metalness: 0.2
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Warehouse Outer Walls & Structural Pillars
    this.buildOuterWalls(width + 10, height + 10);

    // 3. Populate Grid Objects
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const type = this.grid.getCell(r, c);
        const pos = this.grid.gridToWorld(r, c);

        if (type === CELL_TYPES.OBSTACLE) {
          this.buildStorageRack(pos.x, pos.z, cellSize);
        } else if (type === CELL_TYPES.HAZARD_OIL) {
          this.buildOilHazard(pos.x, pos.z, cellSize);
        } else if (type === CELL_TYPES.HAZARD_ELEC) {
          this.buildElecHazard(pos.x, pos.z, cellSize);
        }
      }
    }

    // 4. Charging Stations
    if (levelConfig.chargingStations) {
      levelConfig.chargingStations.forEach(cs => {
        const pos = this.grid.gridToWorld(cs.row, cs.col);
        this.buildChargingStation(pos.x, pos.z, cellSize);
      });
    }

    // 5. Delivery Zones
    if (levelConfig.deliveryZones) {
      levelConfig.deliveryZones.forEach(dz => {
        const pos = this.grid.gridToWorld(dz.row, dz.col);
        this.buildDeliveryZone(pos.x, pos.z, cellSize, dz.label);
      });
    }

    // 6. Rescue Zones
    if (levelConfig.rescueZones) {
      levelConfig.rescueZones.forEach(rz => {
        const pos = this.grid.gridToWorld(rz.row, rz.col);
        this.buildRescueZone(pos.x, pos.z, cellSize, rz.label);
      });
    }

    // 7. Dynamic Blockages (Initial placement if active)
    if (levelConfig.dynamicBlockages) {
      this.dynamicBlockageGroup = new THREE.Group();
      this.scene.add(this.dynamicBlockageGroup);
    }
  }

  createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background tile color
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 512, 512);

    // Grid lines
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 512);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 492, 492);

    // Industrial floor rivets in corners
    ctx.fillStyle = '#9ca3af';
    [20, 492].forEach(x => {
      [20, 492].forEach(y => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  buildOuterWalls(width, height) {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.3,
      metalness: 0.5,
      transparent: true,
      opacity: 0.2
    });

    const wallHeight = 12;

    // North & South Walls
    const nsGeo = new THREE.BoxGeometry(width, wallHeight, 1);
    const nWall = new THREE.Mesh(nsGeo, wallMat);
    nWall.position.set(0, wallHeight / 2, -height / 2);
    nWall.receiveShadow = true;
    this.scene.add(nWall);

    const sWall = new THREE.Mesh(nsGeo, wallMat);
    sWall.position.set(0, wallHeight / 2, height / 2);
    sWall.receiveShadow = true;
    this.scene.add(sWall);

    // East & West Walls
    const ewGeo = new THREE.BoxGeometry(1, wallHeight, height);
    const eWall = new THREE.Mesh(ewGeo, wallMat);
    eWall.position.set(width / 2, wallHeight / 2, 0);
    eWall.receiveShadow = true;
    this.scene.add(eWall);

    const wWall = new THREE.Mesh(ewGeo, wallMat);
    wWall.position.set(-width / 2, wallHeight / 2, 0);
    wWall.receiveShadow = true;
    this.scene.add(wWall);

    // Structural Corner Pillars with Warning Stripes
    const pillarGeo = new THREE.BoxGeometry(2, wallHeight, 2);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
    
    [[-width/2, -height/2], [width/2, -height/2], [-width/2, height/2], [width/2, height/2]].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, wallHeight / 2, pz);
      pillar.castShadow = true;
      this.scene.add(pillar);
    });
  }

  buildStorageRack(x, z, size) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const h = 4.5;
    const w = size * 0.9;
    const d = size * 0.8;

    // 4 Vertical Frame Posts
    const postGeo = new THREE.BoxGeometry(0.12, h, 0.12);
    const pxs = [-w / 2 + 0.1, w / 2 - 0.1];
    const pzs = [-d / 2 + 0.1, d / 2 - 0.1];

    pxs.forEach(px => {
      pzs.forEach(pz => {
        const post = new THREE.Mesh(postGeo, this.shelfFrameMat);
        post.position.set(px, h / 2, pz);
        post.castShadow = true;
        group.add(post);
      });
    });

    // 3 Horizontal Safety Beams (Levels)
    const beamGeo = new THREE.BoxGeometry(w, 0.1, 0.08);
    [0.8, 2.2, 3.6].forEach(levelY => {
      const bFront = new THREE.Mesh(beamGeo, this.shelfBeamMat);
      bFront.position.set(0, levelY, d / 2 - 0.05);
      group.add(bFront);

      const bBack = new THREE.Mesh(beamGeo, this.shelfBeamMat);
      bBack.position.set(0, levelY, -d / 2 + 0.05);
      group.add(bBack);

      // Wooden Pallet / Shelf Board
      const boardGeo = new THREE.BoxGeometry(w - 0.1, 0.08, d - 0.1);
      const boardMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(0, levelY, 0);
      group.add(board);

      // Random Stacked Cargo Boxes on Shelves
      const numBoxes = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numBoxes; i++) {
        const bw = 0.4 + Math.random() * 0.3;
        const bh = 0.4 + Math.random() * 0.4;
        const bd = 0.4 + Math.random() * 0.3;
        const boxGeo = new THREE.BoxGeometry(bw, bh, bd);
        const mat = this.boxMats[Math.floor(Math.random() * this.boxMats.length)];
        const box = new THREE.Mesh(boxGeo, mat);
        box.castShadow = true;
        
        const offsetX = (Math.random() - 0.5) * (w - bw - 0.2);
        const offsetZ = (Math.random() - 0.5) * (d - bd - 0.2);
        box.position.set(offsetX, levelY + bh / 2 + 0.04, offsetZ);
        group.add(box);
      }
    });

    this.scene.add(group);
  }

  buildOilHazard(x, z, size) {
    const geo = new THREE.PlaneGeometry(size * 0.9, size * 0.9);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2
    });
    const pool = new THREE.Mesh(geo, mat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(x, 0.02, z);
    this.scene.add(pool);
  }

  buildElecHazard(x, z, size) {
    const geo = new THREE.PlaneGeometry(size * 0.9, size * 0.9);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      emissive: 0xf97316,
      emissiveIntensity: 0.8,
      roughness: 0.3
    });
    const pad = new THREE.Mesh(geo, mat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(x, 0.02, z);
    this.scene.add(pad);

    // Glowing electrical ring
    const ringGeo = new THREE.RingGeometry(size * 0.2, size * 0.38, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.03, z);
    this.scene.add(ring);

    this.animatedObjects.push({
      update: (time) => {
        ringMat.opacity = 0.5 + Math.sin(time * 10) * 0.5;
        ring.rotation.z += 0.02;
      }
    });
  }

  buildChargingStation(x, z, size) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Charging Pad Base
    const padGeo = new THREE.CylinderGeometry(size * 0.42, size * 0.45, 0.1, 32);
    const pad = new THREE.Mesh(padGeo, this.chargingMat);
    pad.position.y = 0.05;
    pad.receiveShadow = true;
    group.add(pad);

    // Glowing Outer Energy Ring
    const ringGeo = new THREE.TorusGeometry(size * 0.38, 0.04, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfef08a,
      emissiveIntensity: 1.0
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.12;
    group.add(ring);

    // Center Lightning Core Light Pillar
    const pillarGeo = new THREE.CylinderGeometry(size * 0.1, size * 0.1, 2.5, 16);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.45
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.25;
    group.add(pillar);

    // Light
    const pointLight = new THREE.PointLight(0xfacc15, 2.0, 6);
    pointLight.position.y = 1.0;
    group.add(pointLight);

    this.scene.add(group);

    this.animatedObjects.push({
      update: (time) => {
        ring.rotation.z += 0.03;
        pillarMat.opacity = 0.35 + Math.sin(time * 6) * 0.2;
      }
    });
  }

  buildDeliveryZone(x, z, size, label = 'Delivery') {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Glowing Cyan Target Ring
    const padGeo = new THREE.RingGeometry(size * 0.15, size * 0.42, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.9,
      side: THREE.DoubleSide
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.03;
    group.add(pad);

    // Holographic Vertical Beacon Beams
    const beamGeo = new THREE.CylinderGeometry(size * 0.35, size * 0.35, 3.5, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 1.75;
    group.add(beam);

    this.scene.add(group);

    this.animatedObjects.push({
      update: (time) => {
        beamMat.opacity = 0.2 + Math.sin(time * 4) * 0.15;
        pad.rotation.z -= 0.02;
      }
    });
  }

  buildRescueZone(x, z, size, label = 'Rescue') {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Glowing Emerald Green Rescue Target Ring
    const padGeo = new THREE.RingGeometry(size * 0.15, size * 0.42, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x34d399,
      emissiveIntensity: 1.0,
      side: THREE.DoubleSide
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.03;
    group.add(pad);

    // Holographic Emergency Crosshair
    const crossGeo = new THREE.BoxGeometry(size * 0.7, 0.02, 0.08);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
    const c1 = new THREE.Mesh(crossGeo, crossMat);
    c1.position.y = 0.04;
    const c2 = new THREE.Mesh(crossGeo, crossMat);
    c2.rotation.y = Math.PI / 2;
    c2.position.y = 0.04;
    group.add(c1);
    group.add(c2);

    const beamGeo = new THREE.CylinderGeometry(size * 0.38, size * 0.38, 4.0, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.0;
    group.add(beam);

    this.scene.add(group);

    this.animatedObjects.push({
      update: (time) => {
        beamMat.opacity = 0.25 + Math.sin(time * 5) * 0.15;
        c1.rotation.y += 0.015;
        c2.rotation.y += 0.015;
      }
    });
  }

  addDynamicBox(x, z, size) {
    if (!this.dynamicBlockageGroup) return;
    const boxGeo = new THREE.BoxGeometry(size * 0.85, size * 0.85, size * 0.85);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.5
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(x, size * 0.425, z);
    box.castShadow = true;
    this.dynamicBlockageGroup.add(box);
  }

  update(time) {
    this.animatedObjects.forEach(obj => obj.update(time));
  }
}
