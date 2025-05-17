import { useEffect, useRef, useState } from 'react';
import { Player } from '../entities/Player.js';
import { SceneManager } from '../scene/SceneManager.js';
import * as THREE from 'three';
import VirtualControls from './VirtualControls.jsx';
import WinPopup from './WinPopup.jsx';
import MiniMap from './MiniMap.jsx';
import ConfirmationPopup from './ConfirmationPopup.jsx';

const Game = ({ 
  mazeConfig, 
  onBackToMain, 
  onGameWin,
  audioRefs
}) => {
  const canvasRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const playerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showMapConfirmation, setShowMapConfirmation] = useState(false);
  const [playerState, setPlayerState] = useState({
    position: null,
    rotation: 0
  });
  
  // Track active keys for button highlighting
  const [activeKeys, setActiveKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false
  });

  // Win condition checker
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
  
  // Handle winning the game
  const handleWin = () => {
    setShowWinPopup(true);
    onGameWin();
  };
  
  // Handler for returning to starting position
  const handleReturnToStart = () => {
    if (playerRef.current) {
      // Reset position to start zone
      playerRef.current.position.set(
        mazeConfig.startZone.x,
        playerRef.current.sceneYOffset,
        mazeConfig.startZone.z
      );
      
      // Reset rotation to default
      playerRef.current.rotation = 0;
      
      // Play game start sound
      if (audioRefs.gameStartAudio) {
        audioRefs.gameStartAudio.currentTime = 0;
        audioRefs.gameStartAudio.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };
  
  // Handler for retrying the game
  const handleRetry = () => {
    // Hide win popup
    setShowWinPopup(false);
    
    // Reset player position to start position and reset win status
    if (playerRef.current) {
      // Reset position to start zone
      playerRef.current.position.set(
        mazeConfig.startZone.x,
        playerRef.current.sceneYOffset,
        mazeConfig.startZone.z
      );
      
      // Reset rotation to default
      playerRef.current.rotation = 0;
      
      // Reset win status
      playerRef.current.hasWon = false;
      
      // Play game start sound
      if (audioRefs.gameStartAudio) {
        audioRefs.gameStartAudio.currentTime = 0;
        audioRefs.gameStartAudio.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };
  
  // Handler for continuing after winning
  const handleContinue = () => {
    setShowWinPopup(false);
  };
  
  // Handler for virtual button press/release
  const handleVirtualButtonDown = (keyCode) => {
    if (playerRef.current) {
      playerRef.current.keyStates[keyCode] = true;
      setActiveKeys(prev => ({ ...prev, [keyCode]: true }));
      
      // Play movement sound for Up/Down
      if ((keyCode === 'ArrowUp' || keyCode === 'ArrowDown') && 
          audioRefs.playerMovingAudio && 
          audioRefs.playerMovingAudio.paused) {
        audioRefs.playerMovingAudio.play().catch(e => console.log("Audio play failed:", e));
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
          audioRefs.playerMovingAudio) {
        audioRefs.playerMovingAudio.pause();
      }
    }
  };
  
  // Check for movement to play sound
  useEffect(() => {
    if (playerRef.current) {
      const isMoving = 
        playerRef.current.keyStates['ArrowUp'] || 
        playerRef.current.keyStates['ArrowDown'] || 
        activeKeys['KeyW'] || 
        activeKeys['KeyS'];
      
      if (isMoving && audioRefs.playerMovingAudio && audioRefs.playerMovingAudio.paused) {
        audioRefs.playerMovingAudio.play().catch(e => console.log("Audio play failed:", e));
      } else if (!isMoving && audioRefs.playerMovingAudio && !audioRefs.playerMovingAudio.paused) {
        audioRefs.playerMovingAudio.pause();
      }
    }
  }, [activeKeys, audioRefs.playerMovingAudio]);
  
  // Animation function to capture player position for minimap
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    const delta = clockRef.current.getDelta();
    
    const player = playerRef.current;
    if (player) {
      player.update(mazeConfig.walls, delta);
      
      // Update player state for MiniMap - this ensures the map shows current position
      setPlayerState({
        position: { ...player.position },
        rotation: player.rotation
      });
      
      if (sceneManagerRef.current) {
        sceneManagerRef.current.updateCameraPosition(player.position, player.rotation, delta);
        sceneManagerRef.current.renderer.render(sceneManagerRef.current.scene, sceneManagerRef.current.camera);
      }
    }
  };

  // Initialize 3D game
  useEffect(() => {
    // Initialize scene and player
    const canvas = canvasRef.current;
    const sceneManager = new SceneManager(canvas);
    const player = new Player(mazeConfig);
    
    // Modify player to use our React win handler
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
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        setActiveKeys(prev => ({ ...prev, [e.code]: true }));
        
        // Map WASD to arrow keys for the player
        if (e.code === 'KeyW') player.keyStates['ArrowUp'] = true;
        if (e.code === 'KeyS') player.keyStates['ArrowDown'] = true;
        if (e.code === 'KeyA') player.keyStates['ArrowLeft'] = true;
        if (e.code === 'KeyD') player.keyStates['ArrowRight'] = true;
        
        // Play movement sound for forward/backward movement
        if ((e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') && 
            audioRefs.playerMovingAudio && 
            audioRefs.playerMovingAudio.paused) {
          audioRefs.playerMovingAudio.play().catch(err => console.log("Audio play failed:", err));
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        setActiveKeys(prev => ({ ...prev, [e.code]: false }));
        
        // Map WASD to arrow keys for the player
        if (e.code === 'KeyW') player.keyStates['ArrowUp'] = false;
        if (e.code === 'KeyS') player.keyStates['ArrowDown'] = false;
        if (e.code === 'KeyA') player.keyStates['ArrowLeft'] = false;
        if (e.code === 'KeyD') player.keyStates['ArrowRight'] = false;
        
        // Stop movement sound if all forward/backward movement keys are released
        if ((e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') &&
            !player.keyStates['ArrowUp'] && !player.keyStates['ArrowDown'] && 
            audioRefs.playerMovingAudio && !audioRefs.playerMovingAudio.paused) {
          audioRefs.playerMovingAudio.pause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Handle window resizing
    const handleResize = () => sceneManager.handleResize();
    window.addEventListener('resize', handleResize);

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
  }, [mazeConfig, audioRefs.playerMovingAudio]);

  // Handler for map button click - show confirmation first
  const handleMapButtonClick = () => {
    setShowMapConfirmation(true);
  };
  
  // Handler for confirmation dialog responses
  const handleConfirmMap = () => {
    setShowMapConfirmation(false);
    setShowMiniMap(true);
  };
  
  const handleCancelMap = () => {
    setShowMapConfirmation(false);
  };
  
  return (
    <>
      <canvas ref={canvasRef} id="canvas" />
      
      {/* Back to Main Menu Button */}
      <button 
        className="back-button control-btn"
        onClick={onBackToMain}
        aria-label="Back to main menu"
      >
        <div className="arrow arrow-left"></div>
      </button>
      
      {/* Return to Start Position Button */}
      <button 
        className="start-position-button control-btn"
        onClick={handleReturnToStart}
        aria-label="Return to start position"
      >
        <div className="start-icon"></div>
      </button>
      
      {/* View Map Button - positioned below other buttons */}
      <button 
        className="map-button control-btn"
        onClick={handleMapButtonClick} // show confirmation first
        aria-label="View maze map"
      >
        <div className="map-icon"></div>
      </button>
      
      {/* Map Confirmation Popup */}
      {showMapConfirmation && (
        <ConfirmationPopup
          title="Using the Map"
          message="Do you want to cheat and use the map?"
          confirmText="Yes, I'll Cheat"
          cancelText="No, I won't"
          onConfirm={handleConfirmMap}
          onCancel={handleCancelMap}
        />
      )}
      
      {/* MiniMap Component - shows player's current position */}
      {showMiniMap && (
        <MiniMap
          mazeConfig={mazeConfig}
          playerPosition={playerState.position}
          playerRotation={playerState.rotation}
          onClose={() => setShowMiniMap(false)}
        />
      )}
      
      {/* Win Popup */}
      {showWinPopup && (
        <WinPopup 
          onRetry={handleRetry}
          onMainMenu={onBackToMain}
          onContinue={handleContinue}
        />
      )}
      
      {/* Virtual Controls */}
      <VirtualControls 
        activeKeys={activeKeys}
        onButtonDown={handleVirtualButtonDown}
        onButtonUp={handleVirtualButtonUp}
      />
    </>
  );
};

export default Game;
