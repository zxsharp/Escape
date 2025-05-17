// This file is now deprecated as we generate maze configurations dynamically
// based on selected difficulty in App.jsx

// For backwards compatibility, export a default config
import { generateMaze } from '../utils/mazeGenerator.js';

// Default to Easy difficulty
const mazeWidth = 10;  
const mazeHeight = 10; 
const cellSize = 2;    

const generatedMaze = generateMaze(mazeWidth, mazeHeight, cellSize);

export const mazeConfig = {
    width: mazeWidth,
    height: mazeHeight, 
    cellSize: cellSize,
    wallHeight: 2,
    wallSize: 0.3,
    
    wallColor: 0xa3a09e,
    floorColor: 0x407521,
    startColor: 0x4040FF,
    winColor: 0xFF4040,
    
    ...generatedMaze
};
