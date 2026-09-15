import * as THREE from 'three';
import { SCENE_Y_OFFSET } from '../configs/constants.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    // Detect mobile viewport
    this.isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const fov = this.isMobile ? 120 : 90;

    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    const height = typeof window !== 'undefined' ? window.innerHeight : 600;

    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);

    // Try initializing WebGLRenderer with permissive flags
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
    } catch (e1) {
      console.warn("Retrying WebGLRenderer with minimal config:", e1);
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'low-power'
      });
    }

    this.sceneYOffset = SCENE_Y_OFFSET;
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xa0d8f0);

    if (THREE.SRGBColorSpace) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    this.renderer.toneMappingExposure = 1.1;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    // Directional light 1
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20 + this.sceneYOffset, 10);
    this.scene.add(directionalLight);

    // Directional light 2
    const secondaryLight = new THREE.DirectionalLight(0xf5f5f5, 0.5);
    secondaryLight.position.set(-5, 15 + this.sceneYOffset, -10);
    this.scene.add(secondaryLight);

    this.camera.position.set(0, 1 + this.sceneYOffset, 5);
    this.scene.fog = new THREE.Fog(0xa0d8f0, 4, 14);
  }

  handleResize() {
    if (typeof window === 'undefined' || !this.renderer) return;

    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (wasMobile !== this.isMobile) {
      this.camera.fov = this.isMobile ? 90 : 75;
      this.camera.updateProjectionMatrix();
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createWalls(mazeConfig) {
    if (!this.scene) return;

    const floorGeometry = new THREE.PlaneGeometry(
      mazeConfig.width * mazeConfig.cellSize * 2,
      mazeConfig.height * mazeConfig.cellSize * 2
    );
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: mazeConfig.floorColor || 0x208020,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x002200,
      emissiveIntensity: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5 + this.sceneYOffset;
    this.scene.add(floor);

    const wallHeight = mazeConfig.wallHeight || 2;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: mazeConfig.wallColor || 0x808080,
      roughness: 0.5,
      metalness: 0.3,
      emissive: 0x101010,
      emissiveIntensity: 0.1
    });

    mazeConfig.walls.forEach((wall) => {
      const wallGeometry = new THREE.BoxGeometry(wall.width, wallHeight, wall.depth);
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(wall.x, wallHeight / 2 - 0.5 + this.sceneYOffset, wall.z);
      this.scene.add(wallMesh);
    });

    if (mazeConfig.startZone) {
      const startGeometry = new THREE.CircleGeometry(mazeConfig.cellSize * 0.4, 32);
      const startMaterial = new THREE.MeshStandardMaterial({
        color: mazeConfig.startColor || 0x2020ff,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.8,
        emissive: 0x0000ff,
        emissiveIntensity: 0.3
      });
      const startZone = new THREE.Mesh(startGeometry, startMaterial);
      startZone.rotation.x = -Math.PI / 2;
      startZone.position.set(
        mazeConfig.startZone.x,
        -0.48 + this.sceneYOffset,
        mazeConfig.startZone.z
      );
      this.scene.add(startZone);
    }

    if (mazeConfig.winZone) {
      const winGeometry = new THREE.CircleGeometry(mazeConfig.cellSize * 0.4, 32);
      const winMaterial = new THREE.MeshStandardMaterial({
        color: mazeConfig.winColor || 0xff2020,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.8,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
      });
      const winZone = new THREE.Mesh(winGeometry, winMaterial);
      winZone.rotation.x = -Math.PI / 2;
      winZone.position.set(
        mazeConfig.winZone.x,
        -0.48 + this.sceneYOffset,
        mazeConfig.winZone.z
      );
      this.scene.add(winZone);
    }
  }

  updateCameraPosition(playerPosition, playerRotation, delta) {
    if (!this.camera) return;
    const cameraHeight = 0.8;
    this.camera.position.x = playerPosition.x;
    this.camera.position.y = playerPosition.y + cameraHeight;
    this.camera.position.z = playerPosition.z;

    const lookAheadDistance = 0.7;
    const lookAtX = playerPosition.x + Math.sin(playerRotation) * lookAheadDistance;
    const lookAtZ = playerPosition.z + Math.cos(playerRotation) * lookAheadDistance;

    this.camera.lookAt(new THREE.Vector3(lookAtX, playerPosition.y + cameraHeight * 0.8, lookAtZ));
  }
}
