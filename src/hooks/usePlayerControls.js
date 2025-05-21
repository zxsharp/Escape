import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage player movement controls
 * 
 * @param {Object} playerRef - Reference to the player object
 * @param {Object} audioRefs - References to audio elements
 * @returns {Object} Control states and handlers
 */
const usePlayerControls = (playerRef, audioRefs) => {
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

  // Simple function to update movement sound based on any movement key
  const updateMovementSound = useCallback(() => {
    if (!audioRefs.playerMovingAudio) return;
    
    // Check if any movement key is pressed (forward, backward, left, right)
    const isMoving = activeKeys.ArrowUp || activeKeys.ArrowDown || 
                     activeKeys.KeyW || activeKeys.KeyS ||
                     activeKeys.ArrowLeft || activeKeys.ArrowRight || 
                     activeKeys.KeyA || activeKeys.KeyD;
    
    if (isMoving && audioRefs.playerMovingAudio.paused) {
      audioRefs.playerMovingAudio.play().catch(e => console.log("Audio play failed:", e));
    } else if (!isMoving && !audioRefs.playerMovingAudio.paused) {
      audioRefs.playerMovingAudio.pause();
    }
  }, [activeKeys, audioRefs.playerMovingAudio]);

  // Handler for virtual button press
  const handleVirtualButtonDown = useCallback((keyCode) => {
    if (!playerRef.current) return;
    
    playerRef.current.keyStates[keyCode] = true;
    setActiveKeys(prev => ({ ...prev, [keyCode]: true }));
  }, [playerRef]);
  
  // Handler for virtual button release
  const handleVirtualButtonUp = useCallback((keyCode) => {
    if (!playerRef.current) return;
    
    playerRef.current.keyStates[keyCode] = false;
    setActiveKeys(prev => ({ ...prev, [keyCode]: false }));
  }, [playerRef]);

  // Set up keyboard controls
  useEffect(() => {
    if (!playerRef.current) return;
    
    const player = playerRef.current;
    
    // Keyboard down event handler
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        setActiveKeys(prev => ({ ...prev, [e.code]: true }));
        
        // Set the key state directly in the player object
        player.keyStates[e.code] = true;
      }
    };

    // Keyboard up event handler
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        setActiveKeys(prev => ({ ...prev, [e.code]: false }));
        
        // Set the key state directly in the player object
        player.keyStates[e.code] = false;
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerRef]);

  // Update movement sound whenever key states change
  useEffect(() => {
    updateMovementSound();
  }, [activeKeys, updateMovementSound]);

  return {
    activeKeys,
    handleVirtualButtonDown,
    handleVirtualButtonUp
  };
};

export default usePlayerControls;
