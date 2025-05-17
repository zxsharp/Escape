import { generateMaze } from './utils/mazeGenerator.js';
import { Player } from './entities/Player.js';
import { SceneManager } from './scene/SceneManager.js';
import MazeMap from './components/MazeMap.jsx';
import DifficultySelector from './components/DifficultySelector.jsx';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import './App.css';

// Import audio files directly
import playerMovingSound from './assets/player-moving.mp3';
import gameStartSound from './assets/game-start.mp3';
import gameWonSound from './assets/game-won.mp3';

function App() {
  // App state: 'difficulty', 'preview', or 'game'
  const [appState, setAppState] = useState('difficulty');
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [currentMazeConfig, setCurrentMazeConfig] = useState(null);
  
  const canvasRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const playerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  
  // Audio references
  const playerMovingAudioRef = useRef(null);
  const gameStartAudioRef = useRef(null);
  const gameWonAudioRef = useRef(null);
  
  // Handler for difficulty selection
  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setAppState('preview');
  };
  
  // Handler for starting the game
  const handleStartGame = () => {
    setAppState('game');
    // Play game start sound
    if (gameStartAudioRef.current) {
      gameStartAudioRef.current.currentTime = 0;
      gameStartAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };
  
  // Generate maze config based on difficulty
  useEffect(() => {
    if (!difficulty) return;
    
    // Set loading state
    setCurrentMazeConfig(null);
    
    // Generate maze with small delay to allow UI to update
    setTimeout(() => {
      const cellSize = 2;
      const generatedMaze = generateMaze(difficulty.width, difficulty.height, cellSize);
      
      setCurrentMazeConfig({
        // Base maze properties
        width: difficulty.width,
        height: difficulty.height, 
        cellSize: cellSize,
        wallHeight: 2,
        wallSize: 0.3,
        
        // Colors
        wallColor: 0xa3a09e,  // gray walls
        floorColor: 0x407521, // green floor
        startColor: 0x4040FF, // blue start zone
        winColor: 0xFF4040,   // red win zone
        
        // Include all properties from generated maze
        ...generatedMaze
      });
    }, 10);
  }, [difficulty]);
  
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
    
    // Play winning sound
    if (gameWonAudioRef.current) {
      gameWonAudioRef.current.currentTime = 0;
      gameWonAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Stop movement sound if it's playing
    if (playerMovingAudioRef.current) {
      playerMovingAudioRef.current.pause();
    }
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
  
  // Initialize 3D game
  useEffect(() => {
    // Only initialize the 3D scene when in game state and maze is generated
    if (appState !== 'game' || !currentMazeConfig) return;
    
    // Initialize scene and player
    const canvas = canvasRef.current;
    const sceneManager = new SceneManager(canvas);
    const player = new Player(currentMazeConfig);
    
    // Modify player to use our React win handler
    const originalCheckWinCondition = player.checkWinCondition;
    player.checkWinCondition = (position) => {
      if (player.hasWon) return false;
      
      if (checkWin(position, currentMazeConfig.winZone)) {
        player.hasWon = true;
        handleWin();
        return true;
      }
      
      return false;
    };
    
    sceneManagerRef.current = sceneManager;
    playerRef.current = player;

    // Create maze
    sceneManager.createWalls(currentMazeConfig);

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
      
      player.update(currentMazeConfig.walls, delta);
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
  }, [appState, currentMazeConfig]); // Run effect when appState or currentMazeConfig changes
  
  // Handler for virtual button press/release
  const handleVirtualButtonDown = (keyCode) => {
    if (playerRef.current) {
      playerRef.current.keyStates[keyCode] = true;
      setActiveKeys(prev => ({ ...prev, [keyCode]: true }));
      
      // Play movement sound for Up/Down
      if ((keyCode === 'ArrowUp' || keyCode === 'ArrowDown') && 
          playerMovingAudioRef.current && 
          playerMovingAudioRef.current.paused) {
        playerMovingAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };
  
  const handleVirtualButtonUp = (keyCode) => {
    if (playerRef.current) {
      playerRef.current.keyStates[keyCode] = false;
      setActiveKeys(prev => ({ ...prev, [keyCode]: false }));
      
      // Stop movement sound if both Up/Down are released
      if ((keyCode === 'ArrowUp' || keyCode === 'ArrowDown') && 
          playerRef.current.keyStates['ArrowUp'] === false && 
          playerRef.current.keyStates['ArrowDown'] === false && 
          playerMovingAudioRef.current) {
        playerMovingAudioRef.current.pause();
      }
    }
  };
  
  // Handler for retrying the game - replace with reset position functionality
  const handleRetry = () => {
    // Hide win popup
    setShowWinPopup(false);
    
    // Reset player position to start position and reset win status
    if (playerRef.current) {
      // Reset position to start zone
      playerRef.current.position.set(
        currentMazeConfig.startZone.x,
        playerRef.current.sceneYOffset,
        currentMazeConfig.startZone.z
      );
      
      // Reset rotation to default
      playerRef.current.rotation = 0;
      
      // Reset win status
      playerRef.current.hasWon = false;
      
      // Play game start sound
      if (gameStartAudioRef.current) {
        gameStartAudioRef.current.currentTime = 0;
        gameStartAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };
  
  // Handler for continuing after winning
  const handleContinue = () => {
    setShowWinPopup(false);
  };
  
  // Handler for going back to difficulty selection
  const handleBackToMain = () => {
    // Reset game state
    setAppState('difficulty');
    setShowWinPopup(false);
    setCurrentMazeConfig(null);
    
    // Cancel animation frame if it's running
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop any audio playing
    if (playerMovingAudioRef.current) {
      playerMovingAudioRef.current.pause();
      playerMovingAudioRef.current.currentTime = 0;
    }
  };
  
  // Check for movement to play sound
  useEffect(() => {
    if (appState === 'game' && playerRef.current) {
      const isMoving = playerRef.current.keyStates['ArrowUp'] || playerRef.current.keyStates['ArrowDown'];
      
      if (isMoving && playerMovingAudioRef.current && playerMovingAudioRef.current.paused) {
        playerMovingAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else if (!isMoving && playerMovingAudioRef.current && !playerMovingAudioRef.current.paused) {
        playerMovingAudioRef.current.pause();
      }
    }
  }, [activeKeys, appState]);
  
  // Create audio elements on first render
  useEffect(() => {
    // Player movement sound (looping)
    playerMovingAudioRef.current = new Audio(playerMovingSound);
    playerMovingAudioRef.current.loop = true;
    playerMovingAudioRef.current.volume = 0.4;
    
    // Game start sound (once)
    gameStartAudioRef.current = new Audio(gameStartSound);
    gameStartAudioRef.current.volume = 0.6;
    
    // Game won sound (once)
    gameWonAudioRef.current = new Audio(gameWonSound);
    gameWonAudioRef.current.volume = 0.6;
    
    // Cleanup
    return () => {
      if (playerMovingAudioRef.current) {
        playerMovingAudioRef.current.pause();
        playerMovingAudioRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // Render the appropriate view based on app state
  return (
    <>
      {appState === 'difficulty' && (
        <DifficultySelector onDifficultySelect={handleDifficultySelect} />
      )}
      
      {appState === 'preview' && (
        <MazeMap 
          mazeConfig={currentMazeConfig} 
          onStartGame={handleStartGame}
          onBackClick={handleBackToMain} // Add the back button handler
        />
      )}
      
      {appState === 'game' && (
        <>
          <canvas ref={canvasRef} id="canvas" />
          
          {/* Back to Main Menu Button */}
          <button 
            className="back-button control-btn"
            onClick={handleBackToMain}
            aria-label="Back to main menu"
          >
            <div className="arrow arrow-left"></div>
          </button>
          
          {/* Win Popup - React Component */}
          {showWinPopup && (
            <div className="win-popup" style={{ display: 'flex' }}>
              <div className="popup-content">
                <h2>You Won!</h2>
                <button onClick={handleRetry}>Retry</button>
                <button onClick={handleBackToMain}>Main Menu</button>
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
