import * as THREE from 'three';

class Player {
    constructor(mazeConfig) {
        this.moveSpeed = 3; // Units per second
        this.rotationSpeed = 2; // Radians per second
        this.rotation = 0;
        this.keyStates = {};
        this.hasWon = false;
       
        this.winZone = mazeConfig.winZone;
        this.startZone = mazeConfig.startZone;
        
        // Apply vertical offset from SceneManager
        this.sceneYOffset = -1.5; // Same value as in SceneManager
        
        // Simple position object instead of a mesh
        this.position = new THREE.Vector3(
            this.startZone.x,
            0 + this.sceneYOffset,
            this.startZone.z
        );
        
        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (event) => {
            this.keyStates[event.code] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keyStates[event.code] = false;
        });
    }

    update(walls, deltaTime) {
        const newPosition = this.position.clone();
        
        // Only check win condition if player hasn't won yet
        if (!this.hasWon && this.checkWinCondition(this.position)) {
            return; // Win condition is now handled by React component
        }

        // Handle rotation with deltaTime
        if (this.keyStates['ArrowLeft']) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        if (this.keyStates['ArrowRight']) {
            this.rotation -= this.rotationSpeed * deltaTime;
        }

        // Move in the direction player is facing
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        if (this.keyStates['ArrowDown']) {
            newPosition.add(forward.multiplyScalar(this.moveSpeed * deltaTime));
        }
        if (this.keyStates['ArrowUp']) {
            newPosition.add(forward.multiplyScalar(-this.moveSpeed * deltaTime));
        } 

        if (!this.checkCollision(newPosition, walls)) {
            this.position.copy(newPosition);
        }
    }

    // This will be overridden by App.jsx to use React state
    checkWinCondition(position) {
        if (this.hasWon) return false;
        
        // Check if we have bounds property in winZone
        if (this.winZone.bounds) {
            // Check if player is beyond the maze's right edge at the exit point
            const isInExitZone = position.x > this.winZone.bounds.minX && 
                               position.x < this.winZone.bounds.maxX && 
                               position.z > this.winZone.bounds.minZ && 
                               position.z < this.winZone.bounds.maxZ;
            
            // Also check player has moved beyond the right edge of the maze
            const hasExitedMaze = position.x > this.winZone.bounds.minX + 1;
            
            return isInExitZone && hasExitedMaze;
        }
        
        return false;
    }

    checkCollision(position, walls) {
        // fixed collision radius
        const collisionRadius = 0.1; 
        
        // Check wall collisions
        for (const wall of walls) {
            const wallMinX = wall.x - wall.width/2 - collisionRadius;
            const wallMaxX = wall.x + wall.width/2 + collisionRadius;
            const wallMinZ = wall.z - wall.depth/2 - collisionRadius;
            const wallMaxZ = wall.z + wall.depth/2 + collisionRadius;

            if (position.x > wallMinX && position.x < wallMaxX &&
                position.z > wallMinZ && position.z < wallMaxZ) {
                return true;
            }
        }

        return false;
    }
}

export { Player };
