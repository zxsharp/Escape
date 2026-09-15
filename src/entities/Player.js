import * as THREE from 'three';
import { SCENE_Y_OFFSET, PLAYER_MOVE_SPEED, PLAYER_ROTATE_SPEED, PLAYER_COLLISION_RADIUS } from '../configs/constants.js';

export class Player {
  constructor(mazeConfig) {
    this.moveSpeed = PLAYER_MOVE_SPEED;
    this.rotationSpeed = PLAYER_ROTATE_SPEED;
    this.rotation = 0;
    this.keyStates = {};
    this.hasWon = false;
    this.onWin = null;

    this.winZone = mazeConfig.winZone;
    this.startZone = mazeConfig.startZone;
    this.sceneYOffset = SCENE_Y_OFFSET;
    this.mazeConfig = mazeConfig;

    this.position = new THREE.Vector3(
      this.startZone.x,
      0 + this.sceneYOffset,
      this.startZone.z
    );
  }

  // Update position based on input state and delta time
  update(walls, deltaTime) {
    const newPosition = this.position.clone();

    // Calculate forward vector based on current rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);

    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);

    // Keyboard movement state evaluation
    if (this.keyStates['ArrowDown'] || this.keyStates['KeyS']) {
      newPosition.add(forward.clone().multiplyScalar(this.moveSpeed * deltaTime));
    }
    if (this.keyStates['ArrowUp'] || this.keyStates['KeyW']) {
      newPosition.add(forward.clone().multiplyScalar(-this.moveSpeed * deltaTime));
    }
    if (this.keyStates['ArrowRight'] || this.keyStates['KeyD']) {
      newPosition.add(right.clone().multiplyScalar(-this.moveSpeed * deltaTime));
    }
    if (this.keyStates['ArrowLeft'] || this.keyStates['KeyA']) {
      newPosition.add(right.clone().multiplyScalar(this.moveSpeed * deltaTime));
    }

    // Check spatial collision before applying movement
    if (!this.checkSpatialCollision(newPosition, walls)) {
      this.position.copy(newPosition);
    }

    // Check if player stepped into the exit zone
    if (!this.hasWon && this.checkWinCondition(this.position)) {
      this.hasWon = true;
      if (this.onWin) {
        this.onWin();
      }
    }
  }

  checkWinCondition(position) {
    if (this.hasWon) return false;

    if (this.winZone) {
      // 1. Distance check to exit pad center
      if (this.winZone.x !== undefined && this.winZone.z !== undefined) {
        const dx = position.x - this.winZone.x;
        const dz = position.z - this.winZone.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const threshold = (this.mazeConfig.cellSize || 2) * 1.0;
        if (dist < threshold) {
          return true;
        }
      }

      // 2. Bounding box check
      if (this.winZone.bounds) {
        const isInExitZone =
          position.x >= this.winZone.bounds.minX - 0.5 &&
          position.x <= this.winZone.bounds.maxX + 0.5 &&
          position.z >= this.winZone.bounds.minZ - 0.5 &&
          position.z <= this.winZone.bounds.maxZ + 0.5;

        if (isInExitZone) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Spatial Grid Collision Check (O(1))
   * Converts world coordinates (x, z) to grid cell indices and only checks nearby wall segments.
   */
  checkSpatialCollision(position, walls) {
    const radius = PLAYER_COLLISION_RADIUS;
    const { cellSize, baseX, baseZ } = this.mazeConfig;

    if (baseX === undefined || baseZ === undefined) {
      return this.checkAABBCollision(position, walls, radius);
    }

    // Determine current grid cell coordinates
    const cellX = Math.floor((position.x - baseX) / cellSize);
    const cellZ = Math.floor((position.z - baseZ) / cellSize);

    // Only test walls belonging to the current cell and adjacent 8 neighbors
    for (const wall of walls) {
      if (
        wall.gridX !== undefined &&
        wall.gridZ !== undefined &&
        (Math.abs(wall.gridX - cellX) > 1 || Math.abs(wall.gridZ - cellZ) > 1)
      ) {
        continue;
      }

      const wallMinX = wall.x - wall.width / 2 - radius;
      const wallMaxX = wall.x + wall.width / 2 + radius;
      const wallMinZ = wall.z - wall.depth / 2 - radius;
      const wallMaxZ = wall.z + wall.depth / 2 + radius;

      if (
        position.x > wallMinX &&
        position.x < wallMaxX &&
        position.z > wallMinZ &&
        position.z < wallMaxZ
      ) {
        return true;
      }
    }

    return false;
  }

  checkAABBCollision(position, walls, radius) {
    for (const wall of walls) {
      const wallMinX = wall.x - wall.width / 2 - radius;
      const wallMaxX = wall.x + wall.width / 2 + radius;
      const wallMinZ = wall.z - wall.depth / 2 - radius;
      const wallMaxZ = wall.z + wall.depth / 2 + radius;

      if (
        position.x > wallMinX &&
        position.x < wallMaxX &&
        position.z > wallMinZ &&
        position.z < wallMaxZ
      ) {
        return true;
      }
    }
    return false;
  }
}
