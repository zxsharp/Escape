import React from 'react';

const VirtualControls = ({ activeKeys, onButtonDown, onButtonUp }) => {
  return (
    <div className="virtual-controls">
      <div 
        className={`control-btn up-btn ${activeKeys.ArrowUp ? 'active' : ''}`}
        onTouchStart={() => onButtonDown('ArrowUp')}
        onTouchEnd={() => onButtonUp('ArrowUp')}
        onMouseDown={() => onButtonDown('ArrowUp')}
        onMouseUp={() => onButtonUp('ArrowUp')}
        onMouseLeave={() => onButtonUp('ArrowUp')}
      >
        <div className="arrow arrow-up"></div>
      </div>
      
      <div 
        className={`control-btn down-btn ${activeKeys.ArrowDown ? 'active' : ''}`}
        onTouchStart={() => onButtonDown('ArrowDown')}
        onTouchEnd={() => onButtonUp('ArrowDown')}
        onMouseDown={() => onButtonDown('ArrowDown')}
        onMouseUp={() => onButtonUp('ArrowDown')}
        onMouseLeave={() => onButtonUp('ArrowDown')}
      >
        <div className="arrow arrow-down"></div>
      </div>
      
      <div 
        className={`control-btn left-btn ${activeKeys.ArrowLeft ? 'active' : ''}`}
        onTouchStart={() => onButtonDown('ArrowLeft')}
        onTouchEnd={() => onButtonUp('ArrowLeft')}
        onMouseDown={() => onButtonDown('ArrowLeft')}
        onMouseUp={() => onButtonUp('ArrowLeft')}
        onMouseLeave={() => onButtonUp('ArrowLeft')}
      >
        <div className="arrow arrow-left"></div>
      </div>
      
      <div 
        className={`control-btn right-btn ${activeKeys.ArrowRight ? 'active' : ''}`}
        onTouchStart={() => onButtonDown('ArrowRight')}
        onTouchEnd={() => onButtonUp('ArrowRight')}
        onMouseDown={() => onButtonDown('ArrowRight')}
        onMouseUp={() => onButtonUp('ArrowRight')}
        onMouseLeave={() => onButtonUp('ArrowRight')}
      >
        <div className="arrow arrow-right"></div>
      </div>
    </div>
  );
};

export default VirtualControls;
