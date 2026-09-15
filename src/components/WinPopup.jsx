import React from 'react';

const WinPopup = ({ onRetry, onMainMenu, onFreeRoam, finishTimeMs, isMultiplayer = false, winnerName }) => {
  const formatTime = (totalMs) => {
    if (!totalMs) return null;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
  };

  const formattedTime = formatTime(finishTimeMs);

  return (
    <div className="win-popup" style={{ display: 'flex' }}>
      <div className="popup-content">
        <h2>🎉 You Escaped! 🎉</h2>
        {formattedTime && (
          <p className="win-time">
            Time: <strong>{formattedTime}</strong>
          </p>
        )}
        {isMultiplayer && (
          <p className="win-status">
            {winnerName ? `🏆 Race Winner: ${winnerName}` : '🏁 Race Complete!'}
          </p>
        )}
        <div className="popup-buttons">
          <button className="primary-btn" onClick={onRetry}>Play Again</button>
          <button className="secondary-btn" onClick={onMainMenu}>Main Menu</button>
          <button className="free-roam-btn" onClick={onFreeRoam}>Free Roam</button>
        </div>
      </div>
    </div>
  );
};

export default WinPopup;
