import GitHubLogo from './GitHubLogo';
import './DifficultySelector.css';

const DifficultySelector = ({ onDifficultySelect, onBack }) => {
  const difficultySettings = {
    easy: { label: 'Easy', width: 10, height: 10 },
    intermediate: { label: 'Intermediate', width: 15, height: 10 },
    hard: { label: 'Hard', width: 20, height: 15 },
    extreme: { label: 'Extreme', width: 35, height: 20 }
  };

  return (
    <div className="difficulty-container">
      <GitHubLogo />
      {onBack && (
        <button 
          className="back-btn-top" 
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Main Menu
        </button>
      )}
      <h2>Select Difficulty</h2>
      
      <div className="difficulty-grid">
        {Object.entries(difficultySettings).map(([key, { label, width, height }]) => (
          <button 
            key={key}
            className="difficulty-card"
            onClick={() => onDifficultySelect({ width, height, key })}
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
      
      <a href="https://github.com/zxsharp" target="_blank" rel="noopener noreferrer" className="credit-tag">
        Made By - zxsharp
      </a>
    </div>
  );
};

export default DifficultySelector;
