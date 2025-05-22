import { useEffect } from 'react';

const KeyboardControls = ({ playerRef }) => {
  useEffect(() => {
    if (!playerRef.current) return;
    
    // Keep track of button elements to avoid repetitive DOM queries
    const buttonElements = {
      up: null, down: null, left: null, right: null
    };
    
    const handleKeyDown = (e) => {
      const keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
      };
      
      // Skip if not a movement key
      if (!Object.keys(keyMap).includes(e.code)) return;
      
      const direction = keyMap[e.code];
      
      // Update player key state
      playerRef.current.keyStates[e.code] = true;
      
      // Find the corresponding button (if not already cached)
      if (!buttonElements[direction]) {
        buttonElements[direction] = document.querySelector(`.${direction}-btn.control-btn`);
      }
      
      const button = buttonElements[direction];
      if (button) {
        // Add active class which creates the glow effect - stays until key up
        button.classList.add('active');
        
        // Trigger button down to reuse its audio logic
        button.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
    };
    
    const handleKeyUp = (e) => {
      const keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
      };
      
      if (!Object.keys(keyMap).includes(e.code)) return;
      
      const direction = keyMap[e.code];
      
      // Update player key state
      playerRef.current.keyStates[e.code] = false;
      
      // Remove the active class when key is released
      if (buttonElements[direction]) {
        buttonElements[direction].classList.remove('active');
        
        // Trigger button up to properly handle audio
        buttonElements[direction].dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerRef]);
  
  return null; // This component doesn't render anything
};

export default KeyboardControls;
