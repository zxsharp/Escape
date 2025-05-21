class Cell {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.visited = false;
        this.walls = { top: true, right: true, bottom: true, left: true };
    }
}

export function generateMaze(width, height, cellSize = 2) {
    // Create grid of cells
    const grid = Array(height).fill().map((_, i) => 
        Array(width).fill().map((_, j) => new Cell(j, i))
    );
    
    function getNeighbors(cell) {
        const neighbors = [];
        const {x, z} = cell;
        
        if (z > 0) neighbors.push({cell: grid[z-1][x], dir: 'top'});
        if (x < width-1) neighbors.push({cell: grid[z][x+1], dir: 'right'});
        if (z < height-1) neighbors.push({cell: grid[z+1][x], dir: 'bottom'});
        if (x > 0) neighbors.push({cell: grid[z][x-1], dir: 'left'});
        
        return neighbors.filter(n => !n.cell.visited);
    }
    
    function removeWall(current, next, direction) {
        current.walls[direction] = false;
        switch(direction) {
            case 'top': next.walls.bottom = false; break;
            case 'right': next.walls.left = false; break;
            case 'bottom': next.walls.top = false; break;
            case 'left': next.walls.right = false; break;
        }
    }
    
    // Generate the maze using the Depth-First Search algorithm
    // This guarantees a perfect maze with exactly one path between any two points
    function generatePath() {
        // Start DFS
        const stack = [grid[0][0]]; // Start from top-left cell
        grid[0][0].visited = true;
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = getNeighbors(current);
            
            if (neighbors.length === 0) {
                stack.pop(); // Backtrack
                continue;
            }
            
            // Choose a random unvisited neighbor
            const randomIndex = Math.floor(Math.random() * neighbors.length);
            const {cell: next, dir} = neighbors[randomIndex];
            
            // Remove wall between current and next cell
            removeWall(current, next, dir);
            
            // Mark the next cell as visited and add to stack
            next.visited = true;
            stack.push(next);
        }
    }
    
    // Generate the maze
    generatePath();

    // Create exit point by removing the appropriate wall from the bottom-right cell
    const exitCell = grid[height-1][width-1];
    exitCell.walls.right = false; // Remove the right wall to create an exit

    // Convert grid to wall segments
    const walls = [];
    const baseX = -width * cellSize / 2;
    const baseZ = -height * cellSize / 2;
    const wallThickness = 0.3;

    // Add interior walls
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[z][x];
            const worldX = baseX + x * cellSize;
            const worldZ = baseZ + z * cellSize;

            // Top wall (except for top row which is handled in outer walls)
            if (cell.walls.top) {
                walls.push({
                    x: worldX + cellSize/2,
                    z: worldZ,
                    width: cellSize,
                    depth: wallThickness
                });
            }
            
            // Right wall
            if (cell.walls.right) {
                walls.push({
                    x: worldX + cellSize,
                    z: worldZ + cellSize/2,
                    width: wallThickness,
                    depth: cellSize
                });
            }
            
            // Bottom wall (only for bottom row)
            if (cell.walls.bottom && z === height-1) {
                walls.push({
                    x: worldX + cellSize/2,
                    z: worldZ + cellSize,
                    width: cellSize,
                    depth: wallThickness
                });
            }
            
            // Left wall (only for leftmost column)
            if (cell.walls.left && x === 0) {
                walls.push({
                    x: worldX,
                    z: worldZ + cellSize/2,
                    width: wallThickness,
                    depth: cellSize
                });
            }
        }
    }

    return {
        walls,
        startZone: {
            x: baseX + cellSize/2,
            z: baseZ + cellSize/2,
            bounds: {
                minX: baseX,
                maxX: baseX + cellSize,
                minZ: baseZ,
                maxZ: baseZ + cellSize
            }
        },
        winZone: {
            x: baseX + width*cellSize + cellSize/2, // Position center beyond the right wall
            z: baseZ + (height-0.5)*cellSize,       // Keep z-center at the final row
            bounds: {
                minX: baseX + (width-0.5)*cellSize, // Start win zone from middle of last cell
                maxX: baseX + width*cellSize + cellSize, // Extend beyond the right edge
                minZ: baseZ + (height-1)*cellSize - cellSize/4, // Widen the z-range a bit
                maxZ: baseZ + height*cellSize + cellSize/4
            }
        }
    };
}

// Helper function to visualize the maze in the console (useful for debugging)
export function printMaze(maze, width, height) {
    const output = [];
    
    // Top border
    output.push('#'.repeat(width * 2 + 1));
    
    for (let z = 0; z < height; z++) {
        let line = '#'; // Left border
        let bottomLine = '#';
        
        for (let x = 0; x < width; x++) {
            // Find if there's a wall object at this position
            const cellX = -maze.walls[0].width * width / 2 + x * maze.walls[0].width;
            const cellZ = -maze.walls[0].depth * height / 2 + z * maze.walls[0].depth;
            
            const hasRightWall = maze.walls.some(wall => 
                Math.abs(wall.x - (cellX + maze.walls[0].width)) < 0.1 && 
                Math.abs(wall.z - (cellZ + maze.walls[0].depth/2)) < 0.1);
            
            const hasBottomWall = maze.walls.some(wall => 
                Math.abs(wall.x - (cellX + maze.walls[0].width/2)) < 0.1 && 
                Math.abs(wall.z - (cellZ + maze.walls[0].depth)) < 0.1);
            
            line += ' ' + (hasRightWall ? '#' : ' ');
            bottomLine += (hasBottomWall ? '#' : ' ') + '#';
        }
        
        output.push(line);
        output.push(bottomLine);
    }
    
}
