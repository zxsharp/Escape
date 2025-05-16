import { generateMaze } from '../utils/mazeGenerator.js';

// Configure maze parameters
const mazeWidth = 15;  
const mazeHeight = 10; 
const cellSize = 2;    

const generatedMaze = generateMaze(mazeWidth, mazeHeight, cellSize);

// Export the complete maze configuration
export const mazeConfig = {
    // Base maze properties
    width: mazeWidth,
    height: mazeHeight, 
    cellSize: cellSize,
    wallHeight: 2,
    wallSize: 0.3,
    
    
    wallColor: 0xa3a09e,  // gray walls
    floorColor: 0x407521, // green floor
    startColor: 0x4040FF, // blue start zone
    winColor: 0xFF4040,   // red win zone
    
    // Include all properties from generated maze (walls, start/win zones)
    ...generatedMaze
};
