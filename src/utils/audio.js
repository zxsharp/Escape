// Create and export AudioContext
export const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create an audio element programmatically instead of relying on refs
let movementAudio = null;

// Initialize audio
export function initAudio() {
  if (!movementAudio) {
    movementAudio = new Audio();
    // Use the same path as in your build logs
    movementAudio.src = '/assets/player-moving-BA4YeR6D.mp3';
    movementAudio.loop = true;
    document.body.appendChild(movementAudio);
  }
}

// Function to play movement sound
export function playMovementSound() {
  if (!movementAudio) initAudio();
  
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      if (movementAudio.paused) {
        movementAudio.play().catch(err => console.log("Audio play failed:", err));
      }
    });
  } else if (movementAudio.paused) {
    movementAudio.play().catch(err => console.log("Audio play failed:", err));
  }
}

// Function to pause movement sound
export function pauseMovementSound() {
  if (movementAudio && !movementAudio.paused) {
    movementAudio.pause();
  }
}
