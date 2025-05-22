// Create and export AudioContext
export const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create an audio element programmatically instead of relying on refs
let movementAudio = null;

// Initialize audio
export function initAudio() {
  // This function is simply to ensure the module is imported properly
  console.log("Audio system initialized");
}

// Function to play movement sound
export function playMovementSound() {
  // Resume context if needed
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}
