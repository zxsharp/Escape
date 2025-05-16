import { generateMaze } from '../utils/mazeGenerator.js';

// Configure maze parameters
const mazeWidth = 10;  // Number of cells horizontally
const mazeHeight = 10; // Number of cells vertically
const cellSize = 2;    // Size of each cell

// Generate the maze with dimensions and cell size
const generatedMaze = generateMaze(mazeWidth, mazeHeight, cellSize);

// Export the complete maze configuration
export const mazeConfig = {
    // Base maze properties
    width: mazeWidth,
    height: mazeHeight, 
    cellSize: cellSize,
    wallHeight: 2,
    wallSize: 0.3,
    
    // Colors
    wallColor: 0x808080,  // Gray walls
    floorColor: 0x208020, // Green floor
    startColor: 0x2020ff, // Blue start zone
    winColor: 0xff2020,   // Red win zone
    
    // Include all properties from generated maze (walls, start/win zones)
    ...generatedMaze
};

// Log maze configuration for debugging
console.log("Maze configuration loaded with dimensions:", mazeWidth, "×", mazeHeight);
