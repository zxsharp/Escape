import React from 'react';
import './DifficultySelector.css';

const DifficultySelector = ({ onDifficultySelect }) => {
  // Define difficulty settings
  const difficultySettings = {
    easy: { label: 'Easy', width: 10, height: 10 },
    intermediate: { label: 'Intermediate', width: 15, height: 10 },
    hard: { label: 'Hard', width: 20, height: 15 },
    extreme: { label: 'Extreme', width: 35, height: 20 }
  };

  return (
    <div className="difficulty-container">
      <h1>Escape The Maze</h1>
      <h2>Select Difficulty</h2>
      
      <div className="difficulty-grid">
        {Object.entries(difficultySettings).map(([key, { label, width, height }]) => (
          <button 
            key={key}
            className="difficulty-card"
            onClick={() => onDifficultySelect({ width, height })}
          >
            <div className="difficulty-label">{label}</div>
            <div className="difficulty-description">
              <span className="maze-size">{width}×{height}</span>
              <span className="maze-cells">{width * height} cells</span>
            </div>
          </button>
        ))}
      </div>
      
      <p className="game-description">
        Find your way through the randomly generated maze from the blue start point to the red exit!
      </p>
    </div>
  );
};

export default DifficultySelector;
