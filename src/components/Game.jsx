import { useEffect, useRef, useState } from 'react';
import { Player } from '../entities/Player.js';
import { SceneManager } from '../scene/SceneManager.js';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
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
  audioRefs,
  finishTimeMs = null,
  isMultiplayer = false,
  winnerName = null
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
  const [webGlError, setWebGlError] = useState(false);
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

  // Reliable Win condition checker
  const checkWin = (position, winZone) => {
    if (!winZone || !position) return false;
    
    // 1. Radial distance check to exit center
    if (winZone.x !== undefined && winZone.z !== undefined) {
      const dx = position.x - winZone.x;
      const dz = position.z - winZone.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const threshold = (mazeConfig?.cellSize || 2) * 1.0;
      if (dist < threshold) {
        return true;
      }
    }

    // 2. Bounding box check
    if (winZone.bounds) {
      const isInExitZone = 
        position.x >= winZone.bounds.minX - 0.5 && 
        position.x <= winZone.bounds.maxX + 0.5 && 
        position.z >= winZone.bounds.minZ - 0.5 && 
        position.z <= winZone.bounds.maxZ + 0.5;
      
      if (isInExitZone) {
        return true;
      }
    }

    return false;
  };
  
  // Handle winning the game
  const handleWin = () => {
    setShowWinPopup(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log("Confetti trigger:", e);
    }
    if (onGameWin) {
      onGameWin();
    }
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
      if (audioRefs?.gameStartAudio) {
        audioRefs.gameStartAudio.currentTime = 0;
        audioRefs.gameStartAudio.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };
  
  // Handler for retrying the game
  const handleRetry = () => {
    setShowWinPopup(false);
    
    if (playerRef.current) {
      playerRef.current.position.set(
        mazeConfig.startZone.x,
        playerRef.current.sceneYOffset,
        mazeConfig.startZone.z
      );
      playerRef.current.rotation = 0;
      playerRef.current.hasWon = false;
      
      if (audioRefs?.gameStartAudio) {
        audioRefs.gameStartAudio.currentTime = 0;
        audioRefs.gameStartAudio.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };
  
  // Handler for continuing after winning
  const handleFreeRoam = () => {
    setShowWinPopup(false);
  };
  
  // Animation function to update player physics, camera, and win state
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    const delta = clockRef.current.getDelta();
    
    const player = playerRef.current;
    if (player) {
      player.update(mazeConfig.walls, delta);
      
      // Check win condition every frame
      if (!player.hasWon && checkWin(player.position, mazeConfig.winZone)) {
        player.hasWon = true;
        handleWin();
      }

      // Update player state for MiniMap
      setPlayerState({
        position: { ...player.position },
        rotation: player.rotation
      });
      
      if (sceneManagerRef.current && sceneManagerRef.current.renderer) {
        sceneManagerRef.current.updateCameraPosition(player.position, player.rotation, delta);
        sceneManagerRef.current.renderer.render(sceneManagerRef.current.scene, sceneManagerRef.current.camera);
      }
    }
  };

  // Initialize 3D game
  useEffect(() => {
    initAudio();
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.tabIndex = 0;
      canvas.focus();
    }

    const player = new Player(mazeConfig);
    player.onWin = () => {
      handleWin();
    };
    player.checkWinCondition = (position) => {
      if (player.hasWon) return false;
      if (checkWin(position, mazeConfig.winZone)) {
        player.hasWon = true;
        handleWin();
        return true;
      }
      return false;
    };
    playerRef.current = player;

    try {
      const sceneManager = new SceneManager(canvas);
      sceneManagerRef.current = sceneManager;
      sceneManager.createWalls(mazeConfig);
      setWebGlError(false);
    } catch (err) {
      console.warn("WebGL could not be initialized:", err);
      setWebGlError(true);
      setShowMiniMap(true);
    }
    
    setShowInstructions(true);
    
    const handleResize = () => {
      if (sceneManagerRef.current) sceneManagerRef.current.handleResize();
    };
    window.addEventListener('resize', handleResize);
    
    const handleOrientationChange = () => {
      setTimeout(() => {
        if (sceneManagerRef.current) {
          sceneManagerRef.current.handleResize();
        }
      }, 300);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);

    // Mouse look handlers
    const handleMouseDown = (e) => {
      mouseControlRef.current.isMouseDown = true;
      mouseControlRef.current.lastMouseX = e.clientX;
      if (canvas) canvas.style.cursor = 'grabbing';
    };
    const handleMouseUp = () => {
      mouseControlRef.current.isMouseDown = false;
      if (canvas) canvas.style.cursor = 'default';
    };
    const handleMouseMove = (e) => {
      if (mouseControlRef.current.isMouseDown && playerRef.current) {
        const deltaX = e.clientX - mouseControlRef.current.lastMouseX;
        mouseControlRef.current.lastMouseX = e.clientX;
        playerRef.current.rotation += deltaX * mouseControlRef.current.MouseSensitivity;
      }
    };

    // Touch look handlers
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        mouseControlRef.current.isTouching = true;
        mouseControlRef.current.lastTouchX = e.touches[0].clientX;
        if (canvas) canvas.style.cursor = 'grabbing';
      }
    };
    const handleTouchEnd = () => {
      mouseControlRef.current.isTouching = false;
      if (canvas) canvas.style.cursor = 'default';
    };
    const handleTouchMove = (e) => {
      if (mouseControlRef.current.isTouching && playerRef.current && e.touches.length === 1) {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - mouseControlRef.current.lastTouchX;
        mouseControlRef.current.lastTouchX = touchX;
        playerRef.current.rotation += deltaX * mouseControlRef.current.TouchSensitivity;
      }
    };

    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    }
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Start animation loop
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('touchstart', handleTouchStart);
      }
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mazeConfig]);

  const handleMapButtonClick = () => {
    setShowMapConfirmation(true);
  };
  
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
      
      {/* WebGL Error / Fallback Notice */}
      {webGlError && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(26, 26, 26, 0.95)',
          border: '2px solid #e3b341',
          borderRadius: '12px',
          padding: '16px 24px',
          color: '#fff',
          maxWidth: '520px',
          zIndex: 9999,
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#e3b341' }}>⚠️ WebGL Hardware Acceleration Disabled</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#ccc' }}>
            Your browser currently has WebGL disabled (e.g., Linux sandbox or GPU acceleration turned off).
          </p>
          <div style={{ background: '#111', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', textAlign: 'left', marginBottom: '12px', color: '#90caf9' }}>
            <strong>To enable 3D in Chrome:</strong><br />
            1. Open Chrome <strong>Settings → System</strong><br />
            2. Turn ON <em>"Use graphics acceleration when available"</em><br />
            3. Relaunch Chrome
          </div>
          <button 
            onClick={() => setShowMiniMap(true)}
            style={{
              background: '#238636',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🗺️ Open 2D Maze Mode & Play
          </button>
        </div>
      )}

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
      
      {/* View Map Button */}
      <button 
        className="map-button control-btn"
        onClick={handleMapButtonClick}
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
      
      {/* MiniMap Component */}
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
          finishTimeMs={finishTimeMs}
          isMultiplayer={isMultiplayer}
          winnerName={winnerName}
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
