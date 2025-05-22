import React, { useEffect, useState } from 'react';

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

  // Handle button press and release
  const handleTouchStart = (key) => {
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
