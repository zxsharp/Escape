import { mazeConfig } from './configs/mazeConfig.js';
import { Player } from './entities/Player.js';
import { SceneManager } from './scene/SceneManager.js';
import MazeMap from './components/MazeMap.jsx';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const canvasRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const playerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  
  // Track active keys for button highlighting
  const [activeKeys, setActiveKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  });
  
  // Handle winning the game
  const handleWin = () => {
    setShowWinPopup(true);
  };
  
  // Create a custom win condition checker
  const checkWin = (position, winZone) => {
    if (winZone.bounds) {
      const isInExitZone = position.x > winZone.bounds.minX && 
                          position.x < winZone.bounds.maxX && 
                          position.z > winZone.bounds.minZ && 
                          position.z < winZone.bounds.maxZ;
      
      const hasExitedMaze = position.x > winZone.bounds.minX + 1;
      
      return isInExitZone && hasExitedMaze;
    }
    return false;
  };
  
  useEffect(() => {
    // Only initialize the 3D scene after game has started
    if (!gameStarted) return;
    
    // Initialize scene and player
    const canvas = canvasRef.current;
    const sceneManager = new SceneManager(canvas);
    const player = new Player(mazeConfig);
    
    // Modify player to use our React win handler
    const originalCheckWinCondition = player.checkWinCondition;
    player.checkWinCondition = (position) => {
      if (player.hasWon) return false;
      
      if (checkWin(position, mazeConfig.winZone)) {
        player.hasWon = true;
        handleWin();
        return true;
      }
      
      return false;
    };
    
    sceneManagerRef.current = sceneManager;
    playerRef.current = player;

    // Create maze
    sceneManager.createWalls(mazeConfig);

    // Set up keyboard event tracking for highlighting buttons
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        setActiveKeys(prev => ({ ...prev, [e.code]: true }));
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        setActiveKeys(prev => ({ ...prev, [e.code]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Handle window resizing
    const handleResize = () => sceneManager.handleResize();
    window.addEventListener('resize', handleResize);

    // Animation function
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      
      player.update(mazeConfig.walls, delta);
      sceneManager.updateCameraPosition(player.position, player.rotation, delta);
      sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
    };

    // Start the animation loop
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted]); // Only run effect when gameStarted changes
  
  // Handler for virtual button press/release
  const handleVirtualButtonDown = (keyCode) => {
    if (playerRef.current) {
      playerRef.current.keyStates[keyCode] = true;
      setActiveKeys(prev => ({ ...prev, [keyCode]: true }));
    }
  };
  
  const handleVirtualButtonUp = (keyCode) => {
    if (playerRef.current) {
      playerRef.current.keyStates[keyCode] = false;
      setActiveKeys(prev => ({ ...prev, [keyCode]: false }));
    }
  };

  // Handler for starting the game
  const handleStartGame = () => {
    setGameStarted(true);
  };
  
  // Handler for retrying the game
  const handleRetry = () => {
    window.location.reload();
  };
  
  // Handler for continuing after winning
  const handleContinue = () => {
    setShowWinPopup(false);
  };
  
  return (
    <>
      {!gameStarted ? (
        <MazeMap mazeConfig={mazeConfig} onStartGame={handleStartGame} />
      ) : (
        <>
          <canvas ref={canvasRef} id="canvas" />
          
          {/* Win Popup - React Component */}
          {showWinPopup && (
            <div className="win-popup" style={{ display: 'flex' }}>
              <div className="popup-content">
                <h2>You Won!</h2>
                <button onClick={handleRetry}>Retry</button>
                <button onClick={handleContinue}>Continue</button>
              </div>
            </div>
          )}
          
          {/* Virtual Controls */}
          <div className="virtual-controls">
            <div 
              className={`control-btn up-btn ${activeKeys.ArrowUp ? 'active' : ''}`}
              onTouchStart={() => handleVirtualButtonDown('ArrowUp')}
              onTouchEnd={() => handleVirtualButtonUp('ArrowUp')}
              onMouseDown={() => handleVirtualButtonDown('ArrowUp')}
              onMouseUp={() => handleVirtualButtonUp('ArrowUp')}
              onMouseLeave={() => handleVirtualButtonUp('ArrowUp')}
            >
              <div className="arrow arrow-up"></div>
            </div>
            
            <div 
              className={`control-btn down-btn ${activeKeys.ArrowDown ? 'active' : ''}`}
              onTouchStart={() => handleVirtualButtonDown('ArrowDown')}
              onTouchEnd={() => handleVirtualButtonUp('ArrowDown')}
              onMouseDown={() => handleVirtualButtonDown('ArrowDown')}
              onMouseUp={() => handleVirtualButtonUp('ArrowDown')}
              onMouseLeave={() => handleVirtualButtonUp('ArrowDown')}
            >
              <div className="arrow arrow-down"></div>
            </div>
            
            <div 
              className={`control-btn left-btn ${activeKeys.ArrowLeft ? 'active' : ''}`}
              onTouchStart={() => handleVirtualButtonDown('ArrowLeft')}
              onTouchEnd={() => handleVirtualButtonUp('ArrowLeft')}
              onMouseDown={() => handleVirtualButtonDown('ArrowLeft')}
              onMouseUp={() => handleVirtualButtonUp('ArrowLeft')}
              onMouseLeave={() => handleVirtualButtonUp('ArrowLeft')}
            >
              <div className="arrow arrow-left"></div>
            </div>
            
            <div 
              className={`control-btn right-btn ${activeKeys.ArrowRight ? 'active' : ''}`}
              onTouchStart={() => handleVirtualButtonDown('ArrowRight')}
              onTouchEnd={() => handleVirtualButtonUp('ArrowRight')}
              onMouseDown={() => handleVirtualButtonDown('ArrowRight')}
              onMouseUp={() => handleVirtualButtonUp('ArrowRight')}
              onMouseLeave={() => handleVirtualButtonUp('ArrowRight')}
            >
              <div className="arrow arrow-right"></div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
