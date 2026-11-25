/**
 * WorkerModel.js
 * Procedurally creates a friendly warehouse technician / worker model
 * with safety vest, yellow hardhat, and rescue waving animation.
 */

import * as THREE from 'three';

export class WorkerModel {
  constructor(id, name, x, z) {
    this.id = id;
    this.name = name;
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);

    this.buildWorkerMesh();
  }

  buildWorkerMesh() {
    // Body / Vest (Orange Safety Vest)
    const torsoGeo = new THREE.BoxGeometry(0.4, 0.6, 0.25);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Bright safety orange
      metalness: 0.1,
      roughness: 0.6
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.6;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Reflective Silver Vest Stripes
    const stripeGeo = new THREE.BoxGeometry(0.42, 0.08, 0.27);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 });
    const s1 = new THREE.Mesh(stripeGeo, stripeMat);
    s1.position.y = 0.65;
    this.mesh.add(s1);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.8 }); // Stylized tone
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.05;
    this.mesh.add(head);

    // Yellow Safety Hardhat
    const hatGeo = new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.3, roughness: 0.4 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.1;
    this.mesh.add(hat);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.14, 0.45, 0.16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.1, 0.22, 0);
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.1, 0.22, 0);
    this.mesh.add(legL);
    this.mesh.add(legR);

    // Waving Arm (Right Arm)
    const armGeo = new THREE.BoxGeometry(0.1, 0.45, 0.1);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    this.wavingArm = new THREE.Mesh(armGeo, armMat);
    this.wavingArm.position.set(0.26, 0.75, 0);
    this.wavingArm.rotation.z = -Math.PI / 4;
    this.mesh.add(this.wavingArm);

    // Floating SOS Ring Beacon
    const ringGeo = new THREE.RingGeometry(0.3, 0.45, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.mesh.add(ring);
  }

  update(time) {
    // Waving arm animation
    this.wavingArm.rotation.z = -Math.PI / 3 + Math.sin(time * 6) * 0.4;
  }
}
