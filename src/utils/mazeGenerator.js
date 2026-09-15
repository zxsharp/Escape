import { createPRNG } from './prng.js';
import { CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS, COLOR_WALL, COLOR_FLOOR, COLOR_START, COLOR_WIN } from '../configs/constants.js';

class Cell {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    this.visited = false;
    this.walls = { top: true, right: true, bottom: true, left: true };
  }
}

/**
 * Generates a single-path solvable maze using Randomized Depth-First Search (DFS).
 * Supports deterministic seeded generation so multiplayer rooms share identical mazes.
 */
export function generateMaze(width, height, cellSize = CELL_SIZE, seed = null) {
  const rng = seed !== null ? createPRNG(seed) : Math.random;

  // Create grid of cells
  const grid = Array(height).fill(null).map((_, z) =>
    Array(width).fill(null).map((_, x) => new Cell(x, z))
  );

  function getNeighbors(cell) {
    const neighbors = [];
    const { x, z } = cell;

    if (z > 0) neighbors.push({ cell: grid[z - 1][x], dir: 'top' });
    if (x < width - 1) neighbors.push({ cell: grid[z][x + 1], dir: 'right' });
    if (z < height - 1) neighbors.push({ cell: grid[z + 1][x], dir: 'bottom' });
    if (x > 0) neighbors.push({ cell: grid[z][x - 1], dir: 'left' });

    return neighbors.filter(n => !n.cell.visited);
  }

  function removeWall(current, next, direction) {
    current.walls[direction] = false;
    switch (direction) {
      case 'top': next.walls.bottom = false; break;
      case 'right': next.walls.left = false; break;
      case 'bottom': next.walls.top = false; break;
      case 'left': next.walls.right = false; break;
    }
  }

  // Randomized Depth-First Search (DFS) algorithm with backtracking
  function generatePath() {
    const stack = [grid[0][0]];
    grid[0][0].visited = true;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getNeighbors(current);

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      // Pick a random unvisited neighbor using PRNG
      const randomIndex = Math.floor(rng() * neighbors.length);
      const { cell: next, dir } = neighbors[randomIndex];

      removeWall(current, next, dir);
      next.visited = true;
      stack.push(next);
    }
  }

  generatePath();

  // Create exit point by removing the right wall of the bottom-right cell
  const exitCell = grid[height - 1][width - 1];
  exitCell.walls.right = false;

  // Convert grid into 3D wall segments and spatial collision map
  const walls = [];
  const baseX = -width * cellSize / 2;
  const baseZ = -height * cellSize / 2;

  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[z][x];
      const worldX = baseX + x * cellSize;
      const worldZ = baseZ + z * cellSize;

      if (cell.walls.top) {
        walls.push({
          gridX: x, gridZ: z, dir: 'top',
          x: worldX + cellSize / 2,
          z: worldZ,
          width: cellSize,
          depth: WALL_THICKNESS
        });
      }

      if (cell.walls.right) {
        walls.push({
          gridX: x, gridZ: z, dir: 'right',
          x: worldX + cellSize,
          z: worldZ + cellSize / 2,
          width: WALL_THICKNESS,
          depth: cellSize
        });
      }

      if (cell.walls.bottom && z === height - 1) {
        walls.push({
          gridX: x, gridZ: z, dir: 'bottom',
          x: worldX + cellSize / 2,
          z: worldZ + cellSize,
          width: cellSize,
          depth: WALL_THICKNESS
        });
      }

      if (cell.walls.left && x === 0) {
        walls.push({
          gridX: x, gridZ: z, dir: 'left',
          x: worldX,
          z: worldZ + cellSize / 2,
          width: WALL_THICKNESS,
          depth: cellSize
        });
      }
    }
  }

  return {
    width,
    height,
    cellSize,
    wallHeight: WALL_HEIGHT,
    wallThickness: WALL_THICKNESS,
    wallColor: COLOR_WALL,
    floorColor: COLOR_FLOOR,
    startColor: COLOR_START,
    winColor: COLOR_WIN,
    grid,
    baseX,
    baseZ,
    walls,
    startZone: {
      x: baseX + cellSize / 2,
      z: baseZ + cellSize / 2,
      bounds: {
        minX: baseX,
        maxX: baseX + cellSize,
        minZ: baseZ,
        maxZ: baseZ + cellSize
      }
    },
    winZone: {
      x: baseX + width * cellSize + cellSize / 2,
      z: baseZ + (height - 0.5) * cellSize,
      bounds: {
        minX: baseX + (width - 0.5) * cellSize,
        maxX: baseX + width * cellSize + cellSize,
        minZ: baseZ + (height - 1) * cellSize - cellSize / 4,
        maxZ: baseZ + height * cellSize + cellSize / 4
      }
    }
  };
}
