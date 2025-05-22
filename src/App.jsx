import { useState, useEffect } from 'react';
import { generateMaze } from './utils/mazeGenerator.js';
import MazeMap from './components/MazeMap.jsx';
import DifficultySelector from './components/DifficultySelector.jsx';
import Game from './components/Game.jsx';
import useAudioManager from './utils/AudioManager.jsx';
import { Analytics } from "@vercel/analytics/react"
import './App.css';

function App() {
  // App state: 'difficulty', 'preview', or 'game'
  const [appState, setAppState] = useState('difficulty');
  const [difficulty, setDifficulty] = useState(null);
  const [currentMazeConfig, setCurrentMazeConfig] = useState(null);
  
  // Get audio management utilities
  const { audioRefs, playStartSound, playWinSound, stopAllSounds } = useAudioManager();
  
  // Handler for difficulty selection
  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setAppState('preview');
  };
  
  // Handler for starting the game
  const handleStartGame = () => {
    setAppState('game');
    playStartSound();
  };
  
  // Handler for winning the game
  const handleGameWin = () => {
    playWinSound();
  };
  
  // Handler for going back to difficulty selection
  const handleBackToMain = () => {
    // Reset game state
    setAppState('difficulty');
    setCurrentMazeConfig(null);
    stopAllSounds();
  };
  
  // Generate maze config based on difficulty
  useEffect(() => {
    if (!difficulty) return;
    
    // Set loading state
    setCurrentMazeConfig(null);
    
    // Generate maze with small delay to allow UI to update
    setTimeout(() => {
      const cellSize = 2;
      const generatedMaze = generateMaze(difficulty.width, difficulty.height, cellSize);
      
      setCurrentMazeConfig({
        // Base maze properties
        width: difficulty.width,
        height: difficulty.height, 
        cellSize: cellSize,
        wallHeight: 2,
        wallSize: 0.3,
        
        // Colors
        wallColor: 0xa3a09e,  // gray walls
        floorColor: 0x407521, // green floor
        startColor: 0x4040FF, // blue start zone
        winColor: 0xFF4040,   // red win zone
        
        // Include all properties from generated maze
        ...generatedMaze
      });
    }, 10);
  }, [difficulty]);
  
  // Render the appropriate view based on app state
  return (
    <>
      {appState === 'difficulty' && (
        <DifficultySelector onDifficultySelect={handleDifficultySelect} />
      )}
      
      {appState === 'preview' && (
        <MazeMap 
          mazeConfig={currentMazeConfig} 
          onStartGame={handleStartGame}
          onBackClick={handleBackToMain}
        />
      )}
      
      {appState === 'game' && currentMazeConfig && (
        <Game
          mazeConfig={currentMazeConfig}
          onBackToMain={handleBackToMain}
          onGameWin={handleGameWin}
          audioRefs={audioRefs}
        />
      )}
      <Analytics />
    </>
  );
}

export default App;
