import { useEffect, useRef } from 'react';
import playerMovingSound from '../assets/player-moving.mp3';
import gameStartSound from '../assets/game-start.mp3';
import gameWonSound from '../assets/game-won.mp3';

const useAudioManager = () => {
  const playerMovingAudioRef = useRef(null);
  const gameStartAudioRef = useRef(null);
  const gameWonAudioRef = useRef(null);
  
  // Initialize audio elements
  useEffect(() => {
    // Player movement sound (looping)
    playerMovingAudioRef.current = new Audio(playerMovingSound);
    playerMovingAudioRef.current.loop = true;
    playerMovingAudioRef.current.volume = 1;
    
    // Game start sound (once)
    gameStartAudioRef.current = new Audio(gameStartSound);
    gameStartAudioRef.current.volume = 0.8;
    
    // Game won sound (once)
    gameWonAudioRef.current = new Audio(gameWonSound);
    gameWonAudioRef.current.volume = 0.8;
    
    // Reset audio state on page visibility change or window blur
    const handleVisibilityChange = () => {
      if (document.hidden && playerMovingAudioRef.current) {
        playerMovingAudioRef.current.pause();
      }
    };
    
    const handleBlur = () => {
      if (playerMovingAudioRef.current && !playerMovingAudioRef.current.paused) {
        playerMovingAudioRef.current.pause();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      
      if (playerMovingAudioRef.current) {
        playerMovingAudioRef.current.pause();
        playerMovingAudioRef.current = null;
      }
      if (gameStartAudioRef.current) {
        gameStartAudioRef.current.pause();
        gameStartAudioRef.current = null;
      }
      if (gameWonAudioRef.current) {
        gameWonAudioRef.current.pause();
        gameWonAudioRef.current = null;
      }
    };
  }, []);
  
  // Helper functions to play sounds
  const playStartSound = () => {
    if (gameStartAudioRef.current) {
      gameStartAudioRef.current.currentTime = 0;
      gameStartAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };
  
  const playWinSound = () => {
    if (gameWonAudioRef.current) {
      gameWonAudioRef.current.currentTime = 0;
      gameWonAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Stop movement sound if it's playing
    if (playerMovingAudioRef.current && !playerMovingAudioRef.current.paused) {
      playerMovingAudioRef.current.pause();
    }
  };
  
  const stopAllSounds = () => {
    if (playerMovingAudioRef.current && !playerMovingAudioRef.current.paused) {
      playerMovingAudioRef.current.pause();
      playerMovingAudioRef.current.currentTime = 0;
    }
    if (gameStartAudioRef.current) {
      gameStartAudioRef.current.pause();
      gameStartAudioRef.current.currentTime = 0;
    }
    if (gameWonAudioRef.current) {
      gameWonAudioRef.current.pause();
      gameWonAudioRef.current.currentTime = 0;
    }
  };
  
  return {
    audioRefs: {
      playerMovingAudio: playerMovingAudioRef.current,
      gameStartAudio: gameStartAudioRef.current,
      gameWonAudio: gameWonAudioRef.current
    },
    playStartSound,
    playWinSound,
    stopAllSounds
  };
};

export default useAudioManager;
