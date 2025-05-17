import { useEffect, useRef } from 'react';

const MiniMap = ({ mazeConfig, playerPosition, playerRotation, onClose }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!mazeConfig || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = mazeConfig.width;
    const height = mazeConfig.height;
    
    // Calculate a good cell size for the minimap
    const maxDimension = Math.max(width, height);
    const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
    const cellSize = Math.floor(maxSize / maxDimension);
    
    // Set canvas dimensions
    canvas.width = width * cellSize + 1;
    canvas.height = height * cellSize + 1;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#161B22';
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
    
    // Draw the grid with lighter lines for better visibility
    ctx.strokeStyle = '#8B949E'; // GitHub secondary text color
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
    
    // Mark player's current position
    if (playerPosition) {
      const { gridX, gridZ } = getGridCell(playerPosition.x, playerPosition.z);
      
      if (gridX >= 0 && gridX < width && gridZ >= 0 && gridZ < height) {
        // Define center coordinates for player
        const centerX = gridX * cellSize + cellSize/2;
        const centerY = gridZ * cellSize + cellSize/2;
        
        // Draw player indicator as a filled circle
        ctx.fillStyle = '#F0883E'; // Orange color for player
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator (triangle) on top of the circle
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        
        // Calculate radius for the triangle (smaller than the circle)
        const radius = cellSize/4;
        
        // Use player rotation to calculate triangle points
        // Make triangle point in the direction of player rotation
        const angle = playerRotation; // Player rotation in radians
        
        // Calculate triangle points - all starting from center
        // Tip point
        const tipX = centerX + Math.sin(angle) * radius;
        const tipY = centerY + Math.cos(angle) * radius;
        
        // Base points (perpendicular to direction)
        const baseX1 = centerX + Math.sin(angle - Math.PI/2) * radius * 0.5;
        const baseY1 = centerY + Math.cos(angle - Math.PI/2) * radius * 0.5;
        
        const baseX2 = centerX + Math.sin(angle + Math.PI/2) * radius * 0.5;
        const baseY2 = centerY + Math.cos(angle + Math.PI/2) * radius * 0.5;
        
        // Draw the triangle
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(baseX1, baseY1);
        ctx.lineTo(baseX2, baseY2);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Add labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Start', startZoneGridPos.gridX * cellSize + cellSize/2, startZoneGridPos.gridZ * cellSize - 5);
    ctx.fillText('Exit', winZoneGridPos.gridX * cellSize + cellSize/2, winZoneGridPos.gridZ * cellSize - 5);
    
  }, [mazeConfig, playerPosition, playerRotation]);

  return (
    <div className="minimap-overlay">
      <div className="minimap-container">
        <button className="minimap-close-btn" onClick={onClose}>×</button>
        <h2 className="minimap-title">Maze Map</h2>
        <canvas ref={canvasRef} className="minimap-canvas" />
        <div className="minimap-legend">
          <div className="legend-item">
            <span className="legend-color start-color"></span>
            <span>Start</span>
          </div>
          <div className="legend-item">
            <span className="legend-color player-color"></span>
            <span>You</span>
          </div>
          <div className="legend-item">
            <span className="legend-color exit-color"></span>
            <span>Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;
