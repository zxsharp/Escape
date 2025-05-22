import { useEffect } from 'react';
import { audioContext } from '../utils/audio';

const KeyboardControls = ({ playerRef }) => {
  useEffect(() => {
    if (!playerRef.current) return;
    
    // Keep track of button elements to avoid repetitive DOM queries
    const buttonElements = {
      up: null, down: null, left: null, right: null
    };
    
    // Make sure we force resume audio context on first key press
    const resumeAudioContext = async () => {
      if (audioContext && audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
          console.log("AudioContext resumed via keyboard!");
        } catch (err) {
          console.error("Failed to resume AudioContext:", err);
        }
      }
    };
    
    const handleKeyDown = async (e) => {
      const keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
      };
      
      // Skip if not a movement key
      if (!Object.keys(keyMap).includes(e.code)) return;
      
      // CRITICAL: Always try to resume audio context first
      await resumeAudioContext();
      
      const direction = keyMap[e.code];
      
      // Update player key state
      playerRef.current.keyStates[e.code] = true;
      
      // Find the corresponding button (if not already cached)
      if (!buttonElements[direction]) {
        // First try with the format used in VirtualControls
        buttonElements[direction] = document.querySelector(`.${direction}-btn.control-btn`);
      }
      
      const button = buttonElements[direction];
      if (button) {
        // Aggressively ensure the audio context is resumed
        resumeAudioContext();
        
        // Add active class which creates the glow effect - stays until key up
        button.classList.add('active');
        
        // CRUCIAL: Create a real DOM click event that mimics the user clicking
        // This is a complete user gesture that browsers recognize for audio playback
        button.dispatchEvent(new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        }));
        
        // Also directly trigger the mousedown for the specific behavior
        button.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
    };
    
    // Same handler for key up
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
