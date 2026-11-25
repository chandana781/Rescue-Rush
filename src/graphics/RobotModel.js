/**
 * RobotModel.js
 * Procedurally builds and animates the futuristic autonomous anti-gravity hover robot (RoboHover X-1).
 * Features:
 * - Sleek metallic body chassis with cyan LED visor
 * - 4 anti-gravity thruster pods with blue glowing energy rings & rotating micro-turbines
 * - Dynamic point light beneath thrusters
 * - Floating y-axis bobbing & tilt physics
 * - Cargo clamp arm to hold packages or rescued workers
 * - Battery status light bar on rear
 */

import * as THREE from 'three';

export class RobotModel {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Movement state
    this.position = new THREE.Vector3(0, 0.8, 0);
    this.targetRotation = 0;
    this.currentRotation = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Carried Object slot
    this.carriedGroup = new THREE.Group();
    this.carriedGroup.position.set(0, 0.7, 0);

    this.buildRobotMesh();
    this.scene.add(this.mesh);
  }

  buildRobotMesh() {
    // 1. Sleek Central Chassis Body
    const bodyGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.45, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark titanium slate
      metalness: 0.85,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    this.mesh.add(body);

    // Top Dome Cover
    const domeGeo = new THREE.SphereGeometry(0.52, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.62;
    this.mesh.add(dome);

    // Cyan LED Visor / Sensor Eye
    const visorGeo = new THREE.BoxGeometry(0.45, 0.12, 0.15);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.2
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.52, 0.46);
    this.mesh.add(visor);

    // 2. Anti-Gravity Thruster Pods (4 corners)
    this.thrusterRings = [];
    const podPositions = [
      { x: 0.65, z: 0.65 },
      { x: -0.65, z: 0.65 },
      { x: 0.65, z: -0.65 },
      { x: -0.65, z: -0.65 }
    ];

    const podGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.35, 16);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

    const ringGeo = new THREE.TorusGeometry(0.24, 0.04, 12, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5
    });

    podPositions.forEach(p => {
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.position.set(p.x, 0.25, p.z);
      pod.castShadow = true;
      this.mesh.add(pod);

      // Blue Glowing Thruster Energy Ring
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(p.x, 0.08, p.z);
      this.mesh.add(ring);
      this.thrusterRings.push(ring);
    });

    // Under-Robot Blue Thruster Glow PointLight
    this.thrusterLight = new THREE.PointLight(0x0284c7, 2.5, 5);
    this.thrusterLight.position.set(0, 0.05, 0);
    this.mesh.add(this.thrusterLight);

    // 3. Battery Indicator Light Bar (Rear)
    const barGeo = new THREE.BoxGeometry(0.4, 0.08, 0.06);
    this.batteryMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 1.0
    });
    const batteryBar = new THREE.Mesh(barGeo, this.batteryMat);
    batteryBar.position.set(0, 0.52, -0.48);
    this.mesh.add(batteryBar);

    // 4. Cargo Attachment Clamp Group
    this.mesh.add(this.carriedGroup);

    this.mesh.position.copy(this.position);
  }

  updateBatteryVisual(batteryPct) {
    if (batteryPct > 50) {
      this.batteryMat.color.setHex(0x22c55e);
      this.batteryMat.emissive.setHex(0x16a34a);
    } else if (batteryPct > 20) {
      this.batteryMat.color.setHex(0xeab308);
      this.batteryMat.emissive.setHex(0xca8a04);
    } else {
      this.batteryMat.color.setHex(0xef4444);
      this.batteryMat.emissive.setHex(0xd97706);
    }
  }

  setCarriedObject(objectMesh) {
    // Clear previous carried items
    while (this.carriedGroup.children.length > 0) {
      this.carriedGroup.remove(this.carriedGroup.children[0]);
    }

    if (objectMesh) {
      const clone = objectMesh.clone();
      clone.position.set(0, 0, 0);
      clone.scale.set(0.65, 0.65, 0.65);
      this.carriedGroup.add(clone);
    }
  }

  update(time, deltaTime) {
    // Smooth hover bobbing animation (Y-axis oscillation)
    const hoverOffset = Math.sin(time * 3.5) * 0.08;
    this.mesh.position.y = this.position.y + hoverOffset;

    // Smooth rotation towards target direction
    let diff = this.targetRotation - this.currentRotation;
    // Normalize angle to [-PI, PI]
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.currentRotation += diff * Math.min(1.0, deltaTime * 10);
    this.mesh.rotation.y = this.currentRotation;

    // Thruster ring pulse
    this.thrusterRings.forEach(ring => {
      ring.rotation.z += 0.05;
    });

    // Forward tilt when moving
    const speed = this.velocity.length();
    const tilt = Math.min(0.2, speed * 0.08);
    this.mesh.rotation.x = tilt;
  }
}
