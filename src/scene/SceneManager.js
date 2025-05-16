import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
    constructor(canvas) {
        this.setupScene(canvas);
        this.setupCamera();
        this.setupLights();
        this.cameraSpeed = 5; // Units per second
    }

    setupScene(canvas) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(1, 5, 8); // Initial position behind player
        this.camera.lookAt(1, 0, 1); // Look at initial player position
    }

    setupControls() {
        // Remove orbit controls as we'll control camera directly
        // Only keep this if you want to allow manual camera control for testing
        /* this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = true;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 30;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.minAzimuthAngle = -Math.PI / 180;
        this.controls.maxAzimuthAngle = Math.PI / 180;
        this.controls.target.set(7.5, 0, 7.5); */
    }

    updateCameraPosition(playerPosition, playerRotation, deltaTime) {
        // Calculate camera position behind player
        const offset = new THREE.Vector3(0, 1, 1);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation);
        
        // Smoothly interpolate camera position
        const targetPosition = playerPosition.clone().add(offset);
        this.camera.position.lerp(targetPosition, this.cameraSpeed * deltaTime);
        this.camera.lookAt(playerPosition);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 0);
        this.scene.add(ambientLight, directionalLight);
    }

    createWalls(mazeConfig) {
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const height = mazeConfig.height;
        
        mazeConfig.walls.forEach(wall => {
            if (!(wall.x === 15 && wall.z === 13.5 && wall.width === 1 && wall.depth === 2)) {
                const geometry = new THREE.BoxGeometry(wall.width, height, wall.depth);
                const wallMesh = new THREE.Mesh(geometry, wallMaterial);
                wallMesh.position.set(wall.x, height / 2, wall.z); // Center walls vertically
                this.scene.add(wallMesh);
            }
        });
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
