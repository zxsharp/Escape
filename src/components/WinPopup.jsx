import React from 'react';

const WinPopup = ({ onRetry, onMainMenu, onContinue }) => {
  return (
    <div className="win-popup" style={{ display: 'flex' }}>
      <div className="popup-content">
        <h2>You Won!</h2>
        <button onClick={onRetry}>Retry</button>
        <button onClick={onMainMenu}>Main Menu</button>
        <button onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
};

export default WinPopup;
