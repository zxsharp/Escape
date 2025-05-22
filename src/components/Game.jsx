import { useEffect, useRef, useState } from 'react';
import { Player } from '../entities/Player.js';
import { SceneManager } from '../scene/SceneManager.js';
import * as THREE from 'three';
import VirtualControls from './VirtualControls.jsx';
import WinPopup from './WinPopup.jsx';
import MiniMap from './MiniMap.jsx';
import ConfirmationPopup from './ConfirmationPopup.jsx';
import InstructionPopup from './InstructionPopup.jsx';
import usePlayerControls from '../hooks/usePlayerControls.js';
import { initAudio } from '../utils/audio';

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
  const [showInstructions, setShowInstructions] = useState(false);
  const [playerState, setPlayerState] = useState({
    position: null,
    rotation: 0
  });
  
  // Mouse/touch rotation control variables
  const mouseControlRef = useRef({
    isMouseDown: false,
    lastMouseX: 0,
    MouseSensitivity: 0.003,
    TouchSensitivity: 0.006,
    isTouching: false,
    lastTouchX: 0,
  });
  
  // Use the player controls hook for movement handling
  const { activeKeys, handleVirtualButtonDown, handleVirtualButtonUp } = 
    usePlayerControls(playerRef, audioRefs);

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
  const handleFreeRoam = () => {
    setShowWinPopup(false);
  };
  
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
    // Initialize audio
    initAudio();
    
    // Initialize scene and player
    const canvas = canvasRef.current;
    // NEW: Ensure canvas is focusable and receives focus for key events
    if (canvas) {
      canvas.tabIndex = 0;
      canvas.focus();
    }
    const sceneManager = new SceneManager(canvas);
    const player = new Player(mazeConfig);
    
    // Modify player win handler
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
    
    // Show instruction popup when maze is first loaded
    setShowInstructions(true);
    
    // Handle window resizing
    const handleResize = () => sceneManager.handleResize();
    window.addEventListener('resize', handleResize);
    
    // Handle device orientation changes for mobile
    const handleOrientationChange = () => {
      // Wait for the resize event to complete
      setTimeout(() => {
        if (sceneManagerRef.current) {
          sceneManagerRef.current.handleResize();
        }
      }, 300);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);

    // Set up mouse controls for camera rotation
    const handleMouseDown = (e) => {
      mouseControlRef.current.isMouseDown = true;
      mouseControlRef.current.lastMouseX = e.clientX;
      canvas.style.cursor = 'grabbing';
    };
    const handleMouseUp = () => {
      mouseControlRef.current.isMouseDown = false;
      canvas.style.cursor = 'default';
    };
    const handleMouseMove = (e) => {
      if (mouseControlRef.current.isMouseDown && playerRef.current) {
        const deltaX = e.clientX - mouseControlRef.current.lastMouseX;
        mouseControlRef.current.lastMouseX = e.clientX;
        playerRef.current.rotation += deltaX * mouseControlRef.current.MouseSensitivity;
      }
    };

    // Touch controls for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        mouseControlRef.current.isTouching = true;
        mouseControlRef.current.lastTouchX = e.touches[0].clientX;
        canvas.style.cursor = 'grabbing';
      }
    };
    const handleTouchEnd = () => {
      mouseControlRef.current.isTouching = false;
      canvas.style.cursor = 'default';
    };
    const handleTouchMove = (e) => {
      if (mouseControlRef.current.isTouching && playerRef.current && e.touches.length === 1) {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - mouseControlRef.current.lastTouchX;
        mouseControlRef.current.lastTouchX = touchX;
        playerRef.current.rotation += deltaX * mouseControlRef.current.TouchSensitivity;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    // Add touch listeners for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Start the animation loop
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
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
      <canvas ref={canvasRef} id="canvas" tabIndex="0" />
      
      {/* Instruction Popup */}
      {showInstructions && <InstructionPopup />}
      
      {/* Back Button */}
      <button 
        className="back-button control-btn"
        onClick={onBackToMain}
        aria-label="Back"
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
          onFreeRoam={handleFreeRoam}
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
