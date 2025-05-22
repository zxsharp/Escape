import { useEffect } from 'react';
import { audioContext, playMovementSound } from '../utils/audio';

const Controls = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const dirMap = {
        w: 'up', arrowup: 'up',
        s: 'down', arrowdown: 'down',
        a: 'left', arrowleft: 'left',
        d: 'right', arrowright: 'right'
      };
      const dir = dirMap[key];
      if (!dir) return;

      // --- new code to resume audio, play sound, and glow button ---
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      playMovementSound();

      const btn = document.querySelector(`.arrow-button.${dir}`);
      if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 100);
      }
      // --- end new code ---
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="controls">
      {/* Existing control elements */}
    </div>
  );
};

export default Controls;