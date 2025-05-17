import { useEffect, useRef, useState } from 'react';
import './MazeMap.css';

const MazeMap = ({ mazeConfig, onStartGame }) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    // Skip if mazeConfig is not available yet
    if (!mazeConfig) return;
    
    const calculateCanvasSize = () => {
      const width = mazeConfig.width;
      const height = mazeConfig.height;
      
      // Calculate the maximum cell size that will fit the screen
      const maxWidth = Math.min(window.innerWidth * 0.95, 1200);
      const maxHeight = Math.min(window.innerHeight * 1.2, 1200);
      
      const cellSizeByWidth = Math.floor(maxWidth / width);
      const cellSizeByHeight = Math.floor(maxHeight / height);
      
      // Use the smaller cell size to ensure it fits both dimensions
      const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, 60);
      
      setCanvasSize({
        width: width * cellSize + 1,
        height: height * cellSize + 1,
        cellSize
      });
    };
    
    calculateCanvasSize();
    window.addEventListener('resize', calculateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', calculateCanvasSize);
    };
  }, [mazeConfig?.width, mazeConfig?.height]);
  
  useEffect(() => {
    // Skip if mazeConfig or canvas is not available yet
    if (!mazeConfig || !canvasSize.cellSize) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = mazeConfig.width;
    const height = mazeConfig.height;
    const cellSize = canvasSize.cellSize;
    
    // Set canvas dimensions
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate walls in a 2D grid format from the 3D wall coordinates
    const grid = Array(height).fill().map(() => 
      Array(width).fill().map(() => ({ top: false, right: false, bottom: false, left: false }))
    );
    
    // Helper to convert from 3D coordinates to grid indices
    const getGridCell = (x, z) => {
      const baseX = -width * mazeConfig.cellSize / 2;
      const baseZ = -height * mazeConfig.cellSize / 2;
      
      const gridX = Math.floor((x - baseX) / mazeConfig.cellSize);
      const gridZ = Math.floor((z - baseZ) / mazeConfig.cellSize);
      
      return { gridX, gridZ };
    };
    
    // Process walls to determine which grid cells have walls
    mazeConfig.walls.forEach(wall => {
      // Horizontal walls (depth is small)
      if (wall.depth < wall.width) {
        const { gridX, gridZ } = getGridCell(wall.x - wall.width/2 + mazeConfig.cellSize/2, wall.z);
        
        if (gridZ >= 0 && gridZ < height && gridX >= 0 && gridX < width) {
          if (wall.z < (-height * mazeConfig.cellSize / 2) + (gridZ * mazeConfig.cellSize) + mazeConfig.cellSize/2) {
            grid[gridZ][gridX].top = true;
          } else {
            grid[gridZ][gridX].bottom = true;
          }
        }
      } 
      // Vertical walls (width is small)
      else {
        const { gridX, gridZ } = getGridCell(wall.x, wall.z - wall.depth/2 + mazeConfig.cellSize/2);
        
        if (gridZ >= 0 && gridZ < height && gridX >= 0 && gridX < width) {
          if (wall.x < (-width * mazeConfig.cellSize / 2) + (gridX * mazeConfig.cellSize) + mazeConfig.cellSize/2) {
            grid[gridZ][gridX].left = true;
          } else {
            grid[gridZ][gridX].right = true;
          }
        }
      }
    });
    
    // Draw the grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    
    // Draw cells with their walls
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[z][x];
        const pixelX = x * cellSize;
        const pixelY = z * cellSize;
        
        // Draw walls
        if (cell.top) {
          ctx.beginPath();
          ctx.moveTo(pixelX, pixelY);
          ctx.lineTo(pixelX + cellSize, pixelY);
          ctx.stroke();
        }
        
        if (cell.right) {
          ctx.beginPath();
          ctx.moveTo(pixelX + cellSize, pixelY);
          ctx.lineTo(pixelX + cellSize, pixelY + cellSize);
          ctx.stroke();
        }
        
        if (cell.bottom) {
          ctx.beginPath();
          ctx.moveTo(pixelX, pixelY + cellSize);
          ctx.lineTo(pixelX + cellSize, pixelY + cellSize);
          ctx.stroke();
        }
        
        if (cell.left) {
          ctx.beginPath();
          ctx.moveTo(pixelX, pixelY);
          ctx.lineTo(pixelX, pixelY + cellSize);
          ctx.stroke();
        }
      }
    }
    
    // Identify and mark start zone
    const startZoneGridPos = getGridCell(
      mazeConfig.startZone.x, 
      mazeConfig.startZone.z
    );
    
    ctx.fillStyle = '#4040FF';
    ctx.fillRect(
      startZoneGridPos.gridX * cellSize + cellSize/4, 
      startZoneGridPos.gridZ * cellSize + cellSize/4, 
      cellSize/2, cellSize/2
    );
    
    // Identify and mark win zone
    const winZoneGridPos = getGridCell(
      mazeConfig.winZone.x - mazeConfig.cellSize, 
      mazeConfig.winZone.z
    );
    
    ctx.fillStyle = '#FF4040';
    ctx.fillRect(
      winZoneGridPos.gridX * cellSize + cellSize/4, 
      winZoneGridPos.gridZ * cellSize + cellSize/4, 
      cellSize/2, cellSize/2
    );
    
    // Add labels if there's enough space
    if (cellSize > 15) {
      ctx.fillStyle = '#000';
      ctx.font = `${Math.max(10, cellSize/3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Start', startZoneGridPos.gridX * cellSize + cellSize/2, startZoneGridPos.gridZ * cellSize - 5);
      ctx.fillText('Exit', winZoneGridPos.gridX * cellSize + cellSize/2, winZoneGridPos.gridZ * cellSize - 5);
    }
    
  }, [mazeConfig, canvasSize]);
  
  return (
    <div className="maze-map-container">
      <h2>Maze Preview</h2>
      <p>Remember your way from the blue start point to the red exit!</p>
      
      <div className="canvas-container">
        {mazeConfig ? (
          <canvas ref={canvasRef} className="maze-map-canvas"></canvas>
        ) : (
          <div className="loading-message">Generating maze...</div>
        )}
      </div>
      
      
      <div className="start-game-btn-container">
        <button 
          className="start-game-btn" 
          onClick={onStartGame}
          disabled={!mazeConfig}
        >
          {mazeConfig ? 'Start Game' : 'Generating Maze...'}
        </button>
      </div>
    </div>
  );
};

export default MazeMap;
