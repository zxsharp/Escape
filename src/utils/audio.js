// We'll create the AudioContext lazily on first user interaction
let _audioContext = null;

// Get the AudioContext, creating it only when needed
export function getAudioContext() {
  if (!_audioContext) {
    _audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioContext;
}

// Resume audio context - call this on EVERY user interaction
export function ensureAudioResumed() {
  const ctx = getAudioContext();
  // Only try to resume if it's suspended
  if (ctx.state === 'suspended') {
    // Return the promise so callers can wait if needed
    return ctx.resume().then(() => {
      console.log('AudioContext successfully resumed');
      return true;
    }).catch(err => {
      console.error('Failed to resume AudioContext:', err);
      return false;
    });
  }
  return Promise.resolve(true); // Already running
}

// Add global event handlers for common user interactions
export function setupGlobalAudioHandlers() {
  const resumeAudio = () => {
    ensureAudioResumed();
  };
  
  // Add handlers to document to catch all user interactions
  document.addEventListener('click', resumeAudio);
  document.addEventListener('touchstart', resumeAudio);
  document.addEventListener('keydown', resumeAudio);
  
  // Also try resuming on visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resumeAudio();
    }
  });
  
  console.log('Global audio handlers initialized');
}

// Simple initialization function that can be called from Game.jsx
export function initAudio() {
  // Just make sure we have an AudioContext ready
  getAudioContext();
  console.log('Audio system initialized');
}
