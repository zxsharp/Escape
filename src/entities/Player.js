import * as THREE from 'three';

export class Player {
    constructor(mazeConfig) {
        this.moveSpeed = 3; // Units per second
        this.rotationSpeed = 2; // Radians per second
        this.rotation = 0;
        this.keyStates = {};
        this.hasWon = false;
        this.playerSize = 0.1;
        this.winZone = mazeConfig.winZone;
        this.startZone = mazeConfig.startZone;
        this.createPlayer();
        this.setupControls();
    }

    createPlayer() {
        const playerGeometry = new THREE.SphereGeometry(this.playerSize, 32, 32);
        const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.mesh.position.set(this.startZone.x, 0, this.startZone.z);
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
        const newPosition = this.mesh.position.clone();
        
        // Only check win condition if player hasn't won yet
        if (!this.hasWon && this.checkWinCondition(this.mesh.position)) {
            console.log("Win condition met!");
            const winPopup = document.querySelector('.win-popup');
            if (winPopup) {
                winPopup.style.display = 'flex';
                this.hasWon = true;
                return;
            } else {
                console.error("Win popup element not found!");
            }
        }

        // Handle rotation with deltaTime
        if (this.keyStates['ArrowLeft']) {
            this.rotation += this.rotationSpeed * deltaTime;
            this.mesh.rotation.y = this.rotation;
        }
        if (this.keyStates['ArrowRight']) {
            this.rotation -= this.rotationSpeed * deltaTime;
            this.mesh.rotation.y = this.rotation;
        }

        // Move in the direction player is facing
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        if (this.keyStates['ArrowUp']) {
            newPosition.add(forward.multiplyScalar(this.moveSpeed * deltaTime));
        }
        if (this.keyStates['ArrowDown']) {
            newPosition.add(forward.multiplyScalar(-this.moveSpeed * deltaTime));
        }

        if (!this.checkCollision(newPosition, walls)) {
            this.mesh.position.copy(newPosition);
        }
    }

    checkWinCondition(position) {
        if (this.hasWon) return false;
        
        // Check if we have bounds property in winZone (new structure)
        if (this.winZone.bounds) {
            // Check if player is beyond the maze's right edge at the exit point
            const isInExitZone = position.x > this.winZone.bounds.minX && 
                               position.x < this.winZone.bounds.maxX && 
                               position.z > this.winZone.bounds.minZ && 
                               position.z < this.winZone.bounds.maxZ;
            
            // Also check player has moved beyond the right edge of the maze
            const hasExitedMaze = position.x > this.winZone.bounds.minX + 1;
            
            return isInExitZone && hasExitedMaze;
        } else {
            // Fallback to old structure (should not happen anymore)
            return position.x > this.winZone.minX && 
                   position.x < this.winZone.maxX && 
                   position.z > this.winZone.minZ && 
                   position.z < this.winZone.maxZ;
        }
    }

    checkCollision(position, walls) {
        // Check wall collisions
        for (const wall of walls) {
            const wallMinX = wall.x - wall.width/2 - this.playerSize;
            const wallMaxX = wall.x + wall.width/2 + this.playerSize;
            const wallMinZ = wall.z - wall.depth/2 - this.playerSize;
            const wallMaxZ = wall.z + wall.depth/2 + this.playerSize;

            if (position.x > wallMinX && position.x < wallMaxX &&
                position.z > wallMinZ && position.z < wallMaxZ) {
                return true;
            }
        }

        return false;
    }
}
