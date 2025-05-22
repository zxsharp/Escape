import React, { useEffect, useState } from 'react';
import { ensureAudioResumed } from '../utils/audio';

const VirtualControls = ({ activeKeys, onButtonDown, onButtonUp }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // KEYBOARD CONTROLS - handle them directly here
  useEffect(() => {
    const handleKeyDown = async (e) => {
      const keyMap = {
        'ArrowUp': 'KeyW',
        'ArrowDown': 'KeyS',
        'ArrowLeft': 'KeyA',
        'ArrowRight': 'KeyD'
      };
      
      // Normalize key codes (map arrow keys to WASD internally)
      const keyCode = keyMap[e.code] || e.code;
      
      // Skip if not a movement key
      if (!['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(keyCode)) return;
      
      // Resume audio context first - CRITICAL 
      await ensureAudioResumed();
      
      // Trigger the same handler as button clicks
      onButtonDown(keyCode);
      
      // Find and highlight the corresponding button
      const dirMap = {
        'KeyW': 'up',
        'KeyS': 'down',
        'KeyA': 'left',
        'KeyD': 'right'
      };
      
      const dir = dirMap[keyCode];
      const btn = document.querySelector(`.${dir}-btn.control-btn`);
      if (btn) {
        btn.classList.add('active');
      }
    };
    
    const handleKeyUp = (e) => {
      const keyMap = {
        'ArrowUp': 'KeyW',
        'ArrowDown': 'KeyS',
        'ArrowLeft': 'KeyA',
        'ArrowRight': 'KeyD'
      };
      
      // Normalize key codes (map arrow keys to WASD internally)
      const keyCode = keyMap[e.code] || e.code;
      
      // Skip if not a movement key
      if (!['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(keyCode)) return;
      
      // Trigger button up handler
      onButtonUp(keyCode);
      
      // Find and remove highlight from button
      const dirMap = {
        'KeyW': 'up',
        'KeyS': 'down',
        'KeyA': 'left',
        'KeyD': 'right'
      };
      
      const dir = dirMap[keyCode];
      const btn = document.querySelector(`.${dir}-btn.control-btn`);
      if (btn) {
        btn.classList.remove('active');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onButtonDown, onButtonUp]);

  // Handle button press and release
  const handleTouchStart = async (key) => {
    // Resume audio context first - CRITICAL
    await ensureAudioResumed();
    onButtonDown(key);
  };

  const handleTouchEnd = (key) => {
    onButtonUp(key);
  };

  // Create touch event handlers that work on mobile
  const createTouchHandlers = (key) => ({
    onTouchStart: () => handleTouchStart(key),
    onTouchEnd: () => handleTouchEnd(key),
    onMouseDown: () => handleTouchStart(key),
    onMouseUp: () => handleTouchEnd(key),
    onMouseLeave: () => handleTouchEnd(key)
  });

  if (isMobile) {
    // Mobile layout with split controls
    return (
      <>
        {/* Forward/Backward controls on right side */}
        <div className="vertical-controls">
          <button 
            className={`up-btn control-btn ${activeKeys.ArrowUp || activeKeys.KeyW ? 'active' : ''}`} 
            {...createTouchHandlers(activeKeys.ArrowUp ? 'ArrowUp' : 'KeyW')}
            aria-label="Move forward"
          >
            <div className="arrow arrow-up"></div>
          </button>
          <button 
            className={`down-btn control-btn ${activeKeys.ArrowDown || activeKeys.KeyS ? 'active' : ''}`} 
            {...createTouchHandlers(activeKeys.ArrowDown ? 'ArrowDown' : 'KeyS')}
            aria-label="Move backward"
          >
            <div className="arrow arrow-down"></div>
          </button>
        </div>
        
        {/* Left/Right controls on left side */}
        <div className="horizontal-controls">
          <button 
            className={`left-btn control-btn ${activeKeys.ArrowLeft || activeKeys.KeyA ? 'active' : ''}`} 
            {...createTouchHandlers(activeKeys.ArrowLeft ? 'ArrowLeft' : 'KeyA')}
            aria-label="Move left"
          >
            <div className="arrow arrow-left"></div>
          </button>
          <button 
            className={`right-btn control-btn ${activeKeys.ArrowRight || activeKeys.KeyD ? 'active' : ''}`} 
            {...createTouchHandlers(activeKeys.ArrowRight ? 'ArrowRight' : 'KeyD')}
            aria-label="Move right"
          >
            <div className="arrow arrow-right"></div>
          </button>
        </div>
      </>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="virtual-controls">
      <button 
        className={`up-btn control-btn ${activeKeys.ArrowUp || activeKeys.KeyW ? 'active' : ''}`} 
        {...createTouchHandlers('KeyW')}
        aria-label="Move forward"
      >
        <div className="arrow arrow-up"></div>
      </button>
      <button 
        className={`down-btn control-btn ${activeKeys.ArrowDown || activeKeys.KeyS ? 'active' : ''}`} 
        {...createTouchHandlers('KeyS')}
        aria-label="Move backward"
      >
        <div className="arrow arrow-down"></div>
      </button>
      <button 
        className={`left-btn control-btn ${activeKeys.ArrowLeft || activeKeys.KeyA ? 'active' : ''}`} 
        {...createTouchHandlers('KeyA')}
        aria-label="Move left"
      >
        <div className="arrow arrow-left"></div>
      </button>
      <button 
        className={`right-btn control-btn ${activeKeys.ArrowRight || activeKeys.KeyD ? 'active' : ''}`} 
        {...createTouchHandlers('KeyD')}
        aria-label="Move right"
      >
        <div className="arrow arrow-right"></div>
      </button>
    </div>
  );
};

export default VirtualControls;
