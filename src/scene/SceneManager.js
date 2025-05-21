import * as THREE from 'three';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        
        // Detect if user is on mobile device
        this.isMobile = window.innerWidth <= 768;
        
        // Adjust field of view based on device type
        // Use wider FOV (90) on mobile for better visibility, 75 on desktop
        const fov = this.isMobile ? 90 : 75;
        
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        
        // Define the vertical offset for the entire scene
        this.sceneYOffset = -1.5; // Shift everything down by 1.5 units
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Brighter sky blue background (increased brightness)
        this.renderer.setClearColor(0xA0D8F0); 
        
        // Increase the overall scene brightness
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMappingExposure = 1.1; // Higher exposure for brighter scene
        
        // Add ambient light with increased intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased from 0.6 to 1.0
        this.scene.add(ambientLight);
        
        // Add directional light (sunlight) with increased intensity
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased from 0.8 to 1.2
        directionalLight.position.set(10, 20 + this.sceneYOffset, 10);
        this.scene.add(directionalLight);
        
        // Add a second directional light to reduce shadows and increase brightness
        const secondaryLight = new THREE.DirectionalLight(0xf5f5f5, 0.5);
        secondaryLight.position.set(-5, 15 + this.sceneYOffset, -10);
        this.scene.add(secondaryLight);
        
        // Set initial camera position with the Y offset
        this.camera.position.set(0, 1 + this.sceneYOffset, 5);
        
        // Add lighter fog for atmosphere
        this.scene.fog = new THREE.Fog(0xA0D8F0, 4, 14); // Brighter fog that's visible a bit further
    }

    handleResize() {
        // Update mobile status on resize
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // If switching between mobile and desktop, update the FOV
        if (wasMobile !== this.isMobile) {
            this.camera.fov = this.isMobile ? 90 : 75;
            this.camera.updateProjectionMatrix();
        }
        
        // Standard resize handling
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createWalls(mazeConfig) {
        // Create floor with the Y offset and brighter material
        const floorGeometry = new THREE.PlaneGeometry(
            mazeConfig.width * mazeConfig.cellSize * 2, 
            mazeConfig.height * mazeConfig.cellSize * 2
        );
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: mazeConfig.floorColor || 0x208020,
            roughness: 0.9, // Reduced roughness for more light reflection
            metalness: 0.1, // Slight metalness for shine
            emissive: 0x002200, // Subtle emissive glow
            emissiveIntensity: 0.2 // Low intensity so it's not too bright
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.5 + this.sceneYOffset; // Apply Y offset to floor
        this.scene.add(floor);

        // Create walls with the Y offset and brighter material
        const wallHeight = mazeConfig.wallHeight || 2;
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: mazeConfig.wallColor || 0x808080,
            roughness: 0.5, // Reduced roughness for more light reflection
            metalness: 0.3, // Slight metalness for shine
            emissive: 0x101010, // Subtle emissive glow
            emissiveIntensity: 0.1 // Low intensity so it's not too bright
        });

        mazeConfig.walls.forEach(wall => {
            const wallGeometry = new THREE.BoxGeometry(wall.width, wallHeight, wall.depth);
            const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
            wallMesh.position.set(wall.x, (wallHeight / 2 - 0.5) + this.sceneYOffset, wall.z);
            this.scene.add(wallMesh);
        });

        // Create brighter start zone indicator
        if (mazeConfig.startZone) {
            const startGeometry = new THREE.CircleGeometry(mazeConfig.cellSize * 0.4, 32);
            const startMaterial = new THREE.MeshStandardMaterial({ 
                color: mazeConfig.startColor || 0x2020ff,
                roughness: 0.3, // Smoother surface for more shine
                metalness: 0.2, // More metalness for reflection
                transparent: true,
                opacity: 0.8, // Slightly higher opacity for visibility
                emissive: 0x0000ff, // Blue glow
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

        // Create brighter win zone indicator
        if (mazeConfig.winZone) {
            const winGeometry = new THREE.CircleGeometry(mazeConfig.cellSize * 0.4, 32);
            const winMaterial = new THREE.MeshStandardMaterial({ 
                color: mazeConfig.winColor || 0xff2020,
                roughness: 0.3, // Smoother surface for more shine
                metalness: 0.2, // More metalness for reflection
                transparent: true,
                opacity: 0.8, // Slightly higher opacity for visibility
                emissive: 0xff0000, // Red glow
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
        // Position camera exactly at player position (first person view)
        const cameraHeight = 0.8; // Reduced height to be closer to eye level
        
        // Set camera position to player position
        this.camera.position.x = playerPosition.x;
        this.camera.position.y = playerPosition.y + cameraHeight;
        this.camera.position.z = playerPosition.z;
        
        // Calculate look-ahead point based on player's rotation
        const lookAheadDistance = 0.7; // Increased look ahead distance for better perspective
        const lookAtX = playerPosition.x + Math.sin(playerRotation) * lookAheadDistance;
        const lookAtZ = playerPosition.z + Math.cos(playerRotation) * lookAheadDistance;
        
        // Point camera in the direction the player is facing
        this.camera.lookAt(new THREE.Vector3(lookAtX, playerPosition.y + cameraHeight * 0.8, lookAtZ));
    }
}
