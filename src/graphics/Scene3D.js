/**
 * Scene3D.js
 * Initializes and manages the Three.js 3D WebGL scene, camera, lights, shadows, and renderer.
 * Provides smooth third-person follow camera + orbit/mouse look.
 */

import * as THREE from 'three';

export class Scene3D {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe0e0e0); // Light grey background for industrial warehouse
    this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 500);
    this.cameraOffset = new THREE.Vector3(0, 14, 18);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Mouse Orbit / Drag Controls
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.cameraAngleYaw = 0;
    this.cameraAnglePitch = Math.PI / 4;
    this.cameraDistance = 22;

    this.setupMouseEvents();

    // 6. Window Resize Handler
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    // Hemisphere Light (sky vs ground tint)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.6);
    this.scene.add(hemiLight);

    // Main Directional Light simulating overhead industrial lights
    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.dirLight.position.set(0, 30, 0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 200;
    const d = 50;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Add an array of soft ceiling spotlights (linear strips)
    const stripCount = 8;
    for (let i = 0; i < stripCount; i++) {
      const strip = new THREE.PointLight(0xfff5e1, 0.6, 30);
      strip.position.set(-30 + (i * 60) / (stripCount - 1), 20, 0);
      this.scene.add(strip);
    }

  }

  setupMouseEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      // Only drag with left or right mouse button on 3D canvas
      if (e.target === dom) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraAngleYaw -= deltaX * 0.005;
      this.cameraAnglePitch = Math.max(0.15, Math.min(Math.PI / 2.2, this.cameraAnglePitch + deltaY * 0.005));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      // Zoom using camera.zoom for crisp rendering
      const delta = -e.deltaY * 0.001;
      this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom + delta, 0.5, 3);
      this.camera.updateProjectionMatrix();
    }, { passive: false });
  }

  updateCameraFollow(targetPos, deltaTime = 0.016) {
    if (!targetPos) return;

    // Calculate camera position based on orbit yaw, pitch, and distance
    const x = targetPos.x + this.cameraDistance * Math.sin(this.cameraAnglePitch) * Math.sin(this.cameraAngleYaw);
    const y = targetPos.y + this.cameraDistance * Math.cos(this.cameraAnglePitch);
    const z = targetPos.z + this.cameraDistance * Math.sin(this.cameraAnglePitch) * Math.cos(this.cameraAngleYaw);

    const desiredCameraPos = new THREE.Vector3(x, y, z);

    // Smooth lerp camera position
    this.camera.position.lerp(desiredCameraPos, Math.min(1.0, deltaTime * 5.0));

    // Target smoothly follows target position (slightly above ground)
    const desiredTarget = new THREE.Vector3(targetPos.x, targetPos.y + 1.2, targetPos.z);
    this.cameraTarget.lerp(desiredTarget, Math.min(1.0, deltaTime * 6.0));

    this.camera.lookAt(this.cameraTarget);

    // Move directional light to follow target for crisp shadows
    this.dirLight.position.set(targetPos.x + 20, 35, targetPos.z + 20);
    this.dirLight.target.position.copy(targetPos);
    this.dirLight.target.updateMatrixWorld();
  }

  onWindowResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  clearScene() {
    // Remove objects except essential lights
    const toRemove = [];
    this.scene.children.forEach(child => {
      if (!child.isLight) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(obj => this.scene.remove(obj));
  }
}
